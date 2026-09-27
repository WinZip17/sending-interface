import { useState, type FormEvent } from 'react'
import type { AuthScreenProps } from '../../types'

export function AuthScreen({ pending, error, onSubmit }: AuthScreenProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = idInstance.trim()
    const token = apiTokenInstance.trim()

    if (!id) {
      setFormError('Укажите idInstance.')
      return
    }
    if (!/^\d+$/.test(id)) {
      setFormError('idInstance должен содержать только цифры.')
      return
    }
    if (!token) {
      setFormError('Укажите apiTokenInstance.')
      return
    }

    setFormError(null)
    onSubmit({ idInstance: id, apiTokenInstance: token })
  }

  const visibleError = formError ?? error

  return (
    <main className="app-shell">
      <section className="auth-card">
        <h1>Чат MAX</h1>
        <p className="auth-lead">
          Введите idInstance и apiTokenInstance из личного кабинета GREEN-API.
        </p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>idInstance</span>
            <input
              name="idInstance"
              inputMode="numeric"
              autoComplete="off"
              value={idInstance}
              disabled={pending}
              aria-invalid={visibleError ? true : undefined}
              onChange={(event) => setIdInstance(event.target.value)}
            />
          </label>
          <label className="auth-field">
            <span>apiTokenInstance</span>
            <input
              name="apiTokenInstance"
              type="password"
              autoComplete="off"
              value={apiTokenInstance}
              disabled={pending}
              aria-invalid={visibleError ? true : undefined}
              onChange={(event) => setApiTokenInstance(event.target.value)}
            />
          </label>
          {visibleError ? (
            <p className="auth-error" role="alert">
              {visibleError}
            </p>
          ) : null}
          <button type="submit" disabled={pending}>
            {pending ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </section>
    </main>
  )
}
