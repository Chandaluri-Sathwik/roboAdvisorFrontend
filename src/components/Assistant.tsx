import { useEffect, useState } from 'react'
import { generateLocalAssistantReply, type LocalAssistantResponse } from '../services/localAssistantService'
import type { AssistantMessage } from '../services/assistantService'
import { useApp } from '../store/AppContext'

export function Assistant() {
  const { profile, setProfile } = useApp()
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

    setMessage('')
    setError('')
    setMessages((current) => [...current, { role: 'user', text: prompt }])
    setIsLoading(true)
    try {
      // No HTTP request: the assistant derives its reply from the profile
      // already in React state/localStorage, even if the API is offline.
      const response: LocalAssistantResponse = generateLocalAssistantReply(prompt, profile)
      setMessages((current) => [...current, {
        role: 'assistant',
        text: response.reply,
        action: response.action,
      }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The local assistant could not answer this question.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmRebalance = (messageIndex: number) => {
    if (isLoading) return
    setError('')
    setProfile({
      actualAllocation: { ...profile.targetAllocation },
      hasSimulatedMarket: false,
    })
    setMessages((current) => current.map((item, index) => index === messageIndex
      ? {
          ...item,
          action: null,
          text: `${item.text}\n\nLocal rebalance simulation applied in this browser. This change is saved only in browser storage; it is not synced to MongoDB and no real trades were placed.`,
        }
      : item))
  }

  return <>
    <button className="assistant-fab" onClick={() => setOpen(true)}><span>✦</span> Ask FinGuide</button>
    {open && <div className="chat-panel">
      <div className="chat-head"><div><span className="chat-logo">AI</span><strong>FinGuide — Local Assistant</strong><small>Uses your saved portfolio · No Gemini/API request</small></div><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></div>
      <div className="chat-body">
        {!messages.length && <div className="bot-bubble">Hi {profile.name}. I run locally in your browser and explain the portfolio details saved in this app. Ask about your allocation, risk profile, contribution split, saved candidates, projection, or rebalance simulation. I do not use Gemini or live market data.</div>}
        {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`bot-bubble ${item.role === 'assistant' ? 'answer' : 'user-message'}`}>
          {item.text}
          {item.role === 'assistant' && item.action?.type === 'confirm_rebalance' && <button className="chat-action" onClick={() => confirmRebalance(index)} disabled={isLoading}>Confirm local rebalance simulation</button>}
          {item.role === 'assistant' && <small>Educational portfolio explanation only. Not investment advice.</small>}
        </div>)}
        {isLoading && <div className="bot-bubble">Checking your saved portfolio…</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="chat-prompts">
          <button onClick={() => void ask('Explain my risk-based allocation')}>Why this allocation?</button>
          <button onClick={() => void ask('Explain the educational investment candidates and their historical data')}>Explain investment options</button>
          <button onClick={() => void ask('How is my contribution allocated across asset classes?')}>Explain contribution split</button>
          <button onClick={() => void ask('Explain my return-assumption projection')}>Explain my projection</button>
          <button onClick={() => void ask('What does rebalancing mean?')}>Why rebalance?</button>
          {profile.hasSimulatedMarket && <button onClick={() => void ask('Please rebalance my portfolio now')}>Rebalance simulation</button>}
        </div>
      </div>
      <form className="chat-input" onSubmit={(event) => { event.preventDefault(); void ask(message) }}>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about your plan" disabled={isLoading} />
        <button aria-label="Send message" disabled={isLoading || !message.trim()}>↑</button>
      </form>
    </div>}
  </>
}
