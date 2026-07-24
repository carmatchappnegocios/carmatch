import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { comparePassword } from "@/lib/password"
import { authConfig } from "./auth.config"
import { cookies } from "next/headers"

// 🚀 Instancia completa con DB para uso en Servidor (API, Server Actions)
export const {
    handlers,
    auth,
    signIn,
    signOut
} = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            // 🚀 FASE DE CRECIMIENTO: Bloqueo por dispositivo DESACTIVADO.
            // Un celular puede crear múltiples cuentas.
            // La vinculación de dispositivo se registra de forma pasiva para análisis futuro.
            return true
        }

    },
    debug: false, // 🔍 Debug desactivado para producción
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
            // Asegurar que si ya existía pero no era admin, se actualice al entrar
            if (user.email === process.env.ADMIN_EMAIL) {
                // Verificar si ya es admin para evitar updates innecesarios
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

            // 🛡️ VINCULACIÓN DE DISPOSITIVO (Server-Side)
            // Se ejecuta después de un login exitoso. Vinculamos la huella aquí
            // para que sea 100% fiable y no dependa del frontend.
            try {
                const cookieStore = await cookies()
                const deviceHash = cookieStore.get('device-fingerprint')?.value

                if (deviceHash && user.id) {
                    console.log(`📡 Vinculando dispositivo ${deviceHash.substring(0, 8)} a usuario ${user.email}`)

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
    providers: [
        ...authConfig.providers,
        Credentials({
            id: "credentials",
            name: "Email y Contraseña",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
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
    ]
})

export const currentUser = async () => {
    const session = await auth()
    return session?.user
}
