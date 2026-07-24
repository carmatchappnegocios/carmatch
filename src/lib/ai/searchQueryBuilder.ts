import { SearchIntent } from "./searchInterpreter";
import { Prisma } from "@prisma/client";

/**
 * 🛠️ CARMATCH SEARCH QUERY BUILDER
 * Transforma la intención de búsqueda de la IA en consultas Prisma potentes.
 */

export interface SearchQueryOptions {
  includeDisabled?: boolean;
  limit?: number;
}

export function buildVehicleQuery(intent: SearchIntent, options: SearchQueryOptions = {}): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {
    status: options.includeDisabled ? undefined : 'ACTIVE',
  };

  // 1. Filtros de Identidad
  if (intent.brand) {
    where.brand = { contains: intent.brand, mode: 'insensitive' };
  }

  if (intent.model) {
    where.model = { contains: intent.model, mode: 'insensitive' };
  }

  if (intent.vehicleType) {
    where.vehicleType = { contains: intent.vehicleType, mode: 'insensitive' };
  }

  if (intent.category) {
    where.user = {
        vehicles: {
            some: {
                vehicleType: { contains: intent.category, mode: 'insensitive' }
            }
        }
    };
    // Nota: En el schema Vehicle tiene vehicleType directamente, category parece ser un concepto de UI o de Business.
    // Pero si SearchIntent trae category, intentamos mapearlo si es posible.
  }

  // 2. Manejo de Rangos Numéricos (Precio y Año)
  if (intent.minPrice !== undefined || intent.maxPrice !== undefined) {
    where.price = {
      gte: intent.minPrice,
      lte: intent.maxPrice
    };
  }

  if (intent.minYear !== undefined || intent.maxYear !== undefined) {
    where.year = {
      gte: intent.minYear,
      lte: intent.maxYear
    };
  }

  // 3. Atributos Técnicos
  if (intent.color) {
    where.color = { contains: intent.color, mode: 'insensitive' };
  }

  if (intent.transmission) {
    where.transmission = { contains: intent.transmission, mode: 'insensitive' };
  }

  if (intent.fuel) {
    where.fuel = { contains: intent.fuel, mode: 'insensitive' };
  }

  if (intent.traction) {
    where.traction = { contains: intent.traction, mode: 'insensitive' };
  }

  if (intent.cylinders !== undefined) {
    where.cylinders = intent.cylinders;
  }

  if (intent.hp !== undefined) {
    where.hp = { gte: intent.hp };
  }

  if (intent.range !== undefined) {
    where.range = { gte: intent.range };
  }

  // 4. Estado y Uso
  if (intent.condition) {
    where.condition = { contains: intent.condition, mode: 'insensitive' };
  }

  if (intent.mileage !== undefined) {
    where.mileage = { lte: intent.mileage };
  }

  if (intent.owners !== undefined) {
    where.owners = { lte: intent.owners };
  }

  // 5. Ubicación y Capacidad
  if (intent.city) {
    where.city = { contains: intent.city, mode: 'insensitive' };
  }

  if (intent.passengers !== undefined) {
    where.passengers = { gte: intent.passengers };
  }

  // 6. Características (Features)
  if (intent.features && intent.features.length > 0) {
    // Usamos AND para que cumpla con todas las características solicitadas si es posible
    where.AND = [
        ...(where.AND as any[] || []),
        ...intent.features.map(f => ({
            features: { has: f }
        }))
    ];
  }

  // 7. Búsqueda por palabras clave (Fallback Inteligente)
  if (intent.keywords && intent.keywords.length > 0) {
    const keywordConditions = intent.keywords.map(keyword => ({
        OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { brand: { contains: keyword, mode: 'insensitive' } },
            { model: { contains: keyword, mode: 'insensitive' } },
            { city: { contains: keyword, mode: 'insensitive' } }
        ]
    }));

    where.AND = [
        ...(where.AND as any[] || []),
        ...keywordConditions
    ];
  }

  return where;
}

export function buildBusinessQuery(intent: SearchIntent, options: SearchQueryOptions = {}): Prisma.BusinessWhereInput {
  const where: Prisma.BusinessWhereInput = {
    isActive: options.includeDisabled ? undefined : true,
  };

  if (intent.category) {
    where.category = { contains: intent.category, mode: 'insensitive' };
  }

  if (intent.brand) {
    // Si busca una marca en negocios, buscamos el nombre del negocio (ej: "Agencia Toyota")
    where.OR = [
        { name: { contains: intent.brand, mode: 'insensitive' } },
        { description: { contains: intent.brand, mode: 'insensitive' } }
    ];
  }

  if (intent.city) {
    where.city = { contains: intent.city, mode: 'insensitive' };
  }

  if (intent.features && intent.features.length > 0) {
    where.services = { hasSome: intent.features };
  }

  if (intent.keywords && intent.keywords.length > 0) {
    const keywordConditions = intent.keywords.map(keyword => ({
        OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { services: { hasSome: [keyword] } },
            { category: { contains: keyword, mode: 'insensitive' } }
        ]
    }));

    where.AND = [
        ...(where.AND as any[] || []),
        ...keywordConditions
    ];
  }

  return where;
}

export default {
    buildVehicleQuery,
    buildBusinessQuery
};
