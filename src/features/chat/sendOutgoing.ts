import { createGreenApi, errorText } from '../../api/greenApi.ts'
import type { Credentials } from '../../types'
import { useSessionStore } from '../../store/sessionStore.ts'

export async function sendOutgoing(
  credentials: Credentials,
  chatId: string,
  text: string,
): Promise<void> {
  const message = useSessionStore.getState().addOutgoing(chatId, text)
  if (!message) {
    throw new Error('Длина сообщения должна быть от 1 до 4000 символов.')
  }

  try {
    const result = await createGreenApi(credentials).sendMessage(chatId, message.text)
    useSessionStore.getState().confirmOutgoing(message.id, result.idMessage)
  } catch (error) {
    useSessionStore.getState().failOutgoing(message.id)
    throw new Error(errorText(error, 'Не удалось отправить сообщение.'))
  }
}
