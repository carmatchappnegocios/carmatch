'use client'

import { useEffect } from 'react'
import * as Sentry from "@sentry/nextjs"
import { useLanguage } from '@/contexts/LanguageContext'

interface ErrorBoundaryProps {
    error: Error & { digest?: string }
    reset: () => void
    title?: string
    description?: string
    variant?: 'sentry' | 'simple'
}

export default function ErrorBoundary({
    error,
    reset,
    title = '',
    description,
    variant = 'sentry'
}: ErrorBoundaryProps) {
    const { t } = useLanguage()

    useEffect(() => {
        if (variant === 'sentry') {
            Sentry.captureException(error)
        } else {
            console.error(error)
        }
    }, [error, variant])

    if (variant === 'simple') {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-bold text-primary mb-2">{title || t('error_boundary.something_wrong')}</h2>
                    <p className="text-text-secondary text-sm mb-4">
                        {description || error.message || t('error_boundary.unexpected_error')}
                    </p>
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-accent text-white rounded-lg text-sm"
                    >
                        {t('error_boundary.try_again')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">{title || t('error_boundary.something_wrong')}</h2>
                <p className="text-text-secondary mb-6 text-sm">{description || error.message || t('error_boundary.unexpected_error')}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white rounded-xl font-bold transition"
                    >
                        {t('error_boundary.retry')}
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 bg-surface hover:bg-surface-highlight text-text-primary rounded-xl font-bold transition border border-surface-highlight"
                    >
                        {t('error_boundary.go_home')}
                    </a>
                </div>
            </div>
        </div>
    )
}
