const DEFAULT_SYSTEM = `You are Copilot, an out-of-character (OOC) assistant for a roleplay writer.
Help with brainstorming, plot ideas, character analysis, lore and scene review.
Never write dialogue or actions for the user's character, and never continue the roleplay.
Be concise and direct.`;

const LENGTH_RULES = {
  auto: "",
  short: "Keep replies short: usually 2-6 sentences, under 150 words. No headers or long lists unless the writer asks for more detail.",
  medium: "Keep replies moderate: a few short paragraphs, under 300 words, unless the writer asks for more detail.",
  long: "Be thorough and detailed: cover the topic fully and use structure when it helps.",
};
const LENGTH_LABELS = { short: "Short", medium: "Medium", long: "Long" };

const DEFAULTS = {
  mode: "chat",
  ctxCount: 10,
  connectionId: "",
  includeCard: true,
  includePersona: true,
  includeLore: false,
  loreBudget: 1500,
  length: "auto",
  systemPrompt: "",
};

let controller = null;
const cache = {};
const loreCache = new Map();
const lorePrefsCache = new Map();
const sessCache = new Map();
const uk = (userId) => userId || "_";
const clip = (s, n) => String(s || "").slice(0, n);
const san = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, "");

// Session "s1" keeps using the original history file, so old histories carry over untouched.
const histPath = (key) => `copilot_history_${san(key)}.json`;
const idxPath = (key) => `copilot_sessions_${san(key)}.json`;
const sessPath = (key, sid) => (sid === "s1" ? histPath(key) : `copilot_hist_${san(key)}_${san(sid)}.json`);
const lorePath = (chatId) => `copilot_lore_${san(chatId)}.json`;

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
    if (["auto", "short", "medium", "long"].includes(s.length)) o.length = s.length;
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

async function loadHistory(path, userId) {
  try {
    const h = await spindle.userStorage.getJson(path, { fallback: [], userId });
    return cleanHistory(h);
  } catch (e) {
    spindle.log.warn("[Copilot] load history failed: " + e.message);
    return [];
  }
}

// ---------- sessions (a list per chat, plus one for General) ----------
async function getSessions(key, userId) {
  const ck = `${uk(userId)}|${key}`;
  if (sessCache.has(ck)) return sessCache.get(ck);
  let raw = {};
  try {
    raw = await spindle.userStorage.getJson(idxPath(key), { fallback: {}, userId });
  } catch (e) {
    spindle.log.warn("[Copilot] load sessions failed: " + e.message);
  }
  const list = (Array.isArray(raw && raw.list) ? raw.list : [])
    .filter((s) => s && typeof s.id === "string" && san(s.id) && typeof s.name === "string")
    .map((s) => ({ id: san(s.id), name: s.name.slice(0, 60) || "Session" }))
    .slice(0, 100);
  if (!list.length) list.push({ id: "s1", name: "Session 1" });
  const active = list.some((s) => s.id === (raw && raw.active)) ? raw.active : list[0].id;
  const idx = { active, list };
  sessCache.set(ck, idx);
  return idx;
}

async function saveSessions(key, userId, idx) {
  sessCache.set(`${uk(userId)}|${key}`, idx);
  try {
    await spindle.userStorage.setJson(idxPath(key), idx, { userId });
  } catch (e) {
    spindle.log.warn("[Copilot] save sessions failed: " + e.message);
  }
}

async function resolveKey(userId) {
  const settings = await getSettings(userId);
  const active = await spindle.chats.getActive(userId);
  const key = settings.mode === "general" || !active ? "general" : active.id;
  return { settings, active, key };
}

async function sendInit(userId) {
  const { settings, active, key } = await resolveKey(userId);
  const connections = await spindle.connections.list(userId);
  const sessions = await getSessions(key, userId);
  const history = await loadHistory(sessPath(key, sessions.active), userId);
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
    sessionId: sessions.active,
    sessions,
    history,
    settings,
    defaultSystem: DEFAULT_SYSTEM,
  }, userId);
}

// ---------- per-chat lorebook choices ----------
async function getLorePrefs(chatId, userId) {
  const k = `${uk(userId)}|${chatId}`;
  if (lorePrefsCache.has(k)) return lorePrefsCache.get(k);
  let raw = {};
  try {
    raw = await spindle.userStorage.getJson(lorePath(chatId), { fallback: {}, userId });
  } catch (e) {
    spindle.log.warn("[Copilot] load lore prefs failed: " + e.message);
  }
  const strs = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === "string").slice(0, 500) : []);
  const prefs = { excluded: strs(raw && raw.excluded), pinned: strs(raw && raw.pinned) };
  lorePrefsCache.set(k, prefs);
  return prefs;
}

async function saveLorePrefs(chatId, userId, prefs) {
  lorePrefsCache.set(`${uk(userId)}|${chatId}`, prefs);
  try {
    await spindle.userStorage.setJson(lorePath(chatId), prefs, { userId });
  } catch (e) {
    spindle.log.warn("[Copilot] save lore prefs failed: " + e.message);
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

// "World Info Before: Souma Kagetora" -> "Souma Kagetora" (stable even if the entry's position changes)
function entryLabel(name) {
  const s = String(name || "");
  const i = s.indexOf(":");
  return (i >= 0 ? s.slice(i + 1) : s).trim() || s;
}

// Decides which triggered entries fit: excluded are dropped, pinned go first and always fit,
// the rest fill whatever budget is left in their original order.
function planLore(blocks, prefs, budgetTokens) {
  const excluded = new Set(prefs.excluded);
  const pinned = new Set(prefs.pinned);
  const items = blocks.map((b) => {
    const key = entryLabel(b.name);
    return {
      key,
      name: b.name,
      text: b.content,
      sent: b.content,
      tokens: Math.ceil(b.content.length / 4),
      excluded: excluded.has(key),
      pinned: pinned.has(key),
      state: "over",
    };
  });

  let remaining = budgetTokens * 4;
  const live = items.filter((x) => !x.excluded);
  const order = [...live.filter((x) => x.pinned), ...live.filter((x) => !x.pinned)];
  for (const it of order) {
    if (it.pinned) {
      it.state = "in";
      remaining = Math.max(0, remaining - it.text.length);
    } else if (remaining <= 0) {
      it.state = "over";
    } else if (it.text.length > remaining) {
      let cut = it.text.slice(0, remaining);
      const nl = cut.lastIndexOf("\n");
      if (nl > remaining * 0.5) cut = cut.slice(0, nl);
      it.sent = cut.trimEnd() + "\n[…trimmed to fit the lorebook budget]";
      it.state = "trimmed";
      remaining = 0;
    } else {
      it.state = "in";
      remaining -= it.text.length;
    }
  }
  for (const it of items) if (it.excluded) it.state = "off";
  return items;
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
  let loreItems = [];

  const rule = LENGTH_RULES[settings.length];
  if (rule) {
    sections.push({
      id: "length",
      label: `Response length (${LENGTH_LABELS[settings.length]})`,
      text: rule,
    });
  }

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
        const prefs = await getLorePrefs(active.id, userId);
        loreItems = planLore(lore.blocks, prefs, settings.loreBudget);

        const st = lore.stats;
        if (st) notes.push(`Lorebook: ${st.activatedAfterBudget} of ${st.totalCandidates} entries triggered.`);

        if (!loreItems.length) {
          notes.push("No lorebook entries are triggered right now.");
        } else {
          const inc = loreItems.filter((x) => x.state === "in" || x.state === "trimmed");
          const off = loreItems.filter((x) => x.state === "off").length;
          const over = loreItems.filter((x) => x.state === "over").length;
          inc.forEach((x, i) => {
            sections.push({
              id: `lore${i}`,
              label: `Lorebook: ${x.key}`,
              text: `<lorebook name="${x.name}">\n${x.sent}\n</lorebook>`,
            });
          });
          const extra = [];
          if (off) extra.push(`${off} turned off`);
          if (over) extra.push(`${over} over the ~${settings.loreBudget} token budget`);
          notes.push(
            `Included ${inc.length} of ${loreItems.length} triggered entries` +
              (extra.length ? ` (${extra.join(", ")})` : "") + ".",
          );
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

  const lore = loreItems.map((x) => ({
    key: x.key,
    name: x.name,
    tokens: x.tokens,
    state: x.state,
    pinned: x.pinned,
    excluded: x.excluded,
    text: x.text,
  }));

  return { sections, notes, useChat, lore };
}

async function sendPreview(userId) {
  const settings = await getSettings(userId);
  const { sections, notes, useChat, lore } = await buildContext(userId, settings);
  spindle.sendToFrontend({ type: "context_preview", sections, notes, useChat, lore }, userId);
}

spindle.log.info("[Copilot] backend started");

spindle.onFrontendMessage(async (payload, userId) => {
  switch (payload && payload.type) {
    case "init": {
      try {
        await sendInit(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] init failed: " + e.message);
      }
      break;
    }

    case "session_new": {
      try {
        const { key } = await resolveKey(userId);
        const idx = await getSessions(key, userId);
        if (idx.list.length >= 100) break;
        const id = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        await saveSessions(key, userId, {
          active: id,
          list: [...idx.list, { id, name: `Session ${idx.list.length + 1}` }],
        });
        await sendInit(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] session_new failed: " + e.message);
      }
      break;
    }

    case "session_switch": {
      try {
        const { key } = await resolveKey(userId);
        const idx = await getSessions(key, userId);
        const sid = String(payload.sid || "");
        if (!idx.list.some((s) => s.id === sid)) break;
        await saveSessions(key, userId, { active: sid, list: idx.list });
        await sendInit(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] session_switch failed: " + e.message);
      }
      break;
    }

    case "session_rename": {
      try {
        const { key } = await resolveKey(userId);
        const idx = await getSessions(key, userId);
        const sid = String(payload.sid || "");
        const name = String(payload.name || "").trim().slice(0, 60);
        if (!name || !idx.list.some((s) => s.id === sid)) break;
        await saveSessions(key, userId, {
          active: idx.active,
          list: idx.list.map((s) => (s.id === sid ? { id: s.id, name } : s)),
        });
        await sendInit(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] session_rename failed: " + e.message);
      }
      break;
    }

    case "session_delete": {
      try {
        const { key } = await resolveKey(userId);
        const idx = await getSessions(key, userId);
        const sid = String(payload.sid || "");
        const pos = idx.list.findIndex((s) => s.id === sid);
        if (pos < 0) break;
        await spindle.userStorage.setJson(sessPath(key, sid), [], { userId });
        let list = idx.list.filter((s) => s.id !== sid);
        if (!list.length) list = [{ id: "s1", name: "Session 1" }];
        const active = idx.active === sid ? list[Math.max(0, pos - 1)].id : idx.active;
        await saveSessions(key, userId, { active, list });
        await sendInit(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] session_delete failed: " + e.message);
      }
      break;
    }

    case "context_preview": {
      try {
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] context preview failed: " + e.message);
      }
      break;
    }

    case "lore_set": {
      try {
        const key = String(payload.key || "");
        const active = await spindle.chats.getActive(userId);
        if (!key || !active) break;
        const prefs = await getLorePrefs(active.id, userId);
        const toggle = (arr, on) => {
          const s = new Set(arr);
          if (on) s.add(key);
          else s.delete(key);
          return [...s].slice(0, 500);
        };
        const next = { excluded: prefs.excluded, pinned: prefs.pinned };
        if (typeof payload.excluded === "boolean") next.excluded = toggle(prefs.excluded, payload.excluded);
        if (typeof payload.pinned === "boolean") next.pinned = toggle(prefs.pinned, payload.pinned);
        await saveLorePrefs(active.id, userId, next);
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] lore_set failed: " + e.message);
      }
      break;
    }

    case "lore_bulk": {
      try {
        const active = await spindle.chats.getActive(userId);
        if (!active) break;
        const prefs = await getLorePrefs(active.id, userId);
        let excluded = [];
        if (payload.action === "none") {
          const settings = await getSettings(userId);
          const { lore } = await buildContext(userId, settings);
          excluded = [...new Set([...prefs.excluded, ...lore.map((x) => x.key)])].slice(0, 500);
        }
        await saveLorePrefs(active.id, userId, { excluded, pinned: prefs.pinned });
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] lore_bulk failed: " + e.message);
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
      if (!payload.key || !payload.sid) break;
      try {
        await spindle.userStorage.setJson(
          sessPath(payload.key, String(payload.sid)),
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