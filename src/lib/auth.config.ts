import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Edge-compatible config (used only by middleware)
export const authConfig: NextAuthConfig = {
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
                '/api/auth',
            ]

            const isPublicPath = publicPaths.some(path =>
                pathname === path || pathname.startsWith(path)
            )

            if (isPublicPath) return true
            return isLoggedIn
        },
        async signIn() {
            return true
        },
        async session({ session, token }) {
            if (session.user && token) {
                // @ts-ignore
                session.user.id = (token.id as string) || (token.sub as string)
                session.user.image = (token.picture as string) || session.user.image
                session.user.name = (token.name as string) || session.user.name

                if (session.user.email === process.env.ADMIN_EMAIL) {
                    // @ts-ignore
                    session.user.isAdmin = true
                } else {
                    // @ts-ignore
                    session.user.isAdmin = !!token.isAdmin
                }
            }
            return session
        },
        async jwt({ token, user, trigger, session }) {
            if (user && user.id) {
                token.id = user.id
                // @ts-ignore
                token.isAdmin = !!user.isAdmin
                // @ts-ignore
                token.lastPasswordChange = (user as any).lastPasswordChange?.getTime() || null
            }
            if (trigger === "update") {
                if (session?.image) token.picture = session.image
                if (session?.name) token.name = session.name
            }
            return token
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
}
