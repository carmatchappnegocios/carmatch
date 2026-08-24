// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import ProfileClient from "./ProfileClient"
import { Suspense } from 'react'

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
    let session
    try {
        session = await auth()
    } catch (e) {
        console.error("🔥 Error en auth() del ProfilePage:", e)
        redirect("/auth")
    }

    if (!session?.user?.email) {
        redirect("/auth")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                vehicles: {
                    orderBy: { createdAt: "asc" },
                    take: 100,
                    select: {
                        id: true, title: true, brand: true, model: true, version: true,
                        year: true, price: true, currency: true, images: true, city: true,
                        status: true, vehicleType: true, createdAt: true,
                        latitude: true, longitude: true,
                        expiresAt: true, isFreePublication: true, moderationStatus: true
                    }
                },
                _count: {
                    select: {
                        vehicles: true,
                        businesses: true,
                        favorites: true,
                    },
                }
            },
        }) as any

        if (!user) {
            console.error(`❌ Usuario no encontrado en DB para el email: ${session.user.email}`)
            redirect("/auth")
        }

        // Determinar si el usuario actual es el dueño del perfil
        const isOwner = session.user.email === user.email

        // Filtrar y ordenar vehículos
        let vehiclesToShow = isOwner
            ? user.vehicles
            : user.vehicles.filter((v: any) => v.status === "ACTIVE")

        // 🛡️ Si es visitante, barajar aleatoriamente
        if (!isOwner) {
            vehiclesToShow = [...vehiclesToShow].sort(() => Math.random() - 0.5)
        }

        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background pt-[70px]"><div className="w-8 h-8 md:w-12 md:h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                <ProfileClient
                    user={{
                        ...user,
                        vehicles: user.vehicles.map((v: any) => ({
                            ...v,
                            price: typeof v.price === 'object' && v.price?.toNumber ? v.price.toNumber() : Number(v.price),
                            latitude: v.latitude,
                            longitude: v.longitude
                        }))
                    }}
                    isOwner={isOwner}
                    vehiclesToShow={vehiclesToShow.map((v: any) => ({
                        ...v,
                        price: typeof v.price === 'object' && v.price?.toNumber ? v.price.toNumber() : Number(v.price),
                        latitude: v.latitude,
                        longitude: v.longitude
                    }))}
                />
            </Suspense>
        )
    } catch (error: any) {
        // ⚠️ IMPORTANTE: No capturar errores de redirección de Next.js
        if (error.digest?.includes('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') {
            throw error
        }

        console.error("🔥 Error crítico en ProfilePage:", error)

        try {
            await prisma.systemLog.create({
                data: {
                    level: "ERROR",
                    message: `ProfilePage Error: ${error.message || String(error)}`,
                    source: "ProfilePage",
                    metadata: {
                        timestamp: new Date().toISOString()
                    }
                }
            })
        } catch (logError) {
            console.error("No se pudo guardar el log en DB:", logError)
        }

        throw error
    }
}
