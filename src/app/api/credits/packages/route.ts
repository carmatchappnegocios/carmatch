
import { NextRequest, NextResponse } from 'next/server'

// API gratuita para tipo de cambio en tiempo real
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/MXN'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const country = searchParams.get('country') || 'MX'

        // PRECIOS BASE
        const BASE_PRICE_MXN = 20.00      // Para emergentes (LATAM, Asia, África) - en MXN
        const PREMIUM_PRICE_USD = 4.99    // Para desarrollados (USA, Europa, Japón) - en USD fijo

        // PISOS MÍNIMOS EN USD (NO BAJAR DE AQUÍ)
        const MIN_PRICE_EMERGING = 1.00   // Mínimo $1.00 USD
        const MIN_PRICE_PREMIUM = 4.99    // Precio fijo para países desarrollados

        // Lista de países emergentes
        const emergingMarkets = [
            'CO', 'AR', 'PE', 'CL', 'EC', 'GT', 'CR', 'BR', 'MX', // LATAM
            'IN', 'CN', 'VN', 'TH', 'ID', 'PH', 'EG', 'NG'  // Asia/África
        ]

        let currency = 'USD'
        let price = MIN_PRICE_PREMIUM
        let tierName = 'premium'
        let priceInMXN = 0

        if (country === 'MX') {
            // México: siempre en MXN
            currency = 'MXN'
            price = BASE_PRICE_MXN
            tierName = 'mexico'
            priceInMXN = BASE_PRICE_MXN
        } else if (emergingMarkets.includes(country)) {
            // Emergentes: $20 MXN convertido a USD
            let usdToMxnRate = 16.50
            try {
                const response = await fetch(EXCHANGE_API, {
                    next: { revalidate: 3600 }
                })
                if (response.ok) {
                    const data = await response.json()
                    usdToMxnRate = 1 / data.rates.USD
                }
            } catch (error) {
                console.warn('Error fetching exchange rate, using fallback:', error)
            }
            const calculatedPrice = BASE_PRICE_MXN / usdToMxnRate
            price = Math.max(calculatedPrice, MIN_PRICE_EMERGING)
            price = Math.round(price * 100) / 100
            tierName = 'standard'
            priceInMXN = BASE_PRICE_MXN
            currency = 'USD'
        } else {
            // Desarrollados: $4.99 USD fijo
            price = PREMIUM_PRICE_USD
            tierName = 'premium'
            priceInMXN = 0 // Precio directo en USD
            currency = 'USD'
        }

        const packages = [
            {
                id: `pkg_${tierName}_monthly`,
                name: 'Crédito Mensual',
                credits: 1,
                price: price,
                currency: currency,
                priceInMXN: priceInMXN,
                discountPercent: 0
            }
        ]

        return NextResponse.json(packages)

    } catch (error) {
        console.error('Error al obtener paquetes:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
