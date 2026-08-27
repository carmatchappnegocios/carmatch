
/**
 * 🎯 CONFIGURACIÓN COMPATIBILIDAD v7.3 (SMART MULTIMODAL BRIDGE)
 */

import { safeGenerateContent } from './geminiClient';

// 🌉 Proxy para Modelos de Velocidad (Flash)
export const geminiFlash = {
    generateContent: async (req: any) => {
        return await safeGenerateContent(req, 3, 'FLASH');
    }
};

// 🌉 Proxy para Modelos de Potencia (Pro)
export const geminiPro = {
    generateContent: async (req: any) => {
        return await safeGenerateContent(req, 3, 'PRO');
    }
};

// Proxies de conveniencia
export const geminiFlash8B = geminiFlash;
export const geminiFlashConversational = geminiFlash;
export const geminiFlashPrecise = geminiFlash;
export { geminiFlash as geminiModel, geminiPro as geminiLegacy };

export const AI_USE_CASES = {
    IMAGE_ANALYSIS: 'FLASH',
    VEHICLE_DISCOVERY: 'FLASH',
    SEARCH_INTERPRETER: 'FLASH',
    CHATBOT: 'FLASH',
    ADMIN_ANALYST: 'PRO',
} as const;

export function getModelForUseCase(useCase: keyof typeof AI_USE_CASES) {
    if (useCase === 'ADMIN_ANALYST') return geminiPro;
    return geminiFlash;
}
