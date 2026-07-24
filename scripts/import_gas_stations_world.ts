import { prisma } from '../src/lib/db';
import { generateSlug } from '../src/lib/slug';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * 🌍 CARMATCH GLOBAL CITY SCOUTER
 * Processes gas stations city-by-city using GPS coordinates and radius.
 */

const OVERPASS_MIRRORS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];

const BATCH_SIZE = 100;
const RADIUS_METERS = 20000; // 20km around the city center
const PROGRESS_FILE = path.join(__dirname, 'import_progress.json');
const CITIES_FILE = path.join(__dirname, 'world_cities.json');

async function main() {
    console.log("\n🚀 CARMATCH GLOBAL CITY SCOUTER: ACTIVADO");
    console.log("==========================================");

    // 1. Localizar Administrador
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUser = await prisma.user.findFirst({
        where: adminEmail ? { email: adminEmail } : { isAdmin: true }
    });

    if (!adminUser) {
        console.error("❌ ERROR CRÍTICO: No se encontró ningún administrador.");
        process.exit(1);
    }

    // 2. Cargar ciudades y progreso
    if (!fs.existsSync(CITIES_FILE)) {
        console.error("❌ ERROR: No se encontró el archivo world_cities.json");
        process.exit(1);
    }
    const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
    let progress = { completedCities: [] };
    if (fs.existsSync(PROGRESS_FILE)) {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }

    console.log(`🌍 Total Ciudades: ${cities.length} | Completadas: ${progress.completedCities.length}`);

    // 3. Procesar ciudades una a una
    for (const city of cities) {
        if (progress.completedCities.includes(city.name)) {
            console.log(`⏩ Saltando: ${city.name} (Ya completado)`);
            continue;
        }

        console.log(`\n🎯 ESCANEANDO: ${city.name}, ${city.country} (${city.lat}, ${city.lon})`);
        
        try {
            await importNearLocation(city.lat, city.lon, city.name, city.country, adminUser);
            
            // Guardar progreso
            progress.completedCities.push(city.name);
            fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
            
            console.log("⏳ Respetando Rate Limits (10s)...");
            await new Promise(r => setTimeout(r, 10000));
        } catch (error) {
            console.error(`❌ Error procesando ${city.name}:`, error);
            console.log("⏳ Esperando 30s para reintentar siguiente ciudad...");
            await new Promise(r => setTimeout(r, 30000));
        }
    }

    console.log("\n🏁 EXPANSIÓN POR CIUDADES COMPLETADA 🏁");
}

async function importNearLocation(lat: number, lon: number, cityName: string, countryName: string, adminUser: any) {
    // Query de proximidad (around) para mayor eficiencia
    const query = `[out:json][timeout:300];
        (
          node["amenity"="fuel"](around:${RADIUS_METERS},${lat},${lon});
          way["amenity"="fuel"](around:${RADIUS_METERS},${lat},${lon});
          relation["amenity"="fuel"](around:${RADIUS_METERS},${lat},${lon});
        );
        out center qt;`;

    let elements: any[] = [];
    let success = false;

    for (const mirror of OVERPASS_MIRRORS) {
        if (success) break;
        try {
            console.log(`📡 Consultando espejo: ${mirror}...`);
            const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`);
            if (!response.ok) {
              console.warn(`⚠️ Espejo respondió con status: ${response.status}`);
              continue;
            }
            const data: any = await response.json();
            elements = data.elements || [];
            success = true;
        } catch (e) {
            console.warn(`⚠️ Error en espejo ${mirror}, probando siguiente...`);
        }
    }

    if (!success) throw new Error("No se pudo contactar con ningún servidor Overpass");
    if (elements.length === 0) {
        console.warn(`⚠️ No se encontraron gasolineras en este radio.`);
        return;
    }

    console.log(`✨ ${elements.length} gasolineras encontradas cerca de ${cityName}.`);

    let addedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < elements.length; i += BATCH_SIZE) {
        const batch = elements.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (node: any) => {
            const sLat = node.lat || node.center?.lat;
            const sLon = node.lon || node.center?.lon;
            if (!sLat || !sLon) return;

            // Deduplicación por proximidad GPS (150m aprox)
            const exists = await prisma.business.findFirst({
                where: {
                    latitude: { gte: sLat - 0.0015, lte: sLat + 0.0015 },
                    longitude: { gte: sLon - 0.0015, lte: sLon + 0.0015 },
                    category: 'gasolinera'
                }
            });

            if (exists) {
                skippedCount++;
                return;
            }

            const brand = node.tags?.brand || node.tags?.operator || '';
            let name = node.tags?.name || brand || 'Gasolinera';
            if (name === 'Gasolinera' && brand) name = brand;

            const city = node.tags?.['addr:city'] || cityName;
            const country = node.tags?.['addr:country'] || countryName;

            const slug = generateSlug(`${name} ${city}`) + '-' + Math.random().toString(36).substring(7);

            try {
                await prisma.business.create({
                    data: {
                        userId: adminUser.id,
                        name: name,
                        slug: slug,
                        category: 'gasolinera',
                        description: `Estación de combustible ${brand} verificada por CarMatch en ${city}.`,
                        address: node.tags?.['addr:street'] || `GPS: ${sLat.toFixed(4)}, ${sLon.toFixed(4)} en ${city}`,
                        city: city,
                        state: node.tags?.['addr:state'] || cityName,
                        country: country,
                        latitude: sLat,
                        longitude: sLon,
                        isActive: true,
                        isFreePublication: true,
                        services: ['Gasolina', 'Diesel', 'Aire'],
                        hours: '24 Horas',
                        is24Hours: true,
                        expiresAt: new Date(Date.now() + 315360000000), // 10 años
                        images: []
                    }
                });
                addedCount++;
            } catch (err) { }
        }));
    }
    console.log(`✅ ${cityName}: ${addedCount} Agregadas / ${skippedCount} Existentes.`);
}

main()
    .catch(e => console.error("❌ ERROR FATAL:", e))
    .finally(async () => await prisma.$disconnect());
