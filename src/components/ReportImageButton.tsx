// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

interface ReportImageButtonProps {
    imageUrl: string
    vehicleId?: string
    businessId?: string
    targetUserId?: string
    className?: string
}

const REPORT_REASON_KEYS = [
    'report.reason.sexual',
    'report.reason.violence',
    'report.reason.harassment',
    'report.reason.spam',
    'report.reason.not_real',
    'report.reason.other'
]

export default function ReportImageButton({
    imageUrl,
    vehicleId,
    businessId,
    targetUserId,
    className = "absolute top-2 right-2"
}: ReportImageButtonProps) {
    const { t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState(REPORT_REASON_KEYS[0])
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason,
                    description,
                    imageUrl,
                    vehicleId,
                    businessId,
                    targetUserId
                })
            })

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    setIsOpen(false)
                    setSuccess(false)
                    setDescription("")
                }, 2000)
            } else {
                toast.error(t('report.error.send'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('report.error.connection'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsOpen(true)
                }}
                className={`p-1.5 bg-black/20 hover:bg-red-600/80 text-white rounded-full backdrop-blur-sm transition ${className}`}
                title={t('report.image_title')}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(false)
                    }}
                >
                    <div
                        className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md p-6 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {t('report.title')}
                                </h3>

                                <p className="text-sm text-text-secondary">
                                    {t('report.subtitle')}
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('report.reason_label')}</label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-text-primary"
                                    >
                                        {REPORT_REASON_KEYS.map(key => (
                                            <option key={key} value={key}>{t(key)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('report.details_label')}</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-text-primary h-24 resize-none"
                                        placeholder={t('report.description_placeholder')}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-text-secondary hover:text-text-primary"
                                    >
                                        {t('report.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg disabled:opacity-50"
                                    >
                                        {loading ? t('report.sending') : t('report.submit')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">{t('report.success_title')}</h3>
                                <p className="text-text-secondary">{t('report.success_message')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
