
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWeightedHomePath } from "@/lib/navigation"

export default async function Home() {
    const session = await auth()
    
    if (session?.user) {
        // Redirección inteligente basada en comportamiento historico
        redirect(getWeightedHomePath())
    }

    // 🚀 Visitantes van directo al MarketCar (no necesitan cuenta para ver)
    redirect('/market')
}
