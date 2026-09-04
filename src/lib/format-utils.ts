export function getRelativeTime(date: Date, t: (key: string, params?: Record<string, string | number>) => string): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t('timeAgo.justNow')
    if (diffMins < 60) return t('timeAgo.minutesAgo', { n: diffMins })
    if (diffHours < 24) return t('timeAgo.hoursAgo', { n: diffHours })
    if (diffDays < 7) return t('timeAgo.daysAgo', { n: diffDays })
    if (diffDays < 30) return t('timeAgo.weeksAgo', { n: Math.floor(diffDays / 7) })
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
