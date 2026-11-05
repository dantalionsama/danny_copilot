const SYSTEM = `You are Copilot, an out-of-character (OOC) assistant for a roleplay writer.
Help with brainstorming, plot ideas, character analysis, lore and scene review.
Never write dialogue or actions for the user's character, and never continue the roleplay.
Be concise and direct.`;

let controller = null;

const histPath = (chatId) =>
  `copilot_history_${String(chatId).replace(/[^a-zA-Z0-9_-]/g, "")}.json`;

function cleanHistory(raw) {
  return (Array.isArray(raw) ? raw : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content }));
}

async function loadHistory(chatId, userId) {
  try {
    const h = await spindle.userStorage.getJson(histPath(chatId), { fallback: [], userId });
    return cleanHistory(h);
  } catch (e) {
    spindle.log.warn("[Copilot] load history failed: " + e.message);
    return [];
  }
}

spindle.log.info("[Copilot] backend started");

spindle.onFrontendMessage(async (payload, userId) => {
  switch (payload && payload.type) {
    case "init": {
      try {
        const connections = await spindle.connections.list(userId);
        const active = await spindle.chats.getActive(userId);
        const history = active ? await loadHistory(active.id, userId) : [];
        spindle.sendToFrontend({
          type: "init",
          connections: connections.map((c) => ({
            id: c.id,
            name: c.name,
            model: c.model,
            is_default: c.is_default,
          })),
          chat: active ? { id: active.id, name: active.name } : null,
          history,
        }, userId);
      } catch (e) {
        spindle.log.warn("[Copilot] init failed: " + e.message);
      }
      break;
    }

    case "save_history": {
      if (!payload.chatId) break;
      try {
        await spindle.userStorage.setJson(
          histPath(payload.chatId),
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
        let transcript = "";
        const active = await spindle.chats.getActive(userId);
        if (active) {
          const msgs = await spindle.chat.getMessages(active.id);
          const n = Math.max(0, Math.min(200, Number(payload.ctxCount) || 0));
          const recent = n > 0 ? msgs.slice(-n) : [];
          transcript = recent.map((m) => `[${m.role}] ${m.content}`).join("\n\n");
        }

        const history = cleanHistory(payload.history).slice(-40);

        const messages = [
          {
            role: "system",
            content: transcript
              ? `${SYSTEM}\n\n<roleplay_context>\n${transcript}\n</roleplay_context>`
              : SYSTEM,
          },
          ...history,
          { role: "user", content: String(payload.text || "") },
        ];

        const input = { type: "quiet", messages, userId, signal: ctl.signal };
        if (payload.connectionId) input.connection_id = payload.connectionId;

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