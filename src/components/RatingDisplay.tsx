'use client'

import { Star } from 'lucide-react'

interface RatingDisplayProps {
    rating: number
    totalReviews?: number
    size?: 'sm' | 'md' | 'lg'
    showCount?: boolean
}

export default function RatingDisplay({ rating, totalReviews, size = 'md', showCount = true }: RatingDisplayProps) {
    const starSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20
    const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={starSize}
                        className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
            <span className={`${textSize} text-surface-textSecondary font-medium`}>
                {rating.toFixed(1)}
            </span>
            {showCount && totalReviews !== undefined && (
                <span className={`${textSize} text-surface-textTertiary`}>
                    ({totalReviews})
                </span>
            )}
        </div>
    )
}
