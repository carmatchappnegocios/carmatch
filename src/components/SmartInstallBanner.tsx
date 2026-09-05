'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type BrowserType = 'chrome-android' | 'samsung-internet' | 'safari-ios' | 'chrome-desktop' | 'other'

function detectBrowser(): BrowserType {
    if (typeof window === 'undefined') return 'other'
    const ua = navigator.userAgent
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://')

    if (isStandalone) return 'other'

    if (/iPhone|iPad|iPod/.test(ua)) return 'safari-ios'
    if (/SamsungBrowser/i.test(ua)) return 'samsung-internet'
    if (/Chrome/.test(ua) && /Mobile|Android/.test(ua)) return 'chrome-android'
    if (/Chrome/.test(ua)) return 'chrome-desktop'
    return 'other'
}

export default function SmartInstallBanner() {
    const { t } = useLanguage();
    const [browser, setBrowser] = useState<BrowserType>('other')
    const [canInstall, setCanInstall] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const b = detectBrowser()
        setBrowser(b)

        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (navigator as any).standalone ||
            document.referrer.includes('android-app://')
        setIsStandalone(standalone)

        if (standalone || b === 'other') return

        const dismissedKey = `pwa-install-dismissed-${b}`
        if (localStorage.getItem(dismissedKey)) {
            setDismissed(true)
            return
        }

        if (b === 'chrome-android' || b === 'chrome-desktop') {
            const handler = (e: Event) => {
                e.preventDefault()
                setDeferredPrompt(e as BeforeInstallPromptEvent)
                setCanInstall(true)
            }
            window.addEventListener('beforeinstallprompt', handler)
            return () => window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = useCallback(async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setCanInstall(false)
                setDeferredPrompt(null)
            }
        }
    }, [deferredPrompt])

    const handleDismiss = useCallback(() => {
        setDismissed(true)
        const dismissedKey = `pwa-install-dismissed-${browser}`
        localStorage.setItem(dismissedKey, 'true')
    }, [browser])

    if (isStandalone || dismissed || browser === 'other') return null

    if (browser === 'samsung-internet') {
        return (
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:hidden">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0ea5e9] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.samsung_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.samsung_desc')}</p>
                    </div>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    if (browser === 'safari-ios') {
        return (
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:hidden">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0ea5e9] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.ios_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.ios_desc')}</p>
                    </div>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    if (browser === 'chrome-android' && canInstall) {
        return (
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:hidden">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.android_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.android_desc')}</p>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="bg-[#f97316] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#ea580c] transition-colors"
                    >
                        {t('install_banner.install_btn')}
                    </button>
                </div>
            </div>
        )
    }

    if (browser === 'chrome-desktop' && canInstall) {
        return (
            <div className="hidden md:block fixed bottom-4 right-4 z-50">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3 max-w-xs">
                    <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.desktop_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.desktop_desc')}</p>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="bg-[#f97316] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#ea580c] transition-colors"
                    >
                        {t('install_banner.install_btn')}
                    </button>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    return null
}
