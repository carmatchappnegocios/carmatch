import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const userAgent = req.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot/i.test(userAgent);

    // 🔧 FIX: Redirect www to non-www (Google Search Console redirect error)
    // Skip for bots to avoid redirect loops or issues with crawlers
    if (req.nextUrl.hostname === 'www.carmatchapp.net' && !isBot) {
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
            return Response.redirect(new URL(decodeURIComponent(callbackUrl), req.url))
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
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
