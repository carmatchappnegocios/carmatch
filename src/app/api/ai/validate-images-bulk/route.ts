import { NextRequest, NextResponse } from 'next/server'
import { analyzeMultipleImages } from '@/lib/ai/imageAnalyzer'

/**
 * Convierte una URL de imagen a base64
 */
async function urlToBase64(url: string): Promise<string> {
    let lastError;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
        try {
            // 🚀 OPTIMIZACIÓN CARMATCH: Si es URL de Cloudinary, pedir versión optimizada
            let fetchUrl = url
            if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('q_auto')) {
                fetchUrl = url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/')
            }

            console.log(`📡 Fetching image [Intento ${i + 1}]: ${fetchUrl === url ? 'Original' : 'Optimized'}...`)

            const response = await fetch(fetchUrl, { signal: AbortSignal.timeout(10000) }) // 10s timeout
            if (!response.ok) throw new Error(`HTTP ${response.status} fetching image`)

            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            return buffer.toString('base64')
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Error fetching image (${url}), reintentando...`, error);
            if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
        }
    }

    console.error('❌ Fallo definitivo al obtener imagen:', url, lastError)
    throw lastError || new Error(`Failed to fetch image from URL: ${url}`)
}

/**
 * Endpoint para analizar MÚLTIPLES imágenes del vehículo
 * POST /api/ai/validate-images-bulk
 * Body: { images: string[] } // Array de URLs de Cloudinary
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { images } = body

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: 'Se requiere un array de imágenes' }, { status: 400 })
        }

        // Convertir URLs de Cloudinary a base64 (una sola vez)
        console.log('🔄 Convirtiendo', images.length, 'URLs a base64...')
        const base64Images = await Promise.all(images.map(url => urlToBase64(url)))

        let lastResult = null;
        let lastError = null;
        const maxRetries = 5;

        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`🤖 Intento de validación AI ${i + 1}/${maxRetries}...`)
                
                const result = await analyzeMultipleImages(
                    base64Images,
                    body.type || 'VEHICLE',
                    body.context
                )

                // Si la IA respondió correctamente (sea válido o no), terminamos
                // (Solo reintentamos si hay un error técnico/excepción)
                return NextResponse.json(result)

            } catch (error: any) {
                lastError = error;
                const errorMsg = error.message?.toLowerCase() || '';
                
                // Si es un error de seguridad (bloqueo por Gemini), no reintentar
                if (errorMsg.includes("safety") || errorMsg.includes("blocked")) {
                   break;
                }

                console.warn(`⚠️ Error técnico en intento ${i + 1}:`, error.message)
                
                // Espera dinámica (backoff) antes de reintentar
                if (i < maxRetries - 1) {
                    const waitTime = Math.min(1000 * (i + 1), 5000);
                    await new Promise(r => setTimeout(r, waitTime));
                }
            }
        }

        // Si llegamos aquí es que fallaron todos los reintentos técnicos
        console.error('❌ Validación fallida tras 5 intentos:', lastError)
        
        return NextResponse.json({
            valid: false,
            reason: "⚠️ Error de red en la verificación. Por favor, intenta subir de nuevo tus fotos en unos segundos.",
            details: {},
            invalidIndices: [0] // Por seguridad, marcamos la portada como inválida para forzar revisión
        })

    } catch (error: any) {
        console.error('❌ Error crítico en endpoint bulk:', error)
        return NextResponse.json({
            valid: false,
            reason: "Error técnico crítico. Intenta con menos imágenes o fotos más ligeras.",
            details: {},
            invalidIndices: [0]
        })
    }
}
