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

const PROPOSAL_RULES = `LOREBOOK PROPOSALS
You can propose lorebook entries, but ONLY when the writer explicitly asks you to create or update one. Never propose unprompted.
When asked, write your normal short reply, then add one block per entry at the very end, in exactly this format:

<lorebook_entry action="create">
name: Short entry title
keys: keyword one, keyword two, keyword three
content:
The entry text, written as concise reference info for the roleplay AI.
</lorebook_entry>

To change an existing entry, use action="update" and add a line "update: <exact existing entry name>" under the name line. For updates, content must be the COMPLETE new text of the entry (it replaces the old text), so keep everything that should stay.
If you can't see an entry's current text, ask the writer to paste it instead of guessing.
The writer reviews and approves every block in the app, so don't explain the format or mention approval.`;

const DEFAULTS = {
  mode: "chat",
  ctxCount: 10,
  connectionId: "",
  includeCard: true,
  includePersona: true,
  includeLore: false,
  loreBudget: 1500,
  length: "auto",
  proposals: true,
  systemPrompt: "",
};

let controller = null;
const cache = {};
const loreCache = new Map();
const lorePrefsCache = new Map();
const pickCache = new Map();
const sessCache = new Map();
const attachedCache = new Map();
const namesCache = new Map();
const limitCache = {};
const uk = (userId) => userId || "_";
const clip = (s, n) => String(s || "").slice(0, n);
const san = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, "");
const norm = (s) => String(s || "").trim().toLowerCase();
const strArr = (a, maxN = 30, maxLen = 100) =>
  (Array.isArray(a) ? a : []).filter((x) => typeof x === "string").slice(0, maxN).map((x) => x.slice(0, maxLen));

// Session "s1" keeps using the original history file, so old histories carry over untouched.
const histPath = (key) => `copilot_history_${san(key)}.json`;
const idxPath = (key) => `copilot_sessions_${san(key)}.json`;
const sessPath = (key, sid) => (sid === "s1" ? histPath(key) : `copilot_hist_${san(key)}_${san(sid)}.json`);
const lorePath = (chatId) => `copilot_lore_${san(chatId)}.json`;
const pickPath = (chatId) => `copilot_pick_${san(chatId)}.json`;

// ---------- history (messages may carry lorebook proposal states) ----------
const PROP_STATUS = ["pending", "approved", "rejected", "undone"];

function cleanProps(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.slice(0, 10).map((p) => {
    if (!p || typeof p !== "object") return { status: "pending" };
    const o = { status: PROP_STATUS.includes(p.status) ? p.status : "pending" };
    for (const f of ["action", "bookId", "bookName", "entryId"]) {
      if (typeof p[f] === "string") o[f] = p[f].slice(0, 300);
    }
    if (p.prev && typeof p.prev === "object") {
      o.prev = {
        key: strArr(p.prev.key, 200, 300),
        content: clip(p.prev.content, 100000),
        comment: clip(p.prev.comment, 300),
      };
    }
    if (p.edit && typeof p.edit === "object") {
      o.edit = { name: clip(p.edit.name, 300), keys: strArr(p.edit.keys), content: clip(p.edit.content, 20000) };
    }
    return o;
  });
  return out.some((o) => o.status !== "pending" || o.edit) ? out : undefined;
}

function cleanHistory(raw) {
  return (Array.isArray(raw) ? raw : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => {
      const o = { role: m.role, content: m.content };
      const p = cleanProps(m.props);
      if (p) o.props = p;
      return o;
    });
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
    o.proposals = s.proposals !== false;
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

// Lighter read: active swipe only, no extra data. Falls back to a plain read if unsupported.
async function readMessages(chatId) {
  try {
    return await spindle.chat.getMessages(chatId, { light: true, includeExtra: false, ownMetadataOnly: true });
  } catch (e) {
    return await spindle.chat.getMessages(chatId);
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

// ---------- per-chat message picks ----------
// mode "auto": the last N messages (CTX slider). mode "manual": exactly the picked message ids.
async function getPick(chatId, userId) {
  const k = `${uk(userId)}|${chatId}`;
  if (pickCache.has(k)) return pickCache.get(k);
  let raw = {};
  try {
    raw = await spindle.userStorage.getJson(pickPath(chatId), { fallback: {}, userId });
  } catch (e) {
    spindle.log.warn("[Copilot] load pick failed: " + e.message);
  }
  const pick = {
    mode: raw && raw.mode === "manual" ? "manual" : "auto",
    ids: (Array.isArray(raw && raw.ids) ? raw.ids : []).filter((x) => typeof x === "string").slice(0, 1000),
  };
  pickCache.set(k, pick);
  return pick;
}

async function savePick(chatId, userId, pick) {
  pickCache.set(`${uk(userId)}|${chatId}`, pick);
  try {
    await spindle.userStorage.setJson(pickPath(chatId), pick, { userId });
  } catch (e) {
    spindle.log.warn("[Copilot] save pick failed: " + e.message);
  }
}

// ---------- lorebook books and entries (for proposals) ----------
function needWB() {
  if (!spindle.world_books) {
    throw new Error("Danny Copilot doesn't have the lorebook permission yet. Approve it in the extension's permissions.");
  }
}

async function listAllBooks(userId) {
  needWB();
  const out = [];
  for (let offset = 0; offset < 1000; offset += 200) {
    const r = await spindle.world_books.list({ limit: 200, offset, userId });
    const data = (r && r.data) || [];
    for (const b of data) out.push({ id: b.id, name: b.name });
    if (data.length < 200) break;
  }
  return out;
}

async function listEntries(bookId, userId) {
  needWB();
  const out = [];
  for (let offset = 0; offset < 1000; offset += 200) {
    const r = await spindle.world_books.entries.list(bookId, { limit: 200, offset, userId });
    const data = (r && r.data) || [];
    for (const e of data) out.push(e);
    if (data.length < 200) break;
  }
  return out;
}

// The lorebooks attached to the active chat's character card.
async function getAttached(userId) {
  const active = await spindle.chats.getActive(userId);
  if (!active || !active.character_id) return { characterName: "", books: [] };
  const ck = `${uk(userId)}|${active.id}`;
  const hit = attachedCache.get(ck);
  if (hit && Date.now() - hit.at < 30000) return hit.val;

  const c = await spindle.characters.get(active.character_id, userId);
  const books = [];
  if (spindle.world_books) {
    const ids = c && Array.isArray(c.world_book_ids) ? c.world_book_ids : [];
    for (const id of ids.slice(0, 10)) {
      try {
        const b = await spindle.world_books.get(id, userId);
        if (b) books.push({ id: b.id, name: b.name });
      } catch (e) {
        spindle.log.warn("[Copilot] attached book load failed: " + e.message);
      }
    }
  }
  const val = { characterName: (c && c.name) || "", books };
  attachedCache.set(ck, { at: Date.now(), val });
  return val;
}

async function getEntryNames(userId, books) {
  const key = `${uk(userId)}|${books.map((b) => b.id).join(",")}`;
  const hit = namesCache.get(key);
  if (hit && Date.now() - hit.at < 60000) return hit.names;
  const names = [];
  for (const b of books.slice(0, 3)) {
    try {
      for (const e of await listEntries(b.id, userId)) if (e.comment) names.push(String(e.comment));
    } catch (e) {
      spindle.log.warn("[Copilot] entry names failed: " + e.message);
    }
  }
  namesCache.set(key, { at: Date.now(), names });
  return names;
}

function proposalText(attached, names) {
  let t = PROPOSAL_RULES;
  if (attached.books.length && names.length) {
    t += `\n\nExisting entries in ${attached.books.map((b) => b.name).join(", ")}: ${clip(names.slice(0, 120).join("; "), 3000)}`;
  }
  return t;
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
async function buildContext(userId, settings, opts = {}) {
  const active = await spindle.chats.getActive(userId);
  const useChat = settings.mode !== "general" && !!active;

  const sections = [
    { id: "system", label: "System prompt", text: settings.systemPrompt.trim() || DEFAULT_SYSTEM },
  ];
  const notes = [];
  let loreItems = [];
  let msgsInfo = null;

  const rule = LENGTH_RULES[settings.length];
  if (rule) {
    sections.push({
      id: "length",
      label: `Response length (${LENGTH_LABELS[settings.length]})`,
      text: rule,
    });
  }

  if (settings.proposals) {
    let attached = { characterName: "", books: [] };
    let names = [];
    if (useChat) {
      try {
        attached = await getAttached(userId);
        names = await getEntryNames(userId, attached.books);
      } catch (e) {
        spindle.log.warn("[Copilot] proposal context failed: " + e.message);
      }
    }
    sections.push({
      id: "proposals",
      label: "Lorebook proposals (instructions)",
      text: proposalText(attached, names),
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

    const pick = await getPick(active.id, userId);
    let msgs = [];
    if (settings.ctxCount > 0 || settings.includeLore || pick.mode === "manual" || opts.withMessages) {
      msgs = await readMessages(active.id);
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

    // which chat messages are included: hand-picked ids, or the last N
    let chosen = [];
    if (pick.mode === "manual") {
      const set = new Set(pick.ids);
      chosen = msgs.map((m, i) => ({ m, i })).filter((x) => set.has(String(x.m.id)));
    } else if (settings.ctxCount > 0) {
      const start = Math.max(0, msgs.length - settings.ctxCount);
      chosen = msgs.slice(start).map((m, k) => ({ m, i: start + k }));
    }

    if (chosen.length) {
      const parts = [];
      let prev = -2;
      for (const x of chosen) {
        if (prev >= 0 && x.i - prev > 1) parts.push("[…]");
        parts.push(`[${x.m.role}] ${x.m.content}`);
        prev = x.i;
      }
      sections.push({
        id: "chat",
        label: `Chat messages (${chosen.length})`,
        text: `<roleplay_context>\n${parts.join("\n\n")}\n</roleplay_context>`,
      });
    }

    if (opts.withMessages) {
      const sel = new Set(chosen.map((x) => String(x.m.id)));
      const limit = opts.limit || 60;
      const startIdx = Math.max(0, msgs.length - limit);
      msgsInfo = {
        mode: pick.mode,
        total: msgs.length,
        selected: chosen.length,
        items: msgs.slice(startIdx).map((m, k) => ({
          id: String(m.id),
          i: startIdx + k,
          role: m.role,
          tokens: Math.ceil(String(m.content).length / 4),
          preview: String(m.content).replace(/\s+/g, " ").trim().slice(0, 160),
          sel: sel.has(String(m.id)),
        })),
      };
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

  return { sections, notes, useChat, lore, msgs: msgsInfo };
}

async function sendPreview(userId) {
  const settings = await getSettings(userId);
  const limit = limitCache[uk(userId)] || 60;
  const { sections, notes, useChat, lore, msgs } = await buildContext(userId, settings, {
    withMessages: true,
    limit,
  });
  spindle.sendToFrontend({ type: "context_preview", sections, notes, useChat, lore, msgs }, userId);
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
        const lim = Number(payload.msgLimit);
        if (Number.isFinite(lim)) limitCache[uk(userId)] = Math.max(20, Math.min(500, Math.floor(lim)));
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] context preview failed: " + e.message);
      }
      break;
    }

    case "pick_toggle": {
      try {
        const id = String(payload.id || "");
        const active = await spindle.chats.getActive(userId);
        if (!id || !active) break;
        const settings = await getSettings(userId);
        const pick = await getPick(active.id, userId);
        let ids = pick.ids;
        if (pick.mode === "auto") {
          const msgs = await readMessages(active.id);
          ids = settings.ctxCount > 0 ? msgs.slice(-settings.ctxCount).map((m) => String(m.id)) : [];
        }
        const s = new Set(ids);
        const on = typeof payload.on === "boolean" ? payload.on : !s.has(id);
        if (on) s.add(id);
        else s.delete(id);
        await savePick(active.id, userId, { mode: "manual", ids: [...s].slice(0, 1000) });
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] pick_toggle failed: " + e.message);
      }
      break;
    }

    case "pick_set": {
      try {
        const active = await spindle.chats.getActive(userId);
        if (!active) break;
        const pick = payload.action === "none" ? { mode: "manual", ids: [] } : { mode: "auto", ids: [] };
        await savePick(active.id, userId, pick);
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] pick_set failed: " + e.message);
      }
      break;
    }

    case "pick_range": {
      try {
        const active = await spindle.chats.getActive(userId);
        if (!active) break;
        const msgs = await readMessages(active.id);
        const a = msgs.findIndex((m) => String(m.id) === String(payload.from));
        const b = msgs.findIndex((m) => String(m.id) === String(payload.to));
        if (a < 0 || b < 0) break;
        const ids = msgs.slice(Math.min(a, b), Math.max(a, b) + 1).map((m) => String(m.id)).slice(0, 1000);
        await savePick(active.id, userId, { mode: "manual", ids });
        await sendPreview(userId);
      } catch (e) {
        spindle.log.warn("[Copilot] pick_range failed: " + e.message);
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

    // ----- lorebook proposals -----
    case "lore_targets": {
      const rid = payload.rid;
      try {
        needWB();
        const att = await getAttached(userId);
        const all = att.books.length ? [] : await listAllBooks(userId);
        spindle.sendToFrontend({
          type: "lore_targets", rid, ok: true,
          characterName: att.characterName, attached: att.books, all,
        }, userId);
      } catch (e) {
        spindle.sendToFrontend({ type: "lore_targets", rid, ok: false, error: e.message }, userId);
      }
      break;
    }

    case "lore_lookup": {
      const rid = payload.rid;
      try {
        needWB();
        const att = await getAttached(userId);
        const books = att.books.length ? att.books : (await listAllBooks(userId)).slice(0, 20);
        const want = norm(payload.name);
        let hit = null;
        let hitBook = null;
        for (const b of books) {
          const found = (await listEntries(b.id, userId)).find((e) => norm(e.comment) === want);
          if (found) { hit = found; hitBook = b; break; }
        }
        if (!hit) {
          spindle.sendToFrontend({ type: "lore_lookup", rid, ok: true, found: false }, userId);
        } else {
          spindle.sendToFrontend({
            type: "lore_lookup", rid, ok: true, found: true,
            bookId: hitBook.id, bookName: hitBook.name, entryId: hit.id,
            name: String(hit.comment || ""), keys: strArr(hit.key, 200, 300), content: String(hit.content || ""),
          }, userId);
        }
      } catch (e) {
        spindle.sendToFrontend({ type: "lore_lookup", rid, ok: false, error: e.message }, userId);
      }
      break;
    }

    case "lore_apply": {
      const rid = payload.rid;
      try {
        needWB();
        const name = clip(payload.name, 300).trim();
        const content = clip(payload.content, 20000).trim();
        const keys = strArr(payload.keys);
        if (!content) throw new Error("The entry has no content.");

        let reply;
        if (payload.action === "update" && payload.entryId) {
          const cur = await spindle.world_books.entries.get(String(payload.entryId), userId);
          if (!cur) throw new Error("That entry no longer exists.");
          const prev = {
            key: strArr(cur.key, 200, 300),
            content: String(cur.content || ""),
            comment: String(cur.comment || ""),
          };
          const patch = { content };
          if (keys.length) patch.key = keys;
          if (name && name !== cur.comment) patch.comment = name;
          await spindle.world_books.entries.update(cur.id, patch, userId);
          const book = await spindle.world_books.get(cur.world_book_id, userId).catch(() => null);
          reply = {
            action: "update", bookId: cur.world_book_id, bookName: book ? book.name : "",
            entryId: cur.id, prev,
          };
        } else {
          const bookId = String(payload.bookId || "");
          if (!bookId) throw new Error("No lorebook selected.");
          const book = await spindle.world_books.get(bookId, userId);
          if (!book) throw new Error("That lorebook no longer exists.");
          const e = await spindle.world_books.entries.create(
            bookId,
            { key: keys, content, comment: name || "Untitled entry", disabled: false },
            userId,
          );
          reply = { action: "create", bookId, bookName: book.name, entryId: e.id };
        }
        loreCache.clear();
        namesCache.clear();
        spindle.sendToFrontend({ type: "lore_applied", rid, ok: true, ...reply }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] lore_apply failed: " + e.message);
        spindle.sendToFrontend({ type: "lore_applied", rid, ok: false, error: e.message }, userId);
      }
      break;
    }

    case "lore_undo": {
      const rid = payload.rid;
      try {
        needWB();
        const entryId = String(payload.entryId || "");
        if (!entryId) throw new Error("Nothing to undo.");
        if (payload.action === "create") {
          await spindle.world_books.entries.delete(entryId, userId);
        } else {
          const prev = payload.prev;
          if (!prev || typeof prev !== "object") throw new Error("The old version wasn't saved.");
          await spindle.world_books.entries.update(entryId, {
            content: String(prev.content || ""),
            key: strArr(prev.key, 200, 300),
            comment: String(prev.comment || ""),
          }, userId);
        }
        loreCache.clear();
        namesCache.clear();
        spindle.sendToFrontend({ type: "lore_undone", rid, ok: true }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] lore_undo failed: " + e.message);
        spindle.sendToFrontend({ type: "lore_undone", rid, ok: false, error: e.message }, userId);
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

        const past = cleanHistory(payload.history)
          .slice(-40)
          .map(({ role, content }) => ({ role, content }));

        const messages = [
          { role: "system", content: sections.map((s) => s.text).join("\n\n") },
          ...past,
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