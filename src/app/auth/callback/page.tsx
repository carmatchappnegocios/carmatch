

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect('/auth')
    }

    const { getWeightedHomePath } = await import("@/lib/navigation")
    redirect(getWeightedHomePath())
}
