
"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

/**
 * 🛡️ HistoryShield (Trampolín de Historial)
 * 
 * Este componente protege al usuario de caer en el bucle de "Atrás" de Google.
 * Detecta cuando el usuario está logueado e intenta volver a páginas de 
 * autenticación o la portada, y lo "rebota" de vuelta a la app.
 */
export default function HistoryShield() {
    const { status } = useSession()
    const pathname = usePathname()

    useEffect(() => {
        // Solo actuamos si el usuario está autenticado
        if (status !== "authenticated") return

        // Función que rebota al usuario hacia adelante si intenta salir
        const handlePopState = (event: PopStateEvent) => {
            // Si el usuario está logueado y trata de retroceder 
            // a /auth o la raíz (o cualquier página fuera de la app segura),
            // lo mandamos hacia adelante.
            const routesToProtect = ["/auth", "/", "/login", "/register"]

            // Verificamos si la página previa (si la supiéramos) o el estado actual
            // sugiere que estamos intentando salir. 
            // En la práctica, simplemente 'history.forward()' nos regresa a donde estábamos
            // si acabamos de presionar "atrás" estando en un feed.

            // Pequeño delay para dejar que el navegador procese el cambio y podamos rebotar
            setTimeout(() => {
                if (window.location.pathname === "/" || window.location.pathname === "/auth") {
                    window.history.forward()
                }
            }, 0)
        }

        // Suscribirse al evento de retroceso del navegador
        window.addEventListener("popstate", handlePopState)

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [status, pathname])

    return null // Es un componente puramente lógico
}
