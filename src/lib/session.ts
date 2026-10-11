const sessionKey = 'cookie-pitada-session-id'

export function getSessionId() {
  const saved = sessionStorage.getItem(sessionKey)
  if (saved) return saved
  const id = crypto.randomUUID()
  sessionStorage.setItem(sessionKey, id)
  return id
}
