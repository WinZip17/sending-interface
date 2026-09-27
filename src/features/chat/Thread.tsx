import { useEffect, useRef } from 'react'
import type { ThreadProps } from '../../types'
import { formatMessageTime } from './formatTime.ts'

export function Thread({ messages }: ThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  if (messages.length === 0) {
    return <p className="chat-placeholder">Сообщений пока нет.</p>
  }

  return (
    <div className="thread">
      {messages.map((message) => (
        <article
          key={message.id}
          className={message.direction === 'out' ? 'message message-out' : 'message message-in'}
        >
          <p>{message.text}</p>
          <span className="message-meta">
            {message.status === 'pending' ? <span className="message-status">Отправляется…</span> : null}
            {message.status === 'failed' ? <span className="message-status">Не отправлено</span> : null}
            <time>{formatMessageTime(message.timestamp)}</time>
          </span>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  )
}
