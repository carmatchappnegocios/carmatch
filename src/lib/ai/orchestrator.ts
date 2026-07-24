// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.


import { geminiFlash, geminiPro, geminiFlashPrecise, geminiFlashConversational } from "./geminiModels";
import aiCache from "./aiCache";
import { parseNaturalSearch } from "../searchParser";
import { VEHICLE_CATEGORIES, BRANDS, COLORS, TRANSMISSIONS, FUELS } from "../vehicleTaxonomy";
import { DIAGNOSTICS_DB } from "./diagnosticsDB";

/**
 * 🎭 CARMATCH AI ORCHESTRATOR - Team Leader
 * "Servicio 7 Estrellas al Menor Costo"
 */

export type AIAgentRole = 'INTERPRETER' | 'MODERATOR' | 'SECURITY' | 'ANALYST' | 'ADVISOR';
export type AIEfficiencyLevel = 'LOCAL_FIRST' | 'FLASH_ONLY' | 'PRO_VERIFIED';

interface OrchestrationOptions {
    role: AIAgentRole;
    efficiency?: AIEfficiencyLevel;
    useCache?: boolean;
    context?: any;
}

class AIOrchestrator {
    /**
     * Procesa una tarea delegando al equipo de agentes según la cascada de eficiencia
     */
    async execute(task: string, options: OrchestrationOptions) {
        const { role, efficiency = 'LOCAL_FIRST', useCache = true, context = {} } = options;

        console.log(`🎭 [Orchestrator] Iniciando tarea: ${role} | Nivel: ${efficiency}`);

        // 🚀 NIVEL 1: HEURÍSTICA LOCAL (Costo $0)
        if (efficiency === 'LOCAL_FIRST' && role === 'INTERPRETER') {
            const localResult = parseNaturalSearch(task);
            if (Object.keys(localResult).length > 0) {
                console.log("✅ [Nivel 1] Resuelto localmente sin gastar tokens.");
                return {
                    source: 'LOCAL',
                    data: localResult,
                    confidence: 0.9
                };
            }
        }

        // 🚀 NIVEL 2: CACHÉ SEMÁNTICO (Costo ~$0)
        if (useCache) {
            const cached = aiCache.get(task, role);
            if (cached) {
                return {
                    source: 'CACHE',
                    data: cached,
                    confidence: 1.0
                };
            }
        }

        // 🚀 NIVEL 3: AGENTE FLASH (Costo Mínimo)
        try {
            const model = this.getModelForRole(role, 'FLASH');
            console.log(`⚡ [Nivel 3] Llamando a Agente Flash para ${role}`);

            const result = await model.generateContent(this.buildPrompt(task, role, context));
            const responseText = result.response.text();
            let data = this.parseJSON(responseText);

            // Fallback si el JSON es inválido o nulo
            if (!data) {
                console.warn(`⚠️ [Orchestrator] AI Flash falló al retornar JSON. Aplicando Nivel 4.`);
                return await this.verifyWithPro(task, null, role, context);
            }

            if (useCache) {
                aiCache.set(task, data, role);
            }

            // 🚀 NIVEL 4: VALIDACIÓN PRO (Solo si es indispensable)
            if (efficiency === 'PRO_VERIFIED' || (data && data.uncertainty > 0.7)) {
                return await this.verifyWithPro(task, data, role, context);
            }

            return {
                source: 'FLASH',
                data,
                confidence: 0.8
            };

        } catch (error) {
            console.error(`❌ Error en Nivel 3:`, error);
            // Fallback directo a Pro si Flash falla catastróficamente
            return await this.verifyWithPro(task, null, role, context);
        }
    }

    private getModelForRole(role: AIAgentRole, tier: 'FLASH' | 'PRO') {
        if (tier === 'PRO') return geminiPro;

        switch (role) {
            case 'INTERPRETER': return geminiFlashPrecise;
            case 'MODERATOR': return geminiFlashPrecise;
            case 'ANALYST': return geminiFlash;
            case 'ADVISOR': return geminiFlashConversational;
            default: return geminiFlash;
        }
    }

    private async verifyWithPro(task: string, flashData: any, role: AIAgentRole, context: any) {
        console.log(`👑 [Nivel 4] Agente PRO entrando a verificar (Servicio 7 Estrellas)`);
        const model = geminiPro;

        try {
            const proPrompt = `
                ERES EL AUDITOR SENIOR 7-ESTRELLAS DE CARMATCH.
                Tarea original: ${task}
                Resultado previo (posiblemente erróneo): ${JSON.stringify(flashData)}
                Contexto: ${JSON.stringify(context)}
                
                Tu trabajo es refinar el resultado para que sea PERFECTO y SIN ERRORES.
                Responde ÚNICAMENTE con el JSON final corregido.
            `;

            const result = await model.generateContent(proPrompt);
            const data = this.parseJSON(result.response.text());

            if (!data) {
                throw new Error("AI Pro falló al retornar JSON");
            }

            return {
                source: 'PRO',
                data,
                confidence: 1.0
            };
        } catch (e) {
            console.error("🚨 [CRITICAL] Fallo total del Orquestador (Flash & Pro fallaron):", e);
            // 🛡️ ÚLTIMA LÍNEA DE DEFENSA: Fallback estático para evitar crashes en el frontend
            return {
                source: 'FAILSAFE',
                data: this.getFailsafeData(role, task),
                confidence: 0
            };
        }
    }

    private getFailsafeData(role: AIAgentRole, task: string) {
        if (role === 'ADVISOR') {
            return { advisorTip: "¡Qué gran elección! Estoy de acuerdo contigo, CarMatch es la mejor opción para ti." };
        }
        if (role === 'INTERPRETER') {
            return { 
                aiReasoning: "Entendido, estoy buscando los mejores vehículos para ti.",
                uncertainty: 1.0
            };
        }
        return {};
    }

    private buildPrompt(task: string, role: AIAgentRole, context: any) {
        // Micro-prompting según rol
        if (role === 'ADVISOR') {
            return `
                ERES EL "GURÚ DE ESTILO DE VIDA" DE CARMATCH. 
                Contexto: ${JSON.stringify(context)}
                Usuario busca: "${task}"
                
                Tu tarea es dar un CONSEJO QUE LLEGUE AL ALMA del usuario, validando su elección basándote en su estilo de vida.
                - Si busca algo familiar: "¡Qué gran elección! La seguridad de los tuyos es lo primero, y esta nave es un búnker de confianza."
                - Si busca estatus/lujo: "¡Eso es todo! Te mereces una nave que grite éxito y te haga sentir el dueño de la ciudad."
                - Si busca aventura/trabajo: "¡Poder puro! Esta máquina no te va a dejar tirado ni en el lodo ni en el jale más pesado."
                - Si busca ahorro: "Inteligencia pura. Esta opción es la campeona del ahorro, ideal para que tu dinero rinda al máximo."
                
                Responde con un mensaje breve (máx 150 caracteres), empático y con mucha vibra positiva.
            `;
        }

        if (role === 'MODERATOR') {
            return `
                ERES EL "GUARDIÁN DE LA COMUNIDAD" DE CARMATCH. 
                Tu tarea es auditar publicaciones de vehículos para asegurar que cumplan con las reglas de la App Store y la seguridad de los usuarios.
                
                **REGLAS DE MODERACIÓN:**
                1. TOXICIDAD: Prohibido insultos, lenguaje de odio o discriminación.
                2. FRAUDE/SCAM: Detectar precios ABSURDOS (ej: $1 peso por un Ferrari). IMPORTANTE: Los precios desde $1,000 MXN son VÁLIDOS (ej: motonetas usadas, motos pequeñas o autos muy antiguos). No rechaces por precio bajo si es mayor a $1,000 MXN.
                3. CONTENIDO PROHIBIDO: Solo se permiten vehículos y autopartes. Prohibido armas, drogas, pornografía o servicios ilegales.
                4. PRIVACIDAD: No permitir números de teléfono o correos en la descripción (esto protege al usuario).
                
                **FORMATO DE RESPUESTA (JSON):**
                {
                    "isApproved": boolean,
                    "reason": "Motivo breve si es rechazado",
                    "toxicityScore": 0-1,
                    "isScamLikely": boolean
                }

                Publicación a auditar: "${task}"
                Responde ÚNICAMENTE con el JSON.
            `;
        }

        if (role === 'INTERPRETER') {
            return `Actúa como un COMITÉ DE EXPERTOS EN AUTOMOCIÓN ("The CarMatch Brain Trust").
Tu objetivo es traducir el lenguaje natural del usuario a filtros técnicos PRECISOS, usando un proceso de pensamiento de 3 pasos (Cadena de Pensamiento).

**TU EQUIPO INTERNO:**
1.  🕵️ **EL ANALISTA (Agente 1):** Extrae datos crudos y slang (ej: "Troca", "Nave", "Para el jale").
2.  ⚖️ **EL SUPERVISOR (Agente 2):** **CRÍTICO.** Su misión es evitar errores de categoría. Si el usuario dice "carro", DEBE rechazar "Pickup" o "SUV". Si dice "troca", DEBE rechazar "Sedán".
3.  ✅ **EL ESTRATEGA (Agente 3):** Genera el JSON final validado.

**CONTEXTO TÉCNICO:**
- Categorías: ${Object.keys(VEHICLE_CATEGORIES).join(", ")}
- Tipos: ${Array.from(new Set(Object.values(VEHICLE_CATEGORIES).flat())).join(", ")}
- Marcas: ${Array.from(new Set(Object.values(BRANDS).flat())).slice(0, 50).join(", ")}...
- Transmisiones: ${TRANSMISSIONS.join(", ")}
- Combustibles: ${FUELS.join(", ")}
- Colors: ${COLORS.join(", ")}

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
    "aiReasoning": "Confirmación experta: 'Analizando búsqueda de [intención]... Aplicando filtros para [tipo]...'",
    "uncertainty": number,
    "isBusinessSearch": boolean,
    "nextQuestion": "string (opcional si hay ambigüedad)"
}

**QUERY DEL USUARIO:**
"${task}"

**PROCESO DE PENSAMIENTO INTERNO (EL COMITÉ):**
1. Analista: Extraigo [términos detectados].
2. Supervisor: Valido que "[término]" no se confunda con otra categoría. Corrijo si es necesario.
3. Estratega: Construyo JSON final para "${task}".

Responde SOLO con el JSON del Estratega. No incluyas markdown.`;
        }

        return `Rol: ${role}. Tarea: ${task}. Contexto: ${JSON.stringify(context)}. Responde solo JSON.`;
    }

    private parseJSON(text: string) {
        try {
            const match = text.match(/\{[\s\S]*\}/);
            return match ? JSON.parse(match[0]) : null;
        } catch {
            return null;
        }
    }
}

export const orchestrator = new AIOrchestrator();
