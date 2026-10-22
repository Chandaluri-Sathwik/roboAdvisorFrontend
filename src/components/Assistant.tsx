import { useState } from 'react'
import { assistantReplies } from '../data/demo'
import { useApp } from '../store/AppContext'

function responseFor(question: string) {
  if (/equity|allocation/i.test(question)) return assistantReplies.equity
  if (/rebalance|drift/i.test(question)) return assistantReplies.rebalance
  if (/goal|sip|reach/i.test(question)) return assistantReplies.goal
  return assistantReplies.default
}

export function Assistant() {
  const { profile } = useApp()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const ask = (question: string) => { setReply(responseFor(question)); setMessage('') }

  return <>
    <button className="assistant-fab" onClick={() => setOpen(true)}><span>✦</span> Ask FinGuide AI</button>
    {open && <div className="chat-panel">
      <div className="chat-head"><div><span className="chat-logo">AI</span><strong>FinGuide AI</strong><small>Educational demo assistant</small></div><button onClick={() => setOpen(false)}>×</button></div>
      <div className="chat-body">
        <div className="bot-bubble">Hi {profile.name}. I can explain your sample portfolio, risk score or goal plan.</div>
        {reply && <div className="bot-bubble answer">{reply}<small>Illustrative information, not investment advice.</small></div>}
        <div className="chat-prompts">
          <button onClick={() => ask('Why equity allocation?')}>Why this allocation?</button>
          <button onClick={() => ask('Will I reach my goal?')}>Will I reach my goal?</button>
          <button onClick={() => ask('Why rebalance?')}>Why rebalance?</button>
        </div>
      </div>
      <form className="chat-input" onSubmit={(event) => { event.preventDefault(); ask(message) }}>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about your plan" />
        <button aria-label="Send message">↑</button>
      </form>
    </div>}
  </>
}
