# Plan: Fix Flash de Traducciones (FOUC)

## Problema
Al cargar cualquier pagina, se ven las keys crudas ("nav.carmatch", "common.login") durante 100-500ms antes de que aparezca el texto traducido.

## Causa raiz
`LanguageContext.tsx` linea 26: `translations` empieza como `null`. La funcion `t()` retorna la key cruda cuando no hay traducciones cargadas. Las traducciones se cargan async via `import()`.

## Solucion
**Archivo:** `src/contexts/LanguageContext.tsx`

### Cambio 1: Importar español estaticamente (lineas 1-5 del archivo)
```tsx
import esTranslations from '@/locales/es.json'
```

### Cambio 2: Estado inicial con español ya cargado (linea 26)
```tsx
// Antes:
const [translations, setTranslations] = useState<any>(null)
// Despues:
const [translations, setTranslations] = useState<any>(esTranslations)
```

### Cambio 3: Loading gate en el Provider (lineas 172-176)
```tsx
// Antes:
return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
        {children}
    </LanguageContext.Provider>
)

// Despues:
return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
        {isLoading ? <div className="min-h-screen bg-black" /> : children}
    </LanguageContext.Provider>
)
```

## Resultado
- Español carga instantaneamente (ya esta en el bundle JS)
- Otros idiomas cargan async pero el usuario nunca ve keys crudas
- El loading gate muestra pantalla negra mientras carga (mismo color que el fondo de la app)

## Verificacion
- Abrir la app en modo incognito → no debe ver "nav.carmatch" ni "common.login"
- Cambiar idioma → debe cargar el nuevo idioma sin flash
