"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
import { useLanguage } from '@/contexts/LanguageContext'
export default function NotificationsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const { t } = useLanguage()
    return <ErrorBoundary error={error} reset={reset} title={t('error_pages.notifications_error')} description={t('error_pages.notifications_error_desc')} />
}
