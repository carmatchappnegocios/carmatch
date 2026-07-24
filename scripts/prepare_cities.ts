import fs from 'fs';
import path from 'path';

/**
 * 🛰️ GLOBAL CITY PREPARATOR
 * Downloads a massive dataset of 128,000+ cities to ensure 100% world coverage.
 */

const CITIES_SOURCE_URL = 'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json';
const OUTPUT_FILE = path.join(__dirname, 'world_cities.json');

async function main() {
    console.log("📥 Descargando base de datos mundial de ciudades (128,000+)...");
    
    try {
        const response = await fetch(CITIES_SOURCE_URL);
        if (!response.ok) throw new Error(`Error descargando: ${response.statusText}`);
        
        const rawCities: any[] = await response.json();
        console.log(`✅ ${rawCities.length} ciudades descargadas.`);

        // Convert to our format: { name, country, lat, lon }
        // Filter: We can filter by population if the source had it, 
        // but lutangar's cities.json is already a good curated list.
        const formattedCities = rawCities.map(c => ({
            name: c.name,
            country: c.country,
            lat: parseFloat(c.lat),
            lon: parseFloat(c.lng)
        }));

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(formattedCities, null, 2));
        console.log(`🚀 Lista masiva guardada en: ${OUTPUT_FILE}`);
        console.log("Ahora puedes ejecutar: npm run db:scout-world");
        
    } catch (error) {
        console.error("❌ Fallo al preparar ciudades:", error);
    }
}

main();
