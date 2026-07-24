import { NextRequest, NextResponse } from 'next/server'
import { safeGenerateContent, safeExtractJSON } from '@/lib/ai/geminiClient'
import { VEHICLE_CATEGORIES, BRANDS, COLORS, TRANSMISSIONS, FUELS } from '@/lib/vehicleTaxonomy'
import { DIAGNOSTICS_DB } from '@/lib/ai/diagnosticsDB'

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        console.log('🔍 [AI Search] Query recibido:', query)


        // ⚠️ CRITICAL: DO NOT MODIFY PROMPT. IT DEFINES THE "BRAIN TRUST" LOGIC.
        const prompt = `Actúa como un COMITÉ DE EXPERTOS EN AUTOMOCIÓN ("The CarMatch Brain Trust").
Tu objetivo es traducir el lenguaje natural del usuario a filtros técnicos PRECISOS, usando un proceso de pensamiento de 3 pasos (Cadena de Pensamiento).

**TU EQUIPO INTERNO:**
1.  🕵️ **EL ANALISTA (Agente 1):** Extrae datos crudos y slang (ej: "Troca", "Nave", "Para el jale").
2.  ⚖️ **EL SUPERVISOR (Agente 2):** **CRÍTICO.** Su misión es evitar errores de categoría. Si el usuario dice "carro", DEBE rechazar "Pickup" o "SUV". Si dice "troca", DEBE rechazar "Sedán".
3.  ✅ **EL ESTRATEGA (Agente 3):** Genera el JSON final validado.

**CONTEXTO TÉCNICO:**
- Categorías: ${Object.keys(VEHICLE_CATEGORIES).join(', ')}
- Tipos: ${Array.from(new Set(Object.values(VEHICLE_CATEGORIES).flat())).join(', ')}
- Marcas: ${Array.from(new Set(Object.values(BRANDS).flat())).slice(0, 50).join(', ')}...
- Transmisiones: ${TRANSMISSIONS.join(', ')}
- Combustibles: ${FUELS.join(', ')}
- Colors: ${COLORS.join(', ')}

**REGLAS DE NEGOCIO (EL LIBRO DE LA VERDAD):**
1.  **Semántica Regional y Desambiguación:**
    Usa este diccionario para traducir términos:
    ${JSON.stringify(DIAGNOSTICS_DB.SLANG_MAPPING, null, 2)}
    
    **REGLA DE ORO DE CATEGORÍAS:**
    - "Carro" / "Coche" / "Nave" -> \`vehicleType\`: Sedán, Hatchback, Coupe o Deportivo. (NUNCA SUV ni Pickup).
    - "Camioneta" -> \`vehicleType\`: SUV, Minivan o Pickup.
    - "Troca" / "De trabajo" / "Mamalona" -> \`vehicleType\`: Pickup o Camión.
    - "Familiar" -> \`vehicleType\`: SUV o Minivan.
    
2.  **Precios Inteligentes:**
    - "Barato/Económico": $0 - $200,000 MXN.
    - "Lujo/Caro": $800,000+ MXN.
3.  **Antigüedad:** "Nuevo" >= ${new Date().getFullYear()}. "Viejo" <= 2012.
4.  **Inferencia de Intención:**
    - "Para la carga" / "Para el jale" -> \`vehicleType\`: Pickup, traction: "4x4 (4WD)" (si se sugiere).
    - "Sin fallas" -> Filtrar mentalmente para evitar modelos con problemas conocidos (aunque el filtro SQL sea por atributos).

**FORMATO DE RESPUESTA (JSON PURO):**
{
    "category": "Automóvil | Motocicleta | Camión | Maquinaria | Especial",
    "vehicleType": "Sedán | SUV | Pickup | Coupe | Hatchback | ...",
    "brand": "Toyota | Ford | ...",
    "model": "Camry | Lobo | ...",
    "minPrice": number, "maxPrice": number,
    "minYear": number, "maxYear": number,
    "transmission": "Automática | Manual",
    "fuel": "Gasolina | Diesel | Híbrido | Eléctrico",
    "traction": "Delantera (FWD) | Trasera (RWD) | 4x4 (4WD) | Integral (AWD)",
    "color": "Blanco | Negro | Rojo | ...",
    "cylinders": number,
    "features": ["string"],
    "explanation": "Confirmación experta: 'Analizando búsqueda de [intención]... Aplicando filtros para [tipo]..."
}

**QUERY DEL USUARIO:**
"${query}"

**PROCESO DE PENSAMIENTO INTERNO (EL COMITÉ):**
1. Analista: Extraigo [términos detectados].
2. Supervisor: Valido que "[término]" no se confunda con otra categoría. Corrijo si es necesario.
3. Estratega: Construyo JSON final para "${query}".

Responde SOLO con el JSON del Estratega. No incluyas markdown.`

        // ✅ Flash para búsquedas (rápido y eficiente)
        // Usamos importación dinámica compatible o fallback a estática si es necesario
        // Pero para asegurar que no sea undefined, mejor importamos arriba o usamos el default de safeGenerateContent

        console.log('🤖 [AI Search] Preparando llamada a Gemini...')

        // safeGenerateContent usa geminiFlash por defecto si no se pasa modelo
        // Así que podemos simplificar y evitar problemas de importación
        const response = await safeGenerateContent(prompt, 5);
        // const { geminiFlash } = await import('@/lib/ai/geminiClient'); // Eliminado por riesgo de undefined

        const responseText = response.text()
        console.log('✅ [AI Search] Respuesta Raw:', responseText.substring(0, 500))

        const aiResponse = safeExtractJSON<any>(responseText)
        console.log('📊 [AI Search] Parsed Filters:', JSON.stringify(aiResponse, null, 2))


        if (!aiResponse) {
            return NextResponse.json({ error: 'AI Error: Invalid filters' }, { status: 500 })
        }

        return NextResponse.json(aiResponse)

    } catch (error: any) {
        console.error('❌ [AI Search Crash]:', error)
        // 🚨 DEBUG: Exposing error details to client to diagnose production issue
        return NextResponse.json({
            error: 'AI Search Failed',
            details: error.message || String(error),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
