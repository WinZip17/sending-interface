const colors = ['#5b8def', '#7c6ae8', '#3cb4a0', '#e07a3d', '#d45d7a', '#4c9a6a']

export function avatarColor(chatId: string): string {
  let hash = 0
  for (const char of chatId) {
    hash = (hash + char.charCodeAt(0)) % colors.length
  }
  return colors[hash] ?? colors[0]
}

export function avatarLabel(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-2) || '•'
}
