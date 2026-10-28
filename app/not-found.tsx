"use client"

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NotFound() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-4xl font-bold text-text-primary mb-4">
                    {t('not_found.title') || '404'}
                </h1>
                <p className="text-text-secondary mb-8">
                    {t('not_found.message') || 'Esta página no existe o fue movida.'}
                </p>
                <Link
                    href="/market"
                    className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition"
                >
                    {t('not_found.go_home') || 'Ir al Market'}
                </Link>
            </div>
        </div>
    )
}