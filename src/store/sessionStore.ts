import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Chat, ChatMessage, PersistedSession, SessionState } from '../types'

const emptySession: PersistedSession = {
  credentials: null,
  chats: [],
  messages: [],
  activeChatId: null,
  httpApiConfigured: false,
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...emptySession,

      setCredentials(credentials) {
        const current = get().credentials
        if (
          current?.idInstance === credentials.idInstance &&
          current.apiTokenInstance === credentials.apiTokenInstance
        ) {
          return
        }

        set({
          credentials,
          chats: [],
          messages: [],
          activeChatId: null,
          httpApiConfigured: false,
        })
      },

      markHttpApiConfigured() {
        set({ httpApiConfigured: true })
      },

      clearSession() {
        set(emptySession)
      },

      setActiveChatId(chatId) {
        if (chatId !== null && !get().chats.some((chat) => chat.chatId === chatId)) {
          return
        }
        set({ activeChatId: chatId })
      },

      addChat(chat) {
        if (!chat.chatId) {
          return
        }

        const chats = get().chats
        if (chats.some((item) => item.chatId === chat.chatId)) {
          set({ activeChatId: chat.chatId })
          return
        }

        set({
          chats: [chat, ...chats],
          activeChatId: chat.chatId,
        })
      },

      addOutgoing(chatId, text) {
        const trimmed = text.trim()
        if (!trimmed || trimmed.length > 4000) {
          return null
        }
        if (!get().chats.some((chat) => chat.chatId === chatId)) {
          return null
        }

        const message: ChatMessage = {
          id: crypto.randomUUID(),
          chatId,
          text: trimmed,
          direction: 'out',
          timestamp: Date.now(),
          status: 'pending',
        }

        set((state) => ({
          messages: [...state.messages, message],
          chats: moveChatToTop(state.chats, chatId),
        }))

        return message
      },

      confirmOutgoing(localId, idMessage) {
        set((state) => {
          const duplicate = state.messages.some(
            (message) => message.id === idMessage && message.id !== localId,
          )

          return {
            messages: state.messages.flatMap((message) => {
              if (message.id !== localId) {
                return [message]
              }
              if (duplicate) {
                return []
              }
              return [{ ...message, id: idMessage, status: 'sent' as const }]
            }),
          }
        })
      },

      failOutgoing(localId) {
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === localId ? { ...message, status: 'failed' as const } : message,
          ),
        }))
      },

      addIncoming(message) {
        const text = message.text.trim()
        if (!message.id || !text) {
          return false
        }

        const state = get()
        if (!state.chats.some((chat) => chat.chatId === message.chatId)) {
          return false
        }
        if (state.messages.some((item) => item.id === message.id)) {
          return false
        }

        const incoming: ChatMessage = {
          id: message.id,
          chatId: message.chatId,
          text,
          direction: 'in',
          timestamp: toMilliseconds(message.timestamp),
          status: 'sent',
        }

        set((current) => ({
          messages: [...current.messages, incoming],
          chats: moveChatToTop(current.chats, message.chatId),
        }))

        return true
      },
    }),
    {
      name: 'max-chat-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedSession => ({
        credentials: state.credentials,
        chats: state.chats,
        messages: state.messages,
        activeChatId: state.activeChatId,
        httpApiConfigured: state.httpApiConfigured,
      }),
    },
  ),
)

export function useSessionHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useSessionStore.persist.onFinishHydration(onStoreChange),
    () => useSessionStore.persist.hasHydrated(),
    () => false,
  )
}

function moveChatToTop(chats: Chat[], chatId: string): Chat[] {
  const index = chats.findIndex((chat) => chat.chatId === chatId)
  if (index <= 0) {
    return chats
  }

  const chat = chats[index]
  if (!chat) {
    return chats
  }

  return [chat, ...chats.slice(0, index), ...chats.slice(index + 1)]
}

function toMilliseconds(timestamp: number): number {
  return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp
}
