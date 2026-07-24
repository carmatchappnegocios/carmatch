// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.


import { geminiFlash8B, geminiFlash, geminiFlashLite, geminiPro } from "./geminiClient"; // ✅ Modelos optimizados (2026)


interface ImageAnalysisResult {
  valid: boolean;
  reason?: string; // If invalid (NSFW, Not a vehicle)
  category?: string; // 'automovil', 'motocicleta', 'comercial', 'industrial', 'transporte', 'especial'
  invalidIndices?: number[]; // 🚨 NEW: Indices of images that are NOT vehicles
  details?: {
    // Identificación básica
    brand?: string;
    model?: string;
    version?: string; // Ej: King Ranch, Raptor, Denali
    year?: string; // Estimated

    color?: string;
    type?: string; // SUV, Sedan, Pickup, etc.

    // Características técnicas
    transmission?: string; // Manual, Automática, CVT
    fuel?: string; // Gasolina, Diésel, Eléctrico, Híbrido
    engine?: string; // Ej: "V6 3.5L"
    hp?: number; // Caballos de fuerza
    torque?: string; // Ej: "350 lb-ft"
    aspiration?: string; // Turbo, Atmosférico, Eléctrico, etc.
    cylinders?: number; // 4, 6, 8, etc.
    traction?: string; // FWD, RWD, 4x4, AWD
    doors?: number;
    passengers?: number;
    batteryCapacity?: number; // kWh (eléctricos)
    range?: number; // km (eléctricos)
    weight?: number; // kg
    axles?: number; // Ejes (camiones)
    condition?: string; // Nuevo, Seminuevo, Usado

    // Características visibles (para vender el vehículo)
    features?: string[]; // ["Quemacocos", "Rines aleación", "Cámara reversa", etc.]

    // Campos específicos por tipo de vehículo
    displacement?: number; // Cilindrada en cc (motos)
    cargoCapacity?: number; // Toneladas (camiones)
    operatingHours?: number; // Horas de uso (maquinaria)
  };
  analysis?: { index: number; isValid: boolean; reason: string }[];
}

export async function analyzeImage(
  imageBase64: string,
  type: 'VEHICLE' | 'BUSINESS' = 'VEHICLE',
  contextHint?: string // 🧠 Contexto opcional: "Jeep Wrangler 2020", "Taller Juan", etc.
): Promise<ImageAnalysisResult> {
  console.log(`🤖 [${type}] Iniciando análisis con Gemini Vision... (Contexto: ${contextHint || 'Ninguno'})`);

  // 🚀 TODO: Integrar orquestador para pre-validación de imágenes con heurísticas visuales básicas
  // Por ahora mantenemos el sistema de rotación Bi-Turbo (Pro/Flash) que ya funciona en producción

  let prompt = '';

  if (type === 'BUSINESS') {
    // 🟢 RELAXED VALIDATION FOR BUSINESS
    prompt = `
ERES UN MODERADOR DE CONTENIDO PARA UNA RED SOCIAL DE NEGOCIOS.
TU TRABAJO ES FILTRAR SOLO EL CONTENIDO PELIGROSO O ILEGAL.

CONTEXTO DEL USUARIO: "${contextHint || 'No especificado'}"

✅ PERMITIDO (TODO LO QUE NO ESTÉ PROHIBIDO):
- Logos, Fachadas, Tarjetas de presentación
- Personas (mecánicos, clientes, staff)
- Memes, Humor, Publicidad, Flyers
- Vehículos, Herramientas, Talleres
- CUALQUIER imagen segura para el trabajo (SFW)

❌ PROHIBIDO ESTRICTAMENTE (TOLERANCIA CERO):
- 🔞 CONTENIDO SEXUAL EXPLÍCITO (Desnudos, pornografía, poses lascivas)
- 🩸 VIOLENCIA EXTREMA (Sangre real, gore, accidentes fatales, tortura)
- 🔫 ARMAS REALES en contexto violento (no herramientas)
- 💊 DROGAS ILEGALES o parafernalia explícita
- 🖕 DISCURSO DE ODIO (Símbolos nazis, racistas, etc.)

SI LA IMAGEN ES SEGURA (Aunque sea un meme o un dibujo):
Responde {"valid": true}

SI LA IMAGEN VIOLA LAS REGLAS:
Responde {"valid": false, "reason": "Explicación breve en español"}

RESPONDE SOLO EL JSON.
`;
  } else {
    // 🚗 VALIDATION FOR VEHICLES (STRICT MOTORIZED LAND VEHICLES ONLY)
    prompt = `
    ERES EL AUDITOR JEFE ESTRICTO DE CARMATCH SOCIAL. 
    TU ÚNICA MISIÓN ES VALIDAR QUE EL PRODUCTO PUBLICADO SEA EXCLUSIVAMENTE UN **VEHÍCULO MOTORIZADO TERRESTRE**.

    **PARADIGMA DE APROBACIÓN (SOLO ESTO ES VÁLIDO):**
    - Debe tener un MOTOR (de combustión o eléctrico).
    - Debe ser para uso TERRESTRE (en calles, terracería o industria terrestre).
    - Autos, Camionetas, Motocicletas, Cuatrimotos (ATVs), RZRs, Camiones, Tractores, Maquinaria pesada terrestre.

    ❌ **RECHAZA INMEDIATAMENTE (CONTENIDO PROHIBIDO):**
    - VEHÍCULOS NO MOTORIZADOS: Bicicletas (si no tienen motor real), Patines, Monopatines, Triciclos infantiles.
    - VEHÍCULOS NO TERRESTRES: Barcos, Lanchas (incluso si están en un remolque terrestre, el producto es el barco), Motos de agua, Aviones, Helicópteros, Drones.
    - CONTENIDO NO AUTOMOTRIZ: Mascotas, Personas (selfies), Ropa, Comida, Muebles, Inmuebles, Facturas/Papeles (como foto principal), Capturas de pantalla de otras apps.
    - JUGUETES O MINIATURAS: Carritos de juguete, Hot Wheels, modelos a escala que no sean vehículos reales operables por un adulto.

    ═══ CAPA DE SEGURIDAD POR EXTRACCIÓN (NUEVO) ═══
    Si un producto es real y válido para CarMatch, **DEBES ser capaz de extraer metadatos técnicos**.
    - ¿Puedes identificar la MARCA y el TIPO de vehículo con alta confianza? 
    - SI LA RESPUESTA ES NO (porque la imagen es muy borrosa, es un juguete, o el objeto es confuso) -> **VALID: FALSE**.
    - No aceptes nada que parezca una mancha de color o un objeto genérico sin marca identificable.

    ═══ REGLAS DE ORO DE CARMATCH ═══
    1. LA PORTADA (Foto 0) debe mostrar el vehículo COMPLETO.
    2. Si no es un vehículo motorizado real para tierra -> VALID: FALSE.
    3. No seas "flexible". Ante la duda de si es un juguete o un objeto real, RECHAZA.

    CONTEXTO SUGERIDO: "${contextHint || 'Desconocido'}"

    RESPONDE ÚNICAMENTE CON ESTE JSON:
    {
      "valid": boolean,
      "reason": "Explicación breve de por qué se rechaza en español (menciona 'No se pudieron extraer datos técnicos suficientes' si el objeto es confuso o 'No es un vehículo motorizado terrestre' si aplica).",
      "category": "automovil" | "motocicleta" | "comercial" | "industrial" | "transporte" | "especial",
      "details": {
        "brand": "Marca",
        "model": "Modelo",
        "version": "Versión/Trim exacta",
        "year": "Año",
        "color": "Color",
        "type": "SUV|Sedan|Pickup|Coupe|Hatchback|Van|Moto|Camion",
        "transmission": "Manual|Automática",
        "fuel": "Gasolina|Diésel|Eléctrico|Híbrido",
        "engine": "Ej: V8 5.7L HEMI",
        "displacement": "cc (solo motos)",
        "hp": number,
        "features": ["Lista de equipamiento observado"]
      }
    }
    `;
  }

  let lastError: any;
  // ⚡ Hasta 2 reintentos solo por fallas TÉCNICAS (red, quota, JSON malformado).
  // Si la IA dice que NO es un vehículo → es NO inmediato, sin más intentos.
  const maxTechnicalRetries = 2;

  for (let i = 0; i < maxTechnicalRetries; i++) {
    try {
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      };

      // 🚗 UN SOLO PROMPT. UNA SOLA LEY: ¿Tiene motor y ruedas? → VÁLIDO. No → RECHAZADO.
      // No hay modos tolerantes ni segundas opiniones que cambien los criterios.
      // Los reintentos son SOLO por problemas técnicos (red, quota), no por desacuerdo de contenido.
      let result;
      try {
        // Primer intento: Flash-8B (rápido y económico)
        // Segundo intento (solo si hubo error técnico): Flash estándar
        const modelToUse = i === 0 ? geminiFlash8B : geminiFlash;
        console.log(`🤖 [IA] Intento técnico ${i + 1}/${maxTechnicalRetries} usando ${modelToUse.model}`);
        result = await modelToUse.generateContent([prompt, imagePart]);

      } catch (genError) {
        console.warn(`⚠️ Error técnico en modelo (intento ${i + 1}), rotando a PRO...`);
        try {
          result = await geminiPro.generateContent([prompt, imagePart]);
        } catch (e) {
          throw genError;
        }
      }

      const response = await result.response;
      const text = response.text();

      console.log("🤖 Respuesta Raw Gemini:", text);

      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        console.warn("⚠️ No se detectó JSON en respuesta. Reintentando si hay intentos disponibles...");
        throw new Error("No JSON found in response"); // Error técnico → reintento
      }

      const jsonString = text.substring(firstBrace, lastBrace + 1);

      try {
        const cleanJson = jsonString
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/(['\"])?([a-zA-Z0-9_]+)(['\"])?:/g, '"$2": ');

        let parsedResult;
        try {
          parsedResult = JSON.parse(jsonString);
        } catch (e) {
          parsedResult = JSON.parse(cleanJson);
        }

        // 🛑 LEY SUPREMA: Si la IA dice que NO es un vehículo → rechazo FINAL e inmediato.
        // No hay segunda opinión, no hay modo tolerante, no hay reintento por contenido.
        // Esta es la única regla: motor + ruedas = válido. Todo lo demás = rechazado.
        if (parsedResult && parsedResult.valid === false) {
          console.log(`🚫 CarMatch: Imagen rechazada por la IA (${parsedResult.reason || 'No es un vehículo motorizado terrestre'}).`);
          return parsedResult; // Rechazo definitivo, sin más intentos
        }

        // ✅ La IA aprobó la imagen
        return parsedResult;

      } catch (parseError: any) {
        console.error("❌ Error parseando JSON de Gemini:", parseError, "Texto recibido:", text);
        // Error técnico de parseo → reintento
        throw new Error("JSON Parse Error");
      }

    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || '';

      // 🔄 Solo errores TÉCNICOS justifican un reintento (nunca rechazos de contenido)
      const isTechnicalError =
        errorMsg.includes("429") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("503") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("exhausted") ||
        errorMsg.includes("fetch") ||
        errorMsg.includes("network") ||
        errorMsg.includes("timeout") ||
        errorMsg.includes("deadline") ||
        errorMsg.includes("json") ||
        errorMsg.includes("parse") ||
        errorMsg.includes("syntax") ||
        errorMsg.includes("no json found");

      if (isTechnicalError && i < maxTechnicalRetries - 1) {
        const waitTime = Math.min(Math.pow(1.5, i) * 1000, 2000) + (Math.random() * 300);
        console.warn(`⚠️ Error técnico (${errorMsg}). Reintentando (${i + 1}/${maxTechnicalRetries}) en ${Math.round(waitTime)}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      break;
    }
  }

  console.error("❌ Error CRÍTICO en análisis de imagen:", lastError);

  const msg = lastError?.message?.toLowerCase() || '';

  // 🛡️ MANEJO DE ERRORES ESPECÍFICOS PARA EL USUARIO

  // ❌ FAIL-CLOSED: Errores de seguridad (contenido bloqueado por políticas)
  if (msg.includes("safety") || msg.includes("blocked")) {
    console.warn("🚫 Imagen bloqueada por políticas de seguridad de Gemini");
    return {
      valid: false,
      reason: "La imagen contiene elementos no permitidos por nuestras políticas de seguridad."
    };
  }

  // 🧠 ÚLTIMO RECURSO: Si el error fue "No JSON found" pero tenemos el texto en el error (si lo hubiéramos guardado), podríamos usarlo.
  // Pero como fallback general, intentaremos ser más descriptivos si es posible.

  // 🛡️ REGLA SOBERANA RUBEN: NO APROBAR SI EL ERROR ES PERSISTENTE PARA EVITAR NSFW
  // En lugar de fail-open total, devolvemos un error descriptivo para que el usuario reintente.
  return {
    valid: false,
    reason: "No pudimos verificar la imagen técnicamente debido a una saturación en la red de IA. Por favor, reintenta en unos momentos.",
    details: {
      brand: contextHint?.split(' ')[0] || "Vehículo",
      features: ["Error de red detectado"]
    }
  };
}

/**
 * Analiza MÚLTIPLES imágenes para obtener datos consolidados
 * @param images Array de imágenes en base64
 * @param type Tipo de publicación ('VEHICLE' | 'BUSINESS')
 * @returns Análisis consolidado
 */
export async function analyzeMultipleImages(
  images: string[],
  type: 'VEHICLE' | 'BUSINESS' = 'VEHICLE',
  context?: { brand?: string, model?: string, year?: string }
): Promise<ImageAnalysisResult> {
  console.log(`🤖 AI Contextual: Analizando ${images.length} imágenes...`);

  const vehicleContextPrompt = context?.brand
    ? `\nGUÍA DE CONTEXTO: El usuario dice tener un ${context.brand} ${context.model || ''} ${context.year || ''}.
       Usa esto para ayudarte a identificar si es un vehículo real, pero sé FLEXIBLE.
       Si el usuario se equivoca de año o modelo pero sube un carro real, ¡APRUÉBALO! (Puede ser error humano).`
    : '';

  const prompt = type === 'VEHICLE'
    ? `ERES EL AUDITOR JEFE DE CARMATCH.
       TU MISIÓN: VALIDAR QUE MÍNIMO LA PORTADA SEA UN VEHÍCULO Y QUE EL RESTO DE LA GALERÍA SEA CONSISTENTE.

       **SISTEMA DE SEGURIDAD CARMATCH (PORTADA SOBERANA):**
       - La PRIMERA FOTO (Índice 0) define la IDENTIDAD de la publicación.
       - TODAS las demás fotos de la galería DEBEN ser del MISMO vehículo exacto (mismo color, modelo, rines).

       👁️ FILTRO ANTI-FRAUDE Y ANTI-RUIDO:
       - RECHAZA (isValid: false) cualquier foto que NO sea el vehículo de la portada.
       - RECHAZA (isValid: false) objetos externos: Recibos, Facturas, Documentos, Muebles (sofás, trampolines), Mascotas, Personas, u otros vehículos que no sean el principal.
       - Si la portada es un Sedan y ves un SUV en la galería -> isValid: false.
       - Si en una foto hay 2 carros y no está claro cuál es el de la portada -> isValid: false.

        🚀 INSTRUCCIONES:
        1. VALIDEZ PORTADA (Index 0): Si la foto 0 es un vehículo real, "isValidCover": true.
        2. ANÁLISIS GALERÍA (indices 1+): Evalúa la consistencia contra la foto 0.
        3. DATOS TÉCNICOS: Extrae ficha técnica oficial basada en lo que ves.

       Responde ÚNICAMENTE este JSON:
       {
         "isValidCover": boolean,
         "coverReason": "OK" o razón breve,
         "analysis": [
           { "index": number, "isValid": boolean, "reason": "OK" | "Vehículo diferente" | "No es parte del vehículo" }
         ],
         "details": {
            "brand": "Marca",
            "model": "Modelo",
            "version": "Versión Específica",
            "year": "Año",
            "color": "Color",
            "type": "SUV|Sedan|Pickup|Coupe|Hatchback|Van|Moto|Camion",
            "transmission": "Manual|Automática",
            "fuel": "Gasolina|Diésel|Eléctrico|Híbrido",
            "engine": "Especificación motor",
            "features": ["Equipamiento visual observado"]
          }
        }`
    : `ERES UN MODERADOR DE CONTENIDO PARA PERFILES DE NEGOCIO.
       TU MISIÓN: Permitir libertad creativa total, FILTRANDO SOLO CONTENIDO ILEGAL O PELIGROSO.
       
       ✅ APRUEBA TODO ESTO (Ejemplos):
       - Memes, Logotipos, Carteles.
       - Fotos de personas, selfies, manos, pies.
       - Objetos random (sacapuntas, herramientas, comida).
       - Edificios, calles, mapas.
       - CUALQUIER IMAGEN que no viole las reglas de abajo.

       🚫 SOLO RECHAZA (isValid: false):
       - Pornografía explícita o desnudez total.
       - Violencia extrema, gore, sangre real.
       - Contenido de odio o símbolos terroristas.

       Si es una foto "rara" o "fea" pero segura -> APRUÉBALA.

       Responde ÚNICAMENTE este JSON (sin markdown):
       {
         "isValidCover": boolean,
         "coverReason": "OK" o razón breve de rechazo,
         "analysis": [
           { "index": number, "isValid": boolean, "reason": "OK" }
         ],
         "details": { "category": "negotioc" }
       }`;

  let lastError: any;
  const maxRetries = 2; // ⚡ OPTIMIZADO: 2 reintentos rápidos (5-10s máximo total)

  // 🚀 REGLA RUBEN: PARA VEHÍCULOS, LA PORTADA SE ANALIZA PRIMERO Y MANDA
  if (type === 'VEHICLE' && images.length > 0) {
    console.log("🛡️ Seguridad CarMatch: Aplicando análisis secuencial (Portada Primero)");

    try {
      // 1. ANALIZAR PORTADA (Index 0)
      const contextHint = context?.brand ? `${context.brand} ${context.model || ''} ${context.year || ''}`.trim() : undefined;
      const coverResult = await analyzeImage(images[0], 'VEHICLE', contextHint);

      if (!coverResult.valid) {
        return {
          valid: false,
          reason: coverResult.reason || "La foto de portada no es válida.",
          invalidIndices: [0],
          details: coverResult.details
        };
      }

      // Si solo hay una imagen, terminamos aquí
      if (images.length === 1) {
        return coverResult;
      }

      // 2. ANALIZAR GALERÍA (Con Referencia Visual de Portada)
      // Enviamos la portada OTRA VEZ como primera imagen para que Gemini tenga referencia visual exacta, no solo texto.
      const galleryImages = images.slice(1, 10);

      const IDENTIDAD_SOBERANA_DE_PORTADA = {
        brand: coverResult.details?.brand,
        model: coverResult.details?.model,
        version: coverResult.details?.version,
        year: coverResult.details?.year,
        type: coverResult.details?.type
      };


      const galleryPrompt = `
        ERES EL AUDITOR SUPREMO DE CONSISTENCIA DE CARMATCH SOCIAL.
        
        SITUACIÓN:
        - Estás recibiendo una serie de imágenes.
        - La PRIMERA IMAGEN (Índice 0) es la PORTADA SOBERANA. Ella es la ÚNICA VERDAD.
        - Las imágenes siguientes (Índice 1, 2, ...) son la GALERÍA del usuario.

        TU MISIÓN (TOLERANCIA CERO): 
        1. Comparar CADA imagen de la galería contra la FOTO DE PORTADA (Índice 0).
        2. Validar que sean del MISMO VEHÍCULO MOTORIZADO EXACTO (mismo color, rines, golpes, interiores).
        3. 🚫 RECHAZA (isValid: false) cualquier objeto que NO sea el vehículo motorizado terrestre:
           - Vehículos no motorizados: Bicicletas, patines, triciclos.
           - Vehículos no terrestres: Barcos, lanchas, motos de agua, aviones.
           - Documentación: Recibos, Facturas, Tarjetas de circulación, Documentos impresos.
           - Muebles/Hogar: Sofás, Camas, Trampolines, Juguetes, Mascotas.
           - Personas: Selfies, gente posando al lado del auto.
           - Otros vehículos: Capturas de pantalla de otros anuncios o marcas diferentes.
           - Repuestos sueltos: Llantas solas, motores fuera del carro que no permitan ver la unidad completa de la portada.
        
        🚗 VEHÍCULO MOTORIZADO SOBERANO (IDENTIDAD DE PORTADA):
        - Marca/Modelo: "${IDENTIDAD_SOBERANA_DE_PORTADA.brand || '?'} ${IDENTIDAD_SOBERANA_DE_PORTADA.model || '?'}"
        - Tipo: "${IDENTIDAD_SOBERANA_DE_PORTADA.type || '?'}"
        
        ═══ CRITERIOS DE RECHAZO (isValid: false) ═══
        - Si el objeto NO es un vehículo motorizado terrestre -> FALSE.
        - Si la portada es un Sedan y la galería muestra un SUV -> FALSE.
        - Si el color de carrocería cambia significativamente -> FALSE.
        - SI ES UN OBJETO AJENO (Papel, Recibo, Trampolín, Bicicleta, Lancha) -> FALSE.
isValid: false) ═══
        - Si la portada es un Sedan y la galería muestra un SUV -> FALSE.
        - Si el color de carrocería cambia significativamente -> FALSE.
        - Si la placa/matrícula es diferente -> FALSE.
        - SI ES UN OBJETO AJENO AL VEHÍCULO (Papel, Recibo, Trampolín) -> FALSE.
        - Si se ve que es otro modelo o marca -> FALSE.

        ⚠️ IMPORTANTE: El análisis debe retornar un array donde el index 0 es siempre la portada (siempre válido).

        Responde con este JSON:
        {
          "analysis": [
            { "index": number, "isValid": boolean, "reason": "OK" | "Vehículo diferente" | "No es parte del vehículo" }
          ],
          "details": {
            "version": "Versión detectada (combinando vista de todas las fotos)",
            "features": ["Lista de equipamiento extraído de galería y portada"]
          }
        }
      `;

      // Incluimos la portada como referencia visual para Gemini
      const imageParts = [images[0], ...galleryImages].map((img, idx) => ({
        inlineData: { data: img, mimeType: "image/jpeg" }
      }));

      let galleryResultRaw;
      try {
        console.log(`🤖 Analizando galería (${galleryImages.length} fotos) con referencia visual de portada...`);
        galleryResultRaw = await geminiFlash.generateContent([galleryPrompt, ...imageParts]);
      } catch (galleryError) {
        console.warn("⚠️ Falló análisis de galería, intentando con respaldo...");
        galleryResultRaw = await geminiPro.generateContent([galleryPrompt, ...imageParts]);
      }

      const galleryResponse = await galleryResultRaw.response;
      const galleryText = galleryResponse.text();

      const galleryMatch = galleryText.match(/\{[\s\S]*\}/);
      if (galleryMatch) {
        const galleryParsed = JSON.parse(galleryMatch[0]);
        const galleryAnalysis = galleryParsed.analysis || [];

        // Mapear invalidIndices excluyendo el índice 0 (referencia)
        const invalidIndices = galleryAnalysis
          .filter((a: any) => a.isValid === false && a.index > 0)
          .map((a: any) => a.index);

        // 🧠 MEZCLA MAESTRA (MERGE): 
        // Combinar equipamiento de portada y galería sin duplicados
        const combinedFeatures = Array.from(new Set([
          ...(coverResult.details?.features || []),
          ...(galleryParsed.details?.features || [])
        ]));

        return {
          valid: true,
          reason: "OK",
          invalidIndices: invalidIndices,
          details: {
            ...coverResult.details,
            ...galleryParsed.details,
            brand: IDENTIDAD_SOBERANA_DE_PORTADA.brand,
            model: IDENTIDAD_SOBERANA_DE_PORTADA.model,
            version: galleryParsed.details?.version || IDENTIDAD_SOBERANA_DE_PORTADA.version,
            year: IDENTIDAD_SOBERANA_DE_PORTADA.year,
            type: IDENTIDAD_SOBERANA_DE_PORTADA.type,
            features: combinedFeatures
          },

          category: coverResult.category,
          analysis: galleryAnalysis
        };
      }

      return coverResult; // Fallback a solo portada si el resto falla

    } catch (error) {
      console.error("❌ Error en análisis secuencial:", error);
      // Si el análisis secuencial falla por algún motivo técnico, intentamos el método tradicional
    }
  }

  // MÉTODO TRADICIONAL (Para Business o Fallback)
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 🚀 OPTIMIZACIÓN CARMATCH: Enviamos hasta 10 fotos para revisión completa (1 portada + 9 galería)
      const imagesToAnalyze = images.slice(0, 10);
      const imageParts = imagesToAnalyze.map(img => ({
        inlineData: { data: img, mimeType: "image/jpeg" }
      }));

      const result = await geminiPro.generateContent([prompt, ...imageParts]); // ✅ Pro
      const response = await result.response;

      return await processGeminiResponse(response); // Moviendo lógica a una función auxiliar para limpieza
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || '';

      const isRetryable =
        errorMsg.includes("429") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("503") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("exhausted") ||
        errorMsg.includes("fetch") ||
        errorMsg.includes("network") ||
        errorMsg.includes("timeout") ||
        errorMsg.includes("deadline");

      if (isRetryable && i < maxRetries - 1) {
        // 🚀 OPTIMIZACIÓN CARMATCH: Cap de 5 segundos máximo por reintento.
        const waitTime = Math.min(Math.pow(1.5, i) * 1000, 5000) + (Math.random() * 800);
        console.warn(`⚠️ Asesor Real ocupado(${i + 1}/${maxRetries}). Reintentando en ${Math.round(waitTime)}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      break;
    }
  }

  // Si llegamos aquí es porque fallaron los reintentos
  console.error("❌ Error definitivo tras reintentos en analyzeMultipleImages:", lastError);

  const msg = lastError?.message?.toLowerCase() || '';

  // ❌ FAIL-CLOSED PROFESIONAL (15 INTENTOS)
  console.error("⚠️ ERROR TÉCNICO MÚLTIPLE DEFINITIVO (15 INTENTOS) - RECHAZANDO GALERÍA");
  return {
    valid: false,
    reason: "No pudimos completar la verificación técnica profunda. Intenta de nuevo con una conexión más estable o fotos más claras.",
    details: {},
    invalidIndices: [0]
  };
}

/**
 * Procesa la respuesta de Gemini para extraer el análisis consolidado
 */
async function processGeminiResponse(response: any): Promise<ImageAnalysisResult> {
  if (response.promptFeedback?.blockReason) {
    return { valid: false, reason: "Bloqueado por seguridad.", invalidIndices: [0] };
  }

  const text = response.text();
  console.log("🤖 Respuesta Gemini (Bulk):", text);

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.warn("⚠️ No se encontró JSON en respuesta de Gemini:", text);
    throw new Error("No JSON found in AI response");
  }

  const parsed = JSON.parse(match[0]);
  const isValidCover = parsed.isValidCover === true;
  let invalidIndices = (parsed.analysis || [])
    .filter((a: any) => a.isValid === false)
    .map((a: any) => Number(a.index));

  // 🛡️ REGLA SOBERANA RUBEN: El índice 0 manda. 
  // Si la IA lo marcó inválido solo por "coincidencia", lo rescatamos si es un vehículo.
  const coverReason = parsed.coverReason || "OK";

  // Si la razón de rechazo de la portada menciona que "no coincide con el resto", la forzamos a válida
  // porque el usuario decidió que la portada es la nueva verdad.
  let forceValidCover = isValidCover;
  if (!isValidCover && coverReason.toLowerCase().includes("coincide")) {
    forceValidCover = true;
    // Si la forzamos a válida por coincidencia, nos aseguramos que el índice 0 no esté en invalidIndices
    invalidIndices = invalidIndices.filter((i: number) => i !== 0);
  }

  return {
    valid: forceValidCover,
    reason: forceValidCover ? "OK" : coverReason,
    invalidIndices: invalidIndices,
    details: parsed.details || {},
    category: parsed.details?.type || 'Automóvil'
  };
}

export interface ContentModerationResult {
  isAppropriate: boolean;
  reason?: string;
  category?: 'VIOLENCE' | 'SEXUAL' | 'DRUGS' | 'WEAPONS' | 'HATE' | 'GORE' | 'OTHER';
}

export async function moderateUserContent(imageBase64: string): Promise<ContentModerationResult> {
  console.log('🛡️ Moderando contenido de imagen con Gemini Vision...');

  const prompt = `
    Analiza esta imagen ESTRICTAMENTE para moderación de contenido en una plataforma pública familiar(fotos de perfil de usuario y negocios).
    
    Busca CUALQUIERA de las siguientes categorías prohibidas:
    1. VIOLENCIA: Sangre real, heridas, peleas físicas, cadáveres, tortura.
    2. SEXUAL: Desnudez(total o parcial explícita), actos sexuales, juguetes sexuales, lencería provocativa sin contexto.
    3. DROGAS: Uso de drogas, parafernalia obvia(pipas, jeringas), sustancias ilegales.
    4. ARMAS: Armas de fuego reales apuntando o en contextos de amenaza, armas blancas ensangrentadas o agresivas. (Nota: armas en contexto deportivo / histórico claro pueden ser tolerables, pero ante la duda refierelas).
    5. ODIO: Símbolos nazis, kkk, mensajes de odio o racismo visibles.
    6. GORE: Mutilación, imágenes médicas perturbadoras, accidentes graves explícitos.

    Responde SOLAMENTE un objeto JSON con este formato exacto:
    {
      "isAppropriate": boolean, // true si NO contiene nada de lo anterior. false si contiene algo prohibido.
        "category": string, // "VIOLENCE", "SEXUAL", "DRUGS", "WEAPONS", "HATE", "GORE", u "OTHER" (solo si isAppropriate es false)
          "reason": string // Explicación corta y amable en ESPAÑOL del por qué se rechaza (solo si isAppropriate es false). Ej: "La imagen contiene desnudez no permitida.", "Se detectaron armas reales en la imagen."
    }

    IMPORTANTE:
    - Sé estricto con la desnudez y la violencia real.
    - Sé tolerante con: gente en traje de baño en playa / alberca(si no es provocativo), tatuajes(si no son ofensivos), alcohol(si es social moderado).
    - Si la imagen es un dibujo infantil inofensivo, un meme sano, o un paisaje, es APROPIADA.
    - Ignora la calidad estética, solo juzga el contenido.
  `;

  try {
    const result = await geminiFlash.generateContent([ // ✅ Flash para moderación (Estable en 2026)
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Limpiar bloques de código markdown si existen
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(cleanText) as ContentModerationResult;

    if (!parsed.isAppropriate) {
      console.warn(`❌ Imagen rechazada por moderación: ${parsed.category} - ${parsed.reason}`);
    } else {
      console.log('✅ Imagen aprobada por moderación');
    }

    return parsed;
  } catch (error) {
    console.error("Error en moderación de contenido:", error);
    // 🛡️ SEGURIDAD CARMATCH: Fail-Closed para moderación de contenido sensible (Pornografía/Armas)
    // No podemos arriesgar la reputación si la IA no responde.
    return { 
        isAppropriate: false, 
        category: 'OTHER', 
        reason: 'Error técnico en la verificación de seguridad. Reintente por favor.' 
    };
  }
}
