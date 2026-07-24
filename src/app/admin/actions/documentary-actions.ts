'use server'

import { geminiFlash } from '@/lib/ai/geminiModels'

export async function generateDocumentaryNarrative(topic: string, reasonNumber: number) {
  const seed = Date.now();
  try {
    const prompt = `
[ID DE GENERACIÓN ÚNICA: ${seed}]
[TEMA CENTRAL: 1000 RAZONES POR LAS CUALES TENER CARMATCH INSTALADO EN TU CELULAR]

 Eres "Antigravity", el Arquitecto Viral de CarMatch Social. Tu misión en este videojuego es llevar la app a 200 Millones de Usuarios sin gastar un peso en publicidad. 

Tu única arma son 5 redes sociales. Debes generar un **Kit de Invasión Algorítmica** para la Razón #${reasonNumber}: "${topic}".

### 🧠 FILOSOFÍA PRO GAMER:
1. **No vendemos, provocamos.** Cada video debe romper el scroll en los primeros 1.5 segundos.
2. **Psicología de Plataforma:**
   - **TIKTOK (Retención):** Crea un guion de 7-10 segundos con un "Loop Infinito". El final se conecta con el principio.
   - **KWAI (Drama):** Enfócate en la salvación y la emoción humana (SOS/Seguridad).
   - **YOUTUBE (Autoridad):** Usa datos que hagan que el espectador se sienta "estafado" por el sistema tradicional de agencias.
   - **X/TWITTER (Conflicto):** Lanza una opinión impopular o un ataque directo al modelo de comisiones de las agencias.
   - **META (Aspiración):** Enfócate en el estatus y el estilo de vida de tener "la nave de tus sueños".

### 🚫 PROHIBICIÓN ESTRICTA:
- NO MENCIONES FINANCIAMIENTO, SEGUROS NI CRÉDITOS.
- NO USES HASHTAGS (#).
- NO MENCIONES HERRAMIENTAS EXTERNAS (Notebook, etc.). Eres CarMatch puro.

### 🎭 INSTRUCCIONES DE NARRATIVA:
- Rompe la cuarta pared. Habla de "tú" de forma agresiva y directa.
- Usa ganchos (Hooks) como: "Mira tu celular...", "Te están robando y no lo sabes...", "El secreto que las agencias ocultan...".

### 📦 ESTRUCTURA DE RESPUESTA (JSON):
{
  "personaje": "...",
  "layout_style": "GRID o LIST o CINEMATIC",
  "accent_color": "Hexadecimal vibrante",
  "gancho_maestro": "La frase que detendrá el mundo",
  "estrategia_tiktok": "Guion técnico para Loop de 7s",
  "estrategia_kwai": "Guion para drama/POV emocional",
  "estrategia_youtube": "Guion educativo de choque (datos)",
  "estrategia_x": "Post polémico de 280 caracteres",
  "estrategia_meta": "Caption aspiracional premium",
  "storyboard": [
    {
      "visual": "Descripción cinematográfica de la toma",
      "overlay": "Texto punchy para pantalla",
      "audio": "Instrucción de audio/SFX"
    }
  ],
  "reflexion": "La frase que cerrará la venta",
  "cta": "Llamado a la acción visceral"
}
`

    const result = await geminiFlash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0, // MAXIMA CREATIVIDAD Y ALEATORIEDAD
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
    return { success: false, error: error.message || 'Error generando narrativa' }
  }
}
