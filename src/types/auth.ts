import type { Credentials } from './api.ts'

export type VerifyResult = {
  restarted: boolean
}

export type AuthScreenProps = {
  pending: boolean
  error: string | null
  onSubmit: (credentials: Credentials) => void
}
