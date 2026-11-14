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
  paperclip: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>',
  forward: '<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>',
  idcard: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 17c.5-1.6 1.7-2.5 3-2.5s2.5.9 3 2.5"/><line x1="15" y1="9" x2="18" y2="9"/><line x1="15" y1="13" x2="18" y2="13"/>',
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
  .cp-ptag { flex:none; min-width:52px; white-space:nowrap; padding-top:2px; font-size:10px; text-transform:uppercase; color:var(--cp-muted); }
  .cp-ptext { flex:1; min-width:0; font-size:12px; line-height:1.35; word-break:break-word; overflow:hidden;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

  .cp-card { margin-top:6px; padding:10px; display:flex; flex-direction:column; gap:6px;
    background:var(--cp-fill); border:1px solid var(--cp-border);
    border-left:3px solid var(--cp-primary); border-radius:var(--cp-radius); }
  .cp-card.approved { border-left-color:var(--lumiverse-success, var(--cp-primary)); }
  .cp-card.rejected, .cp-card.undone { opacity:0.55; border-left-color:var(--cp-border); }
  .cp-card-head { font-size:11px; text-transform:uppercase; letter-spacing:0.04em; color:var(--cp-muted); }
  .cp-card-title { font-weight:600; word-break:break-word; }
  .cp-card-keys { font-size:11px; color:var(--cp-muted); word-break:break-word; }
  .cp-card-body { white-space:pre-wrap; font-size:12px; line-height:1.45; max-height:8.5em; overflow:hidden;
    cursor:pointer; word-break:break-word; }
  .cp-card-body.open { max-height:none; }
  .cp-card-actions { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
  .cp-card-err { font-size:11px; color:var(--lumiverse-danger, #e5484d); }
  .cp-confirm { display:flex; flex-direction:column; gap:8px; padding:8px 10px; font-size:12px; line-height:1.4;
    background:var(--cp-tint); border:1px solid color-mix(in srgb, var(--cp-primary) 40%, transparent);
    border-radius:var(--cp-radius); }

  .cp-clip { width:38px; height:38px; flex:none; display:grid; place-items:center; padding:0; cursor:pointer;
    background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:50%; }
  .cp-clip:hover { background:var(--cp-fill-hover); }
  .cp-chips { display:flex; flex-wrap:wrap; gap:6px; }
  .cp-chip { display:flex; align-items:center; gap:6px; max-width:100%; padding:3px 4px 3px 7px; font-size:11px;
    cursor:pointer; background:var(--cp-fill); border:1px solid var(--cp-border); border-radius:999px; }
  .cp-chip.off { opacity:0.5; }
  .cp-chip-name { max-width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cp-thumb { width:18px; height:18px; object-fit:cover; border-radius:4px; flex:none; }
  .cp-chip .cp-act { width:18px; height:18px; }

  .cp-diff { white-space:pre-wrap; font-size:12px; line-height:1.5; word-break:break-word;
    max-height:14em; overflow:auto; cursor:pointer; }
  .cp-diff.open { max-height:none; }
  .cp-add { background:color-mix(in srgb, var(--lumiverse-success, #3fb27f) 28%, transparent); border-radius:3px; }
  .cp-del { background:color-mix(in srgb, var(--lumiverse-danger, #e5484d) 28%, transparent);
    text-decoration:line-through; opacity:0.85; border-radius:3px; }

  .cp-side { display:none; flex-direction:column; gap:8px; min-height:0; overflow-y:auto; scrollbar-width:thin; }
  .cp-root.cp-full { position:fixed; inset:0; z-index:2147483000; width:auto; height:auto;
    padding:14px 18px; background:var(--lumiverse-bg, #0d0d11); overflow:hidden; }
  .cp-full .cp-top, .cp-full .cp-bottom { position:static; margin:0; padding:0; background:none;
    -webkit-backdrop-filter:none; backdrop-filter:none; }
  .cp-full:not(.wide) > .cp-top, .cp-full:not(.wide) > .cp-chatline,
  .cp-full:not(.wide) > .cp-log, .cp-full:not(.wide) > .cp-bottom { width:100%; max-width:900px; align-self:center; }
  .cp-root.cp-full.wide { display:grid; grid-template-columns:minmax(0,1100px) minmax(340px,420px);
    grid-template-rows:auto auto minmax(0,1fr) auto; column-gap:18px; row-gap:8px; justify-content:center; }
  .cp-root.cp-full.wide.noside { grid-template-columns:minmax(0,1100px); }
  .cp-full.wide > .cp-top { grid-column:1; grid-row:1; }
  .cp-full.wide > .cp-chatline { grid-column:1; grid-row:2; }
  .cp-full.wide > .cp-log { grid-column:1; grid-row:3; }
  .cp-full.wide > .cp-bottom { grid-column:1; grid-row:4; }
  .cp-full.wide > .cp-side { grid-column:2; grid-row:1 / 5; }
  .cp-full.wide > .cp-side.show { display:flex; }

  .cp-draftview { flex:1; min-height:0; overflow-y:auto; display:none; flex-direction:column; gap:10px; scrollbar-width:thin; }
  .cp-draftview.open { display:flex; }
  .cp-fblk { display:flex; flex-direction:column; gap:4px; }
  .cp-fhead { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:11px;
    text-transform:uppercase; letter-spacing:0.04em; color:var(--cp-muted); }
  .cp-badge { display:inline-block; width:7px; height:7px; margin-left:2px; border-radius:50%; background:var(--cp-primary); }

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

// Joins a continuation onto the message it continues
function joinContinuation(base, add) {
  if (!base) return add;
  if (/^\s/.test(add) || /\s$/.test(base)) return base + add;
  if (/[.!?…"”’)\]*_~]$/.test(base)) return base + " " + add;
  return base + add;
}

// Free session title: the first few words of the first message
function nameFromText(t) {
  const words = String(t)
    .replace(/[`*_#>~\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return "";
  let n = words.slice(0, 6).join(" ");
  let cut = words.length > 6;
  if (n.length > 40) {
    n = n.slice(0, 40).replace(/\s+\S*$/, "") || n.slice(0, 40);
    cut = true;
  }
  return n.charAt(0).toUpperCase() + n.slice(1) + (cut ? "…" : "");
}

// ---------- lorebook proposals (blocks Danny writes at the end of a reply) ----------
const PROP_RE = /<(lorebook_entry|chat_edit|card_draft)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
const DRAFT_FIELDS = ["name", "tags", "creator_notes", "scenario", "first_message", "description", "alternate_greetings"];

function parseDraftBody(body) {
  const fields = {};
  let cur = null;
  let buf = [];
  const flush = () => {
    if (cur && !fields[cur]) {
      const v = buf.join("\n").trim();
      if (v) fields[cur] = v;
    }
    buf = [];
  };
  for (const line of body.replace(/\r/g, "").split("\n")) {
    const m = line.match(/^@@\s*([a-z_]+)\s*$/i);
    if (m && DRAFT_FIELDS.includes(m[1].toLowerCase())) {
      flush();
      cur = m[1].toLowerCase();
      continue;
    }
    if (cur) buf.push(line);
  }
  flush();
  return fields;
}

function parseProposals(text) {
  const blocks = [];
  const src = String(text).replace(
    /```[a-z]*\s*(<(?:lorebook_entry|chat_edit|card_draft)\b[\s\S]*?<\/(?:lorebook_entry|chat_edit|card_draft)>)\s*```/gi,
    "$1",
  );
  const clean = src.replace(PROP_RE, (whole, tagName, attrs, body) => {
    const tag = tagName.toLowerCase();
    if (tag === "card_draft") {
      const fields = parseDraftBody(body);
      if (!Object.keys(fields).length) return whole;
      blocks.push({ kind: "draft", fields });
      return "";
    }
    const kind = tag === "chat_edit" ? "chat" : "lore";
    const b = { kind, action: "create", name: "", keys: [], update: "", note: "", message: -1, content: "" };
    if (kind === "lore") {
      b.action = /action\s*=\s*["']?update/i.test(attrs) ? "update" : "create";
    } else {
      const mm = attrs.match(/message\s*=\s*["']?#?(\d+)/i);
      if (!mm) return whole;
      b.message = parseInt(mm[1], 10);
    }
    const lines = body.replace(/\r/g, "").split("\n");
    const contentLines = [];
    let inContent = false;
    for (const line of lines) {
      if (inContent) { contentLines.push(line); continue; }
      const mm = line.match(/^\s*(name|keys?|update|note|content)\s*:\s?(.*)$/i);
      if (!mm) continue;
      const f = mm[1].toLowerCase();
      const v = mm[2];
      if (f === "name") b.name = v.trim();
      else if (f === "update") b.update = v.trim();
      else if (f === "note") b.note = v.trim().slice(0, 200);
      else if (f.startsWith("key")) b.keys = v.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30);
      else {
        inContent = true;
        if (v.trim()) contentLines.push(v);
      }
    }
    b.content = contentLines.join("\n").trim();
    if (!b.content) return whole;
    if (kind === "lore") {
      if (b.action === "update" && !b.update) b.update = b.name;
      if (!b.name) b.name = b.update || "Untitled entry";
    }
    blocks.push(b);
    return "";
  });
  return { text: clean.replace(/\n{3,}/g, "\n\n").trim(), blocks };
}

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
  let loreScrollTop = 0;
  let ridN = 0;
  const pendingCbs = new Map();
  let files = [];
  let ctxImgTokens = 0;
  let noteTimer = 0;
  let hasChat = false;
  let contIdx = -1;
  let contBase = "";
  let draft = null;
  let draftOpen = false;
  let draftConfirm = false;
  let draftMsg = "";
  let defaultVoices = {};
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
    proposals: true,
    chatEdits: true,
    voice: "default",
    voiceTexts: {},
    cardMaker: true,
    cardTemplate: "oc",
    cardNotes: "",
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
  const fullBtn = iconBtn(ICONS.maximize, "Fullscreen");
  topRow.append(modeSelect, ctxWrap, ctxNum, settingsBtn, fullBtn);

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
  const propRow = el("label", "cp-check");
  const propCb = el("input");
  propCb.type = "checkbox";
  propRow.append(propCb, el("span", "", "Allow lorebook proposals"));
  const editRow = el("label", "cp-check");
  const editCb = el("input");
  editCb.type = "checkbox";
  editRow.append(editCb, el("span", "", "Allow chat edit proposals"));
  const mkRow = el("label", "cp-check");
  const mkCb = el("input");
  mkCb.type = "checkbox";
  mkRow.append(mkCb, el("span", "", "Allow card drafts"));
  const tplRow = el("label", "cp-check");
  const tplSelect = el("select", "cp-sel");
  tplSelect.style.width = "170px";
  for (const [v, t] of [["oc", "Character (OC)"], ["ip", "Known character (IP)"], ["rpg", "Scenario / RPG"]]) {
    const o = el("option", "", t);
    o.value = v;
    tplSelect.appendChild(o);
  }
  tplRow.append(el("span", "", "Card template"), tplSelect);
  const notesLabel = el("span", "cp-dim", "Card style notes (optional)");
  const notesTa = el("textarea");
  notesTa.style.height = "80px";
  notesTa.placeholder = "e.g. third person, my usual layout, how to handle NSFW blocks…";
  const voiceRow = el("label", "cp-check");
  const voiceSelect = el("select", "cp-sel");
  voiceSelect.style.width = "150px";
  voiceRow.append(el("span", "", "Assistant voice"), voiceSelect);
  const voiceTa = el("textarea");
  voiceTa.style.height = "90px";
  const voiceReset = el("button", "cp-btn", "Reset voice");
  voiceReset.style.alignSelf = "flex-start";
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
  setPanel.append(cardRow, personaRow, loreRow, budgetRow, lenRow, propRow, editRow, mkRow, tplRow, notesLabel, notesTa, voiceRow, voiceTa, voiceReset, promptLabel, promptTa, resetBtn);

  const chatLine = el("div", "cp-dim", "No active chat");
  const log = el("div", "cp-log");
  const ctxView = el("div", "cp-ctxview");

  // footer: context button + readout
  const foot = el("div", "cp-row cp-foot");
  const ctxBtn = el("button", "cp-btn icon");
  ctxBtn.innerHTML = svg(ICONS.layers, 14) + "<span>Context</span>";
  ctxBtn.title = "See exactly what gets sent to the model";
  const readout = el("span", "cp-readout", "");
  const cardBtn = el("button", "cp-btn icon");
  cardBtn.title = "Character card draft";
  const footL = el("div", "cp-row");
  footL.append(ctxBtn, cardBtn);
  foot.append(footL, readout);

  // input
  const inputBar = el("div", "cp-inputbar");
  const input = el("textarea", "cp-input");
  input.rows = 1;
  input.placeholder = "Ask about the roleplay…";
  const sendBtn = el("button", "cp-send");
  const clipBtn = el("button", "cp-clip");
  clipBtn.innerHTML = svg(ICONS.paperclip, 18);
  clipBtn.title = "Attach text files or images";
  clipBtn.setAttribute("aria-label", "Attach files");
  const fileInput = el("input");
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = "image/*,text/*,.txt,.md,.markdown,.json,.csv,.log,.html,.xml,.yaml,.yml,.srt,.vtt,.rtf";
  fileInput.style.display = "none";
  clipBtn.addEventListener("click", () => fileInput.click());
  inputBar.append(clipBtn, input, sendBtn, fileInput);

  const chipBar = el("div", "cp-chips");
  chipBar.style.display = "none";

  function renderChips(note) {
    chipBar.replaceChildren();
    for (const f of files) {
      const chip = el("div", "cp-chip" + (f.on ? "" : " off"));
      chip.title = (f.on ? "Included. Click to leave it out: " : "Left out. Click to include: ") + f.name;
      if (f.kind === "image" && f.thumb) {
        const im = el("img", "cp-thumb");
        im.src = f.thumb;
        chip.appendChild(im);
      } else {
        const ico = el("span", "cp-ico");
        ico.innerHTML = svg(ICONS.file, 14);
        chip.appendChild(ico);
      }
      chip.append(el("span", "cp-chip-name", f.name), el("span", "cp-dim", "~" + fmt(f.tokens)));
      const rm = actBtn(ICONS.x, "Remove", (e) => {
        e.stopPropagation();
        ctx.sendToBackend({ type: "file_remove", id: f.id });
      });
      chip.appendChild(rm);
      chip.addEventListener("click", () => ctx.sendToBackend({ type: "file_toggle", id: f.id, on: !f.on }));
      chipBar.appendChild(chip);
    }
    if (note) {
      const n = el("div", "cp-card-err", note);
      n.style.width = "100%";
      chipBar.appendChild(n);
    }
    chipBar.style.display = files.length || note ? "flex" : "none";
  }

  function flashNote(msg) {
    renderChips(msg);
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => renderChips(), 6000);
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("can't read this image"));
      im.src = url;
    });
  }

  function drawJpeg(img, w, h, q) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/jpeg", q);
  }

  async function prepareImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const w0 = img.naturalWidth;
      const h0 = img.naturalHeight;
      if (!w0 || !h0) throw new Error("can't read this image");
      let max = 1280;
      let q = 0.82;
      let data = "";
      let w = 0;
      let h = 0;
      for (let pass = 0; pass < 4; pass++) {
        const s = Math.min(1, max / Math.max(w0, h0));
        w = Math.max(1, Math.round(w0 * s));
        h = Math.max(1, Math.round(h0 * s));
        data = drawJpeg(img, w, h, q).split(",")[1] || "";
        if (data.length <= 1000000) break;
        max = Math.round(max * 0.75);
        q = Math.max(0.6, q - 0.08);
      }
      if (!data || data.length > 1400000) throw new Error("that image is too large");
      const ts = Math.min(1, 72 / Math.max(w0, h0));
      const thumb = drawJpeg(img, Math.max(1, Math.round(w0 * ts)), Math.max(1, Math.round(h0 * ts)), 0.6);
      return { data, w, h, thumb };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  fileInput.addEventListener("change", async () => {
    const list = Array.from(fileInput.files || []);
    fileInput.value = "";
    for (const f of list) {
      try {
        if (f.type.startsWith("image/")) {
          if (f.size > 20 * 1024 * 1024) throw new Error("that image is over 20 MB");
          const im = await prepareImage(f);
          ctx.sendToBackend({ type: "file_add", kind: "image", name: f.name, ...im });
        } else {
          if (f.size > 400 * 1024) throw new Error("that file is over 400 KB");
          const text = await f.text();
          const bad = (text.slice(0, 4000).match(/[\u0000\uFFFD]/g) || []).length;
          if (bad > 20) throw new Error("that doesn't look like a text file");
          ctx.sendToBackend({ type: "file_add", kind: "text", name: f.name, text });
        }
      } catch (e) {
        flashNote(`Couldn't attach ${f.name}: ${e.message}`);
      }
    }
  });

  const topGroup = el("div", "cp-top");
  topGroup.append(topRow, connRow, sessRow);
  const bottomGroup = el("div", "cp-bottom");
  bottomGroup.append(foot, chipBar, inputBar);
  chatLine.classList.add("cp-chatline");
  const side = el("div", "cp-side");
  const draftView = el("div", "cp-draftview");
  root.append(topGroup, setPanel, chatLine, log, ctxView, draftView, bottomGroup, side);
  tab.root.appendChild(root);

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  });

  // ---------- card maker ----------
  const FIELD_LABELS = {
    name: "Name",
    tags: "Tags (comma separated)",
    description: "Description (main card text)",
    scenario: "Scenario",
    first_message: "First message",
    alternate_greetings: "Alternate greetings (separate with a line of -----)",
    creator_notes: "Creator notes (not sent to the AI)",
  };
  const FIELD_ORDER = ["name", "tags", "description", "scenario", "first_message", "alternate_greetings", "creator_notes"];

  function draftHasContent() {
    return !!draft && Object.values(draft.fields || {}).some((v) => String(v).trim());
  }

  function updateCardBtn() {
    cardBtn.innerHTML =
      svg(ICONS.idcard, 14) + "<span>Card</span>" + (draftHasContent() ? '<i class="cp-badge"></i>' : "");
    cardBtn.classList.toggle("on", draftOpen);
    cardBtn.style.display = settings.cardMaker === false ? "none" : "";
  }

  function buildDraftChip(block) {
    const card = el("div", "cp-card");
    card.appendChild(el("div", "cp-card-head", "Card draft updated"));
    card.appendChild(el("div", "cp-card-keys", Object.keys(block.fields).join(", ")));
    const row = el("div", "cp-card-actions");
    row.appendChild(textBtn("Open draft", true, () => setDraftOpen(true)));
    card.appendChild(row);
    return card;
  }

  function renderDraftView() {
    draftView.replaceChildren();
    const f = (draft && draft.fields) || {};
    const created = draft && draft.created;

    const head = el("div", "cp-row");
    const tpl = el("select", "cp-sel");
    tpl.style.width = "180px";
    tpl.title = "Template Danny follows when drafting";
    for (const [v, t] of [["oc", "Character (OC)"], ["ip", "Known character (IP)"], ["rpg", "Scenario / RPG"]]) {
      const o = el("option", "", t);
      o.value = v;
      tpl.appendChild(o);
    }
    tpl.value = settings.cardTemplate || "oc";
    tpl.addEventListener("change", () => {
      settings.cardTemplate = tpl.value;
      saveSettings();
      syncSettingsUI();
    });
    head.append(el("span", "cp-sec-name", "Card draft"), tpl);
    draftView.appendChild(head);

    if (!draftHasContent()) {
      const hint = el(
        "div",
        "cp-dim",
        "No draft yet. Chat about your character, then ask Danny to “make a card”. Her draft appears here so you can edit it and create the card.",
      );
      hint.style.whiteSpace = "normal";
      draftView.appendChild(hint);
      return;
    }

    const perm = est(f.description || "") + est(f.scenario || "");
    let total = 0;
    for (const k of FIELD_ORDER) total += est(f[k] || "");
    const sum = el(
      "div",
      "cp-dim",
      `~${fmt(total)} tokens in all · ~${fmt(perm)} sent with every message (description + scenario)`,
    );
    sum.style.whiteSpace = "normal";
    draftView.appendChild(sum);

    for (const k of FIELD_ORDER) {
      const blk = el("div", "cp-fblk");
      const tk = el("span", "", "~" + fmt(est(f[k] || "")));
      const hd = el("div", "cp-fhead");
      hd.append(el("span", "", FIELD_LABELS[k]), tk);
      const single = k === "name" || k === "tags";
      const inp = single ? el("input", "cp-field") : el("textarea", "cp-edit");
      if (single) inp.style.flex = "none";
      else inp.style.minHeight = k === "description" ? "260px" : k === "first_message" ? "160px" : "80px";
      inp.value = f[k] || "";
      inp.addEventListener("input", () => { tk.textContent = "~" + fmt(est(inp.value)); });
      inp.addEventListener("change", () => ctx.sendToBackend({ type: "draft_set", field: k, value: inp.value }));
      blk.append(hd, inp);
      draftView.appendChild(blk);
    }

    if (draftMsg) {
      const m = el("div", "cp-dim", draftMsg);
      m.style.whiteSpace = "normal";
      draftView.appendChild(m);
    }

    if (draftConfirm) {
      const box = el("div", "cp-confirm");
      const text =
        draftConfirm === "create"
          ? `This will create a new character card “${(f.name || "").trim() || "Untitled"}” in your library, tagged danny-copilot.`
          : draftConfirm === "undo"
            ? `This deletes “${created ? created.name : "the card"}” from your library, only while it still has the danny-copilot tag. Any chats using it would lose their card.`
            : "Clear the whole draft? This can't be undone.";
      box.appendChild(el("div", "", text));
      const row = el("div", "cp-card-actions");
      const cancel = textBtn("Cancel", false, () => { draftConfirm = false; renderDraftView(); });
      const label = draftConfirm === "create" ? "Create card" : draftConfirm === "undo" ? "Delete card" : "Clear draft";
      const go = textBtn(label, true, async () => {
        const kind = draftConfirm;
        go.disabled = true;
        cancel.disabled = true;
        if (kind === "clear") {
          ctx.sendToBackend({ type: "draft_clear" });
          draftConfirm = false;
          draftMsg = "";
          renderDraftView();
          return;
        }
        const r = await rpc({ type: kind === "create" ? "card_create" : "card_undo" });
        draftConfirm = false;
        draftMsg =
          r && r.ok
            ? kind === "create"
              ? `Created “${r.name}”. Find it in your characters, tagged danny-copilot.`
              : "Card deleted."
            : "Couldn't do that: " + ((r && r.error) || "unknown error");
        renderDraftView();
      });
      row.append(go, cancel);
      box.appendChild(row);
      draftView.appendChild(box);
    } else {
      const area = el("div", "cp-card-actions");
      if (created) {
        area.appendChild(el("span", "cp-dim", `Created “${created.name}”`));
        area.appendChild(textBtn("Undo (delete)", false, () => { draftConfirm = "undo"; renderDraftView(); }));
      }
      area.appendChild(
        textBtn(created ? "Create another" : "Create card", true, () => { draftConfirm = "create"; renderDraftView(); }),
      );
      area.appendChild(textBtn("Clear draft", false, () => { draftConfirm = "clear"; renderDraftView(); }));
      draftView.appendChild(area);
    }
  }

  function setDraftOpen(v) {
    if (v && ctxOpen) setCtxOpen(false);
    draftOpen = v;
    draftView.classList.toggle("open", v);
    if (v) {
      draftConfirm = false;
      draftMsg = "";
      renderDraftView();
    }
    updateCardBtn();
    syncLog();
    if (full) updateSide();
  }

  cardBtn.addEventListener("click", () => setDraftOpen(!draftOpen));
  updateCardBtn();

  // ---------- fullscreen ----------
  let full = false;
  let fullWide = false;
  let autoCtx = false;

  function updateSide() {
    const show = full && fullWide && (ctxOpen || draftOpen || setPanel.classList.contains("open"));
    side.classList.toggle("show", show);
    root.classList.toggle("noside", full && fullWide && !show);
  }

  function layoutFull() {
    if (!full) return;
    fullWide = window.innerWidth >= 1000;
    root.classList.toggle("wide", fullWide);
    if (fullWide) {
    side.append(setPanel, ctxView, draftView);
    } else {
      root.insertBefore(setPanel, chatLine);
      root.insertBefore(ctxView, bottomGroup);
      root.insertBefore(draftView, bottomGroup);
    }
    syncLog();
    updateSide();
  }

  function setFull(v) {
    if (v === full) return;
    if (v) {
      full = true;
      document.body.appendChild(root);
      root.classList.add("cp-full");
      layoutFull();
      if (fullWide && !ctxOpen) {
        autoCtx = true;
        setCtxOpen(true);
      }
    } else {
      if (autoCtx) {
        autoCtx = false;
        setCtxOpen(false);
      }
      full = false;
      fullWide = false;
      root.classList.remove("cp-full", "wide", "noside");
      side.classList.remove("show");
      tab.root.appendChild(root);
      root.insertBefore(setPanel, chatLine);
      root.insertBefore(ctxView, bottomGroup);
      root.insertBefore(draftView, bottomGroup);
      syncLog();
    }
    fullBtn.innerHTML = svg(full ? ICONS.minimize : ICONS.maximize, 16);
    fullBtn.title = full ? "Exit fullscreen (Esc)" : "Fullscreen";
    fullBtn.classList.toggle("on", full);
  }

  fullBtn.addEventListener("click", () => setFull(!full));
  const onKey = (e) => {
    if (e.key !== "Escape" || !full) return;
    const t = e.target;
    if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT")) return;
    setFull(false);
  };
  const onResize = () => layoutFull();
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);

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
    total += ctxImgTokens;
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
    const list = el("div", "cp-plist");

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
      list.appendChild(item);
    }
    list.addEventListener("scroll", () => { loreScrollTop = list.scrollTop; });
    box.appendChild(list);
    requestAnimationFrame(() => { list.scrollTop = loreScrollTop; });
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
        el("span", "cp-ptag", `${tag} #${x.i}`),
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

  function syncLog() {
    const setOpen = setPanel.classList.contains("open");
    log.style.display = (ctxOpen || setOpen || draftOpen) && !(full && fullWide) ? "none" : "";
  }

  function setCtxOpen(v) {
    if (v && draftOpen) setDraftOpen(false);
    ctxOpen = v;
    ctxView.classList.toggle("open", v);
    ctxBtn.classList.toggle("on", v);
    if (v) {
      pickScrollTop = null;
      loreScrollTop = 0;
      rangeArmed = false;
      rangeStart = null;
      requestPreview();
      renderContextView();
    }
    syncLog();
    if (full) updateSide();
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
    propCb.checked = settings.proposals !== false;
    editCb.checked = settings.chatEdits !== false;
    mkCb.checked = settings.cardMaker !== false;
    tplSelect.value = settings.cardTemplate || "oc";
    notesTa.value = settings.cardNotes || "";
    updateCardBtn();
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
    syncLog();
    if (full) updateSide();
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
  propCb.addEventListener("change", () => { settings.proposals = propCb.checked; saveSettings(); });
  editCb.addEventListener("change", () => { settings.chatEdits = editCb.checked; saveSettings(); });
  mkCb.addEventListener("change", () => { settings.cardMaker = mkCb.checked; saveSettings(); updateCardBtn(); });
  tplSelect.addEventListener("change", () => { settings.cardTemplate = tplSelect.value; saveSettings(); });
  notesTa.addEventListener("change", () => { settings.cardNotes = notesTa.value.trim(); saveSettings(); });
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

  // ---------- assistant voice ----------
  function updatePlaceholder() {
    const dv = defaultVoices[settings.voice];
    const name = dv ? dv.name : "Copilot";
    input.placeholder =
      settings.mode === "general" || !hasChat ? `Ask ${name} anything…` : `Ask ${name} about the roleplay…`;
  }

  function renderVoiceOptions() {
    voiceSelect.replaceChildren();
    const d = el("option", "", "Default");
    d.value = "default";
    voiceSelect.appendChild(d);
    for (const id of Object.keys(defaultVoices)) {
      const o = el("option", "", defaultVoices[id].name);
      o.value = id;
      voiceSelect.appendChild(o);
    }
  }

  function syncVoiceUI() {
    const v = settings.voice || "default";
    const dv = defaultVoices[v];
    voiceSelect.value = v;
    voiceTa.style.display = dv ? "" : "none";
    voiceReset.style.display = dv ? "" : "none";
    if (dv) voiceTa.value = (settings.voiceTexts && settings.voiceTexts[v]) || dv.text;
    updatePlaceholder();
  }

  voiceSelect.addEventListener("change", () => {
    settings.voice = voiceSelect.value;
    saveSettings();
    syncVoiceUI();
  });
  voiceTa.addEventListener("change", () => {
    const v = settings.voice;
    const dv = defaultVoices[v];
    if (!dv) return;
    const t = voiceTa.value.trim();
    settings.voiceTexts = { ...(settings.voiceTexts || {}) };
    if (!t || t === dv.text.trim()) delete settings.voiceTexts[v];
    else settings.voiceTexts[v] = t;
    saveSettings();
  });
  voiceReset.addEventListener("click", () => {
    const v = settings.voice;
    if (!defaultVoices[v]) return;
    settings.voiceTexts = { ...(settings.voiceTexts || {}) };
    delete settings.voiceTexts[v];
    voiceTa.value = defaultVoices[v].text;
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

  function rpc(msg) {
    return new Promise((resolve) => {
      const rid = ++ridN;
      pendingCbs.set(rid, resolve);
      ctx.sendToBackend({ ...msg, rid });
      setTimeout(() => {
        if (pendingCbs.delete(rid)) resolve({ ok: false, error: "Timed out waiting for Lumiverse." });
      }, 20000);
    });
  }

  function setProp(i, k, patch) {
    const m = history[i];
    if (!m) return;
    if (!Array.isArray(m.props)) m.props = [];
    while (m.props.length <= k) m.props.push({ status: "pending" });
    m.props[k] = { ...m.props[k], ...patch };
    saveHistory();
    renderHistory();
  }

  function cardData(block, st) {
    if (!st.edit) return block;
    return {
      ...block,
      name: st.edit.name || block.name,
      keys: st.edit.keys || [],
      content: st.edit.content || block.content,
    };
  }

  function startCardEdit(card, i, k, data) {
    card.replaceChildren();
    const nameIn = el("input", "cp-field");
    nameIn.value = data.name;
    nameIn.placeholder = "Entry name";
    const keysIn = el("input", "cp-field");
    keysIn.value = data.keys.join(", ");
    keysIn.placeholder = "Keywords, comma separated";
    nameIn.style.flex = "none";
    keysIn.style.flex = "none";
    const ta = el("textarea", "cp-edit");
    ta.value = data.content;
    ta.style.minHeight = "140px";
    const row = el("div", "cp-card-actions");
    row.append(
      textBtn("Save", true, () => {
        const content = ta.value.trim();
        if (!content) return;
        setProp(i, k, {
          edit: {
            name: nameIn.value.trim() || data.name,
            keys: keysIn.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30),
            content,
          },
        });
      }),
      textBtn("Cancel", false, () => renderHistory()),
    );
    card.append(nameIn, keysIn, ta, row);
  }

  async function openConfirm(card, area, i, k, data, block) {
    area.style.display = "none";
    const box = el("div", "cp-confirm");
    box.appendChild(el("div", "", "Checking your lorebooks…"));
    card.appendChild(box);
    const close = () => { box.remove(); area.style.display = ""; };

    const t = await rpc({ type: "lore_targets" });
    let found = null;
    if (t && t.ok && data.action === "update") {
      const r = await rpc({ type: "lore_lookup", name: block.update });
      if (r && r.ok && r.found) found = r;
    }

    box.replaceChildren();
    const line = (txt) => box.appendChild(el("div", "", txt));
    const row = el("div", "cp-card-actions");
    const cancelBtn = textBtn("Cancel", false, close);

    if (!t || !t.ok) {
      line("Couldn't reach your lorebooks: " + ((t && t.error) || "unknown error"));
      row.appendChild(cancelBtn);
      box.appendChild(row);
      return;
    }

    let payload;
    if (found) {
      line(`This will update “${found.name}” in the lorebook “${found.bookName}”. The old text is kept so you can undo.`);
      payload = () => ({ action: "update", entryId: found.entryId, bookId: found.bookId });
    } else {
      if (data.action === "update") {
        line(`I couldn't find an entry called “${block.update}”, so this would be added as a new entry.`);
      }
      const who = t.characterName || "this card";
      if (t.attached.length === 1) {
        line(`This will be added to the lorebook attached to ${who}: “${t.attached[0].name}”.`);
        payload = () => ({ action: "create", bookId: t.attached[0].id });
      } else {
        const list = t.attached.length ? t.attached : t.all;
        line(
          t.attached.length
            ? `${who} has ${t.attached.length} lorebooks attached. Add it to:`
            : `${t.characterName ? who + " has no lorebook attached." : "No lorebook is attached to this card."} Pick one of your lorebooks:`,
        );
        if (!list.length) {
          line("You don't have any lorebooks yet.");
          row.appendChild(cancelBtn);
          box.appendChild(row);
          return;
        }
        const pickSel = el("select", "cp-sel");
        pickSel.style.width = "100%";
        for (const b of list) {
          const o = el("option", "", b.name);
          o.value = b.id;
          pickSel.appendChild(o);
        }
        box.appendChild(pickSel);
        payload = () => ({ action: "create", bookId: pickSel.value });
      }
    }

    const msg = el("div", "cp-card-err");
    msg.style.display = "none";
    const go = textBtn(found ? "Update entry" : "Add entry", true, async () => {
      go.disabled = true;
      cancelBtn.disabled = true;
      const r = await rpc({
        type: "lore_apply",
        ...payload(),
        name: data.name,
        keys: data.keys,
        content: data.content,
      });
      if (r && r.ok) {
        setProp(i, k, {
          status: "approved",
          action: r.action,
          bookId: r.bookId,
          bookName: r.bookName,
          entryId: r.entryId,
          prev: r.prev,
        });
      } else {
        go.disabled = false;
        cancelBtn.disabled = false;
        msg.textContent = "Couldn't save: " + ((r && r.error) || "unknown error");
        msg.style.display = "";
      }
    });
    row.append(go, cancelBtn);
    box.append(msg, row);
  }

  // ----- chat edit cards -----
  const lookups = new Set();
  const lookupErr = new Map();

  function diffWords(a, b) {
    const A = a.split(/(\s+)/);
    const B = b.split(/(\s+)/);
    const n = A.length;
    const m = B.length;
    if (n * m > 4000000) return null;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { out.push(["=", A[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(["-", A[i]]); i++; }
      else { out.push(["+", B[j]]); j++; }
    }
    while (i < n) out.push(["-", A[i++]]);
    while (j < m) out.push(["+", B[j++]]);
    return out;
  }

  function diffEl(before, after) {
    const box = el("div", "cp-diff");
    box.addEventListener("click", () => box.classList.toggle("open"));
    const ops = diffWords(before, after);
    if (!ops) {
      box.textContent = after;
      return box;
    }
    let cur = null;
    for (const [t, s] of ops) {
      if (!cur || cur.t !== t) {
        const node = t === "=" ? document.createTextNode("") : el("span", t === "+" ? "cp-add" : "cp-del");
        cur = { t, node };
        box.appendChild(node);
      }
      cur.node.textContent += s;
    }
    return box;
  }

  function plainEl(text) {
    const box = el("div", "cp-diff", text);
    box.addEventListener("click", () => box.classList.toggle("open"));
    return box;
  }

  function ensureBase(i, k, block) {
    const key = `${currentKey}|${i}|${k}`;
    if (lookups.has(key) || lookupErr.has(key)) return;
    lookups.add(key);
    const keyAtStart = currentKey;
    const msgRef = history[i];
    rpc({ type: "chat_lookup", chatId: currentBase, index: block.message }).then((r) => {
      lookups.delete(key);
      if (currentKey !== keyAtStart || history[i] !== msgRef) return;
      if (r && r.ok) {
        setProp(i, k, {
          chatId: currentBase,
          chatName: r.chatName,
          msgId: r.msgId,
          msgRole: r.role,
          before: r.content,
        });
      } else {
        lookupErr.set(key, (r && r.error) || "unknown error");
        renderHistory();
      }
    });
  }

  function openChatConfirm(card, area, i, k, st, content, block) {
    area.style.display = "none";
    const box = el("div", "cp-confirm");
    box.appendChild(
      el(
        "div",
        "",
        `This will change message #${block.message} (${st.msgRole || "message"}) in “${st.chatName || "this chat"}”. The old text is saved here so you can undo.`,
      ),
    );
    const msg = el("div", "cp-card-err");
    msg.style.display = "none";
    const row = el("div", "cp-card-actions");
    const cancel = textBtn("Cancel", false, () => { box.remove(); area.style.display = ""; });
    const go = textBtn("Apply change", true, async () => {
      go.disabled = true;
      cancel.disabled = true;
      const r = await rpc({ type: "chat_apply", chatId: st.chatId, msgId: st.msgId, base: st.before, content });
      if (r && r.ok) {
        setProp(i, k, { status: "approved" });
      } else {
        go.disabled = false;
        cancel.disabled = false;
        msg.textContent = "Couldn't apply: " + ((r && r.error) || "unknown error");
        msg.style.display = "";
      }
    });
    row.append(go, cancel);
    box.append(msg, row);
    card.appendChild(box);
  }

  function startChatCardEdit(card, i, k, content) {
    card.replaceChildren();
    const ta = el("textarea", "cp-edit");
    ta.value = content;
    ta.style.minHeight = "160px";
    const row = el("div", "cp-card-actions");
    row.append(
      textBtn("Save", true, () => {
        const v = ta.value.trim();
        if (v) setProp(i, k, { edit: { name: "", keys: [], content: v } });
      }),
      textBtn("Cancel", false, () => renderHistory()),
    );
    card.append(ta, row);
  }

  function buildChatCard(i, k, block) {
    const m = history[i];
    const st = (Array.isArray(m.props) && m.props[k]) || { status: "pending" };
    const content = st.edit && st.edit.content ? st.edit.content : block.content;
    const card = el("div", "cp-card " + st.status);
    const key = `${currentKey}|${i}|${k}`;
    const hasBase = typeof st.before === "string";

    const label = `Edit chat message #${block.message}`;
    const tag = { approved: "applied", rejected: "rejected", undone: "undone" }[st.status];
    card.appendChild(el("div", "cp-card-head", tag ? `${label} · ${tag}` : label));
    if (block.note) card.appendChild(el("div", "cp-card-keys", block.note));

    if (hasBase) {
      card.appendChild(
        el("div", "cp-card-keys", `${st.msgRole || "message"} in ${st.chatName ? "“" + st.chatName + "”" : "this chat"}`),
      );
      const view = el("div");
      let showDiff = true;
      const toggle = textBtn("Show new text", false, () => {
        showDiff = !showDiff;
        draw();
      });
      toggle.style.cssText = "height:22px;padding:0 8px;font-size:11px;align-self:flex-start;";
      const draw = () => {
        view.replaceChildren(showDiff ? diffEl(st.before, content) : plainEl(content));
        toggle.textContent = showDiff ? "Show new text" : "Show changes";
      };
      draw();
      card.append(view, toggle);
    } else if (lookupErr.has(key)) {
      const e = el("div", "cp-card-err", "Couldn't load that message: " + lookupErr.get(key));
      card.appendChild(e);
      card.appendChild(textBtn("Try again", false, () => { lookupErr.delete(key); renderHistory(); }));
    } else {
      card.appendChild(el("div", "cp-dim", "Loading the current message…"));
      if (st.status === "pending") ensureBase(i, k, block);
    }

    const area = el("div", "cp-card-actions");
    const err = el("div", "cp-card-err");
    err.style.display = "none";

    if (st.status === "pending") {
      const approve = textBtn("Approve", true, () => openChatConfirm(card, area, i, k, st, content, block));
      approve.disabled = !hasBase;
      area.append(
        approve,
        textBtn("Edit", false, () => startChatCardEdit(card, i, k, content)),
        textBtn("Reject", false, () => setProp(i, k, { status: "rejected" })),
      );
    } else if (st.status === "approved") {
      area.appendChild(el("span", "cp-dim", "Applied to the chat"));
      const undo = textBtn("Undo", false, async () => {
        undo.disabled = true;
        const r = await rpc({ type: "chat_undo", chatId: st.chatId, msgId: st.msgId, prev: st.before, applied: content });
        if (r && r.ok) {
          setProp(i, k, { status: "undone" });
        } else {
          undo.disabled = false;
          err.textContent = "Couldn't undo: " + ((r && r.error) || "unknown error");
          err.style.display = "";
        }
      });
      area.appendChild(undo);
    } else {
      area.appendChild(textBtn("Restore", false, () => setProp(i, k, { status: "pending" })));
    }
    card.append(area, err);
    return card;
  }

  function buildCard(i, k, block) {
    if (block.kind === "draft") return buildDraftChip(block);
    if (block.kind === "chat") return buildChatCard(i, k, block);
    const m = history[i];
    const st = (Array.isArray(m.props) && m.props[k]) || { status: "pending" };
    const data = cardData(block, st);
    const card = el("div", "cp-card " + st.status);

    const label = block.action === "update" ? "Update lorebook entry" : "New lorebook entry";
    const tag = { approved: "added", rejected: "rejected", undone: "undone" }[st.status];
    card.appendChild(el("div", "cp-card-head", tag ? `${label} · ${tag}` : label));
    card.appendChild(el("div", "cp-card-title", data.name));
    if (block.action === "update") {
      card.appendChild(el("div", "cp-card-keys", "Replaces the text of: " + block.update));
    }
    if (data.keys.length) card.appendChild(el("div", "cp-card-keys", "Keys: " + data.keys.join(", ")));

    const body = el("div", "cp-card-body", data.content);
    body.title = "Click to expand";
    body.addEventListener("click", () => body.classList.toggle("open"));
    card.appendChild(body);

    const area = el("div", "cp-card-actions");
    const err = el("div", "cp-card-err");
    err.style.display = "none";

    if (st.status === "pending") {
      area.append(
        textBtn("Approve", true, () => openConfirm(card, area, i, k, data, block)),
        textBtn("Edit", false, () => startCardEdit(card, i, k, data)),
        textBtn("Reject", false, () => setProp(i, k, { status: "rejected" })),
      );
    } else if (st.status === "approved") {
      area.appendChild(el("span", "cp-dim", st.bookName ? `In “${st.bookName}”` : "In your lorebook"));
      const undo = textBtn("Undo", false, async () => {
        undo.disabled = true;
        const r = await rpc({ type: "lore_undo", action: st.action, entryId: st.entryId, prev: st.prev });
        if (r && r.ok) {
          setProp(i, k, { status: "undone" });
        } else {
          undo.disabled = false;
          err.textContent = "Couldn't undo: " + ((r && r.error) || "unknown error");
          err.style.display = "";
        }
      });
      area.appendChild(undo);
    } else {
      area.appendChild(textBtn("Restore", false, () => setProp(i, k, { status: "pending" })));
    }
    card.append(area, err);
    return card;
  }

  function buildMessage(i, m) {
    const wrap = el("div", "cp-wrap " + m.role);
    const parsed = m.role === "assistant" ? parseProposals(m.content) : null;

    if (!parsed || parsed.text || !parsed.blocks.length) {
      const bubble = el("div", "cp-msg " + m.role);
      if (parsed) {
        bubble.classList.add("cp-md");
        bubble.innerHTML = renderMarkdown(parsed.text);
      } else {
        bubble.textContent = m.content;
      }
      wrap.appendChild(bubble);
    }
    if (parsed) parsed.blocks.forEach((b, k) => wrap.appendChild(buildCard(i, k, b)));

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
        if (m.role === "assistant") bar.appendChild(actBtn(ICONS.forward, "Continue", continueMsg));
      }
    }

    wrap.appendChild(bar);
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
    const p = parseProposals(contBase ? joinContinuation(contBase, assistantText) : assistantText);
    let t = p.text;
    const open = t.search(/<(lorebook_entry|chat_edit|card_draft)\b/i);
    if (open >= 0) t = t.slice(0, open).trimEnd();
    currentBubble.innerHTML =
      renderMarkdown(t) + (open >= 0 ? '<p class="cp-dim">drafting a proposal…</p>' : "");
    log.scrollTop = log.scrollHeight;
  }

  function generate(text, prior, cont) {
    sendKey = currentKey;
    assistantText = "";
    contIdx = -1;
    contBase = "";
    currentBubble = null;
    reqId++;
    setBusy(true);
    renderHistory();
    if (cont && history.length && history[history.length - 1].role === "assistant") {
      contIdx = history.length - 1;
      contBase = history[contIdx].content;
      const last = log.lastElementChild;
      currentBubble = last ? last.querySelector(".cp-md") : null;
    }
    if (!currentBubble) {
      const wrap = el("div", "cp-wrap assistant");
      currentBubble = el("div", "cp-msg assistant cp-md", "…");
      wrap.appendChild(currentBubble);
      log.appendChild(wrap);
    }
    log.scrollTop = log.scrollHeight;
    ctx.sendToBackend({ type: "send", reqId, text, history: prior.slice(-200) });
  }

  const CONTINUE_PROMPT =
    "Continue exactly where your last message stopped. If it ended mid-word or mid-sentence, pick up right there; otherwise carry on naturally. Don't repeat anything and don't add any preamble or commentary, just the continuation.";

  function continueMsg() {
    if (busy || !history.length || history[history.length - 1].role !== "assistant") return;
    generate(CONTINUE_PROMPT, history.slice(), true);
  }

  function autoNameSession(text) {
    const cur = sessions.list.find((s) => s.id === sessions.active);
    if (!cur || !/^Session \d+$/.test(cur.name)) return;
    const name = nameFromText(text);
    if (!name) return;
    cur.name = name;
    renderSessionSelect();
    ctx.sendToBackend({ type: "session_rename", sid: cur.id, name });
  }

  function finish() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    const sameKey = sendKey === currentKey;
    if (assistantText && sameKey) {
      const target = contIdx >= 0 ? history[contIdx] : null;
      let finalText = assistantText;
      if (target && target.role === "assistant") {
        target.content = joinContinuation(contBase, assistantText);
        finalText = target.content;
      } else {
        history.push({ role: "assistant", content: assistantText });
      }
      for (const b of parseProposals(finalText).blocks) {
        if (b.kind === "draft") ctx.sendToBackend({ type: "draft_merge", fields: b.fields });
      }
    }
    contIdx = -1;
    contBase = "";
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
    if (history.length === 0) autoNameSession(text);
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
        files = Array.isArray(p.files) ? p.files : [];
        renderChips();

        draft = p.draft || null;
        updateCardBtn();
        if (draftOpen) renderDraftView();

        const general = settings.mode === "general" || !p.chat;
        chatLine.textContent =
          settings.mode === "general"
            ? "General chat (no chat context)"
            : p.chat
              ? "Chat: " + p.chat.name
              : "No active chat, using General";
        hasChat = !!p.chat;
        if (p.defaultVoices) defaultVoices = p.defaultVoices;
        renderVoiceOptions();
        syncVoiceUI();

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
        ctxImgTokens = Number(p.imgTokens) || 0;
        updateReadout();
        if (ctxOpen) renderContextView();
        break;
      case "lore_targets":
      case "lore_lookup":
      case "lore_applied":
      case "lore_undone":
      case "chat_lookup":
      case "chat_applied":
      case "chat_undone":
      case "card_created":
      case "card_undone": {
        const cb = pendingCbs.get(p.rid);
        if (cb) {
          pendingCbs.delete(p.rid);
          cb(p);
        }
        break;
      }
      case "files":
        if (Array.isArray(p.files)) files = p.files;
        if (p.error) flashNote(p.error);
        else renderChips();
        updateReadout();
        requestPreview();
        break;
      case "draft":
        draft = p.draft || null;
        updateCardBtn();
        if (draftOpen && !p.quiet) renderDraftView();
        requestPreview();
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
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", onResize);
    root.remove();
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(delTimer);
    clearTimeout(previewTimer);
    unsubBackend();
    unsubChatSwitch();
    removeStyle();
    tab.destroy();
  };
}