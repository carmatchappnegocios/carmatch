
'use client'

import { useRouter } from 'next/navigation'
import { Cookie, Eye, Settings, Info, Shield } from 'lucide-react'

export default function CookiesPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="container mx-auto px-4 pt-8 pb-8 max-w-4xl text-text-primary">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 bg-orange-500/10 rounded-full border border-orange-500/20 mb-4">
                        <Cookie className="text-orange-500" size={48} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Política de Cookies</h1>
                    <p className="text-text-secondary text-sm">
                        Última actualización: 6 de febrero de 2026
                    </p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* 1. Qué son las cookies */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Info className="text-blue-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-blue-500 m-0">¿Qué son las Cookies?</h2>
                        </div>
                        <p className="text-text-secondary">
                            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
                            visitas un sitio web. Nos ayudan a mejorar tu experiencia, recordar tus preferencias
                            y analizar cómo usas nuestra plataforma.
                        </p>
                    </section>

                    {/* 2. Cookies que usamos */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Cookie className="text-green-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-green-500 m-0">Cookies que Utilizamos</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Esenciales */}
                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                    <Shield size={18} className="text-red-400" />
                                    Cookies Esenciales (Obligatorias)
                                </h3>
                                <p className="text-text-secondary text-sm mb-2">
                                    Necesarias para el funcionamiento básico de la plataforma.
                                    <strong className="text-red-400"> No se pueden desactivar.</strong>
                                </p>
                                <ul className="list-disc pl-6 space-y-1 text-text-secondary text-sm">
                                    <li><strong className="text-text-primary">Sesión de usuario:</strong> Para mantenerte conectado</li>
                                    <li><strong className="text-text-primary">Seguridad:</strong> Para prevenir ataques CSRF</li>
                                    <li><strong className="text-text-primary">Preferencias básicas:</strong> Idioma, tema oscuro/claro</li>
                                </ul>
                            </div>

                            {/* Google Analytics */}
                            <div className="border-t border-surface-highlight pt-4">
                                <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                    <Eye size={18} className="text-blue-400" />
                                    Google Analytics (Analíticas)
                                </h3>
                                <p className="text-text-secondary text-sm mb-2">
                                    Usamos Google Analytics para analizar cómo los usuarios interactúan con la plataforma.
                                </p>
                                <ul className="list-disc pl-6 space-y-1 text-text-secondary text-sm mb-3">
                                    <li><strong className="text-text-primary">ID de medición:</strong> G-Q84TC96LDB</li>
                                    <li><strong className="text-text-primary">Datos recopilados:</strong> Páginas visitadas, tiempo en sitio, tipo de dispositivo</li>
                                    <li><strong className="text-text-primary">Duración:</strong> 2 años</li>
                                    <li><strong className="text-text-primary">Proveedor:</strong> Google LLC (Estados Unidos)</li>
                                </ul>
                                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                    <p className="text-xs text-text-secondary">
                                        <strong className="text-blue-400">Privacidad:</strong> Google Analytics usa datos anonimizados.
                                        Para más información sobre cómo Google usa tus datos, visita:{' '}
                                        <a
                                            href="https://policies.google.com/privacy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 underline"
                                        >
                                            Política de Privacidad de Google
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Funcionales */}
                            <div className="border-t border-surface-highlight pt-4">
                                <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                    <Settings size={18} className="text-purple-400" />
                                    Cookies Funcionales
                                </h3>
                                <p className="text-text-secondary text-sm mb-2">
                                    Mejoran tu experiencia recordando tus preferencias.
                                </p>
                                <ul className="list-disc pl-6 space-y-1 text-text-secondary text-sm">
                                    <li><strong className="text-text-primary">Filtros de búsqueda:</strong> Recuerda tus últimas búsquedas</li>
                                    <li><strong className="text-text-primary">Ubicación:</strong> Tu ciudad preferida para resultados</li>
                                    <li><strong className="text-text-primary">Vista favorita:</strong> Marketplace, Swipe o Map Store</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. Cómo controlar cookies */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Settings className="text-amber-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-amber-500 m-0">Cómo Gestionar las Cookies</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-2">🌐 En tu Navegador</h3>
                                <p className="text-text-secondary text-sm mb-2">
                                    Puedes bloquear o eliminar cookies desde la configuración de tu navegador:
                                </p>
                                <ul className="list-disc pl-6 space-y-1 text-text-secondary text-sm">
                                    <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                                    <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad</li>
                                    <li><strong>Safari:</strong> Preferencias → Privacidad</li>
                                    <li><strong>Edge:</strong> Configuración → Privacidad</li>
                                </ul>
                            </div>

                            <div className="border-t border-surface-highlight pt-4">
                                <h3 className="text-lg font-bold text-text-primary mb-2">📊 Desactivar Google Analytics</h3>
                                <p className="text-text-secondary text-sm mb-2">
                                    Instala el complemento oficial de Google:
                                </p>
                                <a
                                    href="https://tools.google.com/dlpage/gaoptout"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition text-sm"
                                >
                                    Descargar complemento para desactivar Google Analytics
                                </a>
                            </div>

                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-text-secondary">
                                    <strong className="text-red-400">⚠️ Advertencia:</strong> Si bloqueas todas las cookies,
                                    algunas funciones de CarMatch Social podrían no funcionar correctamente (como mantener
                                    tu sesión iniciada).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Actualizaciones */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gray-500/10 rounded-lg">
                                <Info className="text-gray-400" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-400 m-0">Actualizaciones</h2>
                        </div>
                        <p className="text-text-secondary text-sm">
                            CarMatch Social puede actualizar esta Política de Cookies periódicamente.
                            Te notificaremos sobre cambios importantes mediante un aviso en la aplicación.
                        </p>
                    </section>

                    {/* 5. Contacto */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <Info className="text-primary-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-primary-500 m-0">¿Preguntas?</h2>
                        </div>
                        <p className="text-text-secondary text-sm">
                            Si tienes dudas sobre cómo usamos las cookies, revisa nuestro{' '}
                            <a href="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                                Aviso de Privacidad
                            </a>{' '}
                            o contáctanos a través del soporte en la aplicación.
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t border-surface-highlight">
                        <p className="text-xs text-text-secondary opacity-50">
                            CarMatch Social - Política de Cookies
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
