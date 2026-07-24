'use server'

/**
 * 🛰️ CARMATCH PROTOCOL AGENT v8.0 — "DON MATCH (APP-MAN)"
 * ──────────────────────────────────────────────────────────
 */

import { geminiFlash } from '@/lib/ai/geminiModels'

export async function generateProtocolContent(topic: string) {
  const seed = Date.now();
  try {
    const prompt = `
[ID DE PROTOCOLO: ${seed}]
[MISIÓN: HACKEO VIRAL CARMATCH SOCIAL]

Eres **DON MATCH**, el legendario "App-Man" de CarMatch. Tu objetivo es convertir esta app en un Unicornio de 200M de usuarios, protegiendo a la banda de las estafas y el abuso de precios.

### 🏴‍☠️ TEMA A INTERVENIR:
"${topic}"

### 📦 ESTRUCTURA DE RESPUESTA (JSON):
{
  "characters": "Don Match (App-Man)",
  "protocol_title": "Operación Don Match: [Nombre de la Misión]",
  "accent_color": "#0369a1",
  "leaked_hook": "¡A la neta! Don Match te cuenta la verdad sobre ${topic}",
  "protocol_briefing": "Explicación técnica, cruda y honesta del 'Hack' o la solución de CarMatch.",
  "recruitment_prompt": "AUTHENTIC STREET PHOTOGRAPHY. Subject: Don Match (A friendly man with a CarMatch App head) talking to a local business owner in Mexico. Setting: An honest mechanic shop or car wash. Style: High-trust, relatable, 8K. 1:1 ratio.",
  "recruitment_copy": "Don Match te invita: ¿Tienes un negocio de autos? Deja de regalar tu lana en comisiones. Únete al MapStore de CarMatch y atrae clientes reales hoy mismo.",
  "pippit_prompt": "CAPCUT VIRAL PRODUCTION PROMPT. [STYLE]: High-energy, fast-paced viral video. [AVATAR]: Don Match (The App-Man). [ACTION]: Don Match pointing at the camera, showing the CarMatch app on a phone, and interacting with a car in an authentic Mexican street. [SCRIPT]: '¡Qué onda, banda! Soy Don Match. ¿Sabían que con CarMatch [VALOR DE ${topic}]? No se dejen estafar. ¡Descárguenla ya!'. [VISUALS]: Bold text overlays, viral transitions, brand colors #0369a1 and #f97316.",
  "platforms": {
    "tiktok": "Hook agresivo de Don Match sobre ${topic}",
    "kwai": "POV: Don Match salvándote de una estafa",
    "youtube": "Don Match: El secreto de ${topic}",
    "x": "Datos reales por Don Match",
    "meta": "Consejo de autoridad de Don Match"
  },
  "cta": "¡Hazle caso a Don Match, descarga la App!"
}

### 🚫 REGLAS DE ORO:
- CERO HASHTAGS.
- CERO MENCIONES A SEGUROS/CRÉDITOS.
- ESTILO: Crudo, Real, Dark, Alta Tensión.
`

    const result = await geminiFlash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        topK: 64,
      }
    })
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en el Protocolo' }
  }
}

export async function getProtocolMissions() {
  try {
    const prompt = `
[ID DE RADAR: ${Date.now()}]
Eres el Radar del CarMatch Protocol. Tu misión es detectar 4 anomalías o verdades ocultas en el mercado automotriz actual para que el usuario las "filtre".

### 📦 ESTRUCTURA DE RESPUESTA (JSON):
[
  { "id": "m1", "label": "Título corto y agresivo", "type": "leak|hero|exclusivity" },
  { "id": "m2", "label": "Título corto y agresivo", "type": "leak|hero|exclusivity" },
  { "id": "m3", "label": "Título corto y agresivo", "type": "leak|hero|exclusivity" },
  { "id": "m4", "label": "Título corto y agresivo", "type": "leak|hero|exclusivity" }
]

### 🚫 REGLAS:
- Estilo crudo, real, rebelde.
- Temas: Estafas, sobreprecios, secretos de agencias, historias de rescate community.
- Máximo 30 caracteres por label.
`

    const result = await geminiFlash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0 }
    })
    const text = result.response.text()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found')
    
    return { success: true, data: JSON.parse(jsonMatch[0]) }
  } catch (error: any) {
    return { success: false, error: 'Falla en el Radar' }
  }
}
