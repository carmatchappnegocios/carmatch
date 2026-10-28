"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
import { useLanguage } from '@/contexts/LanguageContext'
export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const { t } = useLanguage()
    return <ErrorBoundary error={error} reset={reset} title={t('error_pages.auth_error')} description={t('error_pages.auth_error_desc')} />
}
