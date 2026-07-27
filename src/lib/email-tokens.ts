import crypto from 'crypto'
import { prisma } from '@/lib/db'

const TOKEN_EXPIRY_HOURS = 24

export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

export async function createVerificationToken(email: string): Promise<string> {
    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    })

    const token = generateVerificationToken()
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    })

    return token
}

export async function verifyToken(token: string): Promise<string | null> {
    const record = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!record) return null
    if (record.expires < new Date()) {
        await prisma.verificationToken.delete({ where: { token } })
        return null
    }

    // Delete the token after use
    await prisma.verificationToken.delete({ where: { token } })

    return record.identifier // returns the email
}
