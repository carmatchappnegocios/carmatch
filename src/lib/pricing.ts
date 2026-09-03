/**
 * Pricing constants for CarMatch
 * PROHIBIDO MODIFICAR ESTOS PRECIOS SIN CONSULTA PREVIA
 */

export const BASE_PRICE_MXN = 20.00
export const PREMIUM_PRICE_USD = 4.99
export const SUBSCRIPTION_PRICE_MXN = 20.00

export const MIN_PRICE_EMERGING = 1.00
export const MIN_PRICE_PREMIUM = 4.99

export const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/MXN'

export const EMERGING_MARKETS = [
    'CO', 'AR', 'PE', 'CL', 'EC', 'GT', 'CR', 'BR', 'MX',
    'IN', 'CN', 'VN', 'TH', 'ID', 'PH', 'EG', 'NG'
] as const

export type CountryCode = typeof EMERGING_MARKETS[number] | string

/**
 * Calculate price for credits based on country
 */
export function calculateCreditPrice(country: string, quantity: number) {
    if (country === 'MX') {
        return {
            amountInCents: Math.round(BASE_PRICE_MXN * quantity * 100),
            currency: 'mxn' as const,
        }
    }
    if (EMERGING_MARKETS.includes(country as typeof EMERGING_MARKETS[number])) {
        return {
            amountInCents: Math.round(BASE_PRICE_MXN * quantity * 100),
            currency: 'mxn' as const,
        }
    }
    return {
        amountInCents: Math.round(PREMIUM_PRICE_USD * quantity * 100),
        currency: 'usd' as const,
    }
}
