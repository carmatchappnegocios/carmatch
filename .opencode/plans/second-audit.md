# Plan: Segunda Auditoria - 35 Fixes

## Contexto
Segunda auditoria completa post-primer ronda de 17 fixes. 56 hallazgos, 35 a arreglar antes de Facebook Ads.

## CRITICOS (1-7)

### FIX 1: 7 alert() en usePushNotifications
- **Archivo:** `src/hooks/usePushNotifications.ts`
- **Accion:** Reemplazar 7 alert() por toast() de sonner

### FIX 2: Habilitar PushNotificationRequest
- **Archivos:** `src/app/layout.tsx:155`, `src/components/Providers.tsx:23`
- **Accion:** Descomentar `<PushNotificationRequest />` en ambos archivos

### FIX 3: Habilitar InstallInvasiveBanner
- **Archivo:** `src/app/layout.tsx:154`
- **Accion:** Descomentar `<InstallInvasiveBanner />`

### FIX 4: Crear loading.tsx para paginas principales
- **Archivos:** Crear `src/app/market/loading.tsx`, `src/app/swipe/loading.tsx`, `src/app/auth/loading.tsx`, `src/app/publish/loading.tsx`, `src/app/comprar/[slug]/loading.tsx`
- **Accion:** Spinner simple con mensaje

### FIX 5: Rate limiter con Vercel KV o fallback
- **Archivo:** `src/lib/rate-limit.ts`
- **Accion:** Cambiar de Map in-memory a alternativa que funcione en serverless. Usar `Map` con timestamp tracking y cleanup periodico, o integrar `@upstash/ratelimit` si KV esta disponible.

### FIX 6: CAPTCHA en registro
- **Archivo:** `src/app/api/auth/register/route.ts`
- **Accion:** Agregar verificacion de honeypot field (campo oculto que bots llenan) + rate limit mas agresivo

### FIX 7: Stripe webhook error message
- **Archivo:** `src/app/api/webhooks/stripe/route.ts:53`
- **Accion:** Cambiar `Webhook Error: ${err.message}` por `"Firma invalida"`

## ALTOS (8-25)

### FIX 8: user/location GET - quitar email
- **Archivo:** `src/app/api/user/location/route.ts:148`
- **Accion:** Quitar `email: true` del select

### FIX 9: user PATCH - select explicito
- **Archivo:** `src/app/api/user/route.ts:43`
- **Accion:** Cambiar `return NextResponse.json(updatedUser)` por select con solo campos seguros

### FIX 10: debug endpoint - quitar NEXTAUTH_URL value
- **Archivo:** `src/app/api/debug/route.ts:21-24`
- **Accion:** Retornar solo "CONFIGURED"/"MISSING" para todos los campos

### FIX 11: Marketing API CORS restrictivo
- **Archivo:** `src/app/api/marketing/data/route.ts`
- **Accion:** Cambiar `*` por origenes especificos

### FIX 12: Mapbox env var en my-businesses
- **Archivo:** `src/app/my-businesses/MyBusinessesClient.tsx:212`
- **Accion:** Cambiar `NEXT_PUBLIC_MAPBOX_TOKEN` por `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### FIX 13: Admin PATCH - solo master admin puede cambiar isAdmin
- **Archivo:** `src/app/api/admin/users/[id]/route.ts:85`
- **Accion:** Verificar `isAdminMaster` antes de permitir cambio de isAdmin

### FIX 14: Chatbot rate limiting
- **Archivo:** `src/app/api/ai/chatbot/route.ts`
- **Accion:** Agregar rate limit por usuario (20 req/min)

### FIX 15: map/search auth + rate limit
- **Archivo:** `src/app/api/map/search/route.ts`
- **Accion:** Agregar auth check y rate limiting

### FIX 16: analytics/track rate limit
- **Archivo:** `src/app/api/analytics/track/route.ts`
- **Accion:** Agregar rate limiting

### FIX 17: Habilitar push para Citas Seguras
- **Accion:** Ya cubierto por FIX 2 (PushNotificationRequest habilitado)

### FIX 18: Quitar console.logs criticos
- **Archivos:** ~30 archivos con console.log en produccion
- **Accion:** Eliminar o reemplazar por console.error solo para errores reales. Priorizar: client-side (SwipeClient, PublishClient, messages) y server-side (fraud/check, upload, chats)

### FIX 19: JWT maxAge reducido a 7 dias
- **Archivo:** `src/lib/auth.ts:120`
- **Accion:** Cambiar `30 * 24 * 60 * 60` por `7 * 24 * 60 * 60`

### FIX 20: Content-Security-Policy header
- **Archivo:** `next.config.ts`
- **Accion:** Agregar header CSP basico

### FIX 21: credits/confirm atomic check
- **Archivo:** `src/app/api/credits/confirm/route.ts`
- **Accion:** Mover check de payment existente dentro de la transaccion

### FIX 22: Email admin - mover a env var
- **Archivo:** `src/app/api/vehicles/route.ts:314`
- **Accion:** Cambiar hardcoded email por `process.env.ADMIN_EMAIL`

### FIX 23: waitlist rate limit
- **Archivo:** `src/app/api/waitlist/route.ts`
- **Accion:** Agregar rate limiting

### FIX 24: user/search - solo buscar por nombre
- **Archivo:** `src/app/api/user/search/route.ts:28`
- **Accion:** Quitar email del search query, solo nombre

### FIX 25: Habilitar TS errors en build
- **Archivo:** `next.config.ts:44-51`
- **Accion:** Cambiar `ignoreBuildErrors: false` para typescript

## MEDIOS (26-35)

### FIX 26: Error boundaries para paginas principales
- **Archivos:** Crear error.tsx en publish, messages, swipe, profile, settings
- **Accion:** Componente de error con navegacion

### FIX 27: Quitar user-scalable=0
- **Archivo:** `src/app/layout.tsx:128`
- **Accion:** Quitar `user-scalable=0` y `maximum-scale=1` del viewport meta

### FIX 28: Quitar setInterval forceMobile
- **Archivo:** `src/app/layout.tsx:131-147`
- **Accion:** Eliminar el setInterval que fuerza el viewport cada segundo

### FIX 29: CredentialsForm i18n
- **Archivo:** `src/components/auth/CredentialsForm.tsx`
- **Accion:** Reemplazar strings hardcoded por t() calls

### FIX 30: ReportImageButton i18n
- **Archivo:** `src/components/ReportImageButton.tsx`
- **Accion:** Reemplazar strings hardcoded por t() calls

### FIX 31: Validacion inline en formularios
- **Archivos:** `CredentialsForm.tsx`, `PublishClient.tsx`, `business/register/page.tsx`
- **Accion:** Agregar validacion visual antes de submit

### FIX 32: Upload file size limit
- **Archivo:** `src/app/api/upload/route.ts`
- **Accion:** Verificar file.size antes de procesar (max 10MB)

### FIX 33: Admin PATCH - proteger campo isAdmin
- **Accion:** Ya cubierto por FIX 13

### FIX 34: Quitar /auth/login y /auth/register del middleware
- **Archivo:** `src/middleware.ts` o `src/lib/auth.config.ts`
- **Accion:** Quitar rutas inexistentes de authRoutes

### FIX 35: Quitar stale TODO en fraud/check
- **Archivo:** `src/app/api/fraud/check/route.ts:186`
- **Accion:** Actualizar o eliminar TODO
