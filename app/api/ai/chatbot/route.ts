import { NextRequest, NextResponse } from 'next/server'
import { safeGenerateContent, safeExtractJSON } from '@/lib/ai/geminiClient'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { interpretSearchQuery } from '@/lib/ai/searchInterpreter'
import { buildVehicleQuery, buildBusinessQuery } from '@/lib/ai/searchQueryBuilder'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const REPORT_KEYWORDS = ['reportar', 'denunciar', 'bloquear', 'perfil falso', 'estafa', 'fraude', 'scam', 'fake', 'spam', 'acoso', 'harassment', 'abuse', 'malicious', 'malicioso', 'sospechoso', 'suplantación', 'robo', 'perdida']

function isReportIntent(message: string): boolean {
    const lower = message.toLowerCase()
    return REPORT_KEYWORDS.some(kw => lower.includes(kw))
}

export async function POST(req: NextRequest) {
    try {
        const { message, history, city } = await req.json()
        const session = await auth()
        const userId = session?.user?.id

        if (!message) {
            return NextResponse.json({ error: 'Mensaje es requerido' }, { status: 400 })
        }

        // Rate limit: 20 requests per minute per user
        if (userId) {
            const rl = checkRateLimit(`chatbot:${userId}`, { windowMs: 60000, max: 20 })
            if (!rl.allowed) {
                return NextResponse.json({ error: 'Demasiadas peticiones. Espera un momento.' }, { status: 429 })
            }
        }

        const lowerMessage = message.toLowerCase()

        // Check if this is a report intent
        if (isReportIntent(lowerMessage)) {
            // Check if there's enough info to create a report
            const reportPrompt = `Eres el equipo de soporte de CarMatch. Un usuario quiere reportar un perfil o situación.

MENSAJE DEL USUARIO: "${message}"

Analiza el mensaje y extrae:
1. El motivo del reporte (estafa, perfil falso, acoso, spam, etc.)
2. Si menciona un usuario específico o URL
3. Una descripción breve del problema

FORMATO JSON:
{
  "reason": "categoría del reporte (FRAUD, FAKE_PROFILE, HARASSMENT, SPAM, OTHER)",
  "description": "descripción breve extraída del mensaje",
  "targetUser": "nombre o URL del usuario reportado si se menciona",
  "needsMoreInfo": true/false,
  "response": "Mensaje amable al usuario explicando que vamos a investigar y pidiendo más detalles si es necesario"
}`

            const aiResponse = await safeGenerateContent(reportPrompt, 3, 'FLASH')
            const reportData = safeExtractJSON<{
                reason: string
                description: string
                targetUser?: string
                needsMoreInfo: boolean
                response: string
            }>(aiResponse.text())

            if (reportData && !reportData.needsMoreInfo && userId) {
                // Create the report
                const report = await prisma.report.create({
                    data: {
                        reporterId: userId,
                        reason: reportData.reason,
                        description: reportData.description,
                        status: 'PENDING'
                    }
                })

                console.log(`[REPORT] Report ${report.id} created by ${userId}: ${reportData.reason}`)

                return NextResponse.json({
                    response: reportData.response + `\n\n📋 **Reporte #${report.id.slice(-6).toUpperCase()}** registrado. Nuestro equipo lo revisará pronto.`,
                    command: { type: 'NONE' }
                })
            }

            // Not enough info or AI decided to ask for more
            return NextResponse.json({
                response: reportData?.response || 'Entiendo que quieres reportar algo. ¿Podrías darme más detalles?\n\n📋 Por favor menciona:\n1. **¿Qué problema encontraste?** (estafa, perfil falso, acoso, spam)\n2. **¿Quién es el usuario?** (nombre o link)\n3. **¿Qué pasó exactamente?**',
                command: { type: 'NONE' }
            })
        }

        // Regular search/support flow
        const intent = await interpretSearchQuery(message, 'MARKET', city)
        
        let foundResults: any[] = []
        let searchType: 'VEHICLE' | 'BUSINESS' = intent.isBusinessSearch ? 'BUSINESS' : 'VEHICLE'

        if (searchType === 'VEHICLE') {
            const where = buildVehicleQuery(intent)
            foundResults = await prisma.vehicle.findMany({
                where,
                take: 10,
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
                take: 10,
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

        const prompt = `Actúa como el equipo de soporte y asesoría de CarMatch.
Eres un experto en vehículos, mecánica, compraventa, y resolver problemas de usuarios.

**RESULTADOS DE BÚSQUEDA (si los hay):**
${resultsSummary}

**INTENCIÓN DETECTADA:**
${JSON.stringify(intent)}

**REGLAS:**
1. Si busca vehículos o servicios, muéstrale resultados y da consejos.
2. Si pregunta sobre mecánica, mantenimiento, compraventa, seguro, etc., da CONSEJOS ÚTILES y ESPECÍFICOS.
3. Si tiene un problema técnico con la app, ayúdalo paso a paso.
4. Si quiere REPORTAR un perfil malicioso, guíalo para crear el reporte.
5. Puedes dar tips de: cómo vender más rápido, cómo cuidar tu auto, qué revisar al comprar, estimados de precio, etc.
6. Sé breve, profesional y útil. Usa emojis con moderación.

**HISTORIAL:**
${history?.map((h: any) => `${h.sender === 'user' ? 'Usuario' : 'Soporte'}: ${h.text}`).join('\n')}

**MENSAJE DEL USUARIO:**
"${message}"

**FORMATO JSON:**
{
  "response": "Tu respuesta aquí con consejos, tips o resultados",
  "command": { "type": "MARKET_FILTER" | "MAP_SEARCH" | "NONE", "params": {} },
  "actionLink": "/path" (opcional, ej: /market, /map)
}`

        const response = await safeGenerateContent(prompt, 5, 'FLASH')
        const responseText = response.text()

        const aiResponse = safeExtractJSON<{ response: string, command?: any, actionLink?: string }>(responseText)

        if (!aiResponse) {
            return NextResponse.json({
                response: "¡Hola! Soy tu asistente de CarMatch 🚗\n\nPuedo ayudarte con:\n🔍 **Buscar vehículos** — dime marca, modelo, precio\n🔧 **Consejos de mecánica** — qué revisar, cuándo cambiar aceite\n💰 **Tips para vender** — cómo publicar mejor y vender rápido\n📍 **Encontrar talleres** — busca en el mapa de servicios\n📋 **Reportar perfiles** — si ves algo sospechoso\n\n¿En qué te ayudo?",
                command: { type: "NONE" }
            })
        }

        return NextResponse.json(aiResponse)

    } catch (error) {
        console.error('Error en Chatbot:', error)
        return NextResponse.json({
            response: "Lo siento, hubo un error técnico. Intenta de nuevo en unos momentos.",
            command: { type: "NONE" }
        }, { status: 500 })
    }
}
