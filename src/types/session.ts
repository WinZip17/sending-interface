import type { Credentials } from './api.ts'

export type Chat = {
  chatId: string
  phone: string
  title: string
}

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  direction: 'in' | 'out'
  timestamp: number
  status: 'pending' | 'sent' | 'failed'
}

export type IncomingMessage = {
  id: string
  chatId: string
  text: string
  timestamp: number
}

export type SessionState = {
  credentials: Credentials | null
  chats: Chat[]
  messages: ChatMessage[]
  activeChatId: string | null
  httpApiConfigured: boolean
  setCredentials: (credentials: Credentials) => void
  markHttpApiConfigured: () => void
  clearSession: () => void
  setActiveChatId: (chatId: string | null) => void
  addChat: (chat: Chat) => void
  addOutgoing: (chatId: string, text: string) => ChatMessage | null
  confirmOutgoing: (localId: string, idMessage: string) => void
  failOutgoing: (localId: string) => void
  addIncoming: (message: IncomingMessage) => boolean
}

export type PersistedSession = Pick<
  SessionState,
  'credentials' | 'chats' | 'messages' | 'activeChatId' | 'httpApiConfigured'
>
