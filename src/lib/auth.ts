import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { comparePassword } from "@/lib/password"
import { validateAndNormalizeEmail } from "@/lib/email-validation"
import { cookies } from "next/headers"

export const {
    handlers,
    auth,
    signIn,
    signOut
} = NextAuth({
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async signIn({ user, account, profile }) {
            // Block check: prevent blocked users from signing in
            if (user?.email) {
                const blocked = await prisma.blockedIdentity.findFirst({
                    where: { blockedByEmail: user.email.toLowerCase().trim() }
                })
                if (blocked) {
                    return false // Deny sign-in
                }
            }

            // Account linking: if Google user's email matches a credential user, link the account
            if (account?.provider === "google" && user?.email) {
                const normalizedEmail = user.email.toLowerCase().trim()

                // Check if a credential user exists with this email but no Google account
                const existingUser = await prisma.user.findUnique({
                    where: { email: normalizedEmail },
                    include: { accounts: true },
                })

                if (existingUser) {
                    const hasGoogleAccount = existingUser.accounts.some(
                        (a) => a.provider === "google"
                    )

                    if (!hasGoogleAccount) {
                        // Link the Google account to the existing user
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state,
                            },
                        })

                        // Update user with Google profile info if missing
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                image: existingUser.image || (profile as any)?.picture || user.image,
                                emailVerified: existingUser.emailVerified || new Date(),
                            },
                        })

                        // Return the existing user (not the new one from Google)
                        user.id = existingUser.id
                        user.email = existingUser.email
                        user.name = existingUser.name
                    }
                }
            }

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
    pages: {
        signIn: "/auth",
        error: "/auth",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            id: "credentials",
            name: "Email y Contraseña",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                // Normalize email before lookup
                const validation = validateAndNormalizeEmail(credentials.email as string)
                if (!validation.valid) return null

                const user = await prisma.user.findUnique({
                    where: { email: validation.normalized },
                })

                if (!user || !user.password) return null

                const isValidPassword = await comparePassword(
                    credentials.password as string,
                    user.password
                )

                if (!isValidPassword) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
    ],
    debug: false,
    events: {
        async createUser({ user }) {
            if (user.email === process.env.ADMIN_EMAIL) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isAdmin: true }
                })
                console.log(`👑 Admin Maestro creado en DB: ${user.email}`)
            }
        },
        async signIn({ user }) {
            if (user.email === process.env.ADMIN_EMAIL) {
                const currentUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { isAdmin: true }
                })
                if (!currentUser?.isAdmin) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { isAdmin: true }
                    })
                }
            }

            // Device fingerprint linking
            try {
                const cookieStore = await cookies()
                const deviceHash = cookieStore.get('device-fingerprint')?.value
                if (deviceHash && user.id) {
                    await prisma.digitalFingerprint.upsert({
                        where: { deviceHash },
                        update: {
                            userId: user.id,
                            userAgent: cookieStore.get('user-agent')?.value || 'Server-Side Update'
                        },
                        create: {
                            deviceHash,
                            userId: user.id,
                            ipAddress: 'detected-on-signin',
                            userAgent: 'Server-Side Created'
                        }
                    })
                }
            } catch (error) {
                console.error("❌ Error vinculando huella en evento signIn:", error)
            }
        }
    },
})

export const currentUser = async () => {
    const session = await auth()
    return session?.user
}
