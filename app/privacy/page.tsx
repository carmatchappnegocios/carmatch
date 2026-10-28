
'use client'

import Link from 'next/link'
import { Shield, Mail, MapPin, FileText, Clock, Lock, Eye, Database, Share2, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="bg-background pb-32">
            <div className="container mx-auto px-4 pt-8 pb-8 max-w-4xl text-text-primary">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 bg-primary-500/10 rounded-full border border-primary-500/20 mb-4">
                        <Shield className="text-primary-500" size={48} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">{t('privacy.title')}</h1>
                    <p className="text-text-secondary text-sm">
                        {t('privacy.last_updated')}: 6 de febrero de 2026
                    </p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* 1. Introducción */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <FileText className="text-primary-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-primary-500 m-0">{t('privacy.intro_title')}</h2>
                        </div>
                        <div className="space-y-2 text-text-secondary">
                            <p>{t('privacy.intro_text')}</p>
                        </div>
                    </section>

                    {/* 2. Información que Recopilamos */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Database className="text-blue-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-blue-500 m-0">{t('privacy.collect_title')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-2">{t('privacy.collect_1_title')}</h3>
                                <p className="text-text-secondary">{t('privacy.collect_1_text')}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-2">{t('privacy.collect_2_title')}</h3>
                                <p className="text-text-secondary">{t('privacy.collect_2_text')}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-2">{t('privacy.collect_3_title')}</h3>
                                <p className="text-text-secondary">{t('privacy.collect_3_text')}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-2">{t('privacy.collect_4_title')}</h3>
                                <p className="text-text-secondary">{t('privacy.collect_4_text')}</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Uso de la Información */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Eye className="text-green-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-green-500 m-0">{t('privacy.use_title')}</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-text-secondary">{t('privacy.use_text')}</p>
                            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
                                <li>{t('privacy.use_1')}</li>
                                <li>{t('privacy.use_2')}</li>
                                <li>{t('privacy.use_3')}</li>
                                <li>{t('privacy.use_4')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. Compartir Información */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Share2 className="text-amber-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-amber-500 m-0">{t('privacy.share_title')}</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-text-secondary">
                                <strong className="text-text-primary">{t('privacy.share_bold')}</strong>
                            </p>
                            <p className="text-text-secondary">{t('privacy.share_text')}</p>
                            <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                                <li>{t('privacy.share_1')}</li>
                                <li>{t('privacy.share_2')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* 5. Seguridad de Datos */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <AlertCircle className="text-red-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-red-500 m-0">{t('privacy.security_title')}</h2>
                        </div>

                        <p className="text-text-secondary mb-4">
                            {t('privacy.security_text')}
                        </p>
                    </section>

                    {/* 6. Sus Derechos */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Lock className="text-purple-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-purple-500 m-0">{t('privacy.rights_title')}</h2>
                        </div>

                        <p className="text-text-secondary mb-4">
                            {t('privacy.rights_text')}
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t border-surface-highlight">
                        <p className="text-xs text-text-secondary opacity-50">
                            CarMatch Social - {t('privacy.title')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
