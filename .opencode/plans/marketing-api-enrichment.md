# Plan: Enriquecer Marketing API - `type=products`

## Objetivo
Expandir el endpoint `/api/marketing/data?type=products` para que una empresa de marketing tenga TODA la información necesaria para crear campañas publicitarias efectivas para CarMatch.

## Archivo a modificar
`src/app/api/marketing/data/route.ts` — Reemplazar el case `products` (líneas 180-233) con la versión enriquecida.

## Cambios detallados

### 1. Nuevos filtros de query
Agregar filtros opcionales al request:
- `?country=MX` — Filtrar por país
- `?vehicleType=SUV` — Filtrar por tipo
- `?brand=Toyota` — Filtrar por marca
- `?minYear=2020` — Filtrar por año mínimo
- `?maxPrice=500000` — Filtrar por precio máximo
- `?limit=50` y `?city=` (ya existen)

### 2. Campos expandidos por vehículo (de 12 → 40+)
**Campos existentes (se mantienen):**
nombre, precio, moneda, descripcion, imagen, categoria, marca, modelo, anio, ciudad, color, url

**Campos nuevos:**
| Campo | Tipo | Descripción |
|---|---|---|
| `imagenes_count` | number | Cantidad de fotos |
| `todas_las_imagenes` | string[] | URLs de todas las imágenes |
| `condicion` | string | Nuevo/Usado/Seminuevo |
| `kilometraje` | number? | Millaje real |
| `unidad_kilometraje` | string | km/mi |
| `transmision` | string? | Automática/Manual |
| `combustible` | string? | Gas/Diésel/Eléctrico/Híbrido |
| `motor` | string? | Descripción del motor |
| `cilindrada` | number? | Engine displacement |
| `potencia_cv` | number? | Caballos de fuerza |
| `torque` | string? | Torque |
| `peso` | number? | Peso en kg |
| `puertas` | number? | 2/4/5 |
| `pasajeros` | number? | Capacidad |
| `traccion` | string? | Delantera/Trasera/4x4 |
| `version` | string? | Nivel de equipamiento |
| `colonia` | string? | Colonia/fracción |
| `estado` | string? | Estado/Provincia |
| `pais` | string | País (default MX) |
| `latitud` | number? | Para geo-targeting |
| `longitud` | number? | Para geo-targeting |
| `caracteristicas` | string[] | Lista de features |
| `vistas` | number | Número de vistas |
| `favoritos` | number | Número de favoritos |
| `es_gratuito` | boolean | Publicación gratuita o de pago |
| `fecha_publicacion` | string ISO | Fecha de publicación |
| `tuvo_accidentes` | boolean? | Historial de accidentes |
| `duenos_previos` | number? | Número de dueños previos |
| `capacidad_bateria` | number? | Para EVs |
| `autonomia` | number? | Range para EVs |
| `url_absoluta` | string | URL completa |

### 3. Metadata de respuesta
```json
{
  "meta": {
    "total_disponible": <count total en BD>,
    "total_en_respuesta": <count en esta respuesta>,
    "limite_aplicado": <limit>,
    "filtros_aplicados": { ciudad, pais, tipo_vehiculo, marca, anio_minimo, precio_maximo },
    "fecha_consulta": "2026-07-30T...",
    "ultima_publicacion": "2026-07-30T..."
  }
}
```

### 4. Info de plataforma
```json
{
  "plataforma": {
    "nombre": "CarMatch Social",
    "url": "https://carmatchapp.net",
    "descripcion": "...",
    "mercados": ["México", "USA", "Latinoamérica", "España"],
    "idiomas": 22,
    "funciones_clave": [...],
    "moneda_local": "MXN",
    "total_vehiculos_activos": <count>,
    "audiencia_objetivo": "..."
  }
}
```

### 5. Tendencias de mercado (calculadas de todos los vehículos activos)
```json
{
  "tendencias": {
    "marcas_populares": [{ "nombre": "Toyota", "cantidad": 25, "porcentaje": 25 }],
    "tipos_populares": [...],
    "combustibles_populares": [...],
    "colores_populares": [...],
    "condiciones": [...],
    "transmisiones": [...],
    "rango_precios": { "minimo", "maximo", "promedio", "mediana", "moneda" }
  }
}
```

### 6. Sugerencias de marketing pre-generadas
```json
{
  "sugerencias_marketing": {
    "hashtags_populares": ["#CarMatch", "#CompraTuAuto", ...],
    "angulos_por_tipo": { "SUV": " Ideal para familias...", ... },
    "ctas_recomendados": [...],
    "segmentos_audiencia": [
      { "nombre": "Compradores primer auto", "descripcion": "...", "angulo": "..." },
      ...
    ]
  }
}
```

## Sin breaking changes
- Todos los campos existentes se mantienen igual
- Solo se agregan campos nuevos
- Los filtros son opcionales (backward compatible)
- La query SQL usa los mismos índices que antes

## Verificación
1. `npx tsc --noEmit` — Verificar que no hay errores de tipo
2. Probar localmente: `curl "http://localhost:3000/api/marketing/data?key=cm_mktg_2026_a7f3b9c1e5d8&type=products&limit=3"`
3. Verificar que la respuesta tiene: `meta`, `plataforma`, `tendencias`, `sugerencias_marketing`, `productos`
4. Deploy a Vercel y probar en producción
