# Plan: Auditoria Pre-Lanzamiento CarMatch

## Contexto
El usuario va a empezar a publicar en Facebook Ads. Necesita que la app este limpia y profesional antes de recibir trafico masivo (mayormente movil desde Mexico).

## Hallazgos y Fixes (17 items)

### FIX 1: Ratings falsos en Schema.org
- **Archivos**: `src/app/comprar/[slug]/page.tsx`, `src/app/negocio/[slug]/page.tsx`
- **Accion**: Eliminar `fakeRating` y `fakeReviewCount`. No mostrar rating en JSON-LD si no hay reviews reales. Si se muestra rating, usar `ratingCount: 0` cuando no hay reviews.

### FIX 2: Ratings aleatorios en directorio
- **Archivo**: `src/app/negocios/[city]/[category]/page.tsx` linea 108
- **Accion**: Eliminar `Math.random()` para ratings. Mostrar "Sin calificaciones" cuando no hay reviews reales.

### FIX 3: Fraud detection - no-op intencional
- **Archivo**: `src/app/api/fraud/check/route.ts` linea 186
- **Accion**: Dejar el TODO como no-op. No buscar fraude proactivamente (imposible con millones de autos iguales). El enfoque correcto es: DESPUES de una denuncia, rastrear al usuario bloqueado (IP, dispositivo, email, telefono, fotos, ubicacion) e impedir que cree mas cuentas.
- **Filosofia del usuario**: Citas Seguras previene el fraude en persona. Si denuncian a alguien, ahi si rastreamos y bloqueamos toda cuenta futura de esa persona.

### FIX 4: Login con email/password
- **Archivo**: `src/app/auth/`, `src/app/api/auth/register/`
- **Accion**: Agregar formulario de registro con email/password junto al boton de Google. El registro por email ya existe en API, solo falta el frontend.

### FIX 5: Eliminar fingerprint check
- **Archivo**: `src/app/api/auth/fingerprint-check/route.ts`
- **Accion**: Eliminar endpoint o convertirlo en no-op. El usuario no quiere huella digital ni bloqueo de cuentas.

### FIX 6: Proteger `/api/cron/update-taxonomy`
- **Archivo**: `src/app/api/cron/update-taxonomy/route.ts`
- **Accion**: Agregar verificacion `Bearer ${CRON_SECRET}` igual que los demas crons.

### FIX 7: Proteger report messages
- **Archivo**: `src/app/api/report/[id]/messages/route.ts`
- **Accion**: Verificar que el usuario actual es el autor del report o es admin antes de retornar mensajes.

### FIX 8: Proteger appointment safety-check
- **Archivo**: `src/app/api/appointments/[id]/safety-check/route.ts`
- **Accion**: Verificar que el usuario es comprador o vendedor de la cita antes de permitir el POST.

### FIX 9: Reemplazar alert() por toast
- **Archivos**: 16 archivos con 54 llamadas a `alert()`
- **Accion**: Instalar `sonner` (ya esta en package.json como dependencia de Next.js) y reemplazar `alert()` por `toast()` en todos los archivos afectados. Priorizar settings, my-businesses, admin, chat.

### FIX 10: Agregar /notifications al middleware protectedRoutes
- **Archivo**: `src/middleware.ts` o archivo de config de auth
- **Accion**: Agregar `'notifications'` al array de protectedRoutes.

### FIX 11: Auth guard en business/register
- **Archivo**: `src/app/business/register/page.tsx`
- **Accion**: Agregar check de sesion al inicio del componente. Si no hay sesion, mostrar boton de login primero en vez de todo el formulario.

### FIX 12: Quitar localhost fallback en QR codes
- **Archivo**: `src/components/QRCodeModal.tsx` linea 27
- **Accion**: Cambiar fallback a `https://carmatchapp.net` en vez de `http://localhost:3000`.

### FIX 13: Unificar post-login destinations
- **Archivos**: `src/app/auth/callback/page.tsx`
- **Accion**: Usar `getWeightedHomePath()` en el callback en vez del split 70/30 hardcodeado.

### FIX 14: Quitar /api/report duplicado
- **Archivo**: `src/app/api/report/route.ts`
- **Accion**: Redirigir o eliminar. Mantener solo `/api/reports` como version final.

### FIX 15: Quitar /api/business/register duplicado
- **Archivo**: `src/app/api/business/register/route.ts`
- **Accion**: Redirigir a `/api/businesses` POST.

### FIX 16: Agregar paginacion basica a paginas de listado
- **Archivos**: `/autos/[brand]`, `/autos-en/[city]`, `/autos/cluster/[tag]`
- **Accion**: Agregar boton "Ver mas" o infinite scroll basico. Incrementar limit a 50.

### FIX 17: Admin users DELETE - soft delete
- **Archivo**: `src/app/api/admin/users/[id]/route.ts`
- **Accion**: Cambiar `prisma.user.delete()` por `prisma.user.update({ data: { isActive: false } })`.

## Orden de ejecucion sugerido
1. Fixes criticos (1, 2, 3) - SEO y confianza
2. Fix 4 (login email) - conversion
3. Fixes de seguridad (6, 7, 8, 17)
4. Fix 9 (alert→toast) - UX movil
5. Fixes restantes (5, 10, 11, 12, 13, 14, 15, 16)

## Nota del usuario
- NO quiere fingerprint/huella digital (fix 5 = eliminar endpoint)
- NO quiere bloqueo de cuentas por dispositivo proactivamente
- NO quiere buscar fraude proactivamente - imposible con millones de autos iguales
- DESPUES de denuncia: SI rastrear IP, dispositivo, email, telefono, fotos, ubicacion
- Bloquear toda cuenta futura de persona denunciada/bloqueada
- Citas Seguras es la.prevencion principal del fraude
