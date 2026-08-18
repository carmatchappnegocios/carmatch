'use client'

import { useState } from 'react'
import { Star, Send } from 'lucide-react'

interface ReviewFormProps {
    businessId: string
    businessName: string
    onSubmit: (rating: number, comment: string) => Promise<void>
    onCancel?: () => void
}

export default function ReviewForm({ businessId, businessName, onSubmit, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Selecciona una calificación')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            await onSubmit(rating, comment)
            setRating(0)
            setComment('')
        } catch (err) {
            setError('Error al enviar la reseña')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-surface-card rounded-xl p-6 border border-surface-border">
            <h3 className="font-semibold text-surface-text mb-4">
                Escribe una reseña para {businessName}
            </h3>

            {/* Star Rating */}
            <div className="mb-4">
                <p className="text-sm text-surface-textSecondary mb-2">Calificación *</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                size={32}
                                className={
                                    star <= (hoverRating || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 hover:text-gray-400'
                                }
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-surface-textTertiary mt-1">
                        {rating === 1 && 'Malo'}
                        {rating === 2 && 'Regular'}
                        {rating === 3 && 'Bueno'}
                        {rating === 4 && 'Muy bueno'}
                        {rating === 5 && 'Excelente'}
                    </p>
                )}
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm text-surface-textSecondary mb-2">
                    Tu reseña (opcional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos tu experiencia..."
                    className="w-full p-3 bg-surface-background border border-surface-border rounded-lg text-surface-text placeholder-surface-textTertiary resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    maxLength={500}
                />
                <p className="text-xs text-surface-textTertiary mt-1">{comment.length}/500</p>
            </div>

            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-surface-textSecondary hover:bg-surface-highlight rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Send size={14} />
                    {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
                </button>
            </div>
        </div>
    )
}
