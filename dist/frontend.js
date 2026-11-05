const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const STYLES = `
  .cp-root { display:flex; flex-direction:column; height:100%; gap:8px; padding:10px; box-sizing:border-box; color:var(--lumiverse-text, inherit); }
  .cp-row { display:flex; gap:6px; align-items:center; font-size:12px; }
  .cp-row select { flex:1; min-width:0; }
  .cp-row input[type=number] { width:56px; }
  .cp-dim { font-size:11px; color:var(--lumiverse-text-dim, rgba(127,127,127,0.7)); }
  .cp-set { display:none; flex-direction:column; gap:6px; padding:8px; font-size:12px;
    border:1px solid var(--lumiverse-border, rgba(127,127,127,0.25));
    border-radius:var(--lumiverse-radius, 8px); }
  .cp-set.open { display:flex; }
  .cp-set label { display:flex; gap:6px; align-items:center; }
  .cp-set textarea { height:110px; resize:vertical; }
  .cp-log { flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:8px; }
  .cp-wrap { display:flex; flex-direction:column; gap:2px; max-width:92%; }
  .cp-wrap.user { align-self:flex-end; align-items:flex-end; }
  .cp-wrap.assistant { align-self:flex-start; }
  .cp-msg { white-space:pre-wrap; padding:8px 10px; font-size:13px; word-break:break-word;
    background:var(--lumiverse-fill-subtle, rgba(127,127,127,0.1));
    border:1px solid var(--lumiverse-border, rgba(127,127,127,0.25));
    border-radius:var(--lumiverse-radius, 8px); }
  .cp-bar { display:flex; gap:10px; opacity:0.55; }
  .cp-bar:hover { opacity:1; }
  .cp-act { background:none; border:none; padding:0; font-size:11px; cursor:pointer; color:inherit; }
  .cp-act:hover { text-decoration:underline; }
  .cp-edit { width:100%; min-height:80px; resize:vertical; }
  .cp-input { flex:1; resize:none; height:60px; }
  .cp-md { white-space:normal; }
  .cp-md p, .cp-md ul, .cp-md ol, .cp-md blockquote, .cp-md pre { margin:0 0 0.6em; }
  .cp-md > :last-child { margin-bottom:0; }
  .cp-md ul, .cp-md ol { padding-left:1.4em; }
  .cp-md h1, .cp-md h2, .cp-md h3, .cp-md h4 { font-size:1em; font-weight:700; margin:0.4em 0 0.3em; }
  .cp-md h1 { font-size:1.15em; }
  .cp-md h2 { font-size:1.08em; }
  .cp-md blockquote { border-left:3px solid rgba(127,127,127,0.5); padding-left:10px; opacity:0.85; }
  .cp-md pre { overflow-x:auto; padding:8px; background:rgba(127,127,127,0.15); border-radius:6px; }
  .cp-md code { font-family:monospace; font-size:12px; background:rgba(127,127,127,0.15); padding:0 4px; border-radius:4px; }
  .cp-md pre code { background:none; padding:0; }
  .cp-md a { color:inherit; text-decoration:underline; }
  .cp-md hr { border:none; border-top:1px solid rgba(127,127,127,0.4); margin:0.6em 0; }
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

// ---------- extension ----------
export function setup(ctx) {
  console.log("[danny_copilot] frontend setup running");

  let busy = false;
  let reqId = 0;
  let history = [];
  let assistantText = "";
  let currentBubble = null;
  let currentKey = undefined;
  let sendKey = null;
  let raf = 0;
  let defaultSystem = "";
  let settings = {
    mode: "chat",
    ctxCount: 10,
    connectionId: "",
    includeCard: true,
    includePersona: true,
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
    iconSvg: ICON,
  });

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };

  const root = el("div", "cp-root");

  // top row
  const topRow = el("div", "cp-row");
  const modeSelect = el("select");
  for (const [v, t] of [["chat", "This chat"], ["general", "General"]]) {
    const o = el("option", "", t);
    o.value = v;
    modeSelect.appendChild(o);
  }
  const settingsBtn = el("button", "", "⚙");
  settingsBtn.title = "Settings";
  const clearBtn = el("button", "", "Clear");
  clearBtn.title = "Clear Copilot history for this session";
  topRow.append(modeSelect, settingsBtn, clearBtn);

  // settings panel
  const setPanel = el("div", "cp-set");

  const connRow = el("label");
  const connSelect = el("select");
  connSelect.style.flex = "1";
  connRow.append(el("span", "", "Connection"), connSelect);

  const ctxRow = el("label");
  const ctxInput = el("input");
  ctxInput.type = "number";
  ctxInput.min = "0";
  ctxInput.max = "200";
  ctxRow.append(el("span", "", "Recent chat messages"), ctxInput);

  const cardRow = el("label");
  const cardCb = el("input");
  cardCb.type = "checkbox";
  cardRow.append(cardCb, el("span", "", "Include character card"));

  const personaRow = el("label");
  const personaCb = el("input");
  personaCb.type = "checkbox";
  personaRow.append(personaCb, el("span", "", "Include persona"));

  const promptLabel = el("span", "", "System prompt");
  const promptTa = el("textarea");
  const resetBtn = el("button", "", "Reset prompt");

  setPanel.append(connRow, ctxRow, cardRow, personaRow, promptLabel, promptTa, resetBtn);

  const chatLine = el("div", "cp-dim", "No active chat");
  const log = el("div", "cp-log");

  const inputRow = el("div", "cp-row");
  const input = el("textarea", "cp-input");
  input.placeholder = "Ask Copilot…";
  const sendBtn = el("button", "", "Send");
  inputRow.append(input, sendBtn);

  root.append(topRow, setPanel, chatLine, log, inputRow);
  tab.root.appendChild(root);

  // ---------- settings ----------
  function saveSettings() {
    ctx.sendToBackend({ type: "save_settings", settings });
  }

  function syncSettingsUI() {
    modeSelect.value = settings.mode;
    ctxInput.value = String(settings.ctxCount);
    cardCb.checked = !!settings.includeCard;
    personaCb.checked = !!settings.includePersona;
    promptTa.value = settings.systemPrompt || defaultSystem;
  }

  settingsBtn.addEventListener("click", () => setPanel.classList.toggle("open"));

  modeSelect.addEventListener("change", () => {
    settings.mode = modeSelect.value;
    saveSettings();
    ctx.sendToBackend({ type: "init" });
  });
  connSelect.addEventListener("change", () => {
    settings.connectionId = connSelect.value;
    saveSettings();
  });
  ctxInput.addEventListener("change", () => {
    settings.ctxCount = Math.max(0, Math.min(200, Number(ctxInput.value) || 0));
    ctxInput.value = String(settings.ctxCount);
    saveSettings();
  });
  cardCb.addEventListener("change", () => { settings.includeCard = cardCb.checked; saveSettings(); });
  personaCb.addEventListener("change", () => { settings.includePersona = personaCb.checked; saveSettings(); });
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
    if (!currentKey) return;
    ctx.sendToBackend({ type: "save_history", key: currentKey, history: history.slice(-200) });
  }

  function actBtn(label, title, fn) {
    const b = el("button", "cp-act", label);
    b.title = title;
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
    const copyBtn = actBtn("Copy", "Copy text", async () => {
      const ok = await copyText(m.content);
      copyBtn.textContent = ok ? "Copied" : "Failed";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1200);
    });
    bar.appendChild(copyBtn);

    if (!busy) {
      bar.appendChild(actBtn("Edit", "Edit message", () => startEdit(i, wrap)));
      bar.appendChild(actBtn("Delete", "Delete message", () => {
        history.splice(i, 1);
        saveHistory();
        renderHistory();
      }));
      if (i === history.length - 1) {
        bar.appendChild(actBtn(m.role === "assistant" ? "Regen" : "Retry", "Generate again", regen));
      }
    }

    wrap.append(bubble, bar);
    return wrap;
  }

  function startEdit(i, wrap) {
    const ta = el("textarea", "cp-edit");
    ta.value = history[i].content;
    const bar = el("div", "cp-bar");
    bar.style.opacity = "1";
    bar.append(
      actBtn("Save", "Save edit", () => {
        const v = ta.value.trim();
        if (v) {
          history[i].content = v;
          saveHistory();
        }
        renderHistory();
      }),
      actBtn("Cancel", "Cancel", () => renderHistory()),
    );
    wrap.replaceChildren(ta, bar);
    ta.focus();
  }

  function renderHistory() {
    log.replaceChildren();
    history.forEach((m, i) => log.appendChild(buildMessage(i, m)));
    log.scrollTop = log.scrollHeight;
  }

  clearBtn.addEventListener("click", () => {
    if (busy) return;
    history = [];
    renderHistory();
    saveHistory();
  });

  // ---------- generation ----------
  function setBusy(v) {
    busy = v;
    sendBtn.textContent = v ? "Stop" : "Send";
  }

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

        chatLine.textContent =
          settings.mode === "general"
            ? "General chat (no chat context)"
            : p.chat
              ? "Chat: " + p.chat.name
              : "No active chat, using General";

        if (p.sessionKey !== currentKey) {
          if (busy) {
            ctx.sendToBackend({ type: "stop" });
            reqId++;
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
            assistantText = "";
            currentBubble = null;
            setBusy(false);
          }
          currentKey = p.sessionKey;
          history = Array.isArray(p.history) ? p.history : [];
          renderHistory();
        }
        break;
      }
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
    unsubBackend();
    unsubChatSwitch();
    removeStyle();
    tab.destroy();
  };
}