import 'dotenv/config';
import { interpretSearchQuery } from '../src/lib/ai/searchInterpreter';
import { buildVehicleQuery, buildBusinessQuery } from '../src/lib/ai/searchQueryBuilder';

/**
 * 🧪 TEST: PERFECT AI SEARCH
 * Prueba la extracción de intención y la generación de consultas Prisma.
 */

async function testQuery(query: string, city: string = 'México') {
    console.log(`\n🔍 PROBANDO: "${query}" (Ciudad: ${city})`);
    console.log("------------------------------------------");

    try {
        const intent = await interpretSearchQuery(query, 'MARKET', city);
        console.log("✅ Intención Detectada:", JSON.stringify(intent, null, 2));

        if (intent.isBusinessSearch) {
            const where = buildBusinessQuery(intent);
            console.log("📂 Prisma Where (BUSINESS):", JSON.stringify(where, null, 2));
        } else {
            const where = buildVehicleQuery(intent);
            console.log("🚗 Prisma Where (VEHICLE):", JSON.stringify(where, null, 2));
        }

    } catch (error) {
        console.error("❌ Error en prueba:", error);
    }
}

async function runTests() {
    console.log("🚀 INICIANDO PRUEBAS DE BÚSQUEDA IA PERFECTA");
    
    // Test 1: Búsqueda básica de vehículo
    await testQuery("Busco un Mustang rojo barato");

    // Test 2: Búsqueda con slang mexicano y ciudad
    await testQuery("busco una troca mamalona en monterrey", "Monterrey");

    // Test 3: Búsqueda de negocio (taller)
    await testQuery("taller mecanico cerca de polanco", "CDMX");

    // Test 4: Búsqueda compleja con múltiples filtros
    await testQuery("camioneta blanca automatica de mas de 500 mil pesos del 2020");

    console.log("\n✨ PRUEBAS FINALIZADAS");
    process.exit(0);
}

runTests();
