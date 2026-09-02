'use client'

import { useState, useEffect } from 'react'
import { Crown, CreditCard, AlertTriangle, CheckCircle, X } from 'lucide-react'

interface BusinessSubscription {
    id: string
    name: string
    isActive: boolean
    isFreePublication: boolean
    expiresAt: string | null
    subscriptionStatus: string | null
    stripeSubscriptionId: string | null
}

interface SubscriptionBannerProps {
    business: BusinessSubscription
    onSubscribe?: (businessId: string) => void
    onManageBilling?: (businessId: string) => void
}

export default function SubscriptionBanner({ business, onSubscribe, onManageBilling }: SubscriptionBannerProps) {
    const [loading, setLoading] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    const isTrialing = business.isFreePublication && !business.stripeSubscriptionId
    const isSubscribed = !!business.stripeSubscriptionId && business.subscriptionStatus === 'active'
    const isPastDue = business.subscriptionStatus === 'past_due'
    const isCanceled = business.subscriptionStatus === 'canceled'
    const isExpired = business.expiresAt && new Date(business.expiresAt) < new Date()

    // Calculate days until expiration
    const daysLeft = business.expiresAt
        ? Math.max(0, Math.ceil((new Date(business.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0

    const handleSubscribe = async () => {
        if (!onSubscribe) return
        setLoading(true)
        try {
            await onSubscribe(business.id)
        } finally {
            setLoading(false)
        }
    }

    const handleManageBilling = async () => {
        if (!onManageBilling) return
        setLoading(true)
        try {
            await onManageBilling(business.id)
        } finally {
            setLoading(false)
        }
    }

    // Trial banner — show when on free trial, especially near expiration
    if (isTrialing) {
        // Only show prominently if expiring within 14 days or already expired
        if (daysLeft > 14 && !isExpired) return null

        return (
            <div className={`rounded-2xl p-4 mb-4 border backdrop-blur-sm ${
                isExpired
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
            }`}>
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${isExpired ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                        {isExpired
                            ? <AlertTriangle size={20} className="text-red-400" />
                            : <Crown size={20} className="text-amber-400" />
                        }
                    </div>
                    <div className="flex-1">
                        <p className={`font-bold text-sm ${isExpired ? 'text-red-300' : 'text-amber-300'}`}>
                            {isExpired ? 'Periodo de prueba expirado' : `Te quedan ${daysLeft} días de prueba gratis`}
                        </p>
                        <p className="text-text-secondary text-xs mt-1">
                            {isExpired
                                ? 'Suscríbete por $20 MXN/mes para mantener tu negocio activo'
                                : 'Suscríbete por $20 MXN/mes para no perder tu publicación'
                            }
                        </p>
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="mt-3 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Abriendo...' : 'Suscribirme ahora'}
                        </button>
                    </div>
                    <button onClick={() => setDismissed(true)} className="text-text-secondary hover:text-text-primary">
                        <X size={16} />
                    </button>
                </div>
            </div>
        )
    }

    // Active subscription banner
    if (isSubscribed) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-xl">
                        <CheckCircle size={20} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-green-300 font-bold text-sm">Suscripción activa</p>
                        <p className="text-text-secondary text-xs">
                            {business.expiresAt && `Renovación: ${new Date(business.expiresAt).toLocaleDateString()}`}
                        </p>
                    </div>
                    <button
                        onClick={handleManageBilling}
                        disabled={loading}
                        className="text-text-secondary hover:text-text-primary border border-white/10 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                    >
                        <CreditCard size={14} className="inline mr-1" />
                        Gestionar
                    </button>
                </div>
            </div>
        )
    }

    // Past due — urgent
    if (isPastDue) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-red-500/20 p-2 rounded-xl">
                        <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-red-300 font-bold text-sm">Pago pendiente</p>
                        <p className="text-text-secondary text-xs mt-1">
                            Tu último pago falló. Actualiza tu método de pago para evitar la desactivación.
                        </p>
                        <button
                            onClick={handleManageBilling}
                            disabled={loading}
                            className="mt-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Abriendo...' : 'Actualizar pago'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
