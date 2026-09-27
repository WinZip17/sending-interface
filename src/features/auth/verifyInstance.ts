import { HTTP_API_SETTINGS, createGreenApi, needsHttpApiSetup } from '../../api/greenApi.ts'
import type { Credentials, VerifyResult } from '../../types'

const instanceStateMessages: Record<string, string> = {
  notAuthorized: 'Инстанс не авторизован. Авторизуйте его в личном кабинете GREEN-API.',
  blocked: 'Инстанс заблокирован.',
  sleepMode: 'Инстанс в спящем режиме. Включите телефон и подождите до 5 минут.',
  starting: 'Инстанс запускается. Подождите до 5 минут и войдите снова.',
  yellowCard: 'Отправка сообщений временно ограничена.',
}

const inflight = new Map<string, Promise<VerifyResult>>()

export function restartNotice(): string {
  return 'Настройки получения сообщений сохранены. Инстанс перезапускается, это может занять до 5 минут.'
}

export function verifyInstance(
  credentials: Credentials,
  configure: boolean,
): Promise<VerifyResult> {
  const key = `${credentials.idInstance}:${credentials.apiTokenInstance}:${configure}`
  const current = inflight.get(key)
  if (current) {
    return current
  }

  const promise = runVerify(credentials, configure).finally(() => {
    if (inflight.get(key) === promise) {
      inflight.delete(key)
    }
  })
  inflight.set(key, promise)
  return promise
}

async function runVerify(credentials: Credentials, configure: boolean): Promise<VerifyResult> {
  const api = createGreenApi(credentials)
  const state = await api.getStateInstance()

  if (state.stateInstance !== 'authorized') {
    const message =
      instanceStateMessages[state.stateInstance] ??
      `Инстанс недоступен (${state.stateInstance}).`
    throw new Error(message)
  }

  if (!configure) {
    return { restarted: false }
  }

  const settings = await api.getSettings()
  if (!needsHttpApiSetup(settings)) {
    return { restarted: false }
  }

  const saved = await api.setSettings(HTTP_API_SETTINGS)
  if (!saved.saveSettings) {
    throw new Error('Не удалось сохранить настройки инстанса.')
  }

  return { restarted: true }
}
