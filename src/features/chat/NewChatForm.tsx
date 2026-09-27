import { useState, type FormEvent } from 'react'
import type { NewChatFormProps } from '../../types'

export function NewChatForm({ pending, error, onSubmit, onCancel }: NewChatFormProps) {
  const [phone, setPhone] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(phone)
  }

  return (
    <form className="new-chat" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Номер телефона</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 999 123-45-67"
          value={phone}
          disabled={pending}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="new-chat-actions">
        <button type="submit" disabled={pending}>
          {pending ? 'Проверяем…' : 'Создать'}
        </button>
        <button type="button" className="chat-text-button" disabled={pending} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}
