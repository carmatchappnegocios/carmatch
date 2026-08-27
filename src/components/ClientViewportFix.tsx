"use client"

import { useEffect } from "react"

export default function ClientViewportFix() {
    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("carmatch_oauth_reload") === "1") {
            sessionStorage.removeItem("carmatch_oauth_reload")
            window.location.reload()
        }
    }, [])
    return null
}
