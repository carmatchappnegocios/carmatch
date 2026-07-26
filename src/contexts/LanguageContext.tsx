// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Locale = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ru' | 'ko' | 'ar' | 'hi'
    | 'tr' | 'nl' | 'pl' | 'sv' | 'id' | 'th' | 'vi' | 'ur' | 'he'

interface LanguageContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, params?: Record<string, any>) => any
    isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Cache for loaded translations to avoid re-fetching
const translationCache: Partial<Record<Locale, any>> = {}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('es')
    const [translations, setTranslations] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadTranslations = useCallback(async (targetLocale: Locale) => {
        setIsLoading(true)
        try {
            if (translationCache[targetLocale]) {
                setTranslations(translationCache[targetLocale])
            } else {
                const dictionary = await import(`@/locales/${targetLocale}.json`)
                translationCache[targetLocale] = dictionary.default
                setTranslations(dictionary.default)
            }
            setLocaleState(targetLocale)
        } catch (error) {
            console.error(`Error loading translations for ${targetLocale}:`, error)
            // Fallback to ES if target fails
            if (targetLocale !== 'es') {
                await loadTranslations('es')
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        const initLanguage = async () => {
            // 1. Check LocalStorage (User Preference)
            let initialLocale = localStorage.getItem('carmatch-locale') as Locale

            // 2. Detect by country from IP (PRIORITIZE over browser language)
            if (!initialLocale) {
                try {
                    const savedLocation = localStorage.getItem('carmatch_last_detected_location')
                    if (savedLocation) {
                        const loc = JSON.parse(savedLocation)
                        const countryCode = loc.countryCode?.toUpperCase()
                        if (countryCode) {
                            const countryToLocale: Record<string, Locale> = {
                                MX: 'es', ES: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es',
                                US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en',
                                BR: 'pt', PT: 'pt',
                                FR: 'fr', BE: 'fr', CH: 'fr',
                                DE: 'de', AT: 'de', LI: 'de',
                                IT: 'it',
                                CN: 'zh', TW: 'zh', HK: 'zh',
                                JP: 'ja',
                                RU: 'ru', BY: 'ru',
                                KR: 'ko',
                                SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', IQ: 'ar', JO: 'ar', LB: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', LY: 'ar', TN: 'ar', SD: 'ar', PS: 'ar',
                                IN: 'hi', PK: 'ur',
                                TR: 'tr',
                                NL: 'nl',
                                PL: 'pl',
                                SE: 'sv', NO: 'sv', DK: 'sv', FI: 'sv',
                                ID: 'id', MY: 'id',
                                TH: 'th',
                                VN: 'vi',
                                IL: 'he',
                            }
                            const detected = countryToLocale[countryCode]
                            if (detected) initialLocale = detected
                        }
                    }
                } catch (e) { /* ignore parse errors */ }
            }

            // 3. Check Browser Languages (only if country detection didn't find a match)
            if (!initialLocale) {
                const browserLangs = navigator.languages ? navigator.languages : [navigator.language]
                const supportedLocales: Locale[] = ['es', 'en', 'pt', 'fr', 'de', 'it', 'zh', 'ja', 'ru', 'ko', 'ar', 'hi', 'tr', 'nl', 'pl', 'sv', 'id', 'th', 'vi', 'ur', 'he']

                for (const lang of browserLangs) {
                    if (!lang) continue
                    const code = lang.toLowerCase()

                    if (code.startsWith('es')) {
                        initialLocale = 'es'
                        break
                    }

                    const found = supportedLocales.find(key => code === key || code.startsWith(key + '-'))
                    if (found) {
                        initialLocale = found
                        break
                    }
                }
            }

            // Fallback
            if (!initialLocale) initialLocale = 'es'

            await loadTranslations(initialLocale)
        }

        initLanguage()
    }, [loadTranslations])

    // Update HTML lang attribute when locale changes
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale
        }
    }, [locale])

    const setLocale = async (newLocale: Locale) => {
        await loadTranslations(newLocale)
        localStorage.setItem('carmatch-locale', newLocale)
    }

    const t = useCallback((path: string, params?: Record<string, any>): any => {
        if (!translations) return path

        const keys = path.split('.')
        let current: any = translations

        for (const key of keys) {
            if (!current || current[key] === undefined) {
                // Durante el desarrollo, avisar de traducciones faltantes
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`Missing translation for key: ${path} in locale: ${locale}`)
                }
                return path
            }
            current = current[key]
        }

        // Si se pide explícitamente retornar el objeto (array de mensajes por ejemplo)
        if (params?.returnObjects) {
            return current
        }

        if (typeof current !== 'string') return current

        let translated = current
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    translated = translated.replace(new RegExp(`{${key}}`, 'g'), String(value))
                }
            })
        }

        return translated
    }, [translations, locale])

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
            {/* 🚀 FIXED: Render children immediately to prevent the fixed inset-0 full screen lock */}
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
