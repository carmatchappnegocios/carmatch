"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, AlertCircle, ArrowRight, X, Eye, EyeOff } from "lucide-react"

export default function CredentialsForm({ linkedEmail, forceOnlyLinked }: { linkedEmail?: string | null, forceOnlyLinked?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [form, setForm] = useState({
        name: "",
        email: linkedEmail || "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            if (isLogin) {
                const res = await signIn("credentials", {
                    email: form.email,
                    password: form.password,
                    redirect: false
                })

                if (res?.error) {
                    setError("Correo o contraseña incorrectos")
                    setIsLoading(false)
                } else {
                    window.location.href = "/"
                }
            } else {
                // Register
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        password: form.password
                    })
                })

                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || "Ocurrió un error al registrarse")
                    setIsLoading(false)
                } else {
                    // Registration successful, log in automatically
                    await signIn("credentials", {
                        email: form.email,
                        password: form.password,
                        callbackUrl: "/"
                    })
                }
            }
        } catch (err) {
            setError("Ocurrió un error inesperado")
            setIsLoading(false)
        }
    }

    if (forceOnlyLinked && !isExpanded) {
        return null;
    }

    if (!isExpanded) {
        return (
            <div className="mt-4">
                <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-surface-highlight"></div>
                    <span className="flex-shrink-0 mx-4 text-text-secondary text-sm font-medium">o con correo electrónico</span>
                    <div className="flex-grow border-t border-surface-highlight"></div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 transition-all rounded-xl border border-surface-highlight text-text-secondary hover:bg-surface hover:text-white group bg-background"
                >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Entrar con Email y Contraseña</span>
                </button>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-[#151D2C] rounded-2xl border border-surface-highlight p-5 relative overflow-hidden shadow-xl"
        >
            <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors bg-surface p-1 rounded-full border border-surface-highlight"
                title="Cerrar"
                type="button"
            >
                <X className="w-4 h-4" />
            </button>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    </h3>
                    <p className="text-text-secondary text-xs mt-1">
                         {isLogin ? "Ingresa para continuar" : "Registra tus datos a continuación"}
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex gap-3 shadow-inner"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{error}</span>
                    </motion.div>
                )}

                <AnimatePresence>
                    {!isLogin && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="bg-[#0F1523] rounded-xl border border-surface flex items-center px-4 overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all"
                        >
                            <User className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required={!isLogin}
                                placeholder="Nombre completo"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-transparent border-none text-white focus:ring-0 px-3 py-3.5 text-sm outline-none placeholder:text-gray-500"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-[#0F1523] rounded-xl border border-surface flex items-center px-4 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        required
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        disabled={!!linkedEmail && forceOnlyLinked}
                        className="w-full bg-transparent border-none text-white focus:ring-0 px-3 py-3.5 text-sm outline-none placeholder:text-gray-500 disabled:opacity-50"
                    />
                </div>

                <div className="bg-[#0F1523] rounded-xl border border-surface flex items-center px-4 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all relative">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        minLength={4}
                        className="w-full bg-transparent border-none text-white focus:ring-0 pl-3 pr-10 py-3.5 text-sm outline-none placeholder:text-gray-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1.5 text-gray-400 hover:text-white transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 mt-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {isLogin ? "Entrar" : "Registrarse"}
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                    )}
                </button>

                <div className="text-center pt-3 pb-1">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                        }}
                        className="text-primary-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        {isLogin ? "¿No tienes cuenta? Crea una aquí" : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>
                </div>
            </form>
        </motion.div>
    )
}
