import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Minimal edge-compatible config (used ONLY by middleware for session checking)
// OAuth sign-in/callback is handled entirely by the route handler in auth.ts
export const authConfig: NextAuthConfig = {
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    pages: {
        signIn: "/auth",
        error: "/auth",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
    },
    callbacks: {
        // Propagar el rol admin al token (middleware/edge) — igual que en auth.ts
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.isAdmin = !!(user as any).isAdmin
            }
            return token
        },
        // Sin este callback, la sesión del middleware solo trae name/email/image
        // y el guard de /admin bloquearía incluso al admin real.
        async session({ session, token }) {
            // @ts-ignore
            session.user.isAdmin = !!(token as any).isAdmin ||
                (!!session.user.email && session.user.email === process.env.ADMIN_EMAIL)
            return session
        },
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth
            const pathname = nextUrl.pathname

            const publicPaths = [
                '/',
                '/market',
                '/swipe',
                '/map',
                '/map-store',
                '/autos/',
                '/autos-en/',
                '/autos/cluster/',
                '/comprar/',
                '/comparar/',
                '/negocio/',
                '/vehicle/',
                '/negocios/',
                '/business/',
                '/auth',
                '/privacy',
                '/terms',
                '/notifications',
            ]

            const isPublicPath = publicPaths.some(path =>
                pathname === path || pathname.startsWith(path)
            )

            if (isPublicPath) return true
            return isLoggedIn
        },
    },
}
