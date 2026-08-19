import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, RATE_LIMITS } from '../rate-limit'

describe('checkRateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
    })

    it('allows requests under the limit', () => {
        const config = { windowMs: 60000, max: 3 }
        const key = 'test-under-limit'

        const r1 = checkRateLimit(key, config)
        expect(r1.allowed).toBe(true)
        expect(r1.remaining).toBe(2)

        const r2 = checkRateLimit(key, config)
        expect(r2.allowed).toBe(true)
        expect(r2.remaining).toBe(1)

        const r3 = checkRateLimit(key, config)
        expect(r3.allowed).toBe(true)
        expect(r3.remaining).toBe(0)
    })

    it('blocks requests over the limit', () => {
        const config = { windowMs: 60000, max: 2 }
        const key = 'test-over-limit'

        checkRateLimit(key, config)
        checkRateLimit(key, config)

        const blocked = checkRateLimit(key, config)
        expect(blocked.allowed).toBe(false)
        expect(blocked.remaining).toBe(0)
    })

    it('resets after window expires', () => {
        const config = { windowMs: 60000, max: 2 }
        const key = 'test-reset'

        checkRateLimit(key, config)
        checkRateLimit(key, config)

        const blocked = checkRateLimit(key, config)
        expect(blocked.allowed).toBe(false)

        vi.advanceTimersByTime(61000)

        const afterReset = checkRateLimit(key, config)
        expect(afterReset.allowed).toBe(true)
        expect(afterReset.remaining).toBe(1)
    })

    it('returns correct resetAt timestamp', () => {
        const config = { windowMs: 30000, max: 5 }
        const key = 'test-resetAt'

        const result = checkRateLimit(key, config)
        expect(result.resetAt).toBe(Date.now() + 30000)
    })

    it('tracks different keys independently', () => {
        const config = { windowMs: 60000, max: 1 }

        checkRateLimit('key-a', config)
        const a = checkRateLimit('key-a', config)
        expect(a.allowed).toBe(false)

        const b = checkRateLimit('key-b', config)
        expect(b.allowed).toBe(true)
    })

    it('uses predefined RATE_LIMITS configs', () => {
        expect(RATE_LIMITS.register.max).toBe(5)
        expect(RATE_LIMITS.login.max).toBe(10)
        expect(RATE_LIMITS.aiSearch.max).toBe(10)
        expect(RATE_LIMITS.aiDeepSearch.max).toBe(5)
        expect(RATE_LIMITS.aiValidate.max).toBe(20)
    })
})
