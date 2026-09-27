import { useEffect, useState } from 'react'
import { errorText } from './api/greenApi.ts'
import type { Credentials } from './types'
import { AuthScreen } from './features/auth/AuthScreen.tsx'
import { ChatLayout } from './features/chat/ChatLayout.tsx'
import { restartNotice, verifyInstance } from './features/auth/verifyInstance.ts'
import { useSessionHydrated, useSessionStore } from './store/sessionStore.ts'

export default function App() {
  const hydrated = useSessionHydrated()
  const credentials = useSessionStore((state) => state.credentials)
  const setCredentials = useSessionStore((state) => state.setCredentials)
  const markHttpApiConfigured = useSessionStore((state) => state.markHttpApiConfigured)
  const clearSession = useSessionStore((state) => state.clearSession)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated || !credentials || ready) {
      return
    }

    let cancelled = false
    const configure = !useSessionStore.getState().httpApiConfigured

    void verifyInstance(credentials, configure)
      .then((result) => {
        if (cancelled) {
          return
        }
        markHttpApiConfigured()
        setNotice(result.restarted ? restartNotice() : null)
        setReady(true)
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return
        }
        clearSession()
        setError(errorText(caught, 'Не удалось войти.'))
      })

    return () => {
      cancelled = true
    }
  }, [hydrated, credentials, ready, markHttpApiConfigured, clearSession])

  async function handleLogin(nextCredentials: Credentials) {
    setError(null)
    setPending(true)
    try {
      const result = await verifyInstance(nextCredentials, true)
      setCredentials(nextCredentials)
      markHttpApiConfigured()
      setNotice(result.restarted ? restartNotice() : null)
      setReady(true)
    } catch (caught) {
      setError(errorText(caught, 'Не удалось войти.'))
    } finally {
      setPending(false)
    }
  }

  function handleLogout() {
    clearSession()
    setReady(false)
    setNotice(null)
    setError(null)
  }

  if (!hydrated || (credentials && !ready && !error)) {
    return (
      <main className="app-shell">
        <p className="auth-status">{hydrated ? 'Проверяем инстанс…' : 'Загрузка…'}</p>
      </main>
    )
  }

  if (!credentials || !ready) {
    return <AuthScreen pending={pending} error={error} onSubmit={(value) => void handleLogin(value)} />
  }

  return <ChatLayout notice={notice} onLogout={handleLogout} />
}
