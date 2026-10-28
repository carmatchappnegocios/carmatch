'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function ClusterNotFound() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold">{t('cluster_page.catalog_not_found')}</h1>
        </div>
    )
}
