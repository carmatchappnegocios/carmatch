
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import CreditsClient from "./CreditsClient"

export default async function CreditsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth")
    }

    try {
        // Obtener usuario con saldo
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        })

        if (!user) {
            redirect("/auth")
        }

        return (
            <CreditsClient
                user={user}
            />
        )
    } catch (error) {
        console.error("Error en CreditsPage:", error)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="text-5xl mb-4">🔌</div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Servicio Temporalmente no Disponible</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        No pudimos cargar la información de tu cuenta. Por favor, intenta de nuevo en unos momentos.
                    </p>
                </div>
            </div>
        )
    }
}
