import { useEffect } from 'react'
import { createGreenApi } from '../../api/greenApi.ts'
import type { Credentials, ReceiveNotificationResult } from '../../types'
import { useSessionStore } from '../../store/sessionStore.ts'

const RECEIVE_TIMEOUT_SECONDS = 20
const RECEIVE_TIMEOUT_MS = RECEIVE_TIMEOUT_SECONDS * 1000
const MIN_GAP_MS = 1000
const ERROR_PAUSE_MS = 2000

type GreenApi = ReturnType<typeof createGreenApi>

export function useNotificationPoll(credentials: Credentials | null) {
  const idInstance = credentials?.idInstance
  const apiTokenInstance = credentials?.apiTokenInstance

  useEffect(() => {
    if (!idInstance || !apiTokenInstance) {
      return
    }

    const controller = new AbortController()
    const api = createGreenApi({ idInstance, apiTokenInstance })
    void pollNotifications(api, controller.signal)

    return () => {
      controller.abort()
    }
  }, [idInstance, apiTokenInstance])
}

async function pollNotifications(api: GreenApi, signal: AbortSignal) {
  while (!signal.aborted) {
    const started = Date.now()
    try {
      const notification = await api.receiveNotification(RECEIVE_TIMEOUT_SECONDS, signal)
      if (signal.aborted) {
        return
      }
      if (!notification) {
        await pause(remainingTimeout(started), signal)
        continue
      }

      keepIncomingText(notification)
      await api.deleteNotification(notification.receiptId, signal)
      await pause(Math.max(0, MIN_GAP_MS - (Date.now() - started)), signal)
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        return
      }
      await pause(ERROR_PAUSE_MS, signal)
    }
  }
}

function remainingTimeout(started: number) {
  return Math.max(0, RECEIVE_TIMEOUT_MS - (Date.now() - started))
}

function keepIncomingText(notification: ReceiveNotificationResult) {
  const body = notification.body
  const text = body.messageData?.textMessageData?.textMessage
  const chatId = body.senderData?.chatId
  if (
    body.typeWebhook !== 'incomingMessageReceived' ||
    body.messageData?.typeMessage !== 'textMessage' ||
    !chatId ||
    !body.idMessage ||
    !text
  ) {
    return
  }

  useSessionStore.getState().addIncoming({
    id: body.idMessage,
    chatId,
    text,
    timestamp: body.timestamp ?? Date.now(),
  })
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }

    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}
