const DEFAULT_SYSTEM = `You are Copilot, an out-of-character (OOC) assistant for a roleplay writer.
Help with brainstorming, plot ideas, character analysis, lore and scene review.
Never write dialogue or actions for the user's character, and never continue the roleplay.
Be concise and direct.`;

const DEFAULT_VOICES = {
  danny: {
    name: "Danny",
    text: `Your name is Danny. You talk like the chronically online AO3 writer friend everyone has: lowercase, short forms (tbh, ngl, imo, lbr), CAPSLOCK for emphasis, and sparse kaomojis like (ᗒᗣᗕ)՞ or (●ˇ∀ˇ●). Warm, a little chaotic, easily obsessed with the writer's characters and ships. Keep your response concise unless the writer asks for more.`,
  },
  blair: {
    name: "Blair",
    text: `Your name is Blair. You're a rich, sassy, flirty bestie straight out of stan twt: confident, dramatic and here to have fun. Use stan twt and drag-scene slang naturally, not in every sentence (mother, serve, ate, slay, cunt as a term of praise, iconic, the way I gasped, gag). Tease the writer playfully and never meanly, be flirty, and think Gina Linetti: unbothered, self-assured, hilarious. You LOVE character building: get excited about motivations, flaws, contradictions and tiny habits that make a character feel real. Underneath the sass, your feedback is still honest and useful. Keep replies punchy.`,
  },
  woinker: {
    name: "Woinker",
    text: `Your name is Woinker. You are the dry, impeccably British manager of a galactic restaurant at the edge of known space. Understated wit, polite exasperation, a fondness for "rather", "quite" and "I daresay". You adore world-building and treat settings like a menu: cultures, politics, economies and customs are courses, and you always notice what a world eats, grows, trades and cooks. Weave in food talk, both ordinary (a proper roast) and galactic (nebula broth, void-aged cheese), without overdoing it. Stay genuinely helpful beneath the deadpan. Keep replies compact.`,
  },
};
const VOICE_NOTE =
  "\n\nYour voice applies to your normal replies only. Anything you write inside lorebook entries or chat edits must be clean, neutral prose that fits the roleplay, never in your voice.";
const isVoice = (v) => v === "default" || Object.prototype.hasOwnProperty.call(DEFAULT_VOICES, v);

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

const CHAT_EDIT_RULES = `CHAT EDIT PROPOSALS
Messages in the roleplay context are numbered like [#143 assistant]. You can propose a rewrite of ONE of those messages, but ONLY when the writer explicitly asks you to fix, rewrite, shorten or otherwise change a specific message. Never propose unprompted. Only messages shown in the context can be edited.
After your short reply, add one block per message, in exactly this format:

<chat_edit message="143">
note: one short line saying what you changed
content:
The COMPLETE new text of the message.
</chat_edit>

content replaces the whole message, so keep everything that should stay, including its formatting. The writer reviews and approves every edit in the app, so don't explain the format or mention approval.`;

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
  chatEdits: true,
  voice: "default",
  voiceTexts: {},
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
    for (const f of ["action", "bookId", "bookName", "entryId", "chatId", "chatName", "msgId", "msgRole"]) {
      if (typeof p[f] === "string") o[f] = p[f].slice(0, 300);
    }
    if (typeof p.before === "string") o.before = p.before.slice(0, 100000);
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
    o.chatEdits = s.chatEdits !== false;
    if (typeof s.systemPrompt === "string") o.systemPrompt = s.systemPrompt.slice(0, 8000);
    if (isVoice(s.voice)) o.voice = s.voice;
    const vt = {};
    if (s.voiceTexts && typeof s.voiceTexts === "object") {
      for (const id of Object.keys(DEFAULT_VOICES)) {
        if (typeof s.voiceTexts[id] === "string" && s.voiceTexts[id].trim()) {
          vt[id] = s.voiceTexts[id].slice(0, 2000);
        }
      }
    }
    o.voiceTexts = vt;
    // one-time move: an old custom "AO3 Danny" system prompt becomes the Danny voice
    if (typeof s.voice !== "string" && /\bAO3\b/i.test(o.systemPrompt)) {
      o.systemPrompt = "";
      o.voice = "danny";
    }
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

async function assertChat(chatId, userId) {
  if (!chatId || chatId === "general") throw new Error("Chat edits only work in “This chat” mode.");
  const chat = await spindle.chats.get(String(chatId), userId);
  if (!chat) throw new Error("That chat isn't available.");
  return chat;
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
  const shelf = await getShelf(userId, key, sessions.active);
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
    files: lightFiles(shelf.items),
    settings,
    defaultSystem: DEFAULT_SYSTEM,
    defaultVoices: DEFAULT_VOICES,
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

// ---------- attachments (one shelf of files per session) ----------
const filesCache = new Map();
const filesPath = (key, sid) => `copilot_files_${san(key)}_${san(sid)}.json`;
const MAX_FILES = 12;
const MAX_IMAGES = 6;
const MAX_TEXT_TOTAL = 300000;
const newId = () => "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const estImg = (w, h) => Math.min(1600, Math.ceil((w * h) / 750));

function cleanShelf(raw) {
  const items = [];
  for (const x of Array.isArray(raw && raw.items) ? raw.items : []) {
    if (!x || typeof x !== "object" || typeof x.id !== "string") continue;
    const base = { id: san(x.id).slice(0, 40), name: clip(x.name, 120) || "file", on: x.on !== false };
    if (x.kind === "text" && typeof x.text === "string") {
      items.push({ ...base, kind: "text", text: x.text.slice(0, 60000), truncated: x.truncated === true });
    } else if (x.kind === "image" && typeof x.data === "string" && typeof x.thumb === "string") {
      const w = Math.floor(Number(x.w));
      const h = Math.floor(Number(x.h));
      if (w >= 1 && w <= 4096 && h >= 1 && h <= 4096) {
        items.push({ ...base, kind: "image", data: x.data, mime: "image/jpeg", w, h, thumb: x.thumb });
      }
    }
  }
  return { items: items.slice(0, MAX_FILES) };
}

async function getShelf(userId, key, sid) {
  const ck = `${uk(userId)}|${key}|${sid}`;
  if (filesCache.has(ck)) return filesCache.get(ck);
  let raw = {};
  try {
    raw = await spindle.userStorage.getJson(filesPath(key, sid), { fallback: {}, userId });
  } catch (e) {
    spindle.log.warn("[Copilot] load attachments failed: " + e.message);
  }
  const shelf = { key, sid, items: cleanShelf(raw).items };
  if (filesCache.size > 8) filesCache.clear();
  filesCache.set(ck, shelf);
  return shelf;
}

async function saveShelf(userId, shelf) {
  try {
    await spindle.userStorage.setJson(filesPath(shelf.key, shelf.sid), { items: shelf.items }, { userId });
  } catch (e) {
    spindle.log.warn("[Copilot] save attachments failed: " + e.message);
  }
}

const itemTokens = (x) => (x.kind === "image" ? estImg(x.w, x.h) : Math.ceil(x.text.length / 4));

function lightFiles(items) {
  return items.map((x) => ({
    id: x.id,
    kind: x.kind,
    name: x.name,
    on: x.on,
    tokens: itemTokens(x),
    thumb: x.kind === "image" ? x.thumb : undefined,
    truncated: x.truncated || undefined,
  }));
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
  if (settings.voice !== "default" && DEFAULT_VOICES[settings.voice]) {
    const dv = DEFAULT_VOICES[settings.voice];
    const vtext = (settings.voiceTexts[settings.voice] || "").trim() || dv.text;
    sections.push({ id: "voice", label: `Voice: ${dv.name}`, text: `VOICE\n${vtext}${VOICE_NOTE}` });
  }
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

  if (settings.chatEdits && useChat) {
    sections.push({
      id: "chatedits",
      label: "Chat edit proposals (instructions)",
      text: CHAT_EDIT_RULES,
    });
  }

  // attachments: text files go into the system message, images ride on the last user message
  let images = [];
  let imgTokensTotal = 0;
  try {
    const shelfKey = useChat ? active.id : "general";
    const sidx = await getSessions(shelfKey, userId);
    const shelf = await getShelf(userId, shelfKey, sidx.active);
    shelf.items
      .filter((x) => x.on && x.kind === "text")
      .forEach((x, i) => {
        sections.push({
          id: `file${i}`,
          label: `Attachment: ${x.name}`,
          text: `<attached_file name="${x.name}">\n${x.text}\n</attached_file>`,
        });
      });
    const imgs = shelf.items.filter((x) => x.on && x.kind === "image");
    imgTokensTotal = imgs.reduce((a, x) => a + itemTokens(x), 0);
    if (imgs.length) {
      notes.push(
        `${imgs.length} image${imgs.length > 1 ? "s" : ""} attached (~${imgTokensTotal} tokens). Needs a vision-capable model.`,
      );
      if (opts.forSend) images = imgs.map((x) => ({ data: x.data, mime: x.mime }));
    }
  } catch (e) {
    spindle.log.warn("[Copilot] attachments failed: " + e.message);
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
        parts.push(`[${settings.chatEdits ? "#" + x.i + " " : ""}${x.m.role}] ${x.m.content}`);
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

  return { sections, notes, useChat, lore, msgs: msgsInfo, images, imgTokens: imgTokensTotal };
}

async function sendPreview(userId) {
  const settings = await getSettings(userId);
  const limit = limitCache[uk(userId)] || 60;
  const { sections, notes, useChat, lore, msgs, imgTokens } = await buildContext(userId, settings, {
    withMessages: true,
    limit,
  });
  spindle.sendToFrontend({ type: "context_preview", sections, notes, useChat, lore, msgs, imgTokens }, userId);
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
        filesCache.clear();
        await spindle.userStorage.setJson(filesPath(key, sid), { items: [] }, { userId });
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

    case "file_add": {
      try {
        const { key } = await resolveKey(userId);
        const sidx = await getSessions(key, userId);
        const shelf = await getShelf(userId, key, sidx.active);
        const name = clip(payload.name, 120).trim() || "file";
        let error;

        if (shelf.items.length >= MAX_FILES) {
          error = `You can attach up to ${MAX_FILES} files per session.`;
        } else if (payload.kind === "image") {
          const w = Math.floor(Number(payload.w));
          const h = Math.floor(Number(payload.h));
          const data = String(payload.data || "");
          const thumb = String(payload.thumb || "");
          if (shelf.items.filter((x) => x.kind === "image").length >= MAX_IMAGES) {
            error = `You can attach up to ${MAX_IMAGES} images per session.`;
          } else if (
            !(w >= 1 && w <= 4096 && h >= 1 && h <= 4096) ||
            !data || data.length > 1500000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data) ||
            thumb.length > 30000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(thumb)
          ) {
            error = "That image couldn't be read.";
          } else {
            shelf.items.push({ id: newId(), kind: "image", name, on: true, data, mime: "image/jpeg", w, h, thumb });
          }
        } else {
          const raw = String(payload.text || "");
          const textTotal = shelf.items.filter((x) => x.kind === "text").reduce((a, x) => a + x.text.length, 0);
          if (!raw.trim()) error = "That file is empty.";
          else if (textTotal + Math.min(raw.length, 60000) > MAX_TEXT_TOTAL) {
            error = "That would be too much text for one session. Remove a file first.";
          } else {
            shelf.items.push({
              id: newId(), kind: "text", name, on: true,
              text: raw.slice(0, 60000), truncated: raw.length > 60000,
            });
          }
        }

        if (!error) await saveShelf(userId, shelf);
        spindle.sendToFrontend({ type: "files", files: lightFiles(shelf.items), error }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] file_add failed: " + e.message);
        spindle.sendToFrontend({ type: "files", error: "Couldn't attach that file." }, userId);
      }
      break;
    }

    case "file_toggle":
    case "file_remove":
    case "file_clear": {
      try {
        const { key } = await resolveKey(userId);
        const sidx = await getSessions(key, userId);
        const shelf = await getShelf(userId, key, sidx.active);
        const id = String(payload.id || "");
        if (payload.type === "file_toggle") {
          const it = shelf.items.find((x) => x.id === id);
          if (it) it.on = typeof payload.on === "boolean" ? payload.on : !it.on;
        } else if (payload.type === "file_remove") {
          shelf.items = shelf.items.filter((x) => x.id !== id);
        } else {
          shelf.items = [];
        }
        await saveShelf(userId, shelf);
        spindle.sendToFrontend({ type: "files", files: lightFiles(shelf.items) }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] file update failed: " + e.message);
      }
      break;
    }


    case "chat_lookup": {
      const rid = payload.rid;
      try {
        const chat = await assertChat(String(payload.chatId || ""), userId);
        const msgs = await readMessages(chat.id);
        const idx = Math.floor(Number(payload.index));
        if (!(idx >= 0 && idx < msgs.length)) throw new Error(`There is no message #${payload.index} in this chat.`);
        const m = msgs[idx];
        spindle.sendToFrontend({
          type: "chat_lookup", rid, ok: true,
          msgId: String(m.id), role: m.role, content: String(m.content || ""), chatName: String(chat.name || ""),
        }, userId);
      } catch (e) {
        spindle.sendToFrontend({ type: "chat_lookup", rid, ok: false, error: e.message }, userId);
      }
      break;
    }

    case "chat_apply": {
      const rid = payload.rid;
      try {
        const chat = await assertChat(String(payload.chatId || ""), userId);
        const content = clip(payload.content, 100000);
        if (!content.trim()) throw new Error("The new message is empty.");
        const msgs = await readMessages(chat.id);
        const cur = msgs.find((m) => String(m.id) === String(payload.msgId));
        if (!cur) throw new Error("That message no longer exists.");
        if (String(cur.content || "") !== String(payload.base || "")) {
          throw new Error("That message was changed after this card was made, so I didn't overwrite it. Reject this card and ask Danny again.");
        }
        await spindle.chat.updateMessage(chat.id, cur.id, { content });
        loreCache.clear();
        spindle.sendToFrontend({ type: "chat_applied", rid, ok: true }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] chat_apply failed: " + e.message);
        spindle.sendToFrontend({ type: "chat_applied", rid, ok: false, error: e.message }, userId);
      }
      break;
    }

    case "chat_undo": {
      const rid = payload.rid;
      try {
        const chat = await assertChat(String(payload.chatId || ""), userId);
        const prev = clip(payload.prev, 100000);
        if (!prev.trim()) throw new Error("The old version wasn't saved.");
        const msgs = await readMessages(chat.id);
        const cur = msgs.find((m) => String(m.id) === String(payload.msgId));
        if (!cur) throw new Error("That message no longer exists.");
        if (String(cur.content || "") !== String(payload.applied || "")) {
          throw new Error("That message was edited again after Danny's change, so I won't overwrite it.");
        }
        await spindle.chat.updateMessage(chat.id, cur.id, { content: prev });
        loreCache.clear();
        spindle.sendToFrontend({ type: "chat_undone", rid, ok: true }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] chat_undo failed: " + e.message);
        spindle.sendToFrontend({ type: "chat_undone", rid, ok: false, error: e.message }, userId);
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
        const { sections, images } = await buildContext(userId, settings, { forSend: true });

        const past = cleanHistory(payload.history)
          .slice(-40)
          .map(({ role, content }) => ({ role, content }));

        const text = String(payload.text || "");
        const lastContent = images.length
          ? [{ type: "text", text }, ...images.map((im) => ({ type: "image", data: im.data, mime_type: im.mime }))]
          : text;

        const messages = [
          { role: "system", content: sections.map((s) => s.text).join("\n\n") },
          ...past,
          { role: "user", content: lastContent },
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