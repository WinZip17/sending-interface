export function formatMessageTime(timestamp: number): string {
  const ms = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp
  const date = new Date(ms)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
  }

  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(date)
}
