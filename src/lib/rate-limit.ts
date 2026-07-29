// Simple in-memory rate limiter (per-IP)
// For production, consider Redis-backed rate limiting

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap) {
        if (now > value.resetAt) {
            rateLimitMap.delete(key)
        }
    }
}, 5 * 60 * 1000)

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
        // New window
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

// Predefined rate limits
export const RATE_LIMITS = {
    register: { windowMs: 15 * 60 * 1000, max: 5 },       // 5 registrations per 15 min per IP
    login: { windowMs: 15 * 60 * 1000, max: 10 },          // 10 login attempts per 15 min per IP
    verifyEmail: { windowMs: 60 * 60 * 1000, max: 3 },     // 3 verification emails per hour per user
    aiSearch: { windowMs: 60 * 1000, max: 10 },            // 10 AI searches per minute per user
    aiDeepSearch: { windowMs: 60 * 1000, max: 5 },         // 5 deep searches per minute per user
    aiAnalyze: { windowMs: 60 * 1000, max: 10 },           // 10 AI analyses per minute per user
    aiValidate: { windowMs: 60 * 1000, max: 20 },          // 20 image validations per minute per user
}
