
"use client"

import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext';

interface DaySchedule {
    isOpen: boolean
    open: string
    close: string
}

interface WeeklySchedule {
    monday: DaySchedule
    tuesday: DaySchedule
    wednesday: DaySchedule
    thursday: DaySchedule
    friday: DaySchedule
    saturday: DaySchedule
    sunday: DaySchedule
}

interface OpeningHoursDisplayProps {
    hours: string | null
}

export default function OpeningHoursDisplay({ hours }: OpeningHoursDisplayProps) {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false)

    const DAYS_TRANSLATION: Record<keyof WeeklySchedule, string> = {
        monday: t('opening_hours.monday'),
        tuesday: t('opening_hours.tuesday'),
        wednesday: t('opening_hours.wednesday'),
        thursday: t('opening_hours.thursday'),
        friday: t('opening_hours.friday'),
        saturday: t('opening_hours.saturday'),
        sunday: t('opening_hours.sunday')
    }

    // Helper to format time (e.g., "14:00" -> "2:00 PM")
    function formatTime(time: string): string {
        if (!time) return ''
        const [h, minutes] = time.split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`
    }

    if (!hours) return null

    // 1. Try to parse JSON
    let schedule: WeeklySchedule | null = null
    try {
        const parsed = JSON.parse(hours)
        // Basic validation
        if (parsed.monday && typeof parsed.monday.isOpen === 'boolean') {
            schedule = parsed
        }
    } catch (e) {
        // Not JSON, ignore
    }

    // 2. Legacy / Text Mode
    if (!schedule) {
        return (
            <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-highlight rounded-lg text-primary-400 mt-1">
                    <Clock size={20} />
                </div>
                <div>
                    <p className="text-sm text-text-secondary mb-1">{t('opening_hours.hours_label')}</p>
                    <p className="font-medium text-text-primary leading-snug">{hours}</p>
                </div>
            </div>
        )
    }

    // 3. Structured Mode

    // Calculate "Today's Status"
    const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule
    const todaySchedule = schedule[todayKey]

    // Simple logic for "Open/Closed Now" could be added here comparing times, 
    // but for now we just show today's hours + expand button.

    return (
        <div className="flex items-start gap-4">
            <div className="p-2 bg-surface-highlight rounded-lg text-primary-400 mt-1">
                <Clock size={20} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-text-secondary mb-1">{t('opening_hours.hours_label')}</p>

                {/* Collapsed View (Today) */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full text-left group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <span className={`font-bold ${todaySchedule?.isOpen ? 'text-green-400' : 'text-red-400'} mr-2`}>
                                {todaySchedule?.isOpen ? t('opening_hours.open_today') : t('opening_hours.closed_today')}
                            </span>
                            <span className="text-text-primary text-sm">
                                {todaySchedule?.isOpen
                                    ? `${formatTime(todaySchedule.open)} - ${formatTime(todaySchedule.close)}`
                                    : ''
                                }
                            </span>
                        </div>
                        <div className="text-text-secondary group-hover:text-primary-400 transition">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </div>
                </button>

                {/* Expanded View (Full Week) */}
                {isExpanded && (
                    <div className="mt-3 space-y-2 bg-surface-highlight/10 rounded-lg p-3 border border-surface-highlight/50">
                        {(Object.keys(DAYS_TRANSLATION) as Array<keyof WeeklySchedule>).map((day) => {
                            const isToday = day === todayKey
                            const dayData = schedule![day]

                            return (
                                <div key={day} className={`flex justify-between text-sm ${isToday ? 'font-bold text-text-primary bg-white/5 -mx-2 px-2 py-1 rounded' : 'text-text-secondary'}`}>
                                    <span className="w-24">{DAYS_TRANSLATION[day]}</span>
                                    {dayData.isOpen ? (
                                        <span>
                                            {formatTime(dayData.open)} - {formatTime(dayData.close)}
                                        </span>
                                    ) : (
                                        <span className="text-red-400/70 italic">{t('opening_hours.closed')}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
