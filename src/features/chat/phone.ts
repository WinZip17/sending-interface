export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')

  if (digits.startsWith('375')) {
    return digits.length === 12 ? digits : null
  }

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }
  if (digits.length === 10) {
    digits = `7${digits}`
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return digits
  }

  return null
}

export function formatPhone(phone: string): string {
  if (phone.startsWith('375') && phone.length === 12) {
    return `+375 ${phone.slice(3, 5)} ${phone.slice(5, 8)}-${phone.slice(8, 10)}-${phone.slice(10)}`
  }
  if (phone.startsWith('7') && phone.length === 11) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
  }
  return `+${phone}`
}
