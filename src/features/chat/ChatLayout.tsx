import { useState } from 'react'
import { errorText } from '../../api/greenApi.ts'
import { useSessionStore } from '../../store/sessionStore.ts'
import type { ChatLayoutProps } from '../../types'
import { avatarColor, avatarLabel } from './avatar.ts'
import { ChatList } from './ChatList.tsx'
import { Composer } from './Composer.tsx'
import { createChat } from './createChat.ts'
import { NewChatForm } from './NewChatForm.tsx'
import { sendOutgoing } from './sendOutgoing.ts'
import { Thread } from './Thread.tsx'
import { useNotificationPoll } from './useNotificationPoll.ts'

export function ChatLayout({ notice, onLogout }: ChatLayoutProps) {
  const credentials = useSessionStore((state) => state.credentials)
  const chats = useSessionStore((state) => state.chats)
  const messages = useSessionStore((state) => state.messages)
  const activeChatId = useSessionStore((state) => state.activeChatId)
  const setActiveChatId = useSessionStore((state) => state.setActiveChatId)
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useNotificationPoll(credentials)

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null
  const thread = messages.filter((message) => message.chatId === activeChatId)

  async function handleCreate(phone: string) {
    if (!credentials) {
      return
    }

    setError(null)
    setPending(true)
    try {
      await createChat(credentials, phone)
      setCreating(false)
    } catch (caught) {
      setError(errorText(caught, 'Не удалось проверить номер.'))
    } finally {
      setPending(false)
    }
  }

  async function handleSend(text: string) {
    if (!credentials || !activeChat) {
      return
    }

    setSendError(null)
    setSending(true)
    try {
      await sendOutgoing(credentials, activeChat.chatId, text)
    } catch (caught) {
      setSendError(errorText(caught, 'Не удалось отправить сообщение.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-app">
      <aside className="chat-side">
        <header className="chat-side-header">
          <h1>Чаты</h1>
          <div className="chat-side-actions">
            {creating ? null : (
              <button type="button" className="chat-new" aria-label="Новый чат" onClick={() => setCreating(true)}>
                +
              </button>
            )}
            <button type="button" className="chat-text-button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </header>
        {notice ? <p className="auth-note">{notice}</p> : null}
        {creating ? (
          <NewChatForm
            pending={pending}
            error={error}
            onSubmit={(phone) => void handleCreate(phone)}
            onCancel={() => {
              setCreating(false)
              setError(null)
            }}
          />
        ) : null}
        <ChatList
          chats={chats}
          messages={messages}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
        />
      </aside>
      <section className="chat-main">
        {activeChat ? (
          <>
            <header className="chat-main-header">
              <span className="chat-avatar" style={{ background: avatarColor(activeChat.chatId) }}>
                {avatarLabel(activeChat.phone)}
              </span>
              <h2>{activeChat.title}</h2>
            </header>
            <Thread messages={thread} />
            <Composer
              key={activeChat.chatId}
              pending={sending}
              error={sendError}
              onSend={(text) => void handleSend(text)}
            />
          </>
        ) : (
          <p className="chat-placeholder">Выберите чат или создайте новый по номеру телефона.</p>
        )}
      </section>
    </div>
  )
}
