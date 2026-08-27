
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import FavoritesClient from "./FavoritesClient"

export default async function FavoritesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth")
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
    })

    if (!currentUser) {
        redirect("/auth")
    }

    const favorites = await prisma.favorite.findMany({
        where: {
            userId: currentUser.id
        },
        take: 50,
        include: {
            vehicle: {
                select: {
                    id: true, title: true, brand: true, model: true, version: true,
                    year: true, price: true, currency: true, images: true, city: true,
                    status: true, vehicleType: true, latitude: true, longitude: true,
                    userId: true,
                    user: {
                        select: {
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            favorites: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    }) as any

    // Serializar Decimals a números planos para el componente cliente
    const serializedFavorites = favorites.map((fav: any) => ({
        ...fav,
        vehicle: {
            ...fav.vehicle,
            price: Number(fav.vehicle.price),
            latitude: fav.vehicle.latitude ? Number(fav.vehicle.latitude) : null,
            longitude: fav.vehicle.longitude ? Number(fav.vehicle.longitude) : null,
            user: {
                ...fav.vehicle.user,
                name: fav.vehicle.user.name || 'Usuario CarMatch',
                image: fav.vehicle.user.image || ''
            }
        }
    }))

    return (
        <FavoritesClient favorites={serializedFavorites} />
    )
}
