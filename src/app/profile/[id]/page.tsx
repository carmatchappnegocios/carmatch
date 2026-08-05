// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.


import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ProfileClient from "../ProfileClient"
import { notFound } from "next/navigation"

interface PublicProfilePageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<any>
}

export const dynamic = 'force-dynamic' // 🔄 Forzar recarga para barajar items en cada visita

export default async function PublicProfilePage({ params, searchParams }: PublicProfilePageProps) {
    const { id } = await params
    const session = await auth()

    // Buscar al usuario por ID
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            vehicles: {
                orderBy: { createdAt: "asc" },
                take: 100,
                    select: {
                        id: true, title: true, brand: true, model: true, version: true,
                        year: true, price: true, currency: true, images: true, city: true,
                        status: true, vehicleType: true, createdAt: true
                    }
            },
            _count: {
                select: {
                    vehicles: true,
                    businesses: true,
                    favorites: true,
                },
            },
        },
    }) as any

    if (!user) {
        return notFound()
    }

    // Determinar si el usuario actual es el dueño del perfil
    const isOwner = session?.user?.email === user.email

    // Filtrar vehículos: El visitante solo ve los ACTIVOS
    let vehiclesToShow = isOwner
        ? user.vehicles
        : user.vehicles.filter((v: any) => v.status === "ACTIVE")

    // 🛡️ Si es visitante, barajar aleatoriamente
    if (!isOwner) {
        vehiclesToShow = [...vehiclesToShow].sort(() => Math.random() - 0.5)
    }

    return (
        <ProfileClient
            user={{
                ...user,
                vehicles: user.vehicles.map((v: any) => ({
                    ...v,
                    price: v.price.toNumber(),
                    latitude: v.latitude,
                    longitude: v.longitude
                }))
            }}
            isOwner={isOwner}
            vehiclesToShow={vehiclesToShow.map((v: any) => ({
                ...v,
                price: v.price.toNumber(),
                latitude: v.latitude,
                longitude: v.longitude
            }))}
        />
    )
}
