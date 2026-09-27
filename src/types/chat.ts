import type { Chat, ChatMessage } from './session.ts'

export type ChatLayoutProps = {
  notice: string | null
  onLogout: () => void
}

export type ChatListProps = {
  chats: Chat[]
  messages: ChatMessage[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
}

export type NewChatFormProps = {
  pending: boolean
  error: string | null
  onSubmit: (phone: string) => void
  onCancel: () => void
}

export type ThreadProps = {
  messages: ChatMessage[]
}

export type ComposerProps = {
  pending: boolean
  error: string | null
  onSend: (text: string) => void
}
