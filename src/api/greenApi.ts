import type {
  CheckAccountResult,
  Credentials,
  DeleteNotificationResult,
  InstanceSettings,
  ReceiveNotificationResult,
  SaveSettingsResponse,
  SendMessageResult,
  SettingsPatch,
  StateInstanceResponse,
} from '../types'

export const GREEN_API_URL = import.meta.env.VITE_GREEN_API_URL as string || 'https://api.green-api.com'

export const HTTP_API_SETTINGS = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingWebhook: 'yes',
} as const satisfies SettingsPatch

export class GreenApiError extends Error {
  readonly status: number
  readonly body: string

  constructor(status: number, body: string) {
    super(body || `Ошибка GREEN-API (${status})`)
    this.name = 'GreenApiError'
    this.status = status
    this.body = body
  }
}

export function errorText(error: unknown, fallback = 'Не удалось выполнить запрос.'): string {
  if (error instanceof TypeError) {
    return 'Не удалось связаться с GREEN-API.'
  }
  if (error instanceof Error && error.message) {
    const message = error.message.trim()
    if (message.startsWith('{') || message.startsWith('[')) {
      return fallback
    }
    return message
  }
  return fallback
}

export function needsHttpApiSetup(
  settings: Pick<InstanceSettings, 'webhookUrl' | 'incomingWebhook' | 'outgoingWebhook'>,
): boolean {
  return (
    settings.webhookUrl !== HTTP_API_SETTINGS.webhookUrl ||
    settings.incomingWebhook !== HTTP_API_SETTINGS.incomingWebhook ||
    settings.outgoingWebhook !== HTTP_API_SETTINGS.outgoingWebhook
  )
}

export function createGreenApi(credentials: Credentials) {
  const instanceUrl = (method: string, extra?: string) => {
    const idInstance = credentials.idInstance.trim()
    const apiTokenInstance = credentials.apiTokenInstance.trim()

    if (!/^\d+$/.test(idInstance)) {
      throw new GreenApiError(400, 'idInstance должен содержать только цифры')
    }
    if (!apiTokenInstance) {
      throw new GreenApiError(400, 'apiTokenInstance не задан')
    }

    const suffix = extra === undefined ? '' : `/${encodeURIComponent(extra)}`
    return `${GREEN_API_URL}/waInstance${idInstance}/${method}/${encodeURIComponent(apiTokenInstance)}${suffix}`
  }

  return {
    getStateInstance(signal?: AbortSignal) {
      return request<StateInstanceResponse>(instanceUrl('getStateInstance'), { signal })
    },

    getSettings(signal?: AbortSignal) {
      return request<InstanceSettings>(instanceUrl('getSettings'), { signal })
    },

    setSettings(settings: SettingsPatch, signal?: AbortSignal) {
      return request<SaveSettingsResponse>(instanceUrl('setSettings'), {
        method: 'POST',
        body: JSON.stringify(settings),
        signal,
      })
    },

    checkAccount(phoneNumber: string, signal?: AbortSignal) {
      if (!/^\d{11,12}$/.test(phoneNumber)) {
        throw new GreenApiError(400, 'Номер телефона должен содержать 11 или 12 цифр')
      }

      return request<CheckAccountResult>(instanceUrl('checkAccount'), {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
        signal,
      })
    },

    sendMessage(chatId: string, message: string, signal?: AbortSignal) {
      const text = message.trim()
      if (!chatId.trim()) {
        throw new GreenApiError(400, 'Идентификатор чата не задан')
      }
      if (!text || text.length > 4000) {
        throw new GreenApiError(400, 'Длина сообщения должна быть от 1 до 4000 символов')
      }

      return request<SendMessageResult>(instanceUrl('sendMessage'), {
        method: 'POST',
        body: JSON.stringify({ chatId, message: text }),
        signal,
      })
    },

    receiveNotification(receiveTimeout = 20, signal?: AbortSignal) {
      const timeout = Math.min(
        10,
        Math.max(5, Math.trunc(receiveTimeout)),
      )
      const url = `${instanceUrl('receiveNotification')}?receiveTimeout=${timeout}`
      return request<ReceiveNotificationResult | null>(url, { signal }, true)
    },

    deleteNotification(receiptId: number, signal?: AbortSignal) {
      if (!Number.isInteger(receiptId)) {
        throw new GreenApiError(400, 'Идентификатор уведомления должен быть целым числом')
      }

      return request<DeleteNotificationResult>(
        instanceUrl('deleteNotification', String(receiptId)),
        { method: 'DELETE', signal },
      )
    },
  }
}

async function request<T>(url: string, init?: RequestInit, allowEmpty = false): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })

  const body = await response.text()
  if (!response.ok) {
    throw new GreenApiError(response.status, body.trim())
  }
  if (!body.trim()) {
    if (allowEmpty) {
      return null as T
    }
    throw new GreenApiError(response.status, 'Пустой ответ сервера')
  }

  try {
    const parsed = JSON.parse(body) as T
    if (parsed === null && !allowEmpty) {
      throw new GreenApiError(response.status, 'Пустой ответ сервера')
    }
    return parsed
  } catch (error) {
    if (error instanceof GreenApiError) {
      throw error
    }
    throw new GreenApiError(response.status, 'Некорректный ответ сервера')
  }
}
