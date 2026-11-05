type Msg = { role: 'user' | 'assistant'; content: string }

function mount(ctx: any): () => void {
  const COLLAPSED = { w: 48, h: 48 }
  const EXPANDED = { w: 380, h: 520 }

  const widget = ctx.ui.createFloatWidget({
    width: COLLAPSED.w,
    height: COLLAPSED.h,
    initialPosition: { x: 24, y: 140 },
    tooltip: 'Copilot',
  })

  let expanded = false
  let busy = false
  let reqId = 0
  let history: Msg[] = []
  let assistantText = ''
  let currentBubble: HTMLElement | null = null
  let connectionId = ''
  let ctxCount = 10

  const el = (tag: string, css = '', text = '') => {
    const e = document.createElement(tag)
    if (css) e.style.cssText = css
    if (text) e.textContent = text
    return e
  }

  const fab = el('button', 'width:100%;height:100%;font-size:22px;cursor:pointer;background:transparent;border:none;', '🤖')
  fab.addEventListener('click', () => setExpanded(true))

  const panel = el('div', 'display:none;flex-direction:column;width:100%;height:100%;gap:6px;padding:8px;box-sizing:border-box;color:var(--lumiverse-text);')

  const header = el('div', 'display:flex;align-items:center;gap:6px;')
  const title = el('div', 'font-weight:600;flex:1;', 'Copilot')
  const closeBtn = el('button', 'cursor:pointer;', '✕')
  closeBtn.addEventListener('click', () => setExpanded(false))
  header.append(title, closeBtn)

  const settings = el('div', 'display:flex;gap:6px;align-items:center;font-size:12px;')
  const select = el('select', 'flex:1;min-width:0;') as HTMLSelectElement
  const ctxLabel = el('span', 'color:var(--lumiverse-text-dim);', 'CTX')
  const ctxInput = el('input', 'width:52px;') as HTMLInputElement
  ctxInput.type = 'number'
  ctxInput.min = '0'
  ctxInput.max = '200'
  ctxInput.value = String(ctxCount)
  ctxInput.addEventListener('change', () => { ctxCount = Math.max(0, Math.min(200, Number(ctxInput.value) || 0)) })
  select.addEventListener('change', () => { connectionId = select.value })
  settings.append(select, ctxLabel, ctxInput)

  const chatLine = el('div', 'font-size:11px;color:var(--lumiverse-text-dim);', 'No active chat')

  const log = el('div', 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px;')

  const inputRow = el('div', 'display:flex;gap:6px;')
  const input = el('textarea', 'flex:1;resize:none;height:56px;') as HTMLTextAreaElement
  input.placeholder = 'Ask Copilot…'
  const sendBtn = el('button', 'cursor:pointer;', 'Send')
  inputRow.append(input, sendBtn)

  panel.append(header, settings, chatLine, log, inputRow)
  widget.root.append(fab, panel)

  function setExpanded(v: boolean) {
    expanded = v
    fab.style.display = v ? 'none' : 'block'
    panel.style.display = v ? 'flex' : 'none'
    widget.setSize(v ? EXPANDED.w : COLLAPSED.w, v ? EXPANDED.h : COLLAPSED.h)
    if (v) ctx.sendToBackend({ type: 'init' })
  }

  function addBubble(role: 'user' | 'assistant', text: string) {
    const mine = role === 'user'
    const b = el(
      'div',
      `white-space:pre-wrap;padding:8px 10px;max-width:90%;align-self:${mine ? 'flex-end' : 'flex-start'};` +
        'background:var(--lumiverse-fill-subtle);border:1px solid var(--lumiverse-border);' +
        'border-radius:var(--lumiverse-radius);font-size:13px;',
      text,
    )
    log.appendChild(b)
    log.scrollTop = log.scrollHeight
    return b
  }

  function setBusy(v: boolean) {
    busy = v
    sendBtn.textContent = v ? 'Stop' : 'Send'
  }

  function finish() {
    if (assistantText) history.push({ role: 'assistant', content: assistantText })
    assistantText = ''
    currentBubble = null
    setBusy(false)
  }

  function send() {
    if (busy) {
      ctx.sendToBackend({ type: 'stop' })
      return
    }
    const text = input.value.trim()
    if (!text) return
    input.value = ''
    addBubble('user', text)
    currentBubble = addBubble('assistant', '…')
    assistantText = ''
    reqId++
    setBusy(true)
    ctx.sendToBackend({ type: 'send', reqId, text, history: history.slice(-40), ctxCount, connectionId })
    history.push({ role: 'user', content: text })
  }

  sendBtn.addEventListener('click', send)
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  })

  const unsub = ctx.onBackendMessage((p: any) => {
    switch (p?.type) {
      case 'init': {
        select.replaceChildren()
        const def = el('option', '', 'Active connection') as HTMLOptionElement
        def.value = ''
        select.appendChild(def)
        for (const c of p.connections ?? []) {
          const o = el('option', '', `${c.name} (${c.model})`) as HTMLOptionElement
          o.value = c.id
          select.appendChild(o)
        }
        select.value = connectionId
        chatLine.textContent = p.chat ? `Chat: ${p.chat.name}` : 'No active chat'
        break
      }
      case 'token':
        if (p.reqId !== reqId || !currentBubble) return
        assistantText += p.token
        currentBubble.textContent = assistantText
        log.scrollTop = log.scrollHeight
        break
      case 'done':
      case 'stopped':
        if (p.reqId !== reqId) return
        finish()
        break
      case 'error':
        if (p.reqId !== reqId) return
        if (currentBubble) currentBubble.textContent = `Error: ${p.message}`
        assistantText = ''
        finish()
        break
    }
  })

  ctx.sendToBackend({ type: 'init' })

  return () => {
    unsub()
    widget.destroy()
  }
}

export function setup(ctx: any) {
  console.log('[danny_copilot] frontend setup running')
  let cleanup: (() => void) | null = null

  const start = () => {
    if (cleanup) return
    try {
      cleanup = mount(ctx)
      console.log('[danny_copilot] widget mounted')
    } catch (e) {
      console.error('[danny_copilot] widget failed:', e)
    }
  }

  start()
  try { ctx.events?.on?.('PERMISSION_CHANGED', start) } catch {}

  return () => {
    cleanup?.()
    cleanup = null
  }
}