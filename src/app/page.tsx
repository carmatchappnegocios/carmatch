// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWeightedHomePath } from "@/lib/navigation"

export default async function Home() {
    const session = await auth()
    
    if (session?.user) {
        // Redirección inteligente basada en comportamiento historico
        redirect(getWeightedHomePath(session.user))
    }

    // 🚀 Visitantes van directo al MarketCar (no necesitan cuenta para ver)
    redirect('/market')
}
