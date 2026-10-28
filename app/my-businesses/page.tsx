
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import MyBusinessesClient from "./MyBusinessesClient"
import { Suspense } from 'react'

export default async function MyBusinessesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth")
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background pt-[70px]"><div className="w-8 h-8 md:w-12 md:h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <MyBusinessesClient />
        </Suspense>
    )
}
