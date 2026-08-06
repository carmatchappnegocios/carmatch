import { describe, it, expect } from 'vitest'
import { getPricingForCountry } from '../pricing'

describe('getPricingForCountry', () => {
    it('returns USD for developed countries', () => {
        const us = getPricingForCountry('US')
        expect(us.currency).toBe('USD')
        expect(us.pricePerCredit).toBe(4.99)
        expect(us.region).toBe('developed')
    })

    it('returns MXN for Mexico', () => {
        const mx = getPricingForCountry('MX')
        expect(mx.currency).toBe('MXN')
        expect(mx.pricePerCredit).toBe(20)
        expect(mx.region).toBe('developing')
    })

    it('returns MXN for Colombia', () => {
        const co = getPricingForCountry('CO')
        expect(co.currency).toBe('MXN')
        expect(co.pricePerCredit).toBe(20)
    })

    it('returns USD for European countries', () => {
        const de = getPricingForCountry('DE')
        expect(de.currency).toBe('USD')
        expect(de.pricePerCredit).toBe(4.99)

        const es = getPricingForCountry('ES')
        expect(es.currency).toBe('USD')
        expect(es.pricePerCredit).toBe(4.99)
    })

    it('returns USD for Japan', () => {
        const jp = getPricingForCountry('JP')
        expect(jp.currency).toBe('USD')
        expect(jp.pricePerCredit).toBe(4.99)
    })

    it('returns MXN for Argentina', () => {
        const ar = getPricingForCountry('AR')
        expect(ar.currency).toBe('MXN')
        expect(ar.pricePerCredit).toBe(20)
    })

    it('is case insensitive', () => {
        const lower = getPricingForCountry('us')
        expect(lower.currency).toBe('USD')

        const upper = getPricingForCountry('US')
        expect(upper.currency).toBe('USD')
    })
})
