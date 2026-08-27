
'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Smartphone, Sparkles, Lightbulb, Rocket, Compass, Upload, Plus, CheckCircle, Monitor } from 'lucide-react'

interface PWAInstallModalProps {
    isOpen: boolean
    onClose: () => void
    platform?: 'ios' | 'android' | 'auto'
}

export default function PWAInstallModal({ isOpen, onClose, platform = 'auto' }: PWAInstallModalProps) {
    const { t } = useLanguage()
    const [detectedPlatform, setDetectedPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

    useEffect(() => {
        if (platform === 'auto') {
            detectPlatform()
        } else {
            setDetectedPlatform(platform)
        }
    }, [platform])

    const detectPlatform = () => {
        const userAgent = window.navigator.userAgent.toLowerCase()
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setDetectedPlatform('ios')
        } else if (/android/.test(userAgent)) {
            setDetectedPlatform('android')
        } else {
            setDetectedPlatform('desktop')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-surface-highlight shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-surface border-b border-surface-highlight p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <Smartphone size={28} className="text-primary-500" />
                        {t('pwa.install_title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-surface-highlight hover:bg-primary-100 transition flex items-center justify-center"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* iOS Instructions */}
                    {detectedPlatform === 'ios' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                                <p className="text-sm font-bold text-primary-400 mb-2 flex items-center gap-2">
                                    <Smartphone size={16} />
                                    {t('pwa.ios_detected')}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {t('pwa.ios_automatic_disabled')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <StepCard
                                    number={1}
                                    title={t('pwa.ios_step1_title')}
                                    description={t('pwa.ios_step1_desc')}
                                    icon={<Compass size={20} className="text-primary-400" />}
                                />
                                <StepCard
                                    number={2}
                                    title={t('pwa.ios_step2_title')}
                                    description={t('pwa.ios_step2_desc')}
                                    icon={<Upload size={20} className="text-primary-400" />}
                                />
                                <StepCard
                                    number={3}
                                    title={t('pwa.ios_step3_title')}
                                    description={t('pwa.ios_step3_desc')}
                                    icon={<Plus size={20} className="text-primary-400" />}
                                />
                                <StepCard
                                    number={4}
                                    title={t('pwa.ios_step4_title')}
                                    description={t('pwa.ios_step4_desc')}
                                    icon={<CheckCircle size={20} className="text-green-400" />}
                                />
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-sm font-bold text-green-400 mb-1 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    {t('pwa.all_done')}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {t('pwa.ios_success')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Android Instructions */}
                    {detectedPlatform === 'android' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-sm font-bold text-primary-400 mb-2 flex items-center gap-2">
                                    <Smartphone size={16} />
                                    {t('pwa.android_direct_install')}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {t('pwa.android_manual_hint')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <StepCard
                                    number={1}
                                    title={t('pwa.android_step1_title')}
                                    description={t('pwa.android_step1_desc')}
                                    icon={<Smartphone size={20} className="text-primary-400" />}
                                />
                                <StepCard
                                    number={2}
                                    title={t('pwa.android_step2_title')}
                                    description={t('pwa.android_step2_desc')}
                                    icon={<Smartphone size={20} className="text-primary-400" />}
                                />
                                <StepCard
                                    number={3}
                                    title={t('pwa.android_step3_title')}
                                    description={t('pwa.android_step3_desc')}
                                    icon={<CheckCircle size={20} className="text-green-400" />}
                                />
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-2">
                                    <Lightbulb size={14} />
                                    {t('pwa.android_tip_title')}
                                </p>
                                <p className="text-[11px] text-text-secondary">
                                    {t('pwa.android_tip_desc')}
                                </p>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                                <p className="text-sm font-bold text-green-400 flex items-center gap-2 justify-center">
                                    <Rocket size={18} />
                                    {t('pwa.android_success')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Desktop Message */}
                    {detectedPlatform === 'desktop' && (
                        <div className="space-y-4">
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
                                <Monitor size={48} className="mx-auto mb-3 text-primary-400" />
                                <p className="text-sm font-bold text-primary-400 mb-2">
                                    {t('pwa.desktop_detected')}
                                </p>
                                <p className="text-xs text-text-secondary mb-4">
                                    {t('pwa.desktop_qr_hint')}
                                </p>
                                <div className="bg-white p-4 rounded-xl inline-block">
                                    <p className="text-xs text-gray-600 mb-2">QR Code placeholder</p>
                                    <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                                        <p className="text-sm text-gray-500">{t('pwa.scan_with_phone')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-text-secondary mb-3">{t('pwa.or_open_phone')}</p>
                                <div className="bg-surface-highlight rounded-lg p-3 font-mono text-sm text-primary-400">
                                    carmatch.com
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Benefits Section */}
                    <div className="border-t border-surface-highlight pt-6">
                        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                            <Sparkles size={18} className="text-primary-400" />
                            {t('pwa.benefits_title')}
                        </h3>
                        <ul className="space-y-2">
                            <BenefitItem text={t('pwa.benefit_home_screen')} />
                            <BenefitItem text={t('pwa.benefit_notifications')} />
                            <BenefitItem text={t('pwa.benefit_offline')} />
                            <BenefitItem text={t('pwa.benefit_fast')} />
                            <BenefitItem text={t('pwa.benefit_no_store')} />
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-surface border-t border-surface-highlight p-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition"
                    >
                        {t('common.understood')}
                    </button>
                </div>
            </div>
        </div>
    )
}

function StepCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
    return (
        <div className="flex gap-4 bg-surface-highlight/50 rounded-xl p-4 border border-surface-highlight">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                    {number}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <h4 className="font-bold text-text-primary">{title}</h4>
                </div>
                <p className="text-sm text-text-secondary">{description}</p>
            </div>
        </div>
    )
}

function BenefitItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-2 text-sm text-text-secondary">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{text}</span>
        </li>
    )
}
