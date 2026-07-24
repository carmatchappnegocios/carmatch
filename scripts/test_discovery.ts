import fetch from 'node-fetch';

async function test() {
    const country = "Mexico";
    const query = `[out:json];area["name"="${country}"]->.a;(node(area.a)["place"~"city|town"];);out body;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url);
        const data: any = await response.json();
        const cities = data.elements.map((e: any) => ({
            name: e.tags.name,
            type: e.tags.place,
            lat: e.lat,
            lon: e.lon
        }));
        console.log(`Found ${cities.length} cities/towns in ${country}`);
        console.log("Sample:", cities.slice(0, 5));
    } catch (e) {
        console.error(e);
    }
}

test();
