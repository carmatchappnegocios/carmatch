import { describe, it, expect } from 'vitest'
import { generateSlug, generateVehicleSlug, generateBusinessSlug } from '../slug'

describe('generateSlug', () => {
    it('converts text to slug', () => {
        expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('removes accents', () => {
        expect(generateSlug('Ciudad de México')).toBe('ciudad-de-mexico')
        expect(generateSlug('Taller de Rubén')).toBe('taller-de-ruben')
    })

    it('removes special characters', () => {
        expect(generateSlug('Taller & Co!')).toBe('taller-co')
        expect(generateSlug('Auto (usado)')).toBe('auto-usado')
    })

    it('handles multiple spaces', () => {
        expect(generateSlug('Hello   World')).toBe('hello-world')
    })

    it('trims leading/trailing hyphens', () => {
        expect(generateSlug(' hello world ')).toBe('hello-world')
    })

    it('handles empty string', () => {
        expect(generateSlug('')).toBe('')
    })
})

describe('generateVehicleSlug', () => {
    it('generates vehicle slug with all fields', () => {
        expect(generateVehicleSlug('Toyota', 'Tacoma', 2022, 'Juárez'))
            .toBe('toyota-tacoma-2022-juarez')
    })

    it('handles null city', () => {
        expect(generateVehicleSlug('Honda', 'Civic', 2023, null))
            .toBe('honda-civic-2023')
    })

    it('normalizes brand and model', () => {
        expect(generateVehicleSlug('MERCEDES-BENZ', 'Clase C', 2024, 'CDMX'))
            .toBe('mercedes-benz-clase-c-2024-cdmx')
    })
})

describe('generateBusinessSlug', () => {
    it('generates business slug', () => {
        expect(generateBusinessSlug('Taller El Rayo', 'Juárez'))
            .toBe('taller-el-rayo-juarez')
    })

    it('normalizes business name', () => {
        expect(generateBusinessSlug('AUTO LAVADO EXPRESS', 'Monterrey'))
            .toBe('auto-lavado-express-monterrey')
    })
})
