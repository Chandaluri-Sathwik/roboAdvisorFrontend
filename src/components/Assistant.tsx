import { useEffect, useState } from 'react'
import { sendAssistantMessage, type AssistantMessage } from '../services/assistantService'
import { useApp } from '../store/AppContext'

export function Assistant() {
  const { profile } = useApp()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const openAssistant = () => setOpen(true)
    window.addEventListener('finguide:open-assistant', openAssistant)
    return () => window.removeEventListener('finguide:open-assistant', openAssistant)
  }, [])

  const ask = async (question: string) => {
    const prompt = question.trim()
    if (!prompt || isLoading) return
    if (!profile.userId) {
      setError('Save your plan before asking the assistant about it.')
      return
    }

    setMessage('')
    setError('')
    setMessages((current) => [...current, { role: 'user', text: prompt }])
    setIsLoading(true)
    try {
      const reply = await sendAssistantMessage(profile.userId, prompt, messages.slice(-6))
      setMessages((current) => [...current, { role: 'assistant', text: reply }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The assistant could not answer right now.')
    } finally {
      setIsLoading(false)
    }
  }

  return <>
    <button className="assistant-fab" onClick={() => setOpen(true)}><span>✦</span> Ask FinGuide AI</button>
    {open && <div className="chat-panel">
      <div className="chat-head"><div><span className="chat-logo">AI</span><strong>FinGuide AI</strong><small>Google Gemini · Educational assistant</small></div><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></div>
      <div className="chat-body">
        {!messages.length && <div className="bot-bubble">Hi {profile.name}. Ask about your saved allocation, investment candidates, contribution amounts, or illustrative projection.</div>}
        {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`bot-bubble ${item.role === 'assistant' ? 'answer' : 'user-message'}`}>
          {item.text}
          {item.role === 'assistant' && <small>AI-generated educational information. Not investment advice.</small>}
        </div>)}
        {isLoading && <div className="bot-bubble">Thinking…</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="chat-prompts">
          <button onClick={() => void ask('Explain my risk-based allocation')}>Why this allocation?</button>
          <button onClick={() => void ask('Explain the educational investment candidates and their historical data')}>Explain investment options</button>
          <button onClick={() => void ask('How is my contribution allocated across asset classes?')}>Explain contribution split</button>
          <button onClick={() => void ask('Explain my return-assumption projection')}>Explain my projection</button>
          <button onClick={() => void ask('What does rebalancing mean?')}>Why rebalance?</button>
        </div>
      </div>
      <form className="chat-input" onSubmit={(event) => { event.preventDefault(); void ask(message) }}>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about your plan" disabled={isLoading} />
        <button aria-label="Send message" disabled={isLoading || !message.trim()}>↑</button>
      </form>
    </div>}
  </>
}
