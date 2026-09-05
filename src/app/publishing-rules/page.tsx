
'use client'

import { AlertTriangle, Ban, ShieldAlert, Flag, CheckCircle, XCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PublishingRulesPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="container mx-auto px-4 pt-8 pb-8 max-w-4xl text-text-primary">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 bg-red-500/10 rounded-full border border-red-500/20 mb-4 animate-pulse">
                        <ShieldAlert className="text-red-500" size={48} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">{t('publishing_rules.title')}</h1>
                    <p className="text-text-secondary text-sm">
                        {t('publishing_rules.subtitle')}
                    </p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* Introducción */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <p className="text-text-secondary">
                            {t('publishing_rules.intro')}
                        </p>
                    </section>

                    {/* ✅ Qué SÍ puedes publicar */}
                    <section className="bg-surface border border-green-500/20 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle className="text-green-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-green-500 m-0">{t('publishing_rules.what_to_publish')}</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">✅</div>
                                <div>
                                    <strong className="text-text-primary">{t('publishing_rules.legitimate_vehicles')}:</strong>
                                    <p className="text-sm text-text-secondary">{t('publishing_rules.legitimate_vehicles_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">✅</div>
                                <div>
                                    <strong className="text-text-primary">{t('publishing_rules.automotive_businesses')}:</strong>
                                    <p className="text-sm text-text-secondary">{t('publishing_rules.automotive_businesses_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">✅</div>
                                <div>
                                    <strong className="text-text-primary">{t('publishing_rules.real_photos')}:</strong>
                                    <p className="text-sm text-text-secondary">{t('publishing_rules.real_photos_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">✅</div>
                                <div>
                                    <strong className="text-text-primary">{t('publishing_rules.honest_prices')}:</strong>
                                    <p className="text-sm text-text-secondary">{t('publishing_rules.honest_prices_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ❌ PROHIBIDO */}
                    <section className="bg-surface border border-red-500/30 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <XCircle className="text-red-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-red-500 m-0">{t('publishing_rules.strictly_prohibited')}</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Vehículos robados */}
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Ban className="text-red-400 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-red-400 mb-1">{t('publishing_rules.stolen_vehicles')}</h3>
                                        <p className="text-sm text-text-secondary mb-2">
                                            {t('publishing_rules.stolen_vehicles_desc')}
                                        </p>
                                        <p className="text-xs text-red-300">
                                            <strong>Consecuencia:</strong> Eliminación inmediata, reporte a autoridades, veto permanente.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Estafas */}
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-amber-400 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-amber-400 mb-1">{t('publishing_rules.frauds')}</h3>
                                        <p className="text-sm text-text-secondary mb-2">
                                            {t('publishing_rules.frauds_desc')}
                                        </p>
                                        <p className="text-xs text-amber-300">
                                            <strong>Consecuencia:</strong> Eliminación, reporte, veto permanente y posible denuncia penal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido inapropiado */}
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Ban className="text-red-400 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-red-400 mb-1">Contenido Sexual, Violento u Ofensivo</h3>
                                        <p className="text-sm text-text-secondary mb-2">
                                            Fotos con desnudos, contenido pornográfico, violencia gráfica, discurso de odio,
                                            símbolos de grupos violentos o terroristas.
                                        </p>
                                        <p className="text-xs text-red-300">
                                            <strong>Consecuencia:</strong> Eliminación inmediata y veto permanente.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Spam */}
                            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Ban className="text-orange-400 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-orange-400 mb-1">{t('publishing_rules.spam')}</h3>
                                        <p className="text-sm text-text-secondary mb-2">
                                            {t('publishing_rules.spam_desc')}
                                        </p>
                                        <p className="text-xs text-orange-300">
                                            <strong>Consecuencia:</strong> Eliminación de publicaciones, suspensión temporal o veto.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Abuso del sistema */}
                            <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <ShieldAlert className="text-purple-400 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-purple-400 mb-1">{t('publishing_rules.abuse')}</h3>
                                        <p className="text-sm text-text-secondary mb-2">
                                            {t('publishing_rules.abuse_desc')}
                                        </p>
                                        <p className="text-xs text-purple-300">
                                            <strong>Consecuencia:</strong> Eliminación de TODAS las cuentas asociadas y veto permanente.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Suplantación */}
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Ban className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-400 mb-1">{t('publishing_rules.impersonation')}</h3>
                                        <p className="text-sm text-text-secondary mb-2">
                                            {t('publishing_rules.impersonation_desc')}
                                        </p>
                                        <p className="text-xs text-blue-300">
                                            <strong>Consecuencia:</strong> Eliminación inmediata y veto permanente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cómo reportar */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Flag className="text-amber-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-amber-500 m-0">{t('publishing_rules.reporting')}</h2>
                        </div>

                        <div className="space-y-3">
                            <p className="text-text-secondary">
                                {t('publishing_rules.reporting_desc')}
                            </p>
                            <ol className="list-decimal pl-6 space-y-2 text-text-secondary">
                                <li><strong className="text-text-primary">Toca el botón de menú (⋮)</strong> en la publicación</li>
                                <li><strong className="text-text-primary">Selecciona "Reportar"</strong></li>
                                <li><strong className="text-text-primary">Elige el motivo:</strong> Estafa, contenido inapropiado, spam, etc.</li>
                                <li><strong className="text-text-primary">Envía el reporte</strong> - Nuestro equipo lo revisará en 24-48 horas</li>
                            </ol>

                            <div className="mt-4 p-4 bg-primary-500/5 border border-primary-500/20 rounded-lg">
                                <p className="text-sm text-text-secondary">
                                    <strong className="text-primary-400">📢 Tu reporte es anónimo.</strong> El usuario reportado NO sabrá quién lo reportó.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Verificación */}
                    <section className="bg-surface border border-surface-highlight p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <ShieldAlert className="text-green-500" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-green-500 m-0">{t('publishing_rules.moderation')}</h2>
                        </div>

                        <p className="text-text-secondary mb-3">
                            {t('publishing_rules.moderation_desc')}
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-text-secondary">
                            <li>Revisar todas las publicaciones antes de ser publicadas (en fase beta)</li>
                            <li>Solicitar documentación legal de vehículos en casos sospechosos</li>
                            <li>Eliminar publicaciones sin previo aviso si violan estas reglas</li>
                            <li>Suspender o vetar cuentas de forma temporal o permanente</li>
                            <li>Compartir información con autoridades en casos de delitos</li>
                        </ul>
                    </section>

                    {/* Disclaimer */}
                    <section className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Importante</h3>
                        <p className="text-sm text-text-secondary">
                            CarMatch Social NO se hace responsable de transacciones entre usuarios.
                            Solo proporcionamos la plataforma para conectar compradores y vendedores.
                            <strong className="text-text-primary"> Siempre verifica la documentación legal del vehículo antes de comprar.</strong>
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t border-surface-highlight">
                        <p className="text-xs text-text-secondary opacity-50">
                            CarMatch Social - Reglas de Publicación
                        </p>
                        <p className="text-xs text-text-secondary opacity-30 mt-2">
                            Última actualización: 6 de febrero de 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
