import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { ComposerProps } from '../../types'

export function Composer({ pending, error, onSend }: ComposerProps) {
  const [draft, setDraft] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const visibleError = localError ?? error

  function submit() {
    const text = draft.trim()
    if (!text || pending) {
      return
    }
    if (text.length > 4000) {
      setLocalError('Длина сообщения должна быть от 1 до 4000 символов.')
      return
    }

    setLocalError(null)
    setDraft('')
    onSend(text)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <label className="composer-field">
        <span className="composer-label">Сообщение</span>
        <textarea
          name="message"
          rows={2}
          placeholder="Сообщение"
          value={draft}
          disabled={pending}
          aria-invalid={visibleError ? true : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
      <button type="submit" aria-label={pending ? 'Отправляем' : 'Отправить'} disabled={pending || draft.trim().length === 0}>
        {pending ? (
          <span className="composer-wait" aria-hidden="true">
            …
          </span>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h12M13 6l6 6-6 6" />
          </svg>
        )}
      </button>
      {visibleError ? (
        <p className="auth-error" role="alert">
          {visibleError}
        </p>
      ) : null}
    </form>
  )
}
