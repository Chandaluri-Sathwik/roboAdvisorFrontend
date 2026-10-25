import { apiRequest } from './apiClient'

export type AssistantAction = { type: 'confirm_rebalance' } | null
export type AssistantProvider = 'local' | 'gemini'
export type AssistantMessage = {
  role: 'user' | 'assistant'
  text: string
  action?: AssistantAction
  provider?: AssistantProvider
}
export type AssistantResponse = {
  reply: string
  action?: AssistantAction
  provider?: AssistantProvider
  warning?: string
}

export async function sendAssistantMessage(
  userId: string,
  message: string,
  history: AssistantMessage[],
): Promise<AssistantResponse> {
  return apiRequest<AssistantResponse>('/assistant/messages', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, message, history }),
  }, 20_000)
}
