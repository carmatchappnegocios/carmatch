// Rate limiter using globalThis (persists across invocations in same Vercel instance)
// Falls back gracefully: each serverless instance has its own map, but within
// an instance the limits are enforced correctly.

const globalForRateLimit = globalThis as unknown as {
    rateLimitMap: Map<string, { count: number; resetAt: number }>
    cleanupScheduled: boolean
}

if (!globalForRateLimit.rateLimitMap) {
    globalForRateLimit.rateLimitMap = new Map()
}

if (!globalForRateLimit.cleanupScheduled) {
    globalForRateLimit.cleanupScheduled = true
    // Cleanup expired entries every 5 minutes
    const intervalId = setInterval(() => {
        const now = Date.now()
        const map = globalForRateLimit.rateLimitMap
        for (const [key, value] of map) {
            if (now > value.resetAt) {
                map.delete(key)
            }
        }
    }, 5 * 60 * 1000)
    // Allow Node.js to exit even if interval is pending
    if (intervalId.unref) intervalId.unref()
}

const rateLimitMap = globalForRateLimit.rateLimitMap

export interface RateLimitConfig {
    windowMs: number    // Time window in milliseconds
    max: number         // Max requests per window
}

export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, {
            count: 1,
            resetAt: now + config.windowMs,
        })
        return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs }
    }

    if (entry.count >= config.max) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt }
}

export const RATE_LIMITS = {
    register: { windowMs: 15 * 60 * 1000, max: 5 },
    login: { windowMs: 15 * 60 * 1000, max: 10 },
    verifyEmail: { windowMs: 60 * 60 * 1000, max: 3 },
    aiSearch: { windowMs: 60 * 1000, max: 10 },
    aiDeepSearch: { windowMs: 60 * 1000, max: 5 },
    aiAnalyze: { windowMs: 60 * 1000, max: 10 },
    aiValidate: { windowMs: 60 * 1000, max: 20 },
}
