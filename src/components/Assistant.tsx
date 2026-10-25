import { useEffect, useRef, useState } from 'react'
import { sendAssistantMessage, type AssistantMessage } from '../services/assistantService'
import { generateLocalAssistantReply, type LocalAssistantResponse } from '../services/localAssistantService'
import { useApp } from '../store/AppContext'

export function Assistant() {
  const { profile, setProfile } = useApp()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatBodyRef = useRef<HTMLDivElement | null>(null)
  const latestAssistantRef = useRef<HTMLDivElement | null>(null)
  const assistantMode = import.meta.env.VITE_ASSISTANT_MODE === 'gemini' ? 'gemini' : 'local'

  useEffect(() => {
    const openAssistant = () => setOpen(true)
    window.addEventListener('finguide:open-assistant', openAssistant)
    return () => window.removeEventListener('finguide:open-assistant', openAssistant)
  }, [])

  useEffect(() => {
    const body = chatBodyRef.current
    const latestMessage = latestAssistantRef.current
    if (!body || !latestMessage) return

    // Start each new answer at its beginning instead of leaving the scroll
    // position halfway through a long response.
    const bodyTop = body.getBoundingClientRect().top
    const messageTop = latestMessage.getBoundingClientRect().top
    const nextScrollTop = body.scrollTop + messageTop - bodyTop - 8
    body.scrollTo({ top: Math.max(0, nextScrollTop), behavior: 'auto' })
  }, [messages])

  const ask = async (question: string) => {
    const prompt = question.trim()
    if (!prompt || isLoading) return

    setMessage('')
    setError('')
    setMessages((current) => [...current, { role: 'user', text: prompt }])
    setIsLoading(true)
    try {
      let response: LocalAssistantResponse

      if (assistantMode === 'gemini' && profile.userId) {
        try {
          // Gemini runs only through the backend, which keeps GEMINI_API_KEY
          // out of browser code. The server falls back locally on provider errors.
          response = await sendAssistantMessage(profile.userId, prompt, messages.slice(-6).map(({ role, text }) => ({ role, text: text.slice(-3000) })))
        } catch (requestError) {
          const local = generateLocalAssistantReply(prompt, profile)
          const reason = requestError instanceof Error ? requestError.message : 'The Gemini request failed.'
          response = {
            ...local,
            provider: 'local',
            warning: `Gemini could not be reached. I answered from the saved portfolio locally instead. ${reason}`,
          }
        }
      } else {
        response = {
          ...generateLocalAssistantReply(prompt, profile),
          provider: 'local',
          ...(assistantMode === 'gemini' ? {
            warning: 'Save a complete plan first to send its portfolio context to Gemini. This answer was generated locally.',
          } : {}),
        }
      }

      setMessages((current) => [...current, {
        role: 'assistant',
        text: response.warning ? `${response.warning}\n\n${response.reply}` : response.reply,
        action: response.action,
        provider: response.provider ?? 'local',
      }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The assistant could not answer this question.')
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
      <div className="chat-head">
        <div>
          <span className="chat-logo">AI</span>
          <strong>{assistantMode === 'gemini' ? 'FinGuide — Gemini mode' : 'FinGuide — Local Assistant'}</strong>
          <small>{assistantMode === 'gemini' ? 'Gemini via backend · local fallback enabled' : 'Uses your saved portfolio · no model API request'}</small>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
      </div>
      <div className="chat-body" ref={chatBodyRef}>
        {!messages.length && <div className="bot-bubble">Hi {profile.name}. {assistantMode === 'gemini'
          ? 'Gemini mode sends your saved portfolio context to the backend Gemini API. If the model or API is unavailable, I fall back to local portfolio explanations.'
          : 'I run locally in your browser and explain the portfolio details saved in this app. I do not use Gemini or live market data in local mode.'} Ask about your allocation, risk profile, contribution split, saved candidates, projection, or rebalance simulation.</div>}
        {messages.map((item, index) => <div key={`${item.role}-${index}`} ref={item.role === 'assistant' && index === messages.length - 1 ? latestAssistantRef : undefined} className={`bot-bubble ${item.role === 'assistant' ? 'answer' : 'user-message'}`}>
          {item.text}
          {item.role === 'assistant' && item.action?.type === 'confirm_rebalance' && <button className="chat-action" onClick={() => confirmRebalance(index)} disabled={isLoading}>Confirm local rebalance simulation</button>}
          {item.role === 'assistant' && <small>{item.provider === 'gemini'
            ? 'Gemini-generated explanation grounded in your saved portfolio context. Educational only, not investment advice.'
            : 'Local portfolio explanation. Educational only, not investment advice.'}</small>}
        </div>)}
        {isLoading && <div className="bot-bubble">{assistantMode === 'gemini' ? 'Checking Gemini and your saved portfolio…' : 'Checking your saved portfolio…'}</div>}
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
