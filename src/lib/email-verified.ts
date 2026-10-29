import { prisma } from '@/lib/db'

/**
 * Check if a user's email is verified.
 * Returns true if verified, false otherwise.
 * Google-authenticated users are automatically considered verified.
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true, isAdmin: true, accounts: { select: { provider: true }, take: 1 } }
    })

    if (!user) return false

    // 👑 Admins (incluye la cuenta del panel que entra por palabra clave + PIN) son de
    // confianza: no requieren verificación de email. Así el colaborador puede publicar
    // sin tener acceso al correo de Gmail del admin.
    if (user.isAdmin) return true

    // Google-authenticated users are automatically verified
    if (user.accounts.some(a => a.provider === 'google')) return true

    return user.emailVerified !== null
}
