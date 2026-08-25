// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut, signIn } from "next-auth/react"

import { Logo } from "@/components/Logo"
import { useLanguage } from "@/contexts/LanguageContext"
import AuthButtons from "./AuthButtons"
import { getWeightedHomePath } from "@/lib/navigation"
import { useState } from "react"
import { AlertTriangle, LogIn } from "lucide-react"

export default function AuthPageContent() {
    const { t } = useLanguage()
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const errorProvider = searchParams.get("provider")




    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-secondary animate-pulse">Cargando CarMatch Social...</p>
                </div>
            </div>
        )
    }

    // Si hay sesión, no redirigimos automáticamente a los feeds aquí,
    // permitimos que se muestre la interfaz de "Regreso" si el dispositivo está vinculado
    // o si el usuario simplemente entró de nuevo.
    // if (session) return null 

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <Link href="/" className="flex justify-center mb-4">
                    <Logo
                        className="w-20 h-20 md:w-32 md:h-32"
                        showText={false}
                        textClassName="text-3xl md:text-5xl font-bold text-white"
                    />
                </Link>

                {/* Card */}
                <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 border border-surface-highlight">
                    <h1 className="text-3xl font-bold text-center mb-2 text-text-primary">
                        {t('auth.welcome')}
                    </h1>
                    <p className="text-center text-text-secondary mb-8">
                        {t('auth.login_subtitle')}
                    </p>



                    {(error === "login_required" || error === "interaction_required") && (
                        <div className="mb-6 bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
                            <AlertTriangle className="text-primary-400 mb-2" size={24} />
                            <p className="text-primary-400 font-bold text-sm">Acción Requerida</p>
                            <p className="text-gray-300 text-xs mt-1">
                                Google requiere que confirmes tu identidad manualmente por seguridad.
                            </p>
                        </div>
                    )}

                    {error === "OAuthCallback" && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
                            <AlertTriangle className="text-red-400 mb-2" size={24} />
                            <p className="text-red-400 font-bold text-sm">Error de Autenticación</p>
                            <p className="text-gray-300 text-xs mt-1">
                                Hubo un problema con la autenticación de Google. Intenta de nuevo o usa tu correo y contraseña.
                            </p>
                        </div>
                    )}

                    {error === "Configuration" && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
                            <AlertTriangle className="text-red-400 mb-2" size={24} />
                            <p className="text-red-400 font-bold text-sm">Error de Configuración</p>
                            <p className="text-gray-300 text-xs mt-1">
                                {errorDescription || "El proveedor OAuth no está configurado correctamente."}
                            </p>
                            <p className="text-gray-500 text-[10px] mt-2 font-mono">
                                error=Configuration{errorProvider ? `&provider=${errorProvider}` : ""}
                            </p>
                        </div>
                    )}

                    {error === "AccessDenied" && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
                            <AlertTriangle className="text-red-400 mb-2" size={24} />
                            <p className="text-red-400 font-bold text-sm">Acceso Denegado</p>
                            <p className="text-gray-300 text-xs mt-1">
                                No se pudo completar el inicio de sesión. Verifica que estés usando la cuenta correcta de Google.
                            </p>
                        </div>
                    )}

                    {error === "OAuthAccountNotLinked" && (
                        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
                            <AlertTriangle className="text-yellow-400 mb-2" size={24} />
                            <p className="text-yellow-400 font-bold text-sm">Cuenta No Vinculada</p>
                            <p className="text-gray-300 text-xs mt-1">
                                Este correo ya está registrado. Inicia sesión con tu correo y contraseña, luego puedes vincular Google desde tu perfil.
                            </p>
                        </div>
                    )}

                    {error && !["login_required", "interaction_required", "OAuthCallback", "Configuration", "AccessDenied", "OAuthAccountNotLinked"].includes(error) && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
                            <AlertTriangle className="text-red-400 mb-2" size={24} />
                            <p className="text-red-400 font-bold text-sm">Error: {error}</p>
                            <p className="text-gray-300 text-xs mt-1">
                                {errorDescription || "Ocurrió un error inesperado al iniciar sesión."}
                            </p>
                        </div>
                    )}

                            <AuthButtons />
                            <p className="mt-8 text-center text-xs text-text-secondary font-sans leading-relaxed">
                                {t('auth.agree_terms')}{" "}
                                <Link href="/terms" className="text-primary-700 hover:text-primary-600 font-medium transition">
                                    {t('auth.terms')}
                                </Link>{" "}
                                {t('auth.and')}{" "}
                                <Link href="/privacy" className="text-primary-700 hover:text-primary-600 font-medium transition">
                                    {t('auth.privacy')}
                                </Link>
                            </p>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-text-secondary hover:text-text-primary transition flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('auth.back_home')}
                    </Link>
                </div>
            </div >
        </div >
    )
}
