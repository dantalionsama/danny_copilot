const DEFAULT_SYSTEM = `You are Copilot, an out-of-character (OOC) assistant for a roleplay writer.
Help with brainstorming, plot ideas, character analysis, lore and scene review.
Never write dialogue or actions for the user's character, and never continue the roleplay.
Be concise and direct.`;

const DEFAULTS = {
  mode: "chat",
  ctxCount: 10,
  connectionId: "",
  includeCard: true,
  includePersona: true,
  includeLore: false,
  loreBudget: 1500,
  systemPrompt: "",
};

let controller = null;
const cache = {};
const loreCache = new Map();
const uk = (userId) => userId || "_";
const clip = (s, n) => String(s || "").slice(0, n);

const histPath = (key) =>
  `copilot_history_${String(key).replace(/[^a-zA-Z0-9_-]/g, "")}.json`;

function cleanHistory(raw) {
  return (Array.isArray(raw) ? raw : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content }));
}

function cleanSettings(s) {
  const o = { ...DEFAULTS };
  if (s && typeof s === "object") {
    if (s.mode === "chat" || s.mode === "general") o.mode = s.mode;
    const n = Number(s.ctxCount);
    if (Number.isFinite(n)) o.ctxCount = Math.max(0, Math.min(200, Math.floor(n)));
    if (typeof s.connectionId === "string") o.connectionId = s.connectionId;
    o.includeCard = s.includeCard !== false;
    o.includePersona = s.includePersona !== false;
    o.includeLore = s.includeLore === true;
    const lb = Number(s.loreBudget);
    if (Number.isFinite(lb)) o.loreBudget = Math.max(200, Math.min(8000, Math.floor(lb)));
    if (typeof s.systemPrompt === "string") o.systemPrompt = s.systemPrompt.slice(0, 8000);
  }
  return o;
}

async function getSettings(userId) {
  if (cache[uk(userId)]) return cache[uk(userId)];
  let raw = {};
  try {
    raw = await spindle.userStorage.getJson("copilot_settings.json", { fallback: {}, userId });
  } catch (e) {
    spindle.log.warn("[Copilot] load settings failed: " + e.message);
  }
  const s = cleanSettings(raw);
  cache[uk(userId)] = s;
  return s;
}

async function loadHistory(key, userId) {
  try {
    const h = await spindle.userStorage.getJson(histPath(key), { fallback: [], userId });
    return cleanHistory(h);
  } catch (e) {
    spindle.log.warn("[Copilot] load history failed: " + e.message);
    return [];
  }
}

function cardBlock(c) {
  const parts = [
    ["Description", c.description],
    ["Personality", c.personality],
    ["Scenario", c.scenario],
  ]
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${clip(v, 6000)}`);
  return `<character_card name="${c.name}">\n${parts.join("\n\n")}\n</character_card>`;
}

function personaBlock(p) {
  const parts = [];
  if (p.title) parts.push(`Title: ${clip(p.title, 500)}`);
  if (p.description) parts.push(`Description: ${clip(p.description, 6000)}`);
  return `<user_persona name="${p.name}">\n${parts.join("\n\n")}\n</user_persona>`;
}

// Real triggered lorebook content, taken from a dry run of Lumiverse's own prompt assembly.
// Cached briefly so previews and sends don't re-run it for the same chat state.
async function getLore(chatId, userId, sig) {
  const key = `${uk(userId)}|${chatId}|${sig}`;
  const hit = loreCache.get(key);
  if (hit && Date.now() - hit.at < 60000) return hit;

  const result = await spindle.generate.dryRun({ chatId }, userId);
  const blocks = (result.breakdown || [])
    .filter((b) => b && b.type === "world_info" && typeof b.content === "string" && b.content.trim())
    .map((b) => ({ name: String(b.name || "World Info"), content: b.content }));

  const entry = { at: Date.now(), blocks, stats: result.worldInfoStats || null };
  if (loreCache.size > 20) loreCache.clear();
  loreCache.set(key, entry);
  return entry;
}

function budgetLore(blocks, budgetTokens) {
  let remaining = budgetTokens * 4;
  let trimmed = false;
  let skipped = 0;
  const out = [];
  for (const b of blocks) {
    if (remaining <= 0) { skipped++; continue; }
    let text = b.content;
    if (text.length > remaining) {
      let cut = text.slice(0, remaining);
      const nl = cut.lastIndexOf("\n");
      if (nl > remaining * 0.5) cut = cut.slice(0, nl);
      text = cut.trimEnd() + "\n[…trimmed to fit the lorebook budget]";
      trimmed = true;
      remaining = 0;
    } else {
      remaining -= text.length;
    }
    out.push({ name: b.name, text });
  }
  return { out, trimmed, skipped };
}

// Builds everything that goes into the system message, as labelled sections.
// Used by both generation and the Context preview so they can never drift apart.
async function buildContext(userId, settings) {
  const active = await spindle.chats.getActive(userId);
  const useChat = settings.mode !== "general" && !!active;

  const sections = [
    { id: "system", label: "System prompt", text: settings.systemPrompt.trim() || DEFAULT_SYSTEM },
  ];
  const notes = [];

  if (useChat) {
    if (settings.includeCard && active.character_id) {
      try {
        const c = await spindle.characters.get(active.character_id, userId);
        if (c) sections.push({ id: "card", label: `Character card: ${c.name}`, text: cardBlock(c) });
      } catch (e) {
        spindle.log.warn("[Copilot] card load failed: " + e.message);
      }
    }

    if (settings.includePersona) {
      try {
        const p = await spindle.personas.getActive(userId);
        if (p) sections.push({ id: "persona", label: `Persona: ${p.name}`, text: personaBlock(p) });
      } catch (e) {
        spindle.log.warn("[Copilot] persona load failed: " + e.message);
      }
    }

    let msgs = [];
    if (settings.ctxCount > 0 || settings.includeLore) {
      msgs = await spindle.chat.getMessages(active.id);
    }

    if (settings.includeLore) {
      try {
        const last = msgs[msgs.length - 1];
        const sig = `${msgs.length}:${last && last.id ? last.id : ""}:${last ? String(last.content).length : 0}`;
        const lore = await getLore(active.id, userId, sig);
        const st = lore.stats;
        if (st) notes.push(`Lorebook: ${st.activatedAfterBudget} of ${st.totalCandidates} entries triggered.`);
        if (!lore.blocks.length) {
          notes.push("No lorebook entries are triggered right now.");
        } else {
          const b = budgetLore(lore.blocks, settings.loreBudget);
          b.out.forEach((x, i) => {
            sections.push({
              id: `lore${i}`,
              label: `Lorebook: ${x.name}`,
              text: `<lorebook name="${x.name}">\n${x.text}\n</lorebook>`,
            });
          });
          if (b.trimmed) notes.push(`Lorebook trimmed to fit the ~${settings.loreBudget} token budget.`);
          if (b.skipped) notes.push(`${b.skipped} lorebook block(s) skipped (over budget).`);
        }
      } catch (e) {
        spindle.log.warn("[Copilot] lorebook failed: " + e.message);
        notes.push("Lorebook unavailable: " + e.message);
      }
    }

    if (settings.ctxCount > 0) {
      const recent = msgs.slice(-settings.ctxCount);
      if (recent.length) {
        const transcript = recent.map((m) => `[${m.role}] ${m.content}`).join("\n\n");
        sections.push({
          id: "chat",
          label: `Chat messages (${recent.length})`,
          text: `<roleplay_context>\n${transcript}\n</roleplay_context>`,
        });
      }
    }
  }

  return { sections, notes, useChat };
}

spindle.log.info("[Copilot] backend started");

spindle.onFrontendMessage(async (payload, userId) => {
  switch (payload && payload.type) {
    case "init": {
      try {
        const settings = await getSettings(userId);
        const connections = await spindle.connections.list(userId);
        const active = await spindle.chats.getActive(userId);
        const key = settings.mode === "general" || !active ? "general" : active.id;
        const history = await loadHistory(key, userId);
        spindle.sendToFrontend({
          type: "init",
          connections: connections.map((c) => ({
            id: c.id,
            name: c.name,
            model: c.model,
            is_default: c.is_default,
          })),
          chat: active ? { id: active.id, name: active.name } : null,
          sessionKey: key,
          history,
          settings,
          defaultSystem: DEFAULT_SYSTEM,
        }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] init failed: " + e.message);
      }
      break;
    }

    case "context_preview": {
      try {
        const settings = await getSettings(userId);
        const { sections, notes, useChat } = await buildContext(userId, settings);
        spindle.sendToFrontend({ type: "context_preview", sections, notes, useChat }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] context preview failed: " + e.message);
      }
      break;
    }

    case "save_settings": {
      const s = cleanSettings(payload.settings);
      cache[uk(userId)] = s;
      try {
        await spindle.userStorage.setJson("copilot_settings.json", s, { userId });
      } catch (e) {
        spindle.log.warn("[Copilot] save settings failed: " + e.message);
      }
      break;
    }

    case "save_history": {
      if (!payload.key) break;
      try {
        await spindle.userStorage.setJson(
          histPath(payload.key),
          cleanHistory(payload.history).slice(-200),
          { userId },
        );
      } catch (e) {
        spindle.log.warn("[Copilot] save history failed: " + e.message);
      }
      break;
    }

    case "stop":
      if (controller) controller.abort();
      break;

    case "send": {
      if (controller) controller.abort();
      const ctl = new AbortController();
      controller = ctl;
      const reqId = payload.reqId;

      try {
        const settings = await getSettings(userId);
        const { sections } = await buildContext(userId, settings);

        const messages = [
          { role: "system", content: sections.map((s) => s.text).join("\n\n") },
          ...cleanHistory(payload.history).slice(-40),
          { role: "user", content: String(payload.text || "") },
        ];

        const input = { type: "quiet", messages, userId, signal: ctl.signal };
        if (settings.connectionId) input.connection_id = settings.connectionId;

        for await (const chunk of spindle.generate.quietStream(input)) {
          if (chunk.type === "token") {
            spindle.sendToFrontend({ type: "token", reqId, token: chunk.token }, userId);
          }
        }
        spindle.sendToFrontend({ type: "done", reqId }, userId);
      } catch (err) {
        if (err && err.name === "AbortError") {
          spindle.sendToFrontend({ type: "stopped", reqId }, userId);
        } else {
          spindle.sendToFrontend({ type: "error", reqId, message: String((err && err.message) || err) }, userId);
        }
      }
      break;
    }
  }
});