interface PasswordResetEntry {
    token: string
    userId: string
    expiresAt: number
}

const passwordResetTokens = new Map<string, PasswordResetEntry>()

const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export { passwordResetTokens, TOKEN_EXPIRY_MS }
export type { PasswordResetEntry }
