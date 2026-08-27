
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSession } from "next-auth/react"
import {
    Flame,
    Car,
    Map as MapIcon,
    User
} from "lucide-react"
import { useRestoreSessionModal } from "@/hooks/useRestoreSessionModal"

export default function MobileNav() {
    const pathname = usePathname()
    const { t } = useLanguage()
    const { data: session, status } = useSession()

    const [isVisible, setIsVisible] = useState(true)

    // ⌨️ SMART KEYBOARD HIDE (Detección por Eventos Puros)
    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                setIsVisible(false);
            }
        };

        const handleBlur = () => {
            setIsVisible(true);
        };

        document.addEventListener('focusin', handleFocus);
        document.addEventListener('focusout', handleBlur);

        return () => {
            document.removeEventListener('focusin', handleFocus);
            document.removeEventListener('focusout', handleBlur);
        };
    }, []);

    if (pathname?.startsWith('/admin')) {
        return null
    }

    const isActive = (path: string) => pathname === path

    const navItems = [
        { href: "/swipe", icon: Flame, label: t('nav.carmatch'), color: "text-orange-500" },
        { href: "/market", icon: Car, label: t('nav.marketcar'), color: "text-blue-500" },
        { href: "/map", icon: MapIcon, label: t('nav.mapstore'), color: "text-green-500" },
        {
            href: (status === 'loading') ? "#" : session ? "/profile" : "/auth",
            icon: User,
            label: (status === 'loading') ? "..." : session ? t('nav.profile') : t('common.login'),
            color: (status === 'loading') ? "text-slate-700" : "text-purple-500"
        },
    ]

    return (
        <nav
            className={`md:hidden fixed bottom-0 left-0 right-0 z-[1002] bg-[#0f172a] border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] pointer-events-auto flex`}
            style={{
                height: 'calc(68px + env(safe-area-inset-bottom))',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            <div className="flex items-center justify-around h-[68px] px-2 w-full">
                {navItems.map((item, index) => {
                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                        <Link
                            key={item.href || index}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full gap-0.5 active:scale-95 transition-transform ${active ? 'text-primary-500' : 'text-slate-400'}`}
                        >
                            <Icon className={`w-6 h-6 ${active ? item.color : 'opacity-80'}`} />
                            <span className={`text-[10px] font-bold truncate max-w-[64px] ${active ? 'text-white' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
