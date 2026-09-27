export type Credentials = {
  idInstance: string
  apiTokenInstance: string
}

export type YesNo = 'yes' | 'no'

export type InstanceSettings = {
  wid: string
  typeInstance: string
  webhookUrl: string
  webhookUrlToken: string
  delaySendMessagesMilliseconds: number
  markIncomingMessagesReaded: YesNo
  markIncomingMessagesReadedOnReply: YesNo
  outgoingWebhook: YesNo
  outgoingMessageWebhook: YesNo
  outgoingAPIMessageWebhook: YesNo
  stateWebhook: YesNo
  incomingWebhook: YesNo
  editedMessageWebhook: YesNo
  deletedMessageWebhook: YesNo
  pollMessageWebhook: YesNo
  downloadUrlJpeg: YesNo
}

export type SettingsPatch = Partial<
  Pick<
    InstanceSettings,
    | 'webhookUrl'
    | 'webhookUrlToken'
    | 'delaySendMessagesMilliseconds'
    | 'markIncomingMessagesReaded'
    | 'markIncomingMessagesReadedOnReply'
    | 'outgoingWebhook'
    | 'outgoingMessageWebhook'
    | 'outgoingAPIMessageWebhook'
    | 'stateWebhook'
    | 'incomingWebhook'
    | 'editedMessageWebhook'
    | 'deletedMessageWebhook'
    | 'pollMessageWebhook'
    | 'downloadUrlJpeg'
  >
>

export type StateInstanceResponse = {
  stateInstance: string
}

export type SaveSettingsResponse = {
  saveSettings: boolean
}

export type CheckAccountResult = {
  exist: boolean
  chatId: string
  fromCache: boolean
}

export type SendMessageResult = {
  idMessage: string
}

export type NotificationSender = {
  chatId?: string
  chatName?: string
  chatType?: string
  sender?: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number
}

export type NotificationBody = {
  typeWebhook: string
  timestamp?: number
  idMessage?: string
  senderData?: NotificationSender
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
  }
}

export type ReceiveNotificationResult = {
  receiptId: number
  body: NotificationBody
}

export type DeleteNotificationResult = {
  result: boolean
  reason: string
}
