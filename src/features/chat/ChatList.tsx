import type { ChatListProps } from '../../types'
import { avatarColor, avatarLabel } from './avatar.ts'
import { formatMessageTime } from './formatTime.ts'

export function ChatList({ chats, messages, activeChatId, onSelect }: ChatListProps) {
  if (chats.length === 0) {
    return <p className="chat-empty">Чатов пока нет. Создайте чат по номеру телефона.</p>
  }

  return (
    <ul className="chat-list">
      {chats.map((chat) => {
        const last = [...messages].reverse().find((message) => message.chatId === chat.chatId)
        return (
          <li key={chat.chatId}>
            <button
              type="button"
              className={chat.chatId === activeChatId ? 'chat-item is-active' : 'chat-item'}
              aria-current={chat.chatId === activeChatId ? 'true' : undefined}
              onClick={() => onSelect(chat.chatId)}
            >
              <span className="chat-avatar" style={{ background: avatarColor(chat.chatId) }}>
                {avatarLabel(chat.phone)}
              </span>
              <span className="chat-item-body">
                <span className="chat-item-row">
                  <span className="chat-item-title">{chat.title}</span>
                  {last ? <time className="chat-item-time">{formatMessageTime(last.timestamp)}</time> : null}
                </span>
                {last ? <span className="chat-item-preview">{last.text}</span> : null}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

