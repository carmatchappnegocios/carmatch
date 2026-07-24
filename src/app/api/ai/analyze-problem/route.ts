// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { safeGenerateContent, safeExtractJSON } from '@/lib/ai/geminiClient'
import aiCache from '@/lib/ai/aiCache' // 💰 Sistema de caché para reducir costos
import { DIAGNOSTICS_DB } from '@/lib/ai/diagnosticsDB'

export async function POST(req: NextRequest) {
    try {
        const { query, categories, history, userCity } = await req.json()

        if (!query || !categories) {
            return NextResponse.json(
                { error: 'Query y categories son requeridos' },
                { status: 400 }
            )
        }

        // 🚀 PASO 1: Intentar obtener del caché (incluimos ciudad en la clave)
        const cacheKey = `${query}_${userCity || 'no_city'}`;
        const cachedResult = aiCache.get(cacheKey, 'MAP_PROBLEM');
        if (cachedResult) {
            console.log(`⚡ [CACHE HIT] Diagnóstico recuperado del caché. $0 gastados.`);
            return NextResponse.json(cachedResult);
        }

        // Prompt de análisis automático mejorado para el "Agente Vivo"
        const prompt = `
            # ERES EL "GURÚ DE SERVICIOS" VIVO DE CARMATCH SOCIAL.
            Tu misión es diagnosticar el problema del usuario y encontrar el negocio/categoría ideal en el mapa de nuestro **MapStore**.
            
            **VISIÓN CARMATCH:** Ecosistema de 3 Feeds donde cualquier usuario puede registrarse: **CarMatch Social** (comunidad), **MapStore** (servicios y puestos de reunión seguros) y **MarketCar** (compra/venta de todo tipo de vehículos). Los negocios en el mapa son TERCEROS independientes.

            ## UBICACIÓN DE REFERENCIA:
            - Ciudad del Usuario: "${userCity || 'México'}"

            ## CONOCIMIENTO PROFESIONAL (BIBLIA DEL MECÁNICO):
            Usa esta base de datos para identificar fallas específicas basadas en los síntomas del usuario:
            ${JSON.stringify(DIAGNOSTICS_DB, null, 2)}

            ## REGLAS DE ORO DE DIAGNÓSTICO:
            1. **RESILIENCIA TOTAL:** Si escribe mal ("tayer", "balatas", "chirreido"), entiéndelo y corrígelo.
            2. **DIAGNÓSTICO EXPERTO:** Si el síntoma coincide con una falla de la "Biblia", menciónala en tu "explanation" con autoridad, pero aclara que es una probabilidad y que debe ser revisada por un experto.
            3. **MAPEO DE CATEGORÍAS:**
               - Ruido motor/no arranca -> [mecanico]
               - Choque/golpe/pintura -> [estetica]
               - Ponchadura/vibración -> [llantas]
               - Luces/batería -> [electrico]
            4. **FILTROS INMEDIATOS:** SIEMPRE rellena el array de "categories" para que el mapa se actualice al instante.
            5. **TONO PROFESIONAL:** Eres un experto que inspira confianza y llega al alma del usuario resolviendo su angustia.
            6. **PRÓXIMA PREGUNTA:** Si isConversational es true, asegúrate de que la "nextQuestion" sea amable y termine preguntando si los resultados que ya se ven en el mapa son los que buscaba.
            7. **EFICIENCIA:** No des vueltas. Si el usuario es directo, devuelve las categorías inmediatamente.

            ## TAXONOMÍA DE CATEGORÍAS (Grounding Real):
            ${categories.map((cat: any) => `- [${cat.id}] "${cat.label}"`).join('\n')}

            ## FORMATO DE RESPUESTA (JSON PURO):
            {
                "isConversational": boolean,
                "nextQuestion": "Pregunta corta si isConversational is true",
                "categories": ["ID_DE_CATEGORIA_1"],
                "explanation": "Explicación experta y empática mencionando la ciudad.",
                "isDeepSearch": boolean,
                "focus": { "lat": number, "lng": number, "zoom": number },
                "selectedBusinessId": "string (opcional si identificas un negocio específico)"
            }

            ## QUERY ACTUAL DEL USUARIO:
            "${query}"
        `;
        
        const finalPrompt = prompt + "\nResponde SOLO con el JSON final.";

        console.log('🤖 Consultando Asesor Experto para:', query)
        const { geminiPro } = await import('@/lib/ai/geminiModels');
        const response = await safeGenerateContent(finalPrompt, 3, geminiPro);
        const responseText = response.text()
        const aiResponse = safeExtractJSON<any>(responseText)

        if (!aiResponse) {
            throw new Error('Invalid AI response format')
        }

        // 🛡️ REFUERZO: Asegurar que las categorías devueltas existan en nuestra taxonomía
        const validIds = new Set(categories.map((c: any) => c.id));
        if (aiResponse.categories) {
            aiResponse.categories = aiResponse.categories.filter((id: string) => validIds.has(id));
        }

        // 💾 PASO FINAL: Guardar en caché
        aiCache.set(query, aiResponse, 'MAP_PROBLEM');
        return NextResponse.json(aiResponse)

    } catch (error) {
        console.error('API Analyze Problem Error:', error)
        return NextResponse.json({
            categories: [],
            explanation: "No pude analizar tu problema. Intenta ser más específico.",
            isConversational: false
        }, { status: 500 })
    }
}
