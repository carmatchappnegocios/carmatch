// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

'use client'

import { useState } from 'react' // ✅ Importar useState
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/contexts/LocationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import {
    Settings,
    ChevronLeft,
    Globe,
    Headset,
    Bell,
    BellOff,
    LogOut,
    Check,
    FileText,
    ChevronDown,
    ChevronUp,
    MapPin,
    Navigation
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion' // ✅ AnimatePresence

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { locale, setLocale, t } = useLanguage()
    const { isSubscribed, subscribe, unsubscribe, permission } = usePushNotifications()
    const { preciseLocationEnabled, setPreciseLocationEnabled, gpsPermission } = useLocation()
    const [showLanguages, setShowLanguages] = useState(false)

    if (status === 'unauthenticated') {
        router.push('/auth')
        return null
    }

    const handleSignOut = async () => {
        try {
            // 🚀 CIERRE DE SESIÓN REAL — Sesión JWT destruida
            await signOut({ redirect: true, callbackUrl: '/market' })
        } catch (error) {
            console.error("Error during sign out:", error)
            window.location.href = '/market'
        }
    }

    const languages = [
        { code: 'es', flag: '🇪🇸', name: 'Español' },
        { code: 'en', flag: '🇺🇸', name: 'English' },
        { code: 'pt', flag: '🇧🇷', name: 'Português' },
        { code: 'fr', flag: '🇫🇷', name: 'Français' },
        { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
        { code: 'it', flag: '🇮🇹', name: 'Italiano' },
        { code: 'zh', flag: '🇨🇳', name: '中文' },
        { code: 'ja', flag: '🇯🇵', name: '日本語' },
        { code: 'ru', flag: '🇷🇺', name: 'Русский' },
        { code: 'ko', flag: '🇰🇷', name: '한국어' },
        { code: 'ar', flag: '🇸🇦', name: 'العربية' },
        { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
        { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
        { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
        { code: 'pl', flag: '🇵🇱', name: 'Polski' },
        { code: 'sv', flag: '🇸🇪', name: 'Svenska' },
        { code: 'id', flag: '🇮🇩', name: 'Bahasa' },
        { code: 'th', flag: '🇹🇭', name: 'ไทย' },
        { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
        { code: 'ur', flag: '🇵🇰', name: 'اردو' },
        { code: 'he', flag: '🇮🇱', name: 'עברית' },
    ]

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-surface-highlight px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-surface-highlight rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-2">
                        <Settings className="text-primary-500" size={20} />
                        {t('settings.title')}
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-8 mt-4">
                {/* Notificaciones y Soporte */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Settings size={18} className="text-primary-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-secondary opacity-60">{t('settings.preferences_help')}</h2>
                    </div>

                    <div className="space-y-2">
                        {/* 🌐 SELECTOR DE IDIOMA */}
                        <div className="overflow-hidden rounded-2xl border border-surface-highlight bg-surface transition-all">
                            <button
                                onClick={() => setShowLanguages(!showLanguages)}
                                className="w-full flex items-center justify-between p-5 hover:bg-surface-highlight/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                                        <Globe size={22} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold flex items-center gap-2">
                                            {t('common.language') || "Idioma"}
                                            <span className="text-sm font-normal text-text-secondary opacity-60">
                                                ({languages.find(l => l.code === locale)?.name})
                                            </span>
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {t('settings.language_subtitle')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-text-secondary">
                                    {showLanguages ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {showLanguages && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-surface-highlight bg-surface-highlight/10"
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setLocale(lang.code as any)
                                                        setShowLanguages(false)
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${locale === lang.code
                                                        ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                                                        : 'hover:bg-surface-highlight text-text-secondary hover:text-text-primary'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{lang.flag}</span>
                                                    <span className="text-sm font-medium">{lang.name}</span>
                                                    {locale === lang.code && <Check size={16} className="ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => isSubscribed ? unsubscribe() : subscribe()}
                            disabled={permission === 'denied'}
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${isSubscribed
                                ? 'bg-green-900/10 border-green-500/30 text-green-400'
                                : 'bg-surface border-surface-highlight text-text-primary hover:border-text-secondary/30'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${isSubscribed ? 'bg-green-500/20' : 'bg-primary-500/10'}`}>
                                    {isSubscribed ? <Bell size={22} /> : <BellOff size={22} className="text-primary-500" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">{t('settings.push_notifications')}</p>
                                    <p className="text-xs text-text-secondary">
                                        {isSubscribed ? t('settings.push_active') : t('settings.push_inactive')}
                                    </p>
                                </div>
                            </div>
                            {!isSubscribed && permission !== 'denied' && (
                                <span className="text-xs font-black uppercase tracking-tighter bg-primary-600 text-white px-3 py-1 rounded-full">{t('settings.activate')}</span>
                            )}
                            {isSubscribed && (
                                <span className="text-xs font-black uppercase tracking-tighter bg-red-600 text-white px-3 py-1 rounded-full">{t('settings.deactivate')}</span>
                            )}
                        </button>

                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-surface-highlight bg-surface text-text-primary hover:border-text-secondary/30 transition-all"
                        >
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                <Headset size={22} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">{t('settings.support_title')}</p>
                                <p className="text-xs text-text-secondary">
                                    {t('settings.support_desc')}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/terms')}
                            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-surface-highlight bg-surface text-text-primary hover:border-text-secondary/30 transition-all"
                        >
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                <FileText size={22} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">{t('settings.terms_title')}</p>
                                <p className="text-xs text-text-secondary">
                                    {t('settings.terms_desc')}
                                </p>
                            </div>
                        </button>
                        {/* 📍 TOGGLE UBICACIÓN PRECISA (GPS en tiempo real) */}
                        <div
                            className={`w-full rounded-2xl border transition-all overflow-hidden ${
                                preciseLocationEnabled
                                    ? 'bg-green-900/10 border-green-500/30'
                                    : gpsPermission === 'denied'
                                    ? 'bg-red-900/10 border-red-500/20'
                                    : 'bg-surface border-surface-highlight'
                            }`}
                        >
                            {/* Row principal */}
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${
                                        preciseLocationEnabled
                                            ? 'bg-green-500/20 text-green-400'
                                            : gpsPermission === 'denied'
                                            ? 'bg-red-500/10 text-red-400'
                                            : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                        <Navigation size={22} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-bold flex items-center gap-2 ${
                                            preciseLocationEnabled ? 'text-green-400'
                                            : gpsPermission === 'denied' ? 'text-red-400'
                                            : 'text-text-primary'
                                        }`}>
                                            {t('settings.gps_realtime')}
                                            {/* Badge de estado */}
                                            {preciseLocationEnabled && gpsPermission === 'granted' && (
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                                                     {t('settings.gps_active_badge')}
                                                 </span>
                                            )}
                                            {gpsPermission === 'denied' && (
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                                                     {t('settings.gps_blocked_badge')}
                                                 </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {preciseLocationEnabled && gpsPermission === 'granted'
                                                ? t('settings.gps_active_desc')
                                                : gpsPermission === 'denied'
                                                ? t('settings.gps_blocked_desc')
                                                : gpsPermission === 'granted'
                                                ? t('settings.gps_activate_desc')
                                                : t('settings.gps_off_desc')
                                            }
                                        </p>
                                    </div>
                                </div>
                                {/* Toggle Switch */}
                                <button
                                    id="precise-location-toggle"
                                    aria-label={t('settings.gps_realtime')}
                                    onClick={() => setPreciseLocationEnabled(!preciseLocationEnabled)}
                                    disabled={gpsPermission === 'denied'}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                                        gpsPermission === 'denied'
                                            ? 'bg-white/5 cursor-not-allowed opacity-40'
                                            : preciseLocationEnabled
                                            ? 'bg-green-500'
                                            : 'bg-white/10'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                                            preciseLocationEnabled && gpsPermission !== 'denied' ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Banner informativo si GPS está bloqueado */}
                            {gpsPermission === 'denied' && (
                                <div className="px-5 pb-4">
                                    <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 flex items-start gap-3">
                                        <MapPin size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] text-red-300/80 leading-relaxed">
                                             {t('settings.gps_blocked_help')}
                                         </p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </section>

                {/* Account Section */}
                <section className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <LogOut size={18} className="text-red-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-secondary opacity-60">{t('settings.account_section')}</h2>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <div className="p-2 rounded-xl bg-red-500/10">
                            <LogOut size={22} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">{t('common.logout')}</p>
                            <p className="text-xs opacity-60">{t('settings.logout_subtitle')}</p>
                        </div>
                    </button>
                </section>

                {/* Footer Info */}
                <div className="text-center pt-8 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-40">CarMatch v0.1.2</p>
                    <p className="text-[10px] text-text-secondary opacity-40">{t('settings.copyright')}</p>
                </div>
            </main>
        </div>
    )
}
