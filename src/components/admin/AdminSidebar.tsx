'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MenuItem {
    id: string
    icon: LucideIcon
    label: string
    badge?: number
}

interface AdminSidebarProps {
    activeView: string
    setActiveView: (id: any) => void
    menuItems: MenuItem[]
    userImage?: string | null
    userName?: string | null
}

export default function AdminSidebar({ activeView, setActiveView, menuItems, userImage, userName }: AdminSidebarProps) {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-[#09090b] border-r border-white/5 h-screen sticky top-0 shrink-0 overflow-y-auto no-scrollbar">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/20">
                        <span className="font-black text-xl italic text-white">C</span>
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tighter italic text-white leading-none">CarMatch</h1>
                        <span className="text-[10px] font-bold text-primary-500 tracking-[0.3em] uppercase">Operating System</span>
                    </div>
                </div>

                <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeView === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group relative ${
                                    isActive 
                                        ? 'bg-primary-500/10 text-primary-400' 
                                        : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-primary-500 rounded-full"
                                    />
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px] group-hover:stroke-[2px]'}`} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </div>

                                {item.badge && item.badge > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                         <img src={userImage || "https://ui-avatars.com/api/?name=Admin"} alt="Admin" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{userName || 'Administrator'}</p>
                        <p className="text-[9px] font-bold text-zinc-600 truncate uppercase tracking-widest">Master Access</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
