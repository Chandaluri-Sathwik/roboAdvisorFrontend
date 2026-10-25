import { apiRequest } from './apiClient'

export type AssistantAction = { type: 'confirm_rebalance' } | null
export type AssistantSource = { title: string; url: string }
export type AssistantMessage = { role: 'user' | 'assistant'; text: string; action?: AssistantAction; sources?: AssistantSource[] }
type AssistantResponse = { reply: string; action?: AssistantAction; sources?: AssistantSource[] }

export async function sendAssistantMessage(
  userId: string,
  message: string,
  history: AssistantMessage[],
): Promise<AssistantResponse> {
  const result = await apiRequest<AssistantResponse>('/assistant/messages', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, message, history }),
  })
  return result
}
