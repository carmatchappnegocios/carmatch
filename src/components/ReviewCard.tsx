'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import RatingDisplay from './RatingDisplay'

interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
        id: string
        name: string | null
        image: string | null
    }
}

interface ReviewCardProps {
    review: Review
    currentUserId?: string
    onUpdate?: (id: string, rating: number, comment: string) => void
    onDelete?: (id: string) => void
}

export default function ReviewCard({ review, currentUserId, onUpdate, onDelete }: ReviewCardProps) {
    const { t } = useLanguage()
    const [showMenu, setShowMenu] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editRating, setEditRating] = useState(review.rating)
    const [editComment, setEditComment] = useState(review.comment || '')

    const isAuthor = currentUserId === review.user.id
    const date = new Date(review.createdAt)
    const timeAgo = getTimeAgo(date, t)

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(review.id, editRating, editComment)
        }
        setIsEditing(false)
    }

    const handleDelete = () => {
        if (onDelete && confirm(t('reviewCard.confirmDelete'))) {
            onDelete(review.id)
        }
        setShowMenu(false)
    }

    return (
        <div className="bg-surface-card rounded-xl p-4 border border-surface-border">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center overflow-hidden">
                        {review.user.image ? (
                            <Image src={review.user.image} alt="" width={40} height={40} unoptimized className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-surface-textSecondary font-medium">
                                {review.user.name?.charAt(0) || '?'}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-surface-text">{review.user.name || t('reviewCard.anonymous')}</p>
                        <p className="text-xs text-surface-textTertiary">{timeAgo}</p>
                    </div>
                </div>

                {isAuthor && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-surface-highlight rounded-lg transition-colors"
                        >
                            <MoreVertical size={16} className="text-surface-textTertiary" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-surface-card border border-surface-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                                <button
                                    onClick={() => { setIsEditing(true); setShowMenu(false) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface-highlight flex items-center gap-2"
                                >
                                    <Pencil size={14} /> {t('reviewCard.edit')}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface-highlight text-red-500 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> {t('reviewCard.delete')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rating */}
            <div className="mb-2">
                <RatingDisplay rating={review.rating} showCount={false} size="sm" />
            </div>

            {/* Comment */}
            {isEditing ? (
                <div className="space-y-3">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setEditRating(star)}
                                className="p-0.5"
                            >
                                <Star
                                    size={20}
                                    className={star <= editRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder={t('reviewCard.writeReview')}
                        className="w-full p-3 bg-surface-background border border-surface-border rounded-lg text-surface-text placeholder-surface-textTertiary resize-none"
                        rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 text-sm text-surface-textSecondary hover:bg-surface-highlight rounded-lg"
                        >
                            {t('reviewCard.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            {t('reviewCard.save')}
                        </button>
                    </div>
                </div>
            ) : (
                review.comment && (
                    <p className="text-surface-text text-sm leading-relaxed">{review.comment}</p>
                )
            )}
        </div>
    )
}

function getTimeAgo(date: Date, t: (key: string) => string): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t('reviewCard.timeAgo.justNow')
    if (diffMins < 60) return t('reviewCard.timeAgo.minutesAgo').replace('{n}', String(diffMins))
    if (diffHours < 24) return t('reviewCard.timeAgo.hoursAgo').replace('{n}', String(diffHours))
    if (diffDays < 7) return t('reviewCard.timeAgo.daysAgo').replace('{n}', String(diffDays))
    if (diffDays < 30) return t('reviewCard.timeAgo.weeksAgo').replace('{n}', String(Math.floor(diffDays / 7)))
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
