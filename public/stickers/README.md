# Stickers CarMatch — Instrucciones de Impresión

## Archivos disponibles

| Archivo | Tamaño | Uso |
|---|---|---|
| `sticker-5x5.svg` | 5×5 cm | Principal — puertas, vitrinas, fachadas |
| `sticker-circular.svg` | 7 cm diámetro | Redondo — cajas, mostradores, empalmes |
| `sticker-mini.svg` | 4×4 cm | Pequeño — mostradores, cajas, muebles |
| `qr-only.svg` | 3×3 cm | Solo QR — para pegar donde quieras |

## Especificaciones de impresión

### Material
- **Vinilo adhesivo** (para vidrio, metal, plástico)
- **Acabado mate** (no refleja, el QR se lee mejor)
- **Resistente a intemperie** si van en exteriores

### Colores
- **Naranja**: #FF6B00 (fondo)
- **Blanco**: #FFFFFF (texto, borde)
- **Negro**: #000000 (QR)

### Tamaños recomendados
| Sticker | Tamaño de impresión | QR mínimo |
|---|---|---|
| Principal | 5×5 cm | 2×2 cm |
| Circular | 7 cm diámetro | 2.5×2.5 cm |
| Mini | 4×4 cm | 2×2 cm |

### Cantidad mínima recomendada
- **200 unidades** (~$300-500 MXN en imprenta local)
- Surte ~50-60 negocios por zona

## Dónde pegar

### SÍ (con permiso del dueño)
- Puerta de entrada del negocio
- Vidrio de la vitrina
- Mostrador / caja
- Cerca del punto de pago

### NO
- Postes públicos (te lo quitan o multan)
- Señales de tránsito
- Propiedad ajena sin permiso

## Imprimir

### Opción 1: Imprenta local en Juárez
1. Lleva los archivos SVG en USB
2. Pide: "Vinilo adhesivo mate, 5cm x 5cm, a color"
3. Precio estimado: $2-3 MXN por unidad

### Opción 2: Impresión online
- **Mercado Libre**: buscar "stickers vinilo personalizados"
- **StickerMule**, **StickerApp**: calidad premium
- **Copy shops**: Office Depot, etc.

## Checklist antes de imprimir

- [ ] QR escaneable (probar con celular)
- [ ] Texto legible de lejos
- [ ] Color naranja consistente
- [ ] Link correcto: carmatchapp.net
- [ ] Archivo SVG abierto en navegador para verificar

## QR Destination
URL: `https://carmatchapp.net`

Para regenerar el QR con otra URL:
```bash
node -e "const QRCode = require('qrcode'); QRCode.toString('NUEVA_URL', {type:'svg',width:300,margin:2,errorCorrectionLevel:'M'}).then(svg => require('fs').writeFileSync('public/stickers/qr-only.svg', svg));"
```
