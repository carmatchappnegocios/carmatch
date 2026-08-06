import { describe, it, expect } from 'vitest'
import { validateAndNormalizeEmail, isDisposableEmail } from '../email-validation'

describe('validateAndNormalizeEmail', () => {
    it('accepts valid email', () => {
        const result = validateAndNormalizeEmail('user@example.com')
        expect(result.valid).toBe(true)
        expect(result.normalized).toBe('user@example.com')
    })

    it('normalizes to lowercase', () => {
        const result = validateAndNormalizeEmail('USER@EXAMPLE.COM')
        expect(result.valid).toBe(true)
        expect(result.normalized).toBe('user@example.com')
    })

    it('trims whitespace', () => {
        const result = validateAndNormalizeEmail('  user@example.com  ')
        expect(result.valid).toBe(true)
        expect(result.normalized).toBe('user@example.com')
    })

    it('rejects empty email', () => {
        const result = validateAndNormalizeEmail('')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Email es requerido')
    })

    it('rejects too short email', () => {
        const result = validateAndNormalizeEmail('a@b')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Email demasiado corto')
    })

    it('rejects email without dot in domain', () => {
        const result = validateAndNormalizeEmail('user@localhost')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Dominio inválido')
    })

    it('rejects invalid format', () => {
        const result = validateAndNormalizeEmail('not-an-email')
        expect(result.valid).toBe(false)
    })

    it('accepts complex valid emails', () => {
        expect(validateAndNormalizeEmail('test+tag@example.co.uk').valid).toBe(true)
        expect(validateAndNormalizeEmail('user.name@domain.com').valid).toBe(true)
        expect(validateAndNormalizeEmail('user-name@domain.com').valid).toBe(true)
    })
})

describe('isDisposableEmail', () => {
    it('detects disposable emails', () => {
        expect(isDisposableEmail('test@mailinator.com')).toBe(true)
        expect(isDisposableEmail('test@guerrillamail.com')).toBe(true)
        expect(isDisposableEmail('test@tempmail.com')).toBe(true)
        expect(isDisposableEmail('test@yopmail.com')).toBe(true)
    })

    it('allows normal emails', () => {
        expect(isDisposableEmail('user@gmail.com')).toBe(false)
        expect(isDisposableEmail('user@hotmail.com')).toBe(false)
        expect(isDisposableEmail('user@outlook.com')).toBe(false)
    })
})
