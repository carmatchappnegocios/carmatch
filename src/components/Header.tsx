
"use client"

import { Logo } from "@/components/Logo"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useRef, useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signOut, useSession } from "next-auth/react"
import { useLanguage } from "@/contexts/LanguageContext"
import PWAInstallModal from "@/components/PWAInstallModal"
import NotificationsDropdown from "@/components/NotificationsDropdown"
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { getWeightedHomePath } from "@/lib/navigation"
import { ThumbsUp, Headset, Flame, CarFront, UserRound, Map, Bell, BellOff, Settings, ShieldCheck, Coins, Heart, MessageSquare, Briefcase, Smartphone, MessageCircleQuestion } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { BUSINESS_CATEGORIES } from "@/lib/businessCategories"
import { useRestoreSessionModal } from "@/hooks/useRestoreSessionModal"

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status, update } = useSession()
    const { t, locale, setLocale } = useLanguage()
    const isAdmin = (session?.user as any)?.isAdmin
    const [showMenu, setShowMenu] = useState<boolean | 'lang' | 'notifications' | 'user' | 'lang_inner'>(false)

    const [ctaIndex, setCtaIndex] = useState(0)
    const ctas = useMemo(() => {
        if (!t || !locale) return []

        // 🗺️ MAPSTORE CONTEXT: Show Category-Specific Business Onboarding CTAs
        if (pathname?.startsWith('/map') || pathname?.startsWith('/map-store')) {
            // 1. Identificar servicios públicos para excluir
            const publicIds = ['caseta', 'hospital', 'policia', 'aeropuerto', 'estacion_tren'];

            // 2. Filtrar y mapear TODAS las categorías de negocio
            const businessCats = BUSINESS_CATEGORIES
                .filter(cat => !publicIds.includes(cat.id))
                .map(cat => cat.label.toUpperCase());

            // 3. Generate specific messages (~33 messages)
            const specific = businessCats.map(cat => t('header.business_cta').replace('{category}', cat));

            // 4. Add generic marketing hooks to exceed 50
            const marketingHooks = [
                t('header.marketing_hooks.empty_business'),
                t('header.marketing_hooks.more_sales'),
                t('header.marketing_hooks.money_today'),
                t('header.marketing_hooks.competition'),
                t('header.marketing_hooks.no_work'),
                t('header.marketing_hooks.real_customers'),
                t('header.marketing_hooks.sell_more'),
                t('header.marketing_hooks.more_money'),
                t('header.marketing_hooks.business_24_7'),
                t('header.marketing_hooks.more_calls'),
                t('header.marketing_hooks.find_customers'),
                t('header.marketing_hooks.dominate_zone'),
                t('header.marketing_hooks.dont_lose'),
                t('header.marketing_hooks.join_map'),
                t('header.marketing_hooks.workshop_empty'),
                t('header.marketing_hooks.multiply_sales')
            ];

            return [
                ...marketingHooks,
                ...specific
            ].sort(() => 0.5 - Math.random());
        }

        const raw = t('common.dynamic_ctas.vehicles', { returnObjects: true })
        return Array.isArray(raw) ? raw : []
    }, [t, locale, pathname])

    // 🎯 CTA personalizado cada 3er mensaje (2 ads + 1 CTA)
    const personalizedCta = useMemo(() => {
        if (!t) return null
        const isMapContext = pathname?.startsWith('/map') || pathname?.startsWith('/map-store')

        if (isMapContext) {
            const key = session
                ? 'common.dynamic_ctas.business_ctas_auth'
                : 'common.dynamic_ctas.business_ctas_guest'
            const ctas = t(key, { returnObjects: true })
            return Array.isArray(ctas) && ctas.length > 0
                ? ctas[Math.floor(Math.random() * ctas.length)]
                : null
        } else {
            const key = session
                ? 'common.dynamic_ctas.vehicle_ctas_auth'
                : 'common.dynamic_ctas.vehicle_ctas_guest'
            const ctas = t(key, { returnObjects: true })
            return Array.isArray(ctas) && ctas.length > 0
                ? ctas[Math.floor(Math.random() * ctas.length)]
                : null
        }
    }, [pathname, session, t])

    // Determinar qué mensaje mostrar: CTA cada 3er slot, ad genérico en los demás
    const isCtaSlot = ctaIndex % 3 === 2
    const displayCta = isCtaSlot && personalizedCta ? personalizedCta : (ctas[ctaIndex] || '')

    // Click handler: CTA slots navegan a registro/publicación según contexto
    const handleCtaClick = () => {
        const isMapContext = pathname?.startsWith('/map') || pathname?.startsWith('/map-store')
        if (isCtaSlot) {
            // CTA personalizado: invitar a registrar
            if (session) {
                router.push(isMapContext ? '/my-businesses?action=new' : '/publish')
            } else {
                router.push(isMapContext ? '/my-businesses?action=new' : '/auth')
            }
        } else {
            // Ad genérico: publicar/subir
            router.push(isMapContext ? '/my-businesses?action=new' : '/publish')
        }
    }

    useEffect(() => {
        if (ctas.length > 0) {
            const interval = setInterval(() => {
                setCtaIndex((prev) => (prev + 1) % ctas.length)
            }, 10000) // ✅ 10 segundos (6 mensajes por minuto)
            return () => clearInterval(interval)
        }
    }, [ctas])

    const [unreadMessages, setUnreadMessages] = useState(0)
    const [unreadNotifications, setUnreadNotifications] = useState(0)
    const [favoritesCount, setFavoritesCount] = useState(0)
    const [showInstallModal, setShowInstallModal] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'auto'>('auto')
    const { triggerInstall, isInstallable, isStandalone } = usePWAInstall()
    const { isSubscribed, subscribe, permission } = usePushNotifications()

    // 📱 Platform detection
    const [userPlatform, setUserPlatform] = useState<'ios' | 'android' | 'desktop'>(() => {
        if (typeof navigator === 'undefined') return 'desktop'
        const ua = navigator.userAgent || ''
        if (/iPad|iPod|iPhone/.test(ua)) return 'ios'
        if (/Android/.test(ua)) return 'android'
        return 'desktop'
    })

    const handleIOSClick = () => {
        setSelectedPlatform('ios')
        setShowInstallModal(true)
    }

    const handleAndroidClick = async () => {
        // Intentar instalación nativa "Magic Install"
        const installed = await triggerInstall()

        // Si no se pudo (o es iOS/Desktop sin soporte), mostrar manual
        if (!installed) {
            setSelectedPlatform('android')
            setShowInstallModal(true)
        }
    }

    const isActive = (path: string) => pathname === path

    const handleSignOut = async () => {
        try {
            // 🚀 CIERRE DE SESIÓN REAL — Sesión JWT destruida
            // El usuario queda como invitado limpio para crear nueva cuenta si quiere
            await signOut({ redirect: true, callbackUrl: '/auth' })
        } catch (error) {
            console.error("Error durante el cierre de sesión:", error)
            window.location.href = '/auth'
        }
    }

    // Fetch badges logic (Moved from HeaderBadges)
    useEffect(() => {
        if (status !== 'authenticated') return

        const fetchCounts = async () => {
            // 1. Notificaciones
            try {
                const resNotifs = await fetch('/api/notifications?unreadOnly=true')
                if (resNotifs.ok) {
                    const notifs = await resNotifs.json()
                    setUnreadNotifications(notifs.length)
                }
            } catch (error) {
                // Silent fail
            }

            // 2. Mensajes
            try {
                const resChats = await fetch('/api/chats')
                if (resChats.ok) {
                    const chats = await resChats.json()
                    const count = chats.filter((chat: any) =>
                        chat.lastMessage &&
                        !chat.lastMessage.isRead &&
                        chat.lastMessage.senderId === chat.otherUser.id
                    ).length
                    setUnreadMessages(count)
                }
            } catch (error) {
                // Silent fail
            }

            // 3. Favoritos
            try {
                const resFavs = await fetch('/api/favorites')
                if (resFavs.ok) {
                    const data = await resFavs.json()
                    setFavoritesCount(data.favorites?.length || 0)
                }
            } catch (error) {
                // Silent fail
            }
        }

        fetchCounts()

        /* 🚀 REAL-TIME UPDATES (Socket.IO)
        // 💰 Desactivado temporalmente para diagnosticar bloqueo de UI por 404 loop
        import('@/lib/socket').then(({ socket }) => {
            if (!socket.connected) {
                socket.connect()
            }

            // Join user channel
            if (session?.user?.id) {
                socket.emit('join-user', session.user.id)
            }

            socket.on('notification-update', () => {
                fetchCounts() // Fetch only when notified
            })

            socket.on('message-update', () => {
                fetchCounts()
            })
        }) */

        // Escuchar actualizaciones inmediatas (desde Swipe)
        const handleFavUpdate = () => fetchCounts()
        window.addEventListener('favoriteUpdated', handleFavUpdate)

        // Fallback: Low frequency polling (every 30 seconds)
        const interval = setInterval(fetchCounts, 30000)

        return () => {
            import('@/lib/socket').then(({ socket }) => {
                socket.off('notification-update')
                socket.off('message-update')
            })
            clearInterval(interval)
            window.removeEventListener('favoriteUpdated', handleFavUpdate)
        }
    }, [status, update, router, session?.user?.id])

    const totalUnread = unreadMessages + unreadNotifications

    return (
        <header className="sticky top-0 w-full z-[1001] bg-slate-900 border-b border-white/5 shadow-lg shrink-0 pointer-events-auto">
            <div className="w-full px-2 md:px-4 py-2 md:py-4">
                <div className="flex items-center justify-between gap-2">
                    {/* LEFT GROUP: Logo + Platform Badges */}
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div
                            onClick={() => {
                                if (session) {
                                    router.push(getWeightedHomePath())
                                } else {
                                    router.push('/')
                                }
                            }}
                            className="hover:opacity-80 transition cursor-pointer"
                        >
                            <Logo
                                className="w-10 h-10 md:w-14 md:h-14"
                                showText={false}
                                textClassName="hidden"
                            />
                        </div>

                        {/* Download Buttons - Platform Specific */}
                        {!isStandalone && (
                            <div className="flex items-center gap-1.5 animate-in fade-in duration-700">
                                {/* Desktop: Show "Descargar" button */}
                                {userPlatform === 'desktop' && (
                                    <button
                                        onClick={() => { setSelectedPlatform('auto'); setShowInstallModal(true) }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 text-white rounded-full text-[10px] font-bold hover:bg-gray-800 transition active:scale-95 backdrop-blur-sm"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                            <line x1="8" y1="21" x2="16" y2="21" />
                                            <line x1="12" y1="17" x2="12" y2="21" />
                                        </svg>
                                        <span>{t('header.install_desktop') || 'Descargar App'}</span>
                                    </button>
                                )}

                                {/* iOS: Show only iOS button */}
                                {userPlatform === 'ios' && (
                                    <button
                                        onClick={handleIOSClick}
                                        className="flex items-center gap-1 px-2 py-1 bg-black/40 border border-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-gray-800 transition active:scale-95"
                                        title={t('header.install_ios')}
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                        </svg>
                                        <span>{t('common.ios')}</span>
                                    </button>
                                )}

                                {/* Android: Show only Android button */}
                                {userPlatform === 'android' && (
                                    <button
                                        onClick={handleAndroidClick}
                                        className="flex items-center gap-1 px-2 py-1 bg-black/40 border border-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-gray-800 transition active:scale-95"
                                        title={t('header.install_android')}
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                        </svg>
                                        <span>{t('common.android')}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CENTER GROUP: Navigation (Desktop Only) */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-4 flex-1 justify-center max-w-xl mx-auto">
                        <Link 
                            href="/swipe" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 ${isActive('/swipe') 
                                ? 'bg-orange-500/10 text-orange-400 font-bold ring-1 ring-orange-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Flame size={18} className={isActive('/swipe') ? 'text-orange-500' : ''} />
                            <span className="hidden lg:inline text-sm tracking-tight">{t('nav.carmatch') || 'CarMatch'}</span>
                        </Link>

                        <Link 
                            href="/market" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 ${isActive('/market') 
                                ? 'bg-blue-500/10 text-blue-400 font-bold ring-1 ring-blue-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <CarFront size={18} className={isActive('/market') ? 'text-blue-500' : ''} />
                            <span className="hidden lg:inline text-sm tracking-tight">{t('nav.marketcar') || 'MarketCar'}</span>
                        </Link>

                        <Link 
                            href="/map" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 ${isActive('/map') 
                                ? 'bg-green-500/10 text-green-400 font-bold ring-1 ring-green-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Map size={18} className={isActive('/map') ? 'text-green-500' : ''} />
                            <span className="hidden lg:inline text-sm tracking-tight">{t('nav.mapstore') || 'MapStore'}</span>
                        </Link>
                    </nav>

                    {/* RIGHT GROUP: CTA + Profile/Auth */}
                    <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end min-w-0">
                        {/* 🚀 DYNAMIC CTA: Adaptive Layout */}
                        {status === 'loading' ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className="w-20 h-2.5 bg-white/5 animate-pulse rounded" />
                                <div className="w-28 h-4 bg-white/10 animate-pulse rounded" />
                            </div>
                        ) : session ? (
                            /* COMPACT STYLE: For Authenticated Users */
                            <div
                                onClick={handleCtaClick}
                                className={`flex flex-col items-center sm:items-end cursor-pointer group active:scale-95 transition-transform ${isStandalone ? 'flex-1' : ''}`}
                            >
                                <AnimatePresence mode="wait">
                                    {displayCta.includes(' | ') && (
                                        <div className={`flex flex-col ${isStandalone ? 'items-center sm:items-end w-full' : 'items-end'}`}>
                                            <motion.span
                                                key={`hook-auth-${ctaIndex}`}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className={`text-[10px] md:text-xs font-bold uppercase tracking-wider leading-none mb-0.5 ${isCtaSlot ? 'text-primary-400' : 'text-slate-400'}`}
                                            >
                                                {displayCta.split(' | ')[0]}
                                            </motion.span>
                                            <motion.span
                                                key={`action-auth-${ctaIndex}`}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`text-xs md:text-base font-black uppercase tracking-tight leading-none transition-colors text-center sm:text-right ${isCtaSlot ? 'text-primary-400 group-hover:text-primary-300' : 'text-accent-500 group-hover:text-accent-400'}`}
                                            >
                                                {displayCta.split(' | ')[1]}
                                            </motion.span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* PROMINENT BUTTON STYLE: For Guests */
                            <div className={`flex flex-col xl:flex-row items-end xl:items-center gap-1 xl:gap-3 justify-end overflow-hidden ${isStandalone ? 'flex-1' : ''}`}>
                                <AnimatePresence mode="wait">
                                    {displayCta.includes(' | ') && (
                                            <motion.div
                                                key={`hook-guest-${ctaIndex}`}
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 5 }}
                                                className={`block font-bold text-[10px] md:text-[10px] uppercase tracking-wide leading-tight text-right max-w-[120px] md:max-w-[250px] mb-0.5 ${isCtaSlot ? 'text-primary-300' : 'text-white/90'} ${pathname === '/swipe' ? 'hidden sm:block' : ''}`}
                                            >
                                                {displayCta.split(' | ')[0]}
                                            </motion.div>
                                    )}
                                </AnimatePresence>

                                <div
                                    onClick={handleCtaClick}
                                    className="relative group shrink-0 flex items-center cursor-pointer z-20"
                                >
                                    <div className={`px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg shadow-lg group-hover:opacity-90 transition-all active:scale-95 ring-1 flex items-center gap-2 pointer-events-none ${isCtaSlot ? 'bg-primary-600 ring-primary-500/30' : 'bg-accent-600 ring-accent-500/30'}`}>
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={`action-guest-${ctaIndex}`}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="text-white font-black text-xs sm:text-sm lg:text-base whitespace-nowrap uppercase tracking-wide truncate max-w-[160px] sm:max-w-none"
                                            >
                                                {displayCta.split(' | ')[1] || t('common.login_vehicle')}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Bell */}
                        {session && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(showMenu === 'notifications' ? false : 'notifications')}
                                    className="p-2 rounded-lg hover:bg-surface-highlight transition"
                                >
                                    <Bell className="w-6 h-6 text-text-secondary hover:text-text-primary" />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                        </span>
                                    )}
                                </button>
                                <NotificationsDropdown isOpen={showMenu === 'notifications'} onClose={() => setShowMenu(false)} />
                            </div>
                        )}

                        {/* User Profile */}
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                        ) : status === 'authenticated' && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(showMenu === 'user' ? false : 'user')}
                                    className="flex items-center gap-2 hover:bg-surface-highlight px-2 py-1.5 rounded-lg transition"
                                >
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt={t('common.user')} width={32} height={32} unoptimized className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                                            {session.user?.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-text-primary font-medium hidden xl:block">{session.user?.name}</span>
                                </button>
                                {showMenu === 'user' && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-2xl border border-surface-highlight overflow-hidden z-50 py-2">
                                            {/* Profile */}
                                            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight transition-colors" onClick={() => setShowMenu(false)}>
                                                <UserRound className="w-5 h-5 text-primary-500" />
                                                <span className="font-medium">{t('nav.profile')}</span>
                                            </Link>

                                            {/* Install App - Prominent positioning */}
                                            {!isStandalone && (
                                                <button
                                                    onClick={() => {
                                                        setShowMenu(false)
                                                        handleAndroidClick()
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-500/10 text-primary-400 transition-colors animate-pulse"
                                                >
                                                    <Smartphone className="w-5 h-5" />
                                                    <span className="font-black uppercase tracking-tight text-sm">{t('common.install_app') || 'Instalar CarMatch App'}</span>
                                                </button>
                                            )}

                                            {/* Admin Panel */}
                                            {isAdmin && (
                                                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-primary-500/10 text-primary-400 font-bold transition-colors" onClick={() => setShowMenu(false)}>
                                                    <ShieldCheck className="w-5 h-5" />
                                                    <span>{t('nav.admin_panel')}</span>
                                                </Link>
                                            )}

                                            <div className="border-t border-surface-highlight/50 my-1" />

                                            {/* Messages */}
                                            <Link href="/messages" className="flex items-center justify-between px-4 py-3 hover:bg-surface-highlight transition-colors" onClick={() => setShowMenu(false)}>
                                                <div className="flex items-center gap-3">
                                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                                    <span className="font-medium">{t('nav.messages')}</span>
                                                </div>
                                                {unreadMessages > 0 && (
                                                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                        {unreadMessages}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Favorites */}
                                            <Link href="/favorites" className="flex items-center justify-between px-4 py-3 hover:bg-surface-highlight transition-colors" onClick={() => setShowMenu(false)}>
                                                <div className="flex items-center gap-3">
                                                    <ThumbsUp className="w-5 h-5 text-primary-500" />
                                                    <span className="font-medium">{t('nav.favorites')}</span>
                                                </div>
                                                {favoritesCount > 0 && (
                                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                        {favoritesCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* My Businesses */}
                                            <Link href="/my-businesses" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight transition-colors" onClick={() => setShowMenu(false)}>
                                                <Briefcase className="w-5 h-5 text-green-500" />
                                                <span className="font-medium">{t('nav.my_businesses')}</span>
                                            </Link>


                                            <div className="border-t border-surface-highlight/50 my-1" />

                                            {/* Settings */}
                                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight transition-colors" onClick={() => setShowMenu(false)}>
                                                <Settings className="w-5 h-5 text-slate-400" />
                                                <span className="font-medium">{t('nav.settings')}</span>
                                            </Link>

                                            {/* CarMatch Ayuda - Soporte + Consejos */}
                                            <button
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('open-chatbot'))
                                                    setShowMenu(false)
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight transition-colors"
                                            >
                                                <MessageCircleQuestion className="w-5 h-5 text-blue-500" />
                                                <div className="text-left">
                                                    <p className="font-medium">{t('common.support')}</p>
                                                    <p className="text-[11px] text-text-secondary">{t('common.online_team')}</p>
                                                </div>
                                            </button>


                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>



            {/* PWA Installation Modal */}
            <PWAInstallModal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                platform={selectedPlatform}
            />
        </header>
    )
}
