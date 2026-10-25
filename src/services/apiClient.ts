const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * All API calls get a bounded wait. Callers can override the timeout with
 * options.signal when they need custom cancellation.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 30_000,
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  // Preserve a caller-provided abort signal as well as our timeout.
  const callerSignal = options.signal
  const abortFromCaller = () => controller.abort()
  if (callerSignal?.aborted) controller.abort()
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true })

  try {
    const response = await fetch(`${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })

    const body = await response.json().catch(() => null) as { detail?: string; message?: string } | null
    if (!response.ok) {
      throw new ApiError(
        body?.detail ?? body?.message ?? `Request failed with HTTP ${response.status}.`,
        response.status,
      )
    }

    if (body === null) {
      throw new ApiError('The server returned an empty or invalid JSON response.', response.status)
    }
    return body as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Check that the backend and MongoDB are running, then retry.`)
    }
    if (error instanceof TypeError) {
      throw new Error(`Could not reach the backend at ${apiBaseUrl}. Check the backend URL, server status, and CORS settings.`)
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
    callerSignal?.removeEventListener('abort', abortFromCaller)
  }
}
