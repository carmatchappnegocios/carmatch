import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const userAgent = req.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot/i.test(userAgent);

    // 📊 REQUEST LOGGING: Registrar metadata de cada request (solo usuarios autenticados, no bots)
    if (!isBot && req.auth?.user?.id) {
        const start = Date.now()
        // Log básico de pathname + userId para analytics de navegación
        const pathname = req.nextUrl.pathname
        // Solo registrar páginas principales, no assets ni API routes
        if (pathname.startsWith('/') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
            try {
                // Fire-and-forget: no bloquear la request
                fetch(`${req.nextUrl.origin}/api/analytics/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventType: 'PAGE_VIEW',
                        entityType: 'APP',
                        metadata: {
                            url: pathname,
                            userId: req.auth.user.id,
                            timestamp: new Date().toISOString()
                        }
                    })
                }).catch(() => {})
            } catch {
                // Fail silently
            }
        }
    }

    // 🔧 FIX: Redirect www to non-www (Google Search Console redirect error)
    // Skip for bots to avoid redirect loops or issues with crawlers
    // Skip for auth callbacks to prevent OAuth state/cookie loss during redirect
    const isAuthCallback = req.nextUrl.pathname.startsWith('/api/auth/')
    if (req.nextUrl.hostname === 'www.carmatchapp.net' && !isBot && !isAuthCallback) {
        const newUrl = req.nextUrl.clone()
        newUrl.hostname = 'carmatchapp.net'
        return Response.redirect(newUrl, 308)
    }

    const isLoggedIn = !!req.auth
    // @ts-ignore
    const isAdmin = !!req.auth?.user?.isAdmin
    const { pathname } = req.nextUrl

    // Rutas protegidas que requieren autenticación (RED SOCIAL)
    const protectedRoutes = [
        '/profile',
        '/publish',
        '/my-businesses',
        '/messages',
        '/credits',
        '/admin',
        '/settings',
        '/favorites'
    ]
    // Rutas de autenticación (no permitidas si ya está logueado y NO es soft_logout)
    const authRoutes = ["/auth", "/auth/login", "/auth/register"]

    // 🚀 REDIRECCIÓN PARA RUTAS PROTEGIDAS (Solo si no está logueado)
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !isLoggedIn && !isBot) {
        const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
        return Response.redirect(new URL(`/auth?callbackUrl=${callbackUrl}`, req.url))
    }

    // 🛡️ PROTECCIÓN DE ADMIN: Si trata de entrar a /admin y no es admin
    if (pathname.startsWith('/admin') && isLoggedIn && !isAdmin && !isBot) {
        return Response.redirect(new URL('/market', req.url))
    }

    // 2. Si está logueado y trata de acceder a login/register O LA RAÍZ (/)
    // Skip for bots to allow them to crawl the root or auth pages
    if ((authRoutes.some(route => pathname.startsWith(route)) || pathname === "/") && isLoggedIn && !isBot) {
        const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
        if (callbackUrl) {
            // 🛡️ Security: Only allow relative paths to prevent open redirect phishing
            const decoded = decodeURIComponent(callbackUrl)
            if (decoded.startsWith('/') && !decoded.includes('://') && !decoded.startsWith('//')) {
                return Response.redirect(new URL(decoded, req.url))
            }
            // If callbackUrl contains domain or protocol, ignore it and redirect to market
        }

        // Random redirect for logged-in users, with /market as the base destination
        let destination = "/market";
        const random = Math.random();
        if (random < 0.2) { destination = "/swipe"; }
        else if (random < 0.3) { destination = "/map"; }
        return Response.redirect(new URL(destination, req.url))
    }

    // 🚨 GUEST at root (/): Redirect directly to /market at middleware level
    // This is faster than waiting for auth() in page.tsx (which can fail/be slow)
    // and guarantees guests are never stuck on a blank home screen.
    if (pathname === "/" && !isLoggedIn && !isBot) {
        return Response.redirect(new URL('/market', req.url))
    }
})

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/(?!auth)).*)"],
}
