// RFC 5322 compliant email validation (simplified but comprehensive)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Known disposable email domains (top offenders)
const DISPOSABLE_DOMAINS = new Set([
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'trashmail.com', 'fakeinbox.com', 'sharklasers.com',
    'guerrillamailblock.com', 'grr.la', 'dispostable.com', '10minutemail.com',
    'maildrop.cc', 'temp-mail.org', 'tempr.email', 'getnada.com',
    'mohmal.com', 'burnermail.io', 'harakirimail.com', 'mailnesia.com',
    'tempail.com', 'discard.email', 'discardmail.com', 'mailcatch.com',
    'tmpmail.net', 'tmpmail.org', 'tempmailo.com', 'temp-mail.ru',
])

export interface EmailValidationResult {
    valid: boolean
    normalized: string
    error?: string
}

export function validateAndNormalizeEmail(email: string): EmailValidationResult {
    if (!email || typeof email !== 'string') {
        return { valid: false, normalized: '', error: 'Email es requerido' }
    }

    // Normalize: trim + lowercase
    const normalized = email.trim().toLowerCase()

    // Length check
    if (normalized.length < 5) {
        return { valid: false, normalized, error: 'Email demasiado corto' }
    }
    if (normalized.length > 254) {
        return { valid: false, normalized, error: 'Email demasiado largo' }
    }

    // Format check
    if (!EMAIL_REGEX.test(normalized)) {
        return { valid: false, normalized, error: 'Formato de email inválido' }
    }

    // Local part max 64 chars
    const [localPart, domain] = normalized.split('@')
    if (localPart.length > 64) {
        return { valid: false, normalized, error: 'Email demasiado largo' }
    }

    // Domain must have at least one dot
    if (!domain.includes('.')) {
        return { valid: false, normalized, error: 'Dominio inválido' }
    }

    // TLD must be at least 2 chars
    const tld = domain.split('.').pop() || ''
    if (tld.length < 2) {
        return { valid: false, normalized, error: 'Dominio inválido' }
    }

    return { valid: true, normalized }
}

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]
    return DISPOSABLE_DOMAINS.has(domain)
}
