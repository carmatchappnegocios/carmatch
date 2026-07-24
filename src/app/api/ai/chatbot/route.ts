import { NextRequest, NextResponse } from 'next/server'
import { safeGenerateContent, safeExtractJSON } from '@/lib/ai/geminiClient'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { interpretSearchQuery } from '@/lib/ai/searchInterpreter'
import { buildVehicleQuery, buildBusinessQuery } from '@/lib/ai/searchQueryBuilder'

export async function POST(req: NextRequest) {
    try {
        const { message, history, city } = await req.json()
        const session = await auth()
        const userId = session?.user?.id

        if (!message) {
            return NextResponse.json({ error: 'Mensaje es requerido' }, { status: 400 })
        }

        // 1. Interpretar la búsqueda usando el Orquestador AI
        const intent = await interpretSearchQuery(message, 'MARKET', city)
        
        let foundResults: any[] = []
        let searchType: 'VEHICLE' | 'BUSINESS' = intent.isBusinessSearch ? 'BUSINESS' : 'VEHICLE'

        // 2. Realizar búsqueda real en la base de datos
        if (searchType === 'VEHICLE') {
            const where = buildVehicleQuery(intent)
            foundResults = await prisma.vehicle.findMany({
                where,
                take: 10, // 🚀 UPGRADE: Más opciones para el asesor
                select: {
                    title: true,
                    brand: true,
                    model: true,
                    year: true,
                    price: true,
                    city: true,
                    condition: true,
                    mileage: true
                }
            })
        } else {
            const where = buildBusinessQuery(intent)
            foundResults = await prisma.business.findMany({
                where,
                take: 10, // 🚀 UPGRADE: Más opciones para el asesor
                select: {
                    name: true,
                    category: true,
                    city: true,
                    services: true,
                    address: true
                }
            })
        }

        const resultsSummary = foundResults.length > 0
            ? foundResults.map(r => 
                searchType === 'VEHICLE' 
                ? `- ${r.title} (${r.year}, ${r.condition || 'Usado'}): $${r.price} MXN en ${r.city}. ${r.mileage ? `Kilometraje: ${r.mileage}km` : ''}`
                : `- ${r.name} (${r.category}) en ${r.city}: ${r.services?.slice(0,3).join(', ')}. Ubicación: ${r.address}`
              ).join('\n')
            : "No se encontraron resultados exactos en este momento."

        // 3. Generar respuesta final con contexto de resultados reales
        const prompt = `Actúa como el "SÚPER ASESOR MAESTRO" de la red social CarMatch. 
Eres un experto absoluto de nivel mundial en la industria automotriz.

**RESULTADOS REALES ENCONTRADOS:**
${resultsSummary}

**INTENCIÓN DETECTADA:**
${JSON.stringify(intent)}

**REGLAS DE ORO (ESTRICTAS):**
1. **DOMINIO EXCLUSIVO**: Habla solo de vehículos terrestres y servicios automotrices.
2. **PERSONALIDAD**: Eres profesional, experto, entusiasta y apasionado.
3. **MENCIÓN DE RESULTADOS**: Si hay resultados, menciónalos de forma natural y entusiasta. Si hay muchos, destaca los 2 o 3 mejores.
4. **RAZONAMIENTO**: Utiliza el 'aiReasoning' detectado para conectar emocionalmente con el usuario.
5. **MODO CONTROL REMOTO**:
    - Usa "MARKET_FILTER" si el usuario busca vehículos.
    - Usa "MAP_SEARCH" si busca servicios/talleres.

**HISTORIAL RECIENTE:**
${history?.map((h: any) => `${h.sender === 'user' ? 'Usuario' : 'Asesor'}: ${h.text}`).join('\n')}

**MENSAJE DEL USUARIO:**
"${message}"

**FORMATO DE RESPUESTA (JSON):**
{
  "response": "Tu respuesta breve, entusiasta y experta aquí",
  "command": {
    "type": "MARKET_FILTER" | "MAP_SEARCH" | "NONE",
    "params": { 
        "brand": "string", "model": "string", "minPrice": number, "maxPrice": number, 
        "category": "string", "lat": number, "lng": number, "zoom": number,
        "search": "string"
    }
  },
  "actionLink": "/path" (ej: "/market" o "/map-store")
}

Responde ÚNICAMENTE con el JSON solicitado.`

        const { geminiFlashConversational } = await import('@/lib/ai/geminiClient')
        const response = await safeGenerateContent(prompt, 5, geminiFlashConversational)
        const responseText = response.text()

        const aiResponse = safeExtractJSON<{ response: string, command?: any, actionLink?: string }>(responseText)

        if (!aiResponse) {
            return NextResponse.json({
                response: "Estoy analizando las mejores opciones para ti. ¿Podrías ser un poco más específico?",
                command: { type: "NONE" }
            })
        }

        return NextResponse.json(aiResponse)

    } catch (error) {
        console.error('Error en Chatbot AI:', error)
        return NextResponse.json({
            response: "Lo siento, mi sistema de asesoría experto está en mantenimiento.",
            command: { type: "NONE" }
        }, { status: 500 })
    }
}
