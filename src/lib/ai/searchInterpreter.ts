

import { geminiPro } from "./geminiModels"; // 🚀 UPGRADE: Usamos PRO para "Entendimiento Humano" perfecto
import { BRANDS, COLORS, TRANSMISSIONS, FUELS } from "../vehicleTaxonomy";
import aiCache from "./aiCache"; // 💰 Sistema de caché para reducir costos
import { orchestrator } from "./orchestrator";

export interface SearchIntent {
  category?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number; // Added maxYear
  color?: string;
  transmission?: string;
  fuel?: string;
  passengers?: number;
  cylinders?: number;
  mileage?: number; // Added mileage
  traction?: string; // Added traction (4x4, AWD, etc.)
  hp?: number; // Added horsepower
  range?: number; // Added electric range
  condition?: string; // New, used, etc.
  owners?: number; // Added number of owners
  features?: string[];
  sort?: string; // sorting intent
  query_language?: string; // Just for logging/debugging
  keywords?: string[]; // Extra keywords like "roja", "4x4"
  isBusinessSearch?: boolean; // If user is looking for a shop/mechanic instead of a car
  aiReasoning?: string; // 🗣️ Mensaje de la IA explicando su lógica al usuario
  advisorTip?: string; // 💡 Intelligent tip from the expert advisor
  isConversational?: boolean; // 💬 TRUE si la IA necesita más info y está iniciando un cuestionario
  nextQuestion?: string; // ❓ La pregunta que la IA le hace al usuario para refinar la búsqueda
  city?: string; // 📍 La ciudad de interés para filtrar los resultados
}

export async function interpretSearchQuery(query: string, context: 'MARKET' | 'MAP', city?: string): Promise<SearchIntent> {
  console.log(`🧠 Interpretando búsqueda (${context}): "${query}"`);

  try {
    // 🚀 NIVEL 0: ORQUESTADOR DE EFICIENCIA EXTREMA
    const orchestratedResult = await orchestrator.execute(query, {
      role: 'INTERPRETER',
      efficiency: 'FLASH_ONLY', // AI-First for smarter results
      useCache: true,
      context: { 
        taxonomy: { BRANDS, COLORS, TRANSMISSIONS, FUELS }, 
        searchContext: context,
        city: city 
      }
    });

    let finalFilters = {} as SearchIntent;

    if (orchestratedResult.data) {
      finalFilters = orchestratedResult.data as SearchIntent;
      console.log(`✅ [ORCHESTRATOR ${orchestratedResult.source}] Confianza: ${orchestratedResult.confidence}`);

      // 💡 PASO EXTRA: Si no hay advisorTip, lo generamos para dar el toque "7 estrellas"
      if (!finalFilters.advisorTip && !finalFilters.isBusinessSearch && context === 'MARKET') {
        try {
          const advisorRes = await orchestrator.execute(query, {
            role: 'ADVISOR',
            efficiency: 'FLASH_ONLY',
            context: { filters: finalFilters }
          });
          if (advisorRes.data) {
            finalFilters.advisorTip = typeof advisorRes.data === 'string' 
              ? advisorRes.data 
              : (advisorRes.data.advisorTip || JSON.stringify(advisorRes.data));
          }
        } catch (e) {
          console.warn("No se pudo generar el consejo del asesor:", e);
        }
      }
    }

    return finalFilters;
  } catch (orchError) {
    console.warn("⚠️ Orquestador no disponible, usando flujo legacy:", orchError);
  }

  // 🚀 PASO 1: FALLBACK - Intentar obtener del caché directo (por si el orquestador falló)
  try {
    const cachedResult = aiCache.get(query, context);
    if (cachedResult) {
      console.log(`⚡ [CACHE HIT LEGACY] Respuesta recuperada del caché. $0 gastados.`);
      return cachedResult as SearchIntent;
    }

    // Si no está en caché, usamos el modelo PRO (Fallback legacy)
    const prompt = `Extrae filtros de búsqueda de: "${query}". Contexto: ${context}. Responde en JSON. Exactamente como la interfaz SearchIntent.`;
    const result = await geminiPro.generateContent(prompt);
    const responseText = result.response.text();
    const match = responseText.match(/\{[\s\S]*\}/);
    const aiOutput = match ? JSON.parse(match[0]) as SearchIntent : {} as SearchIntent;

    // 🛡️ REFUERZO DE TAXONOMÍA PROGRESIVO: Corrección post-IA con tolerancia a errores
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (aiOutput.brand) {
      const queryBrand = normalize(aiOutput.brand);
      const allBrandsValue = Object.values(BRANDS).flat();
      const exactBrand = allBrandsValue.find(b => normalize(b) === queryBrand);
      if (exactBrand) aiOutput.brand = exactBrand;
    }

    if (aiOutput.color) {
      const queryColor = normalize(aiOutput.color);
      const exactColor = COLORS.find(c => normalize(c) === queryColor);
      if (exactColor) {
        aiOutput.color = exactColor;
      } else {
        // Tolerancia a "rojiso", "azuloso", etc.
        const partial = COLORS.find(c => queryColor.includes(normalize(c)) || normalize(c).includes(queryColor.substring(0, 4)));
        if (partial) aiOutput.color = partial;
      }
    }

    if (aiOutput.fuel) {
      const queryFuel = normalize(aiOutput.fuel);
      const exactFuel = FUELS.find(f => normalize(f).includes(queryFuel) || queryFuel.includes(normalize(f)));
      if (exactFuel) aiOutput.fuel = exactFuel;
    }

    if (aiOutput.transmission) {
      const queryTrans = normalize(aiOutput.transmission);
      const exactTrans = TRANSMISSIONS.find(t => normalize(t).includes(queryTrans) || queryTrans.includes(normalize(t)));
      if (exactTrans) aiOutput.transmission = exactTrans;
    }

    // 💾 PASO FINAL: Guardar en caché para futuras consultas
    aiCache.set(query, aiOutput, context);
    console.log(`💰 [CACHE SAVE] Próxima búsqueda idéntica será gratis.`);

    return aiOutput;
  } catch (error) {
    console.error("❌ Error interpretando búsqueda:", error);
    return {}; // Return empty filter if AI fails (fallback to text search)
  }
}
