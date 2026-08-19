import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../sanitize'

describe('escapeHtml', () => {
    it('escapes < and > characters', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
    })

    it('escapes double quotes', () => {
        expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
    })

    it('escapes single quotes', () => {
        expect(escapeHtml("it's")).toBe('it&#x27;s')
    })

    it('escapes ampersands', () => {
        expect(escapeHtml('A & B')).toBe('A &amp; B')
    })

    it('passes through normal text unchanged', () => {
        expect(escapeHtml('hello world')).toBe('hello world')
    })

    it('handles empty string', () => {
        expect(escapeHtml('')).toBe('')
    })

    it('handles nested HTML tags', () => {
        expect(escapeHtml('<div><span>test</span></div>')).toBe(
            '&lt;div&gt;&lt;span&gt;test&lt;/span&gt;&lt;/div&gt;'
        )
    })
})
