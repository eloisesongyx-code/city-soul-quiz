const SESSION_ID_KEY = 'csq_session_id'
const SESSION_TOKEN_KEY = 'csq_session_token'

export interface StoredSession {
  sessionId: string
  sessionToken: string
}

export function saveSession(session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_ID_KEY, session.sessionId)
    localStorage.setItem(SESSION_TOKEN_KEY, session.sessionToken)
  } catch {
    // 隐私模式等场景下 localStorage 不可用，静默降级
  }
}

export function getStoredSession(): StoredSession | null {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY)
    const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY)
    if (sessionId && sessionToken) return { sessionId, sessionToken }
  } catch {
    // ignore
  }
  return null
}

export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_ID_KEY)
    localStorage.removeItem(SESSION_TOKEN_KEY)
  } catch {
    // ignore
  }
}
