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
