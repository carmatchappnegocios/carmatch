# Archivos Protegidos - CarMatch App

⚠️ **ESTOS ARCHIVOS NO DEBEN SER MODIFICADOS SIN VERIFICACIÓN**

La aplicación CarMatch está en producción y funcionando correctamente.
Las modificaciones a estos archivos pueden romper funcionalidad crítica.

---

## Archivos PROTEGIDOS (NO MODIFICAR)

### App Principal
- `src/app/**` — Todas las rutas y páginas
- `src/components/**` — Todos los componentes UI
- `src/lib/**` — Toda la lógica de negocio
- `middleware.ts` — Autenticación y protección de rutas
- `next.config.ts` — Configuración de Next.js y Sentry
- `package.json` — Dependencias
- `prisma/schema.prisma` — Esquema de base de datos
- `public/sw.js` — Service Worker PWA

### Seguridad
- `src/lib/auth.ts` — Sistema de autenticación
- `auth.config.ts` — Configuración de NextAuth
- `src/lib/rate-limit.ts` — Rate limiting
- `.env` — Variables de entorno (NUNCA commitear)

---

## Archivos PERMITIDOS (MODIFICAR LIBRE)

### Admin Panel
- `src/components/admin/FacebookAdsTab.tsx` — Anuncios Facebook/Ads
- `src/components/admin/FamilyMatchTab.tsx` — Personajes
- `src/components/admin/**` — Todos los componentes admin
- `src/app/admin/**` — Rutas del admin

### Scripts
- `scripts/**` — Scripts de automatización

---

## Restauración de Emergencia

Si algo se rompe, restaurar desde la rama `production-locked`:

```bash
# Opción 1: Merge del backup
git checkout master
git merge production-locked
git push origin master

# Opción 2: Restaurar archivo específico
git checkout production-locked -- [nombre-del-archivo]

# Opción 3: Restaurar todo el repo
git checkout production-locked .
git commit -m "restore: emergency rollback to production-locked"
git push origin master
```

---

## Último Estado Verificado

- **Fecha:** 2026-09-05
- **Rama:** master
- **Commit:** c8a8e81
- **Estado:** ✅ Todos los 280 prompts de Facebook Ads funcionando
- **Sentry:** ✅ Errores Android WebView filtrados

---

*Este archivo fue creado automáticamente. Última actualización: 2026-09-05*
