
/**
 * 🛰️ GEMINI REST CLIENT v7.9.5 — "TRANSLATOR"
 * Protocolo: Direct REST con Soporte para Formatos SDK Complejos.
 */

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

export type IntelligenceTier = 'FLASH' | 'PRO';

/**
 * Mapea partes del SDK (camelCase) al formato REST (snake_case)
 */
function mapPartsToRest(parts: any[]) {
    return parts.map(p => {
        if (typeof p === 'string') return { text: p };
        if (p.text) return { text: p.text };
        if (p.inlineData) {
            return {
                inline_data: {
                    mime_type: p.inlineData.mimeType,
                    data: p.inlineData.data
                }
            };
        }
        return p;
    });
}

async function geminiRestFetch(promptOrParts: string | any[] | { contents: any[] }, model: string, version: string = 'v1') {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const fullModelName = model.startsWith('models/') ? model : `models/${model}`;
    const url = `https://generativelanguage.googleapis.com/${version}/${fullModelName}:generateContent`;
    
    // 🛠️ TRADUCTOR DE FORMATOS (v7.9.5): Soporta String, Array de Partes o Request Object completo
    let finalContents: any[] = [];

    if (typeof promptOrParts === 'string') {
        finalContents = [{ parts: [{ text: promptOrParts }] }];
    } else if (Array.isArray(promptOrParts)) {
        finalContents = [{ parts: mapPartsToRest(promptOrParts) }];
    } else if (typeof promptOrParts === 'object' && (promptOrParts as any).contents) {
        // Formato SDK: { contents: [{ parts: [...] }] }
        finalContents = (promptOrParts as any).contents.map((c: any) => ({
            role: c.role || 'user',
            parts: mapPartsToRest(c.parts || [])
        }));
    } else {
        // Fallback para objetos desconocidos
        finalContents = [{ parts: [{ text: JSON.stringify(promptOrParts) }] }];
    }

    const body = {
        contents: finalContents,
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const msg = data.error?.message || response.statusText;
        throw new Error(`[Google REST ${response.status}] ${msg}`);
    }

    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;
    
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION' || finishReason === 'OTHER') {
        const blockMsg = `{"isAppropriate": false, "category": "SEXUAL", "reason": "Bloqueo seguridad (${finishReason})"}`;
        return {
            text: () => blockMsg,
            response: { text: () => blockMsg }
        };
    }

    const text = candidate?.content?.parts?.[0]?.text || "";
    
    if (!text && data.promptFeedback?.blockReason) {
         const blockMsg = `{"isAppropriate": false, "category": "OTHER", "reason": "Bloqueo prompt: ${data.promptFeedback.blockReason}"}`;
         return {
            text: () => blockMsg,
            response: { text: () => blockMsg }
         };
    }

    return {
        text: () => text,
        response: { text: () => text }
    };
}

export async function safeGenerateContent(promptOrParts: any, maxRetries = 3, tier: IntelligenceTier = 'FLASH') {
    let lastError: any;

    const flashStrategies = [
        { v: 'v1beta', m: 'gemini-3.1-flash-lite-preview' },
        { v: 'v1beta', m: 'gemini-flash-latest' }
    ];

    const proStrategies = [
        { v: 'v1beta', m: 'gemini-3.1-pro-preview' },
        { v: 'v1beta', m: 'gemini-pro-latest' }
    ];

    const currentStrategies = tier === 'PRO' ? proStrategies : flashStrategies;

    for (let i = 0; i < maxRetries; i++) {
        for (const strategy of currentStrategies) {
            try {
                const result = await geminiRestFetch(promptOrParts, strategy.m, strategy.v);
                return result;
            } catch (error: any) {
                lastError = error;
                if (error.message.includes("403")) break;
                continue;
            }
        }
        if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
    }
    
    throw lastError;
}

export const geminiFlash = { generateContent: (req: any) => safeGenerateContent(req, 3, 'FLASH') };
export const geminiPro = { generateContent: (req: any) => safeGenerateContent(req, 3, 'PRO') };
export const geminiFlash8B = geminiFlash;
export const geminiFlashLite = geminiFlash;
export const geminiFlashConversational = geminiFlash;
export const geminiFlashPrecise = geminiFlash;

export function safeExtractJSON<T>(text: string): T | null {
    try {
        if (!text) return null;
        const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (!jsonMatch) return null;
        const cleaned = jsonMatch[0].replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned) as T;
    } catch (e) {
        console.error("❌ [AI-JSON] Fallo de parseo:", e);
        return null;
    }
}
