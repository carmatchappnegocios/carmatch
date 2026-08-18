'use client'

import { Star } from 'lucide-react'
import RatingDisplay from './RatingDisplay'

interface RatingSummaryProps {
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

export default function RatingSummary({ average, total, distribution }: RatingSummaryProps) {
    if (total === 0) {
        return (
            <div className="bg-surface-card rounded-xl p-6 border border-surface-border">
                <div className="text-center">
                    <div className="text-4xl font-bold text-surface-textSecondary mb-2">0.0</div>
                    <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={20} className="text-gray-300" />
                        ))}
                    </div>
                    <p className="text-surface-textTertiary text-sm">Sin reseñas aún</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-surface-card rounded-xl p-6 border border-surface-border">
            <div className="flex items-start gap-6">
                {/* Promedio */}
                <div className="text-center">
                    <div className="text-5xl font-bold text-surface-text">{average.toFixed(1)}</div>
                    <RatingDisplay rating={average} showCount={false} size="md" />
                    <p className="text-surface-textTertiary text-sm mt-1">{total} reseñas</p>
                </div>

                {/* Distribución */}
                <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = distribution[stars as keyof typeof distribution]
                        const percentage = total > 0 ? (count / total) * 100 : 0
                        return (
                            <div key={stars} className="flex items-center gap-2">
                                <span className="text-sm text-surface-textSecondary w-8">{stars}★</span>
                                <div className="flex-1 h-2 bg-surface-highlight rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-surface-textTertiary w-8 text-right">{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
