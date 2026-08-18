import { prisma } from '@/lib/db'

/**
 * Check if a user's email is verified.
 * Returns true if verified, false otherwise.
 * Google-authenticated users are automatically considered verified.
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true, accounts: { select: { provider: true }, take: 1 } }
    })

    if (!user) return false

    // Google-authenticated users are automatically verified
    if (user.accounts.some(a => a.provider === 'google')) return true

    return user.emailVerified !== null
}
