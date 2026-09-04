
"use client"

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'
import ConfirmationModal from '@/components/ConfirmationModal'
import { useSearchParams, useRouter } from 'next/navigation'
import { CreditCard, ShieldCheck, BadgeCheck, Clock, User as UserIcon } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

interface CreditsClientProps {
    user: any
}

interface PricingData {
    countryCode: string
    pricePerCredit: number
    currency: string
    region: 'developed' | 'developing'
    localCurrency?: string
    localPriceEstimate?: number
    exchangeRate?: number
}

export default function CreditsClient({ user }: CreditsClientProps) {
    const { t, locale } = useLanguage()
    const searchParams = useSearchParams()
    const router = useRouter()
    const isTopupAction = searchParams.get('action') === 'topup'
    
    const [pricing, setPricing] = useState<PricingData | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)

    // Estado para el modal de confirmación personalizado
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean
        title: string
        message: string
        variant: 'success' | 'danger' | 'info' | 'credit'
        onConfirm?: () => void
        confirmLabel?: string
        showCancel?: boolean
    }>({ isOpen: false, title: '', message: '', variant: 'info' })

    useEffect(() => {
        if (isTopupAction) {
            fetchPricing()
        } else {
            setLoading(false)
        }

        // Verificar si regresamos de un pago exitoso
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')

        if (urlParams.get('success') === 'true' && sessionId) {
            const confirmPayment = async () => {
                setLoading(true)
                try {
                    const res = await fetch('/api/credits/confirm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId })
                    })
                    const data = await res.json()
                    if (res.ok && data.success) {
                        setModalConfig({
                            isOpen: true,
                            title: t('credits.success_title'),
                            message: t('credits.success_message'),
                            variant: 'credit',
                            confirmLabel: t('credits.understood'),
                            showCancel: false,
                            onConfirm: () => {
                                setModalConfig(prev => ({ ...prev, isOpen: false }))
                                router.replace('/credits')
                                window.location.reload()
                            }
                        })
                    } else {
                        setModalConfig({
                            isOpen: true,
                            title: t('credits.transaction_problem'),
                            message: data.error || t('credits.transaction_problem_message'),
                            variant: 'danger',
                            confirmLabel: t('credits.close'),
                            showCancel: false,
                            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                        })
                        setLoading(false)
                    }
                } catch (error) {
                    console.error('Error de red al confirmar:', error)
                    setLoading(false)
                }
            }
            confirmPayment()
        }
    }, [isTopupAction])

    const fetchPricing = async () => {
        try {
            const res = await fetch('/api/pricing')
            if (res.ok) {
                const data = await res.json()
                setPricing(data)
            }
        } catch (error) {
            console.error('Error fetching pricing:', error)
        } finally {
            setLoading(false)
        }
    }

    const [showBridgeModal, setShowBridgeModal] = useState(false)

    const handlePurchase = async () => {
        if (!pricing) return

        setLoading(true)
        try {
            const res = await fetch('/api/credits/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity,
                    country: pricing.countryCode
                })
            })

            const data = await res.json()

            if (res.ok && data.url) {
                setShowBridgeModal(true)
                window.open(data.url, '_blank')
                setLoading(false)
            } else {
                setModalConfig({
                    isOpen: true,
                    title: t('credits.connection_error'),
                    message: `${t('credits.connection_error_message')}: ${data.error || 'Error'}`,
                    variant: 'danger',
                    showCancel: false,
                    onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                })
                setLoading(false)
            }
        } catch (error: any) {
            setModalConfig({
                isOpen: true,
                title: t('credits.network_error'),
                message: t('credits.network_error_message'),
                variant: 'danger',
                showCancel: false,
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            })
            setLoading(false)
        }
    }

    const total = pricing ? pricing.pricePerCredit * quantity : 0

    if (!isTopupAction) {
        return (
            <div className="min-h-screen bg-background px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-surface border border-surface-highlight rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400">
                                <BadgeCheck size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">{t('credits.account_status')}</h1>
                                <p className="text-text-secondary text-sm">{t('credits.membership_info')}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <UserIcon size={20} className="text-text-secondary" />
                                    <span className="text-text-primary font-medium">{t('credits.user')}</span>
                                </div>
                                <span className="text-text-secondary font-bold">{user.name}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} className="text-green-500" />
                                    <span className="text-text-primary font-medium">{t('credits.account_level')}</span>
                                </div>
                                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold uppercase border border-green-500/20">
                                    {t('credits.verified')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-surface-highlight/30 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-text-secondary" />
                                    <span className="text-text-primary font-medium">{t('credits.since')}</span>
                                </div>
                                <span className="text-text-secondary">
                                    {new Date(user.createdAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-surface-highlight/50">
                            <p className="text-center text-xs text-text-secondary leading-relaxed">
                                {t('credits.support_text')}
                            </p>
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={modalConfig.onConfirm}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    variant={modalConfig.variant}
                    confirmLabel={modalConfig.confirmLabel || t('credits.accept')}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-4">
                    <button 
                        onClick={() => router.push('/credits')}
                        className="p-2 hover:bg-surface-highlight rounded-full transition text-text-secondary"
                    >
                        <ShieldCheck size={24} />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t('credits.service_update')}</h1>
                </div>

                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden border border-white/5">
                    <div className="relative z-10">
                        <p className="text-white/60 font-medium mb-1 uppercase tracking-wider text-xs">{t('credits.publication_credits')}</p>
                        <div className="text-5xl font-black flex items-baseline gap-2">
                            {user.credits}
                            <span className="text-lg font-normal opacity-60">{t('credits.coins_name')}</span>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner fullScreen={false} />
                        </div>
                    ) : pricing ? (
                        <div className="bg-surface rounded-2xl border border-surface-highlight p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-text-primary mb-6">{t('credits.get_coins')}</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-text-primary mb-3">
                                    {t('credits.select_quantity')}
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 bg-surface-highlight hover:bg-primary-500/20 rounded-xl font-bold text-xl transition"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="flex-1 text-center text-3xl font-bold bg-background border-2 border-surface-highlight rounded-xl py-4 focus:outline-none focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(100, quantity + 1))}
                                        className="w-12 h-12 bg-surface-highlight hover:bg-primary-500/20 rounded-xl font-bold text-xl transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-8 flex-wrap">
                                {[1, 5, 10, 20].map((qty) => (
                                    <button
                                        key={qty}
                                        onClick={() => setQuantity(qty)}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${quantity === qty
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
                                            : 'bg-surface-highlight text-text-secondary hover:bg-primary-500/10'
                                            }`}
                                    >
                                        {qty} {qty === 1 ? 'Coin' : 'Coins'}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-surface-highlight/30 rounded-2xl p-6 mb-6 border border-white/5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">{t('credits.total_investment')}</p>
                                        <p className="text-4xl font-black text-text-primary">
                                            ${total.toFixed(2)} <span className="text-lg font-bold">{pricing.currency}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <BadgeCheck size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-text-secondary uppercase">{t('credits.secure')}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl text-lg transition shadow-xl shadow-primary-900/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <CreditCard size={24} />
                                {t('credits.continue_payment')}
                            </button>

                            <p className="text-[10px] text-text-secondary text-center mt-6 uppercase tracking-widest font-bold opacity-40">
                                {t('credits.ssl_secure')}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-text-secondary bg-surface rounded-2xl border border-surface-highlight">
                            {t('credits.load_error')}
                        </div>
                    )}
                </div>
            </div>

            {/* Bridge Modal */}
            {showBridgeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface border border-surface-highlight rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            🔒
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-4">{t('credits.secure_platform')}</h3>
                        <p className="text-text-secondary mb-8 text-sm leading-relaxed">
                            {t('credits.bridge_message')}
                            <br /><br />
                            {t('credits.bridge_message_2')}
                        </p>
                        <button
                            onClick={() => setShowBridgeModal(false)}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition shadow-lg"
                        >
                            {t('credits.back_to_carmatch')}
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                confirmLabel={modalConfig.confirmLabel || t('credits.accept')}
                showCancel={modalConfig.showCancel}
            />
        </div>
    )
}
