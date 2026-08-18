'use client'

import { ShieldCheck, Car, ShoppingBag, Clock, Zap } from 'lucide-react'

interface UserBadgesProps {
    user: {
        createdAt: string | Date
        lifetimeVehicleCount?: number
        lifetimeBusinessCount?: number
    }
    showAll?: boolean
}

export default function UserBadges({ user, showAll = false }: UserBadgesProps) {
    const badges = []

    // Badge: Miembro desde
    const memberSince = new Date(user.createdAt)
    const memberYear = memberSince.getFullYear()
    badges.push({
        icon: <Clock size={12} />,
        label: `Miembro ${memberYear}`,
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    })

    // Badge: Vendedor activo (si tiene vehículos publicados)
    if (user.lifetimeVehicleCount && user.lifetimeVehicleCount > 0) {
        badges.push({
            icon: <Car size={12} />,
            label: 'Vendedor',
            color: 'bg-green-500/10 text-green-400 border-green-500/20'
        })
    }

    // Badge: Dueño de negocio
    if (user.lifetimeBusinessCount && user.lifetimeBusinessCount > 0) {
        badges.push({
            icon: <ShieldCheck size={12} />,
            label: 'Negocio',
            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        })
    }

    // Badge: Comprador (si no tiene vehículos ni negocios)
    if ((!user.lifetimeVehicleCount || user.lifetimeVehicleCount === 0) &&
        (!user.lifetimeBusinessCount || user.lifetimeBusinessCount === 0)) {
        badges.push({
            icon: <ShoppingBag size={12} />,
            label: 'Comprador',
            color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        })
    }

    if (badges.length === 0) return null

    const displayBadges = showAll ? badges : badges.slice(0, 3)

    return (
        <div className="flex flex-wrap gap-2">
            {displayBadges.map((badge, index) => (
                <span
                    key={index}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}
                >
                    {badge.icon}
                    {badge.label}
                </span>
            ))}
        </div>
    )
}
