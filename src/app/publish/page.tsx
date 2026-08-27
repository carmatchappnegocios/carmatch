

import PublishClient from "./PublishClient"
import { Suspense } from "react"

export default async function PublishPage() {


    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <PublishClient />
        </Suspense>
    )
}
