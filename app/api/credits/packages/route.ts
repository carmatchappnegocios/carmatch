import { NextRequest, NextResponse } from 'next/server'
import { BASE_PRICE_MXN, PREMIUM_PRICE_USD, EMERGING_MARKETS, EXCHANGE_API, MIN_PRICE_EMERGING, MIN_PRICE_PREMIUM } from '@/lib/pricing'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const country = searchParams.get('country') || 'MX'

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
        } else if (EMERGING_MARKETS.includes(country as typeof EMERGING_MARKETS[number])) {
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
