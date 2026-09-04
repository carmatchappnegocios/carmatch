'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import RatingSummary from './RatingSummary'
import type { Review } from '@/types/review'

interface ReviewStats {
    average: number
    total: number
    distribution: {
        1: number
        2: number
        3: number
        4: number
        5: number
    }
}

interface ReviewListProps {
    businessId: string
    businessName: string
    currentUserId?: string
}

export default function ReviewList({ businessId, businessName, currentUserId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/businesses/reviews?businessId=${businessId}`)
            if (!res.ok) throw new Error('Error al cargar reseñas')
            const data = await res.json()
            setReviews(data.reviews)
            setStats(data.stats)
        } catch (err) {
            setError('Error al cargar las reseñas')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [businessId])

    const handleSubmitReview = async (rating: number, comment: string) => {
        const res = await fetch('/api/businesses/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, rating, comment })
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Error al crear reseña')
        }

        await fetchReviews()
        setShowForm(false)
    }

    const handleUpdateReview = async (id: string, rating: number, comment: string) => {
        const res = await fetch(`/api/businesses/reviews/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment })
        })

        if (!res.ok) throw new Error('Error al actualizar reseña')
        await fetchReviews()
    }

    const handleDeleteReview = async (id: string) => {
        const res = await fetch(`/api/businesses/reviews/${id}`, {
            method: 'DELETE'
        })

        if (!res.ok) throw new Error('Error al eliminar reseña')
        await fetchReviews()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-primary-500" />
                    <h2 className="text-lg font-semibold text-surface-text">Reseñas</h2>
                    {stats && stats.total > 0 && (
                        <span className="text-sm text-surface-textTertiary">({stats.total})</span>
                    )}
                </div>
                {currentUserId && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={14} />
                        Escribir reseña
                    </button>
                )}
            </div>

            {/* Summary */}
            {stats && (
                <RatingSummary
                    average={stats.average}
                    total={stats.total}
                    distribution={stats.distribution}
                />
            )}

            {/* Form */}
            {showForm && (
                <ReviewForm
                    businessId={businessId}
                    businessName={businessName}
                    onSubmit={handleSubmitReview}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm text-center py-4">{error}</p>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <MessageSquare size={48} className="mx-auto text-surface-textTertiary mb-3" />
                    <p className="text-surface-textSecondary">No hay reseñas aún</p>
                    <p className="text-surface-textTertiary text-sm">Sé el primero en reseñar este negocio</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={currentUserId}
                            onUpdate={handleUpdateReview}
                            onDelete={handleDeleteReview}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
