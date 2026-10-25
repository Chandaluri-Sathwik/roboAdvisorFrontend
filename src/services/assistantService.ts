import { apiRequest } from './apiClient'

export type AssistantMessage = { role: 'user' | 'assistant'; text: string }

export async function sendAssistantMessage(
  userId: string,
  message: string,
  history: AssistantMessage[],
): Promise<string> {
  const result = await apiRequest<{ reply: string }>('/assistant/messages', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, message, history }),
  })
  return result.reply
}
