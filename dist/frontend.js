const svg = (inner, size = 16) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const ICONS = {
  tab: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  sliders: '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  send: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
};

const STYLES = `
  .cp-root {
    --cp-primary: var(--lumiverse-primary, #7c6dfa);
    --cp-muted: var(--lumiverse-text-muted, rgba(127,127,127,0.85));
    --cp-border: var(--lumiverse-border, rgba(127,127,127,0.28));
    --cp-fill: var(--lumiverse-fill-subtle, rgba(127,127,127,0.08));
    --cp-fill-hover: var(--lumiverse-fill-hover, rgba(127,127,127,0.16));
    --cp-surface: var(--lumiverse-bg-elevated, rgba(127,127,127,0.1));
    --cp-tint: var(--lumiverse-primary-010, rgba(124,109,250,0.1));
    --cp-radius: var(--lumiverse-radius, 10px);
    --cp-on-primary: var(--lumiverse-primary-text, #fff);
    display:flex; flex-direction:column; height:100%; gap:8px; padding:10px; box-sizing:border-box;
    color:var(--lumiverse-text, inherit); font-family:var(--lumiverse-font-family, inherit); font-size:13px;
  }
  .cp-root select, .cp-root input, .cp-root textarea, .cp-root button { font:inherit; color:inherit; box-sizing:border-box; }

  .cp-row { display:flex; gap:6px; align-items:center; }
  .cp-ico { display:grid; place-items:center; flex:none; color:var(--cp-muted); }
  .cp-dim { font-size:11px; color:var(--cp-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .cp-sel {
    appearance:none; -webkit-appearance:none; height:30px; padding:0 26px 0 10px; min-width:0; cursor:pointer;
    background-color:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius);
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 8px center; text-overflow:ellipsis;
  }
  .cp-sel option { background:var(--lumiverse-bg-elevated, #1a1a1f); color:var(--lumiverse-text, inherit); }
  .cp-sel:focus, .cp-num:focus, .cp-field:focus, .cp-input:focus, .cp-edit:focus, .cp-set textarea:focus { outline:none; border-color:var(--cp-primary); }

  .cp-field { flex:1; min-width:0; height:30px; padding:0 10px;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius); }

  .cp-ibtn {
    width:30px; height:30px; flex:none; display:grid; place-items:center; padding:0; cursor:pointer;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius);
    transition:background 0.15s, border-color 0.15s, color 0.15s;
  }
  .cp-ibtn:hover { background:var(--cp-fill-hover); }
  .cp-ibtn.on { border-color:var(--cp-primary); color:var(--cp-primary); }

  .cp-ctx { flex:1; min-width:0; display:flex; align-items:center; gap:6px; color:var(--cp-muted); font-size:11px; letter-spacing:0.04em; }
  .cp-ctx input[type=range] { flex:1; min-width:30px; accent-color:var(--cp-primary); }
  .cp-num { width:44px; height:30px; flex:none; text-align:center; padding:0 4px;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius); }

  .cp-set { display:none; flex-direction:column; gap:8px; padding:10px; font-size:12px;
    background:var(--cp-fill); border:1px solid var(--cp-border); border-radius:var(--cp-radius); }
  .cp-set.open { display:flex; }
  .cp-check { display:flex; gap:8px; align-items:center; cursor:pointer; }
  .cp-check input { accent-color:var(--cp-primary); }
  .cp-set textarea { height:110px; resize:vertical; padding:8px 10px; line-height:1.4;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius); }

  .cp-btn { height:28px; padding:0 12px; cursor:pointer; background:var(--cp-surface);
    border:1px solid var(--cp-border); border-radius:var(--cp-radius); }
  .cp-btn:hover { background:var(--cp-fill-hover); }
  .cp-btn.primary { background:var(--cp-primary); border-color:transparent; color:var(--cp-on-primary); }
  .cp-btn.icon { display:inline-flex; align-items:center; gap:6px; padding:0 10px; }
  .cp-btn.on { border-color:var(--cp-primary); color:var(--cp-primary); }

  .cp-log { flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:2px; scrollbar-width:thin; }
  .cp-wrap { display:flex; flex-direction:column; gap:3px; min-width:0; }
  .cp-wrap.user { align-self:flex-end; align-items:flex-end; max-width:88%; }
  .cp-wrap.assistant { align-self:stretch; }
  .cp-msg { white-space:pre-wrap; padding:9px 12px; line-height:1.5; word-break:break-word;
    border:1px solid var(--cp-border); border-radius:var(--cp-radius); }
  .cp-msg.user { background:var(--cp-tint); border-color:color-mix(in srgb, var(--cp-primary) 35%, transparent); }
  .cp-msg.assistant { background:var(--cp-fill); }

  .cp-bar { display:flex; gap:2px; align-items:center; opacity:0.5; transition:opacity 0.15s; }
  .cp-wrap:hover .cp-bar, .cp-bar.show { opacity:1; }
  .cp-act { width:24px; height:24px; display:grid; place-items:center; padding:0; background:none;
    border:none; border-radius:6px; cursor:pointer; color:inherit; flex:none; }
  .cp-act:hover { background:var(--cp-fill-hover); }
  .cp-edit { width:100%; min-height:80px; resize:vertical; padding:8px 10px; line-height:1.4;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius); }

  .cp-foot { justify-content:space-between; }
  .cp-readout { font-size:11px; color:var(--cp-muted); white-space:nowrap; }

  .cp-ctxview { flex:1; min-height:0; overflow-y:auto; display:none; flex-direction:column; gap:8px; scrollbar-width:thin; }
  .cp-ctxview.open { display:flex; }
  .cp-sec { padding:8px 10px; cursor:pointer; background:var(--cp-fill);
    border:1px solid var(--cp-border); border-radius:var(--cp-radius); }
  .cp-sec:hover { background:var(--cp-fill-hover); }
  .cp-sec-top { display:flex; gap:8px; align-items:center; }
  .cp-sec-name { flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cp-meter { height:4px; margin-top:6px; border-radius:2px; background:var(--cp-fill-hover); overflow:hidden; }
  .cp-meter-fill { height:100%; background:var(--cp-primary); border-radius:2px; }
  .cp-pre { margin:8px 0 0; padding:8px; max-height:240px; overflow:auto; cursor:text; white-space:pre-wrap;
    word-break:break-word; font-family:var(--lumiverse-font-mono, monospace); font-size:11px; line-height:1.45;
    background:var(--cp-fill-hover); border-radius:8px; }

  .cp-lore { display:flex; flex-direction:column; gap:2px; padding:8px 10px; background:var(--cp-fill);
    border:1px solid var(--cp-border); border-radius:var(--cp-radius); }
  .cp-lore-head { display:flex; gap:6px; align-items:center; margin-bottom:4px; }
  .cp-lrow { display:flex; gap:6px; align-items:center; cursor:pointer; padding:1px 0; }
  .cp-lrow input { accent-color:var(--cp-primary); flex:none; margin:0; }
  .cp-lrow.dim .cp-sec-name { opacity:0.5; }
  .cp-act.pinned { color:var(--cp-primary); }
  .cp-act.pinned svg { fill:currentColor; }

  .cp-top, .cp-bottom { position:sticky; z-index:5; display:flex; flex-direction:column; gap:8px;
    background:var(--lumiverse-bg, #101014);
    background:color-mix(in srgb, var(--lumiverse-bg, #101014) 90%, transparent);
    -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); }
  .cp-top { top:0; margin:-10px -10px 0; padding:10px 10px 8px; }
  .cp-bottom { bottom:0; margin:0 -10px -10px; padding:8px 10px 10px; }

  .cp-plist { max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; scrollbar-width:thin; }
  .cp-prow { display:flex; gap:6px; align-items:flex-start; padding:3px 4px; border-radius:6px; cursor:pointer; }
  .cp-prow:hover { background:var(--cp-fill-hover); }
  .cp-prow input { accent-color:var(--cp-primary); flex:none; margin:2px 0 0; pointer-events:none; }
  .cp-prow.off .cp-ptext { opacity:0.5; }
  .cp-prow.start { outline:1px solid var(--cp-primary); }
  .cp-ptag { flex:none; width:26px; padding-top:2px; font-size:10px; text-transform:uppercase; color:var(--cp-muted); }
  .cp-ptext { flex:1; min-width:0; font-size:12px; line-height:1.35; word-break:break-word; overflow:hidden;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

  .cp-inputbar { display:flex; align-items:flex-end; gap:8px; }
  .cp-input { flex:1; min-width:0; resize:none; min-height:38px; max-height:140px; padding:9px 14px; line-height:1.4;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:19px; }
  .cp-send { width:38px; height:38px; flex:none; display:grid; place-items:center; padding:0; cursor:pointer;
    border:1px solid transparent; border-radius:50%; background:var(--cp-primary); color:var(--cp-on-primary); }
  .cp-send.busy { background:var(--cp-surface); color:inherit; border-color:var(--cp-border); }

  .cp-md { white-space:normal; }
  .cp-md p, .cp-md ul, .cp-md ol, .cp-md blockquote, .cp-md pre { margin:0 0 0.6em; }
  .cp-md > :last-child { margin-bottom:0; }
  .cp-md ul, .cp-md ol { padding-left:1.4em; }
  .cp-md h1, .cp-md h2, .cp-md h3, .cp-md h4 { font-size:1em; font-weight:700; margin:0.4em 0 0.3em; }
  .cp-md h1 { font-size:1.15em; }
  .cp-md h2 { font-size:1.08em; }
  .cp-md blockquote { border-left:3px solid var(--cp-border); padding-left:10px; opacity:0.85; }
  .cp-md pre { overflow-x:auto; padding:8px 10px; background:var(--cp-fill-hover); border-radius:8px; }
  .cp-md code { font-family:var(--lumiverse-font-mono, monospace); font-size:12px; background:var(--cp-fill-hover); padding:0 4px; border-radius:4px; }
  .cp-md pre code { background:none; padding:0; }
  .cp-md a { color:var(--cp-primary); text-decoration:underline; }
  .cp-md hr { border:none; border-top:1px solid var(--cp-border); margin:0.6em 0; }
`;

// ---------- markdown ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s) {
  const codes = [];
  s = s.replace(/`([^`\n]+)`/g, (m, c) => {
    codes.push(c);
    return "\uE000" + (codes.length - 1) + "\uE000";
  });
  s = esc(s);
  s = s.replace(
    /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  s = s.replace(/\*\*(?!\s)([^*\n]+?)(?<!\s)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(?!\s)([^_\n]+?)(?<!\s)__/g, "<strong>$1</strong>");
  s = s.replace(/\*(?!\s)([^*\n]+?)(?<!\s)\*/g, "<em>$1</em>");
  s = s.replace(/(^|[^\w])_(?!\s)([^_\n]+?)(?<!\s)_(?=[^\w]|$)/g, "$1<em>$2</em>");
  s = s.replace(/~~(?!\s)([^~\n]+?)(?<!\s)~~/g, "<del>$1</del>");
  s = s.replace(/\uE000(\d+)\uE000/g, (m, i) => "<code>" + esc(codes[i]) + "</code>");
  return s;
}

const RE = {
  fence: /^\s*```/,
  fenceEnd: /^\s*```\s*$/,
  h: /^(#{1,6})\s+(.*)$/,
  hr: /^\s*([-*_])(?:\s*\1){2,}\s*$/,
  quote: /^\s*>/,
  ul: /^\s*[-*+]\s+/,
  ol: /^\s*\d+[.)]\s+/,
};
const startsBlock = (l) =>
  RE.fence.test(l) || RE.h.test(l) || RE.hr.test(l) || RE.quote.test(l) || RE.ul.test(l) || RE.ol.test(l);

function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (RE.fence.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !RE.fenceEnd.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push("<pre><code>" + esc(buf.join("\n")) + "</code></pre>");
      continue;
    }

    let m = line.match(RE.h);
    if (m) {
      const n = Math.min(m[1].length, 4);
      out.push(`<h${n}>${inline(m[2])}</h${n}>`);
      i++;
      continue;
    }

    if (RE.hr.test(line)) { out.push("<hr>"); i++; continue; }

    if (RE.quote.test(line)) {
      const buf = [];
      while (i < lines.length && RE.quote.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push("<blockquote>" + renderMarkdown(buf.join("\n")) + "</blockquote>");
      continue;
    }

    if (RE.ul.test(line)) {
      const items = [];
      while (i < lines.length && RE.ul.test(lines[i])) {
        items.push(lines[i].replace(RE.ul, ""));
        i++;
      }
      out.push("<ul>" + items.map((t) => "<li>" + inline(t) + "</li>").join("") + "</ul>");
      continue;
    }

    if (RE.ol.test(line)) {
      const items = [];
      while (i < lines.length && RE.ol.test(lines[i])) {
        items.push(lines[i].replace(RE.ol, ""));
        i++;
      }
      out.push("<ol>" + items.map((t) => "<li>" + inline(t) + "</li>").join("") + "</ol>");
      continue;
    }

    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) { buf.push(lines[i]); i++; }
    out.push("<p>" + buf.map(inline).join("<br>") + "</p>");
  }
  return out.join("");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const est = (s) => Math.ceil(String(s).length / 4);
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));

// ---------- extension ----------
export function setup(ctx) {
  console.log("[danny_copilot] frontend setup running");

  let busy = false;
  let reqId = 0;
  let history = [];
  let assistantText = "";
  let currentBubble = null;
  let currentKey = undefined; // "<chatId or general>|<sessionId>"
  let currentBase = null;
  let currentSid = null;
  let sendKey = null;
  let raf = 0;
  let defaultSystem = "";
  let delArmed = false;
  let delTimer = 0;
  let previewTimer = 0;
  let ctxSections = null;
  let ctxUseChat = false;
  let ctxNotes = [];
  let ctxLore = [];
  let ctxOpen = false;
  let ctxMsgs = null;
  let msgLimit = 60;
  let rangeArmed = false;
  let rangeStart = null;
  let pickScrollTop = null;
  let sessions = { active: null, list: [] };
  const openIds = new Set();
  let settings = {
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

  const removeStyle = ctx.dom.addStyle(STYLES);

  const tab = ctx.ui.registerDrawerTab({
    id: "copilot",
    title: "Copilot",
    shortName: "Copilot",
    description: "OOC assistant for brainstorming and lore",
    keywords: ["copilot", "ooc", "assistant", "brainstorm"],
    headerTitle: "Copilot",
    iconSvg: svg(ICONS.tab, 24),
  });

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };
  const iconBtn = (icon, title, cls) => {
    const b = el("button", cls || "cp-ibtn");
    b.innerHTML = svg(icon, 16);
    b.title = title;
    b.setAttribute("aria-label", title);
    return b;
  };

  const root = el("div", "cp-root");

  // row 1: mode, CTX slider, settings
  const topRow = el("div", "cp-row");
  const modeSelect = el("select", "cp-sel");
  modeSelect.style.width = "104px";
  for (const [v, t] of [["chat", "This chat"], ["general", "General"]]) {
    const o = el("option", "", t);
    o.value = v;
    modeSelect.appendChild(o);
  }

  const ctxWrap = el("div", "cp-ctx");
  const ctxRange = el("input");
  ctxRange.type = "range";
  ctxRange.min = "0";
  ctxRange.max = "50";
  ctxRange.title = "How many recent chat messages Copilot can see";
  const ctxNum = el("input", "cp-num");
  ctxNum.type = "number";
  ctxNum.min = "0";
  ctxNum.max = "200";
  ctxWrap.append(el("span", "", "CTX"), ctxRange);

  const settingsBtn = iconBtn(ICONS.sliders, "Settings");
  topRow.append(modeSelect, ctxWrap, ctxNum, settingsBtn);

  // row 2: connection
  const connRow = el("div", "cp-row");
  const connIco = el("span", "cp-ico");
  connIco.innerHTML = svg(ICONS.cpu, 16);
  const connSelect = el("select", "cp-sel");
  connSelect.style.flex = "1";
  connSelect.title = "Connection used for Copilot";
  connRow.append(connIco, connSelect);

  // row 3: sessions
  const sessRow = el("div", "cp-row");
  const sessSelect = el("select", "cp-sel");
  sessSelect.style.flex = "1";
  sessSelect.title = "Copilot session";
  const renameInput = el("input", "cp-field");
  renameInput.style.display = "none";
  renameInput.maxLength = 60;
  const newBtn = iconBtn(ICONS.plus, "New session");
  const renBtn = iconBtn(ICONS.edit, "Rename session");
  const delBtn = iconBtn(ICONS.trash, "Delete session");
  sessRow.append(sessSelect, renameInput, newBtn, renBtn, delBtn);

  // settings panel
  const setPanel = el("div", "cp-set");
  const cardRow = el("label", "cp-check");
  const cardCb = el("input");
  cardCb.type = "checkbox";
  cardRow.append(cardCb, el("span", "", "Include character card"));
  const personaRow = el("label", "cp-check");
  const personaCb = el("input");
  personaCb.type = "checkbox";
  personaRow.append(personaCb, el("span", "", "Include persona"));
  const loreRow = el("label", "cp-check");
  const loreCb = el("input");
  loreCb.type = "checkbox";
  loreRow.append(loreCb, el("span", "", "Include triggered lorebook entries"));
  const budgetRow = el("label", "cp-check");
  const budgetNum = el("input", "cp-num");
  budgetNum.type = "number";
  budgetNum.min = "200";
  budgetNum.max = "8000";
  budgetNum.step = "100";
  budgetNum.style.width = "70px";
  budgetRow.append(el("span", "", "Lorebook budget (tokens)"), budgetNum);
  const lenRow = el("label", "cp-check");
  const lenSelect = el("select", "cp-sel");
  lenSelect.style.width = "120px";
  lenSelect.title = "Adds a length rule to the system prompt. Auto adds nothing.";
  for (const [v, t] of [["auto", "Auto"], ["short", "Short"], ["medium", "Medium"], ["long", "Long"]]) {
    const o = el("option", "", t);
    o.value = v;
    lenSelect.appendChild(o);
  }
  lenRow.append(el("span", "", "Reply length"), lenSelect);
  const promptLabel = el("span", "cp-dim", "System prompt");
  const promptTa = el("textarea");
  const resetBtn = el("button", "cp-btn", "Reset prompt");
  resetBtn.style.alignSelf = "flex-start";
  setPanel.append(cardRow, personaRow, loreRow, budgetRow, lenRow, promptLabel, promptTa, resetBtn);

  const chatLine = el("div", "cp-dim", "No active chat");
  const log = el("div", "cp-log");
  const ctxView = el("div", "cp-ctxview");

  // footer: context button + readout
  const foot = el("div", "cp-row cp-foot");
  const ctxBtn = el("button", "cp-btn icon");
  ctxBtn.innerHTML = svg(ICONS.layers, 14) + "<span>Context</span>";
  ctxBtn.title = "See exactly what gets sent to the model";
  const readout = el("span", "cp-readout", "");
  foot.append(ctxBtn, readout);

  // input
  const inputBar = el("div", "cp-inputbar");
  const input = el("textarea", "cp-input");
  input.rows = 1;
  input.placeholder = "Ask about the roleplay…";
  const sendBtn = el("button", "cp-send");
  inputBar.append(input, sendBtn);

  const topGroup = el("div", "cp-top");
  topGroup.append(topRow, connRow, sessRow);
  const bottomGroup = el("div", "cp-bottom");
  bottomGroup.append(foot, inputBar);
  root.append(topGroup, setPanel, chatLine, log, ctxView, bottomGroup);
  tab.root.appendChild(root);

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  });

  // ---------- sessions ----------
  function renderSessionSelect() {
    sessSelect.replaceChildren();
    for (const s of sessions.list) {
      const o = el("option", "", s.name);
      o.value = s.id;
      sessSelect.appendChild(o);
    }
    if (sessions.active) sessSelect.value = sessions.active;
  }

  sessSelect.addEventListener("change", () => {
    ctx.sendToBackend({ type: "session_switch", sid: sessSelect.value });
  });
  newBtn.addEventListener("click", () => ctx.sendToBackend({ type: "session_new" }));

  function startRename() {
    const cur = sessions.list.find((s) => s.id === sessions.active);
    if (!cur) return;
    renameInput.value = cur.name;
    sessSelect.style.display = "none";
    renameInput.style.display = "";
    renameInput.focus();
    renameInput.select();
  }
  function endRename(save) {
    if (renameInput.style.display === "none") return;
    const v = renameInput.value.trim();
    renameInput.style.display = "none";
    sessSelect.style.display = "";
    if (save && v) ctx.sendToBackend({ type: "session_rename", sid: sessions.active, name: v });
  }
  renBtn.addEventListener("click", startRename);
  renameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); endRename(true); }
    else if (e.key === "Escape") { e.preventDefault(); endRename(false); }
  });
  renameInput.addEventListener("blur", () => endRename(true));

  function disarmDelete() {
    delArmed = false;
    clearTimeout(delTimer);
    delBtn.classList.remove("on");
    delBtn.title = "Delete session";
  }

  delBtn.addEventListener("click", () => {
    if (busy) return;
    if (!delArmed) {
      delArmed = true;
      delBtn.classList.add("on");
      delBtn.title = "Click again to delete this session";
      delTimer = setTimeout(disarmDelete, 2500);
      return;
    }
    disarmDelete();
    if (sessions.list.length <= 1) {
      history = [];
      renderHistory();
    }
    ctx.sendToBackend({ type: "session_delete", sid: sessions.active });
  });

  // ---------- context view ----------
  function requestPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => ctx.sendToBackend({ type: "context_preview", msgLimit }), 150);
  }

  function convoText() {
    return history.slice(-40).map((m) => `[${m.role}] ${m.content}`).join("\n\n");
  }

  function totalTokens() {
    let total = 0;
    for (const s of ctxSections || []) total += est(s.text);
    total += est(convoText());
    return total;
  }

  function updateReadout() {
    readout.textContent = ctxSections
      ? `~${fmt(totalTokens())} tkns · ${history.length} msgs`
      : `${history.length} msgs`;
  }

  function secEl(it, total) {
    const t = est(it.text);
    const sec = el("div", "cp-sec");
    const top = el("div", "cp-sec-top");
    top.append(el("span", "cp-sec-name", it.label), el("span", "cp-dim", "~" + fmt(t)));
    const meter = el("div", "cp-meter");
    const fill = el("div", "cp-meter-fill");
    fill.style.width = (total ? Math.max(2, Math.round((t / total) * 100)) : 0) + "%";
    meter.appendChild(fill);
    sec.append(top, meter);
    if (openIds.has(it.id)) {
      const pre = el("pre", "cp-pre");
      pre.textContent = it.text;
      sec.appendChild(pre);
    }
    sec.addEventListener("click", (e) => {
      if (e.target.closest(".cp-pre")) return;
      if (openIds.has(it.id)) openIds.delete(it.id);
      else openIds.add(it.id);
      renderContextView();
    });
    return sec;
  }

  function loreGroupEl() {
    const box = el("div", "cp-lore");
    const head = el("div", "cp-lore-head");
    const inCount = ctxLore.filter((x) => x.state === "in" || x.state === "trimmed").length;
    head.appendChild(el("span", "cp-sec-name", `Lorebook · ${inCount} of ${ctxLore.length} included`));
    for (const [label, action] of [["All", "all"], ["None", "none"]]) {
      const b = el("button", "cp-btn", label);
      b.style.cssText = "height:24px;padding:0 8px;font-size:11px;";
      b.title = action === "all" ? "Include every triggered entry" : "Exclude every triggered entry";
      b.addEventListener("click", () => ctx.sendToBackend({ type: "lore_bulk", action }));
      head.appendChild(b);
    }
    box.appendChild(head);

    for (const x of ctxLore) {
      const id = "lk:" + x.key;
      const item = el("div");
      const row = el("div", "cp-lrow" + (x.state === "over" || x.state === "off" ? " dim" : ""));

      const cb = el("input");
      cb.type = "checkbox";
      cb.checked = !x.excluded;
      cb.addEventListener("click", (e) => e.stopPropagation());
      cb.addEventListener("change", () =>
        ctx.sendToBackend({ type: "lore_set", key: x.key, excluded: !cb.checked }));

      const pin = el("button", "cp-act" + (x.pinned ? " pinned" : ""));
      pin.innerHTML = svg(ICONS.pin, 14);
      pin.title = x.pinned ? "Unpin" : "Pin: always fits in the budget";
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        ctx.sendToBackend({ type: "lore_set", key: x.key, pinned: !x.pinned });
      });

      const tag =
        x.state === "over" ? "over budget" :
        x.state === "off" ? "off" :
        x.state === "trimmed" ? "trimmed" : "~" + fmt(x.tokens);

      row.append(cb, pin, el("span", "cp-sec-name", x.key), el("span", "cp-dim", tag));
      row.addEventListener("click", () => {
        if (openIds.has(id)) openIds.delete(id);
        else openIds.add(id);
        renderContextView();
      });
      item.appendChild(row);
      if (openIds.has(id)) {
        const pre = el("pre", "cp-pre");
        pre.textContent = x.text;
        item.appendChild(pre);
      }
      box.appendChild(item);
    }
    return box;
  }

  function pickGroupEl() {
    const m = ctxMsgs;
    const box = el("div", "cp-lore");
    const head = el("div", "cp-lore-head");
    const how = m.mode === "manual" ? "hand-picked" : "last " + settings.ctxCount;
    head.appendChild(el("span", "cp-sec-name", `Chat messages · ${m.selected} of ${m.total} (${how})`));

    const mk = (label, title, fn, on) => {
      const b = el("button", "cp-btn" + (on ? " on" : ""), label);
      b.style.cssText = "height:24px;padding:0 8px;font-size:11px;";
      b.title = title;
      b.addEventListener("click", fn);
      return b;
    };
    head.append(
      mk("Auto", "Back to the last N messages (CTX slider)", () =>
        ctx.sendToBackend({ type: "pick_set", action: "auto" })),
      mk("None", "Deselect every message", () =>
        ctx.sendToBackend({ type: "pick_set", action: "none" })),
      mk("Range", "Tap a first and last message to select everything between", () => {
        rangeArmed = !rangeArmed;
        rangeStart = null;
        renderContextView();
      }, rangeArmed),
    );
    box.appendChild(head);

    if (rangeArmed) {
      box.appendChild(
        el("div", "cp-dim", rangeStart ? "Now tap the last message." : "Tap the first message of the range."),
      );
    }

    const list = el("div", "cp-plist");
    if (m.total > m.items.length) {
      const more = el("button", "cp-btn", `Show older (${m.total - m.items.length} more)`);
      more.style.cssText = "height:24px;font-size:11px;align-self:center;";
      more.addEventListener("click", () => {
        msgLimit += 60;
        requestPreview();
      });
      list.appendChild(more);
    }

    for (const x of m.items) {
      const row = el("div", "cp-prow" + (x.sel ? "" : " off") + (rangeStart === x.id ? " start" : ""));
      const cb = el("input");
      cb.type = "checkbox";
      cb.checked = x.sel;
      const tag = x.role === "user" ? "you" : x.role === "assistant" ? "ai" : "sys";
      row.append(
        cb,
        el("span", "cp-ptag", tag),
        el("span", "cp-ptext", x.preview || "(empty)"),
        el("span", "cp-dim", "~" + fmt(x.tokens)),
      );
      row.addEventListener("click", () => {
        if (rangeArmed) {
          if (rangeStart === null) {
            rangeStart = x.id;
            renderContextView();
          } else {
            ctx.sendToBackend({ type: "pick_range", from: rangeStart, to: x.id });
            rangeArmed = false;
            rangeStart = null;
          }
          return;
        }
        ctx.sendToBackend({ type: "pick_toggle", id: x.id, on: !x.sel });
      });
      list.appendChild(row);
    }

    list.addEventListener("scroll", () => { pickScrollTop = list.scrollTop; });
    box.appendChild(list);
    requestAnimationFrame(() => {
      list.scrollTop = pickScrollTop === null ? list.scrollHeight : pickScrollTop;
    });
    return box;
  }

  function renderContextView() {
    ctxView.replaceChildren();
    if (!ctxSections) {
      ctxView.appendChild(el("div", "cp-dim", "Loading…"));
      return;
    }

    const isLore = (s) => /^lore\d+$/.test(s.id);
    const items = ctxSections
      .filter((s) => !isLore(s) && s.id !== "chat")
      .map((s) => ({ id: s.id, label: s.label, text: s.text }));
    const convo = history.slice(-40);
    const total = totalTokens();

    ctxView.appendChild(
      el("div", "cp-dim", `Sent with your next message · ~${fmt(total)} tokens (rough estimate)`),
    );
    if (!ctxUseChat) {
      ctxView.appendChild(el("div", "cp-dim", "General mode: no chat context is included."));
    }
    for (const n of ctxNotes) {
      const d = el("div", "cp-dim", n);
      d.style.whiteSpace = "normal";
      ctxView.appendChild(d);
    }

    for (const it of items) ctxView.appendChild(secEl(it, total));
    if (ctxLore.length) ctxView.appendChild(loreGroupEl());
    if (ctxMsgs) ctxView.appendChild(pickGroupEl());
    if (convo.length) {
      ctxView.appendChild(
        secEl({ id: "convo", label: `Copilot conversation (${convo.length})`, text: convoText() }, total),
      );
    }
  }

  function setCtxOpen(v) {
    ctxOpen = v;
    ctxView.classList.toggle("open", v);
    log.style.display = v ? "none" : "";
    ctxBtn.classList.toggle("on", v);
    if (v) {
      pickScrollTop = null;
      rangeArmed = false;
      rangeStart = null;
      requestPreview();
      renderContextView();
    }
  }

  ctxBtn.addEventListener("click", () => setCtxOpen(!ctxOpen));

  // ---------- settings ----------
  function saveSettings() {
    ctx.sendToBackend({ type: "save_settings", settings });
    requestPreview();
  }

  function syncSettingsUI() {
    modeSelect.value = settings.mode;
    ctxNum.value = String(settings.ctxCount);
    ctxRange.value = String(Math.min(50, settings.ctxCount));
    cardCb.checked = !!settings.includeCard;
    personaCb.checked = !!settings.includePersona;
    loreCb.checked = !!settings.includeLore;
    budgetNum.value = String(settings.loreBudget);
    lenSelect.value = settings.length || "auto";
    promptTa.value = settings.systemPrompt || defaultSystem;
  }

  function commitCtx(n) {
    settings.ctxCount = Math.max(0, Math.min(200, Math.floor(Number(n) || 0)));
    ctxNum.value = String(settings.ctxCount);
    ctxRange.value = String(Math.min(50, settings.ctxCount));
    saveSettings();
  }

  settingsBtn.addEventListener("click", () => {
    const open = setPanel.classList.toggle("open");
    settingsBtn.classList.toggle("on", open);
  });
  modeSelect.addEventListener("change", () => {
    settings.mode = modeSelect.value;
    saveSettings();
    ctx.sendToBackend({ type: "init" });
  });
  connSelect.addEventListener("change", () => {
    settings.connectionId = connSelect.value;
    saveSettings();
  });
  lenSelect.addEventListener("change", () => {
    settings.length = lenSelect.value;
    saveSettings();
  });
  ctxRange.addEventListener("input", () => { ctxNum.value = ctxRange.value; });
  ctxRange.addEventListener("change", () => commitCtx(ctxRange.value));
  ctxNum.addEventListener("change", () => commitCtx(ctxNum.value));
  cardCb.addEventListener("change", () => { settings.includeCard = cardCb.checked; saveSettings(); });
  personaCb.addEventListener("change", () => { settings.includePersona = personaCb.checked; saveSettings(); });
  loreCb.addEventListener("change", () => { settings.includeLore = loreCb.checked; saveSettings(); });
  budgetNum.addEventListener("change", () => {
    settings.loreBudget = Math.max(200, Math.min(8000, Math.floor(Number(budgetNum.value) || 1500)));
    budgetNum.value = String(settings.loreBudget);
    saveSettings();
  });
  promptTa.addEventListener("change", () => {
    const v = promptTa.value.trim();
    settings.systemPrompt = v === defaultSystem.trim() ? "" : v;
    saveSettings();
  });
  resetBtn.addEventListener("click", () => {
    settings.systemPrompt = "";
    promptTa.value = defaultSystem;
    saveSettings();
  });

  // ---------- history + rendering ----------
  function saveHistory() {
    if (!currentBase || !currentSid) return;
    ctx.sendToBackend({
      type: "save_history",
      key: currentBase,
      sid: currentSid,
      history: history.slice(-200),
    });
  }

  function actBtn(icon, title, fn) {
    const b = el("button", "cp-act");
    b.innerHTML = svg(icon, 14);
    b.title = title;
    b.setAttribute("aria-label", title);
    b.addEventListener("click", fn);
    return b;
  }

  function textBtn(label, primary, fn) {
    const b = el("button", "cp-btn" + (primary ? " primary" : ""), label);
    b.addEventListener("click", fn);
    return b;
  }

  function buildMessage(i, m) {
    const wrap = el("div", "cp-wrap " + m.role);
    const bubble = el("div", "cp-msg " + m.role);
    if (m.role === "assistant") {
      bubble.classList.add("cp-md");
      bubble.innerHTML = renderMarkdown(m.content);
    } else {
      bubble.textContent = m.content;
    }

    const bar = el("div", "cp-bar");
    const copyBtn = actBtn(ICONS.copy, "Copy text", async () => {
      const ok = await copyText(m.content);
      copyBtn.innerHTML = svg(ok ? ICONS.check : ICONS.copy, 14);
      setTimeout(() => { copyBtn.innerHTML = svg(ICONS.copy, 14); }, 1200);
    });
    bar.appendChild(copyBtn);

    if (!busy) {
      bar.appendChild(actBtn(ICONS.edit, "Edit message", () => startEdit(i, wrap)));
      bar.appendChild(actBtn(ICONS.trash, "Delete message", () => {
        history.splice(i, 1);
        saveHistory();
        renderHistory();
      }));
      if (i === history.length - 1) {
        bar.appendChild(actBtn(ICONS.refresh, m.role === "assistant" ? "Regenerate" : "Retry", regen));
      }
    }

    wrap.append(bubble, bar);
    return wrap;
  }

  function startEdit(i, wrap) {
    const ta = el("textarea", "cp-edit");
    ta.value = history[i].content;
    const bar = el("div", "cp-bar show");
    bar.append(
      textBtn("Save", true, () => {
        const v = ta.value.trim();
        if (v) {
          history[i].content = v;
          saveHistory();
        }
        renderHistory();
      }),
      textBtn("Cancel", false, () => renderHistory()),
    );
    bar.style.gap = "6px";
    wrap.replaceChildren(ta, bar);
    ta.focus();
  }

  function renderHistory() {
    log.replaceChildren();
    history.forEach((m, i) => log.appendChild(buildMessage(i, m)));
    log.scrollTop = log.scrollHeight;
    updateReadout();
    if (ctxOpen) renderContextView();
  }

  // ---------- generation ----------
  function setBusy(v) {
    busy = v;
    sendBtn.innerHTML = svg(v ? ICONS.stop : ICONS.send, 18);
    sendBtn.classList.toggle("busy", v);
    sendBtn.title = v ? "Stop" : "Send";
    sendBtn.setAttribute("aria-label", v ? "Stop" : "Send");
  }
  setBusy(false);

  function paintStream() {
    raf = 0;
    if (!currentBubble) return;
    currentBubble.innerHTML = renderMarkdown(assistantText);
    log.scrollTop = log.scrollHeight;
  }

  function generate(text, prior) {
    sendKey = currentKey;
    assistantText = "";
    reqId++;
    setBusy(true);
    renderHistory();
    const wrap = el("div", "cp-wrap assistant");
    currentBubble = el("div", "cp-msg assistant cp-md", "…");
    wrap.appendChild(currentBubble);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    ctx.sendToBackend({ type: "send", reqId, text, history: prior.slice(-40) });
  }

  function finish() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    const sameKey = sendKey === currentKey;
    if (assistantText && sameKey) history.push({ role: "assistant", content: assistantText });
    assistantText = "";
    currentBubble = null;
    setBusy(false);
    if (sameKey) {
      saveHistory();
      renderHistory();
    }
  }

  function send() {
    if (busy) {
      ctx.sendToBackend({ type: "stop" });
      return;
    }
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    input.style.height = "auto";
    if (ctxOpen) setCtxOpen(false);
    const prior = history.slice();
    history.push({ role: "user", content: text });
    saveHistory();
    generate(text, prior);
  }

  function regen() {
    if (busy || !history.length) return;
    if (history[history.length - 1].role === "assistant") history.pop();
    const last = history[history.length - 1];
    saveHistory();
    if (!last || last.role !== "user") {
      renderHistory();
      return;
    }
    generate(last.content, history.slice(0, -1));
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // ---------- backend messages ----------
  const unsubBackend = ctx.onBackendMessage((p) => {
    switch (p && p.type) {
      case "init": {
        if (p.settings) settings = p.settings;
        if (typeof p.defaultSystem === "string") defaultSystem = p.defaultSystem;

        connSelect.replaceChildren();
        const def = el("option", "", "Active connection");
        def.value = "";
        connSelect.appendChild(def);
        for (const c of p.connections || []) {
          const o = el("option", "", `${c.name} (${c.model})`);
          o.value = c.id;
          connSelect.appendChild(o);
        }
        connSelect.value = settings.connectionId;
        if (connSelect.value !== settings.connectionId) {
          settings.connectionId = "";
          connSelect.value = "";
        }
        syncSettingsUI();

        sessions = p.sessions || { active: p.sessionId, list: [] };
        renderSessionSelect();

        const general = settings.mode === "general" || !p.chat;
        chatLine.textContent =
          settings.mode === "general"
            ? "General chat (no chat context)"
            : p.chat
              ? "Chat: " + p.chat.name
              : "No active chat, using General";
        input.placeholder = general ? "Ask anything…" : "Ask about the roleplay…";

        const composite = p.sessionKey + "|" + p.sessionId;
        if (composite !== currentKey) {
          if (busy) {
            ctx.sendToBackend({ type: "stop" });
            reqId++;
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
            assistantText = "";
            currentBubble = null;
            setBusy(false);
          }
          currentKey = composite;
          currentBase = p.sessionKey;
          currentSid = p.sessionId;
          history = Array.isArray(p.history) ? p.history : [];
          renderHistory();
        }
        requestPreview();
        break;
      }
      case "context_preview":
        ctxSections = Array.isArray(p.sections) ? p.sections : [];
        ctxUseChat = !!p.useChat;
        ctxNotes = Array.isArray(p.notes) ? p.notes : [];
        ctxLore = Array.isArray(p.lore) ? p.lore : [];
        ctxMsgs = p.msgs || null;
        updateReadout();
        if (ctxOpen) renderContextView();
        break;
      case "token":
        if (p.reqId !== reqId || !currentBubble) return;
        assistantText += p.token;
        if (!raf) raf = requestAnimationFrame(paintStream);
        break;
      case "done":
      case "stopped":
        if (p.reqId !== reqId) return;
        finish();
        break;
      case "error": {
        if (p.reqId !== reqId) return;
        assistantText = "";
        finish();
        const w = el("div", "cp-wrap assistant");
        w.appendChild(el("div", "cp-msg assistant", "Error: " + p.message));
        log.appendChild(w);
        log.scrollTop = log.scrollHeight;
        break;
      }
    }
  });

  const unsubChatSwitch = ctx.events.on("CHAT_SWITCHED", () => {
    ctx.sendToBackend({ type: "init" });
  });

  tab.onActivate(() => ctx.sendToBackend({ type: "init" }));
  ctx.sendToBackend({ type: "init" });

  return () => {
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(delTimer);
    clearTimeout(previewTimer);
    unsubBackend();
    unsubChatSwitch();
    removeStyle();
    tab.destroy();
  };
}