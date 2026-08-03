# Plan: 136 Prompts de Imagen para Facebook Ads CarMatch

## Objetivo
Crear 136 prompts de imagen optimizados para Gemini, listos para copiar y pegar. Cada imagen sera un anuncio de Facebook Ads para promocionar CarMatch en Mexico.

## Estructura de archivos
```
carmatch-fb-ads/
├── 01-negocios/
│   ├── 01-taller-mecanico.txt
│   ├── 02-taller-frenos.txt
│   ├── 03-taller-electrico.txt
│   ├── 04-hojalateria-pintura.txt
│   ├── 05-llantera.txt
│   ├── 06-autolavado-estetica.txt
│   ├── 07-detallado-profesional.txt
│   ├── 08-refaccionaria.txt
│   ├── 09-audio-alarmas.txt
│   ├── 10-cristales-automotriz.txt
│   ├── 11-tapiceria-automotriz.txt
│   ├── 12-transmisiones.txt
│   ├── 13-servicio-gruas.txt
│   ├── 14-taller-motos.txt
│   ├── 15-modificaciones-tuning.txt
│   ├── 16-taller-mofles.txt
│   ├── 17-taller-radiadores.txt
│   ├── 18-rectificadora.txt
│   ├── 19-taller-blindaje.txt
│   ├── 20-taller-diesel.txt
│   ├── 21-taller-offroad-4x4.txt
│   ├── 22-cerrajeria-automotriz.txt
│   ├── 23-gasolinera.txt
│   ├── 24-yonke-partes-usadas.txt
│   ├── 25-estacionamiento.txt
│   ├── 26-taller-suspension.txt
│   ├── 27-aire-acondicionado.txt
│   ├── 28-importadoras.txt
│   ├── 29-polarizado-vinil.txt
│   ├── 30-iluminacion-led.txt
│   ├── 31-laboratorio-inyectores.txt
│   ├── 32-rotulacion-wrap.txt
│   ├── 33-electrolinera.txt
│   ├── 34-taller-ev-hibrido.txt
│   ├── 35-cambio-aceite.txt
│   ├── 36-auto-boutique.txt
│   ├── 37-hospital-urgencias.txt
│   ├── 38-policia-transito.txt
│   └── 39-aeropuerto.txt
├── 02-vehiculos/
│   ├── 01-sedan.txt
│   ├── 02-suv.txt
│   ├── 03-pickup.txt
│   ├── 04-deportivo.txt
│   ├── 05-convertible.txt
│   ├── 06-coupe.txt
│   ├── 07-hatchback.txt
│   ├── 08-minivan.txt
│   ├── 09-wagon.txt
│   ├── 10-crossover.txt
│   ├── 11-limusina.txt
│   ├── 12-microcar.txt
│   ├── 13-roadster.txt
│   ├── 14-moke.txt
│   ├── 15-targa.txt
│   ├── 16-shooting-brake.txt
│   ├── 17-moto-deportiva.txt
│   ├── 18-moto-cruiser.txt
│   ├── 19-moto-touring.txt
│   ├── 20-moto-offroad.txt
│   ├── 21-scooter.txt
│   ├── 22-chopper.txt
│   ├── 23-naked.txt
│   ├── 24-dual-sport.txt
│   ├── 25-adventure.txt
│   ├── 26-cafe-racer.txt
│   ├── 27-scrambler.txt
│   ├── 28-enduro.txt
│   ├── 29-motocross.txt
│   ├── 30-trial.txt
│   ├── 31-triciclo-spyder.txt
│   ├── 32-cuatrimoto-atv.txt
│   ├── 33-moped.txt
│   ├── 34-pocket-bike.txt
│   ├── 35-supermoto.txt
│   ├── 36-tractocamion.txt
│   ├── 37-torton.txt
│   ├── 38-rabon.txt
│   ├── 39-pickup-heavy-duty.txt
│   ├── 40-volteo.txt
│   ├── 41-cisterna-pipa.txt
│   ├── 42-refrigerado.txt
│   ├── 43-plataforma.txt
│   ├── 44-caja-seca.txt
│   ├── 45-grua.txt
│   ├── 46-hormigonera.txt
│   ├── 47-portacoches-madrina.txt
│   ├── 48-basurero.txt
│   ├── 49-chasis-cabina.txt
│   ├── 50-bomberos.txt
│   ├── 51-blindado.txt
│   ├── 52-compactador.txt
│   ├── 53-madre-nodriza.txt
│   ├── 54-autobus-urbano.txt
│   ├── 55-interurbano.txt
│   ├── 56-turismo.txt
│   ├── 57-escolar.txt
│   ├── 58-microbus.txt
│   ├── 59-van-pasajeros.txt
│   ├── 60-articulado.txt
│   ├── 61-dos-pisos.txt
│   ├── 62-trolebus.txt
│   ├── 63-minibus.txt
│   ├── 64-shuttle-bus.txt
│   ├── 65-excavadora.txt
│   ├── 66-retroexcavadora.txt
│   ├── 67-bulldozer.txt
│   ├── 68-montacargas.txt
│   ├── 69-tractor-agricola.txt
│   ├── 70-cosechadora.txt
│   ├── 71-rodillo-compactador.txt
│   ├── 72-pavimentadora.txt
│   ├── 73-grua-industrial.txt
│   ├── 74-cargador-frontal.txt
│   ├── 75-minicargador.txt
│   ├── 76-sembradora.txt
│   ├── 77-motoconformadora.txt
│   ├── 78-telehandler.txt
│   ├── 79-sideboom.txt
│   ├── 80-barredora-industrial.txt
│   ├── 81-zanjadora.txt
│   ├── 82-perforadora.txt
│   ├── 83-utv-rzr-maverick.txt
│   ├── 84-buggy-arenero.txt
│   ├── 85-golf-cart.txt
│   ├── 86-go-kart.txt
│   ├── 87-motonieve.txt
│   ├── 88-ambulancia.txt
│   ├── 89-patrulla.txt
│   ├── 90-bomberos-especial.txt
│   ├── 91-blindado-especial.txt
│   ├── 92-food-truck.txt
│   ├── 93-casa-rodante-rv.txt
│   ├── 94-remolque.txt
│   ├── 95-lowboy.txt
│   ├── 96-remolque-frijorifico.txt
│   └── 97-plataforma-porta-contenedor.txt
└── README.txt
```

## Contenido de cada archivo
```
PROMPT (Gemini):
[2-4 oraciones en ingles, descripcion natural de la escena, incluye Don Match, colores CarMatch, texto overlay]

HOOK (Facebook):
[1 linea en espanol - el hook del anuncio]

CTA:
[Boton: Ej. "Publica Gratis" / "Descarga Ahora"]

SEGMENTACION:
- Edad: 25-55
- Ubicacion: Mexico
- Intereses: [especificos por categoria]
```

## Estilo visual
- Don Match: Hombre mexicano 30s, chaqueta azul CarMatch (#0369a1), celular en mano, sonrisa confiable
- Colores: Azul #0369a1, Naranja #f97316, fondo oscuro #111827
- Texto overlay: Blanco/grande/legible
- Estilo: Fotografia realista, publicitario Facebook Ads
- Formato: 1080x1080 (cuadrado) o 1200x628 (landscape)

## Instrucciones de uso
1. Abrir archivo .txt
2. Copiar el PROMPT
3. Pegar en Gemini (o Midjourney, DALL-E, etc.)
4. Generar imagen
5. Usar el HOOK como copy del anuncio en Facebook Ads Manager
6. Configurar segmentacion segun lo indicado
