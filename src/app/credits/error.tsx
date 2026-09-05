"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
import { useLanguage } from '@/contexts/LanguageContext'
export default function CreditsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const { t } = useLanguage()
    return <ErrorBoundary error={error} reset={reset} title={t('error_pages.credits_error')} description={t('error_pages.credits_error_desc')} />
}
