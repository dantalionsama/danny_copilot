const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const STYLES = `
  .cp-root { display:flex; flex-direction:column; height:100%; gap:8px; padding:10px; box-sizing:border-box; color:var(--lumiverse-text, inherit); }
  .cp-row { display:flex; gap:6px; align-items:center; font-size:12px; }
  .cp-row select { flex:1; min-width:0; }
  .cp-row input[type=number] { width:56px; }
  .cp-dim { font-size:11px; color:var(--lumiverse-text-dim, rgba(127,127,127,0.7)); }
  .cp-log { flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px; }
  .cp-msg { white-space:pre-wrap; padding:8px 10px; max-width:92%; font-size:13px;
    background:var(--lumiverse-fill-subtle, rgba(127,127,127,0.1));
    border:1px solid var(--lumiverse-border, rgba(127,127,127,0.25));
    border-radius:var(--lumiverse-radius, 8px); }
  .cp-msg.user { align-self:flex-end; }
  .cp-msg.assistant { align-self:flex-start; }
  .cp-input { flex:1; resize:none; height:60px; }
`;

export function setup(ctx) {
  console.log("[danny_copilot] frontend setup running");

  let busy = false;
  let reqId = 0;
  let history = [];
  let assistantText = "";
  let currentBubble = null;
  let connectionId = "";
  let ctxCount = 10;
  let currentChatId = undefined;
  let sendChatId = null;

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

  const row = el("div", "cp-row");
  const select = el("select");
  const ctxLabel = el("span", "cp-dim", "CTX");
  const ctxInput = el("input");
  ctxInput.type = "number";
  ctxInput.min = "0";
  ctxInput.max = "200";
  ctxInput.value = String(ctxCount);
  ctxInput.addEventListener("change", () => {
    ctxCount = Math.max(0, Math.min(200, Number(ctxInput.value) || 0));
  });
  select.addEventListener("change", () => { connectionId = select.value; });
  const clearBtn = el("button", "", "Clear");
  clearBtn.title = "Clear Copilot history for this chat";
  clearBtn.addEventListener("click", () => {
    if (busy) return;
    history = [];
    renderHistory();
    saveHistory();
  });
  row.append(select, ctxLabel, ctxInput, clearBtn);

  const chatLine = el("div", "cp-dim", "No active chat");
  const log = el("div", "cp-log");

  const inputRow = el("div", "cp-row");
  const input = el("textarea", "cp-input");
  input.placeholder = "Ask Copilot…";
  const sendBtn = el("button", "", "Send");
  inputRow.append(input, sendBtn);

  root.append(row, chatLine, log, inputRow);
  tab.root.appendChild(root);

  function addBubble(role, text) {
    const b = el("div", "cp-msg " + role, text);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function renderHistory() {
    log.replaceChildren();
    for (const m of history) addBubble(m.role, m.content);
  }

  function saveHistory() {
    if (!currentChatId) return;
    ctx.sendToBackend({ type: "save_history", chatId: currentChatId, history: history.slice(-200) });
  }

  function setBusy(v) {
    busy = v;
    sendBtn.textContent = v ? "Stop" : "Send";
  }

  function finish() {
    if (assistantText && sendChatId === currentChatId) {
      history.push({ role: "assistant", content: assistantText });
    }
    assistantText = "";
    currentBubble = null;
    setBusy(false);
    if (sendChatId === currentChatId) saveHistory();
  }

  function send() {
    if (busy) {
      ctx.sendToBackend({ type: "stop" });
      return;
    }
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addBubble("user", text);
    currentBubble = addBubble("assistant", "…");
    assistantText = "";
    sendChatId = currentChatId;
    reqId++;
    setBusy(true);
    ctx.sendToBackend({ type: "send", reqId, text, history: history.slice(-40), ctxCount, connectionId });
    history.push({ role: "user", content: text });
    saveHistory();
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  const unsubBackend = ctx.onBackendMessage((p) => {
    switch (p && p.type) {
      case "init": {
        select.replaceChildren();
        const def = el("option", "", "Active connection");
        def.value = "";
        select.appendChild(def);
        for (const c of p.connections || []) {
          const o = el("option", "", `${c.name} (${c.model})`);
          o.value = c.id;
          select.appendChild(o);
        }
        select.value = connectionId;
        chatLine.textContent = p.chat ? "Chat: " + p.chat.name : "No active chat";

        const newId = p.chat ? p.chat.id : null;
        if (newId !== currentChatId) {
          if (busy) {
            ctx.sendToBackend({ type: "stop" });
            reqId++;
            assistantText = "";
            currentBubble = null;
            setBusy(false);
          }
          currentChatId = newId;
          history = Array.isArray(p.history) ? p.history : [];
          renderHistory();
        }
        break;
      }
      case "token":
        if (p.reqId !== reqId || !currentBubble) return;
        assistantText += p.token;
        currentBubble.textContent = assistantText;
        log.scrollTop = log.scrollHeight;
        break;
      case "done":
      case "stopped":
        if (p.reqId !== reqId) return;
        finish();
        break;
      case "error":
        if (p.reqId !== reqId) return;
        if (currentBubble) currentBubble.textContent = "Error: " + p.message;
        assistantText = "";
        finish();
        break;
    }
  });

  const unsubChatSwitch = ctx.events.on("CHAT_SWITCHED", () => {
    ctx.sendToBackend({ type: "init" });
  });

  tab.onActivate(() => ctx.sendToBackend({ type: "init" }));
  ctx.sendToBackend({ type: "init" });

  return () => {
    unsubBackend();
    unsubChatSwitch();
    removeStyle();
    tab.destroy();
  };
}