# Plan: Restaurar Creador de Publicidad en Admin Panel

## Objetivo
Restaurar el tab "Marketing" en el panel de admin con los 2 componentes de creacion de contenido.

## Archivo a modificar
`src/app/admin/page.tsx`

## Cambios

### 1. Agregar tipo al AdminView (linea 61)
Cambiar:
```ts
type AdminView = 'overview' | 'users' | 'inventory' | 'map-store' | 'intelligence' | 'reports' | 'logs' | 'ai-hub' | 'costs' | 'more'
```
Por:
```ts
type AdminView = 'overview' | 'users' | 'inventory' | 'map-store' | 'intelligence' | 'reports' | 'logs' | 'ai-hub' | 'costs' | 'marketing' | 'more'
```

### 2. Importar componentes dinamicamente (lineas 51-56)
Agregar despues de `BetaSessionsTab`:
```ts
const ProtocolAgentTab = dynamic<any>(() => import('@/components/admin/ProtocolAgentTab'), { ssr: false })
const ContentCalendarTab = dynamic<any>(() => import('@/components/admin/ContentCalendarTab'), { ssr: false })
```

### 3. Agregar item al menu sidebar (lineas 150-160)
Agregar antes de `reports`:
```ts
{ id: 'marketing', icon: Megaphone, label: 'Marketing' },
```
(`Megaphone` ya esta importado en linea 40)

### 4. Crear MarketingTab inline (antes de MoreTab)
Componente con sub-tabs: Protocol Agent y Calendario de Contenido.

### 5. Agregar rendering (lineas 197-212)
Agregar antes del caso `more`:
```tsx
{activeView === 'marketing' && <MarketingTab />}
```

## Archivos
- `src/app/admin/page.tsx` (unico archivo a modificar)
