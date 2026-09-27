import { createGreenApi, errorText } from '../../api/greenApi.ts'
import { useSessionStore } from '../../store/sessionStore.ts'
import type { Chat, Credentials } from '../../types'
import { formatPhone, normalizePhone } from './phone.ts'

const invalidPhone = 'Введите номер РФ (код 7) или РБ (код 375).'
const missingAccount = 'На этом номере нет аккаунта MAX.'

export async function createChat(credentials: Credentials, rawPhone: string): Promise<Chat> {
  const phone = normalizePhone(rawPhone)
  if (!phone) {
    throw new Error(invalidPhone)
  }

  const existing = useSessionStore.getState().chats.find((chat) => chat.phone === phone)
  if (existing) {
    useSessionStore.getState().addChat(existing)
    return existing
  }

  try {
    const result = await createGreenApi(credentials).checkAccount(phone)
    if (!result.exist || !result.chatId) {
      throw new Error(missingAccount)
    }

    const chat: Chat = {
      chatId: result.chatId,
      phone,
      title: formatPhone(phone),
    }
    useSessionStore.getState().addChat(chat)
    return chat
  } catch (error) {
    if (error instanceof Error && (error.message === invalidPhone || error.message === missingAccount)) {
      throw error
    }
    throw new Error(errorText(error, 'Не удалось проверить номер.'))
  }
}
