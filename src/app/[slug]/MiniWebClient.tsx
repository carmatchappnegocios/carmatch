'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    MapPin,
    Phone,
    MessageCircle,
    Globe,
    Facebook,
    Instagram,
    Clock,
    Navigation,
    Share2,
    ShieldCheck,
    CheckCircle2,
    ExternalLink,
    ChevronRight,
    BadgeCheck,
    Calendar,
    FileText,
    Star,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'

const DEFAULT_THEME = {
    primaryColor: '#0ea5e9',
    bgColor: '#050810',
    textColor: '#e2e8f0',
    accentColor: '#f97316',
    fontFamily: 'Arial, Helvetica, sans-serif',
    borderRadius: '16px',
}

const DEFAULT_SECTIONS = {
    showHero: true,
    showAbout: true,
    showServices: true,
    showGallery: true,
    showInfo: true,
    showSocial: true,
    showFooter: true,
    showWhatsApp: true,
    showReviews: true,
    showPromos: true,
    showFaq: true,
    showAppointmentButton: true,
    showQuoteButton: true,
}

interface MiniWebProps {
    business: {
        id: string
        name: string
        category: string
        description: string | null
        address: string
        city: string
        state: string | null
        phone: string | null
        whatsapp: string | null
        facebook: string | null
        instagram: string | null
        tiktok: string | null
        website: string | null
        telegram: string | null
        images: string[]
        services: string[]
        is24Hours: boolean
        hasEmergencyService: boolean
        hasHomeService: boolean
        hours: string | null
        latitude: number
        longitude: number
        miniWebTheme?: any
        miniWebSections?: any
        miniWebHero?: any
        miniWebLogo?: string | null
        miniWebServices?: any
        miniWebPromos?: any
        miniWebFaq?: any
    }
}

export default function MiniWebClient({ business }: MiniWebProps) {
    const { t } = useLanguage()
    const { data: session } = useSession()
    const [showAppointmentForm, setShowAppointmentForm] = useState(false)
    const [showQuoteForm, setShowQuoteForm] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    const theme = { ...DEFAULT_THEME, ...business.miniWebTheme }
    const sections = { ...DEFAULT_SECTIONS, ...business.miniWebSections }
    const hero = business.miniWebHero || { headline: business.name, subtitle: `${business.category} en ${business.city}`, ctaText: 'Contactar', overlayOpacity: 60 }
    const servicesWithPrices = business.miniWebServices || business.services.map((s: string) => ({ name: s, description: '', price: '', priceRange: '', duration: '' }))
    const promos = business.miniWebPromos || []
    const faq = business.miniWebFaq || []
    const mainImage = business.images[0] || null
    const gallery = business.images.slice(1)

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: business.name,
                    text: `¡Mira el sitio oficial de ${business.name} en CarMatch!`,
                    url: window.location.href,
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        }
    }

    const handleAppointment = async (formData: any) => {
        try {
            const res = await fetch('/api/miniweb/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, businessId: business.id }),
            })
            if (res.ok) {
                toast.success('Cita agendada correctamente')
                setShowAppointmentForm(false)
            } else {
                toast.error('Error al agendar cita')
            }
        } catch {
            toast.error('Error de conexión')
        }
    }

    const handleQuote = async (formData: any) => {
        try {
            const res = await fetch('/api/miniweb/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, businessId: business.id }),
            })
            if (res.ok) {
                toast.success('Solicitud de presupuesto enviada')
                setShowQuoteForm(false)
            } else {
                toast.error('Error al enviar solicitud')
            }
        } catch {
            toast.error('Error de conexión')
        }
    }

    return (
        <div
            style={{
                backgroundColor: theme.bgColor,
                color: theme.textColor,
                fontFamily: theme.fontFamily,
            }}
            className="selection:bg-primary-500/30"
        >
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
                style={{ backgroundColor: `${theme.bgColor}cc`, borderColor: `${theme.textColor}0a` }}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {business.miniWebLogo ? (
                            <img src={business.miniWebLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white italic" style={{ backgroundColor: theme.primaryColor }}>C</div>
                        )}
                        <span className="font-black text-lg tracking-tighter uppercase italic">CarMatch</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={handleShare} className="p-2 hover:bg-white/5 rounded-full transition">
                            <Share2 size={20} style={{ color: theme.primaryColor }} />
                        </button>
                    </div>
                </div>
            </nav>

            {sections.showHero && (
                <section className="relative pt-16 h-[70vh] md:h-[85vh] overflow-hidden">
                    {mainImage ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${theme.textColor}05` }}>
                            <MapPin size={80} style={{ color: `${theme.textColor}10` }} />
                        </div>
                    )}

                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${theme.bgColor}, ${theme.bgColor}${Math.round(hero.overlayOpacity * 2.55).toString(16).padStart(2, '0')}, transparent)` }} />

                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="container mx-auto px-4 pb-12 md:pb-24">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="px-4 py-1.5 text-white text-xs font-black uppercase tracking-widest rounded-full" style={{ backgroundColor: theme.primaryColor }}>
                                        {business.category}
                                    </span>
                                    {business.is24Hours && (
                                        <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border" style={{ backgroundColor: '#16a34a15', color: '#16a34a', borderColor: '#16a34a30' }}>
                                            Abierto 24 Horas
                                        </span>
                                    )}
                                    <span className="px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border flex items-center gap-2" style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor, borderColor: `${theme.primaryColor}30` }}>
                                        <BadgeCheck size={14} />
                                        CarMatch Verificado
                                    </span>
                                </div>

                                <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6 uppercase italic">
                                    {hero.headline}
                                </h1>

                                <p className="text-lg md:text-2xl font-medium mb-8 flex items-center gap-3" style={{ color: `${theme.textColor}99` }}>
                                    <MapPin style={{ color: theme.primaryColor }} />
                                    {hero.subtitle}
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    {sections.showAppointmentButton && (
                                        <button
                                            onClick={() => setShowAppointmentForm(true)}
                                            className="px-8 py-4 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all hover:scale-105"
                                            style={{ backgroundColor: theme.primaryColor }}
                                        >
                                            <Calendar size={24} />
                                            Agendar Cita
                                        </button>
                                    )}
                                    {sections.showQuoteButton && (
                                        <button
                                            onClick={() => setShowQuoteForm(true)}
                                            className="px-8 py-4 font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all border"
                                            style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}30` }}
                                        >
                                            <FileText size={24} />
                                            Solicitar Presupuesto
                                        </button>
                                    )}
                                    {session && sections.showWhatsApp && business.whatsapp && (
                                        <a
                                            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi su negocio ${business.name} en CarMatch`)}`}
                                            target="_blank"
                                            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all hover:scale-105"
                                        >
                                            <MessageCircle size={24} />
                                            WhatsApp
                                        </a>
                                    )}
                                    {!session && (
                                        <Link
                                            href="/auth"
                                            className="px-8 py-4 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all hover:scale-105"
                                            style={{ backgroundColor: theme.primaryColor }}
                                        >
                                            <ShieldCheck size={24} />
                                            Registrarse
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            <main id="detalles" className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                        {sections.showAbout && business.description && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 italic" style={{ color: theme.primaryColor }}>{t('mini_web.about_us')}</h2>
                                <p className="text-xl md:text-2xl leading-relaxed font-light" style={{ color: `${theme.textColor}99` }}>
                                    {business.description}
                                </p>
                            </section>
                        )}

                        {sections.showServices && servicesWithPrices.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 italic" style={{ color: theme.primaryColor }}>{t('mini_web.our_services')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {servicesWithPrices.filter((s: any) => s.name).map((service: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-5 border rounded-2xl group transition-all" style={{ backgroundColor: `${theme.textColor}05`, borderColor: `${theme.textColor}0a` }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                                                <CheckCircle2 size={24} style={{ color: theme.primaryColor }} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-lg font-bold">{service.name}</span>
                                                {service.description && <p className="text-sm opacity-60 mt-1">{service.description}</p>}
                                            </div>
                                            {service.price && (
                                                <span className="text-lg font-black" style={{ color: theme.primaryColor }}>{service.price}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {sections.showPromos && promos.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 italic" style={{ color: theme.accentColor }}>Promociones</h2>
                                <div className="space-y-4">
                                    {promos.filter((p: any) => p.title).map((promo: any, i: number) => (
                                        <div key={i} className="rounded-2xl p-6 border" style={{ backgroundColor: `${theme.accentColor}08`, borderColor: `${theme.accentColor}20` }}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-black">{promo.title}</h3>
                                                    {promo.description && <p className="text-sm opacity-70 mt-2">{promo.description}</p>}
                                                </div>
                                                {promo.discount && (
                                                    <span className="text-2xl font-black" style={{ color: theme.accentColor }}>{promo.discount}</span>
                                                )}
                                            </div>
                                            {promo.validUntil && (
                                                <p className="text-xs opacity-50 mt-3">Válido hasta: {new Date(promo.validUntil).toLocaleDateString('es-MX')}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {sections.showFaq && faq.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 italic" style={{ color: theme.primaryColor }}>Preguntas Frecuentes</h2>
                                <div className="space-y-3">
                                    {faq.filter((f: any) => f.question).map((item: any, i: number) => (
                                        <div key={i} className="border rounded-xl overflow-hidden" style={{ borderColor: `${theme.textColor}10` }}>
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                                className="w-full p-4 flex items-center justify-between text-left"
                                            >
                                                <span className="font-bold">{item.question}</span>
                                                {expandedFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                            {expandedFaq === i && (
                                                <div className="px-4 pb-4 opacity-70 text-sm leading-relaxed">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {gallery.length > 0 && sections.showGallery && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 italic" style={{ color: theme.primaryColor }}>{t('mini_web.work_gallery')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {gallery.map((img, i) => (
                                        <motion.div key={i} whileHover={{ scale: 1.02 }} className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                            <img src={img} alt={`Trabajo ${i + 1}`} className="w-full h-full object-cover" />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="space-y-8">
                        {sections.showInfo && (
                            <div className="sticky top-24 p-8 border rounded-[40px] shadow-2xl" style={{ backgroundColor: `${theme.textColor}05` }}>
                                <h3 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">{t('mini_web.information')}</h3>

                                <div className="space-y-8">
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.primaryColor}10` }}>
                                            <MapPin size={24} style={{ color: theme.primaryColor }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase mb-1 tracking-widest" style={{ color: `${theme.textColor}60` }}>{t('mini_web.location')}</p>
                                            <p className="text-lg font-medium">{business.address}</p>
                                            <p className="text-lg" style={{ color: theme.primaryColor }}>{business.city}{business.state ? `, ${business.state}` : ''}</p>
                                        </div>
                                    </div>

                                    {business.hours && (
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.primaryColor}10` }}>
                                                <Clock size={24} style={{ color: theme.primaryColor }} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase mb-1 tracking-widest" style={{ color: `${theme.textColor}60` }}>{t('mini_web.hours')}</p>
                                                <p className="text-lg font-medium">{business.hours}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.primaryColor}10` }}>
                                            <Phone size={24} style={{ color: theme.primaryColor }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase mb-1 tracking-widest" style={{ color: `${theme.textColor}60` }}>{t('mini_web.phone')}</p>
                                            <p className="text-2xl font-black tracking-widest">
                                                {session ? (business.phone || "Consultar") : "•••• ••••"}
                                            </p>
                                            {!session && <p className="text-[10px] mt-1 uppercase font-bold tracking-tight" style={{ color: theme.primaryColor }}>{t('mini_web.register_to_see')}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 space-y-4">
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`, '_blank')}
                                        className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] shadow-xl"
                                    >
                                        <Navigation size={22} />
                                        Cómo Llegar
                                    </button>

                                    {sections.showSocial && session && (
                                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                                            {business.facebook && (
                                                <a href={business.facebook} target="_blank" className="p-3 rounded-xl transition" style={{ backgroundColor: `${theme.textColor}05`, color: '#60a5fa' }}>
                                                    <Facebook size={24} />
                                                </a>
                                            )}
                                            {business.instagram && (
                                                <a href={business.instagram} target="_blank" className="p-3 rounded-xl transition" style={{ backgroundColor: `${theme.textColor}05`, color: '#f472b6' }}>
                                                    <Instagram size={24} />
                                                </a>
                                            )}
                                            {business.tiktok && (
                                                <a href={business.tiktok} target="_blank" className="p-3 rounded-xl transition" style={{ backgroundColor: `${theme.textColor}05`, color: theme.textColor }}>
                                                    <span className="text-lg font-black">T</span>
                                                </a>
                                            )}
                                            {business.telegram && (
                                                <a href={business.telegram} target="_blank" className="p-3 rounded-xl transition" style={{ backgroundColor: `${theme.textColor}05`, color: '#60a5fa' }}>
                                                    <MessageSquare size={24} />
                                                </a>
                                            )}
                                            {business.website && (
                                                <a href={business.website} target="_blank" className="p-3 rounded-xl transition" style={{ backgroundColor: `${theme.textColor}05`, color: theme.primaryColor }}>
                                                    <Globe size={24} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {sections.showFooter && (
                <footer className="border-t py-20" style={{ backgroundColor: theme.bgColor, borderColor: `${theme.textColor}0a` }}>
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border text-xs font-black uppercase tracking-[0.2em] mb-8" style={{ backgroundColor: `${theme.primaryColor}10`, color: theme.primaryColor, borderColor: `${theme.primaryColor}20` }}>
                            <ShieldCheck size={16} />
                            Negocio Verificado Pro
                        </div>
                        <p className="text-sm mb-4 italic" style={{ color: `${theme.textColor}60` }}>{t('mini_web.powered_by')}</p>
                        <div className="flex justify-center items-center gap-4" style={{ color: `${theme.textColor}40` }}>
                            <Link href="/terms" className="text-xs hover:opacity-100 transition opacity-60">{t('mini_web.terms')}</Link>
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: `${theme.textColor}30` }}></span>
                            <Link href="/privacy" className="text-xs hover:opacity-100 transition opacity-60">{t('mini_web.privacy')}</Link>
                        </div>
                    </div>
                </footer>
            )}

            {sections.showWhatsApp && session && business.whatsapp && (
                <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
                    <div className="backdrop-blur-2xl p-4 rounded-[32px] border shadow-2xl flex items-center gap-4" style={{ backgroundColor: `${theme.bgColor}cc`, borderColor: `${theme.textColor}10` }}>
                        <a href={`tel:${business.phone}`} className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.textColor}05`, color: theme.textColor }}>
                            <Phone size={24} />
                        </a>
                        <a
                            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi su negocio ${business.name} en CarMatch`)}`}
                            target="_blank"
                            className="flex-1 h-14 bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={22} />
                            WhatsApp
                        </a>
                    </div>
                </div>
            )}

            {showAppointmentForm && (
                <AppointmentModal business={business} theme={theme} onClose={() => setShowAppointmentForm(false)} onSubmit={handleAppointment} />
            )}
            {showQuoteForm && (
                <QuoteModal business={business} theme={theme} onClose={() => setShowQuoteForm(false)} onSubmit={handleQuote} />
            )}
        </div>
    )
}

function AppointmentModal({ business, theme, onClose, onSubmit }: any) {
    const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', service: '', date: '', time: '', description: '', vehicleInfo: '' })
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-surface-highlight max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-text-primary">Agendar Cita</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
                </div>
                <div className="space-y-3">
                    <input type="text" placeholder="Tu nombre *" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <input type="tel" placeholder="Tu teléfono *" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <input type="email" placeholder="Tu email (opcional)" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <input type="text" placeholder="Servicio requerido *" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                        <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    </div>
                    <input type="text" placeholder="Info del vehículo (opcional)" value={form.vehicleInfo} onChange={e => setForm({ ...form, vehicleInfo: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <textarea placeholder="Describe el problema o servicio necesario" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none resize-none" />
                    <button onClick={() => onSubmit(form)} disabled={!form.clientName || !form.clientPhone || !form.service || !form.date || !form.time} className="w-full py-3 text-white font-bold rounded-lg disabled:opacity-50 transition" style={{ backgroundColor: theme.primaryColor }}>
                        Agendar Cita
                    </button>
                </div>
            </div>
        </div>
    )
}

function QuoteModal({ business, theme, onClose, onSubmit }: any) {
    const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', vehicleInfo: '', description: '' })
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-surface-highlight max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-text-primary">Solicitar Presupuesto</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
                </div>
                <div className="space-y-3">
                    <input type="text" placeholder="Tu nombre *" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <input type="tel" placeholder="Tu teléfono *" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <input type="email" placeholder="Tu email (opcional)" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <input type="text" placeholder="Info del vehículo (ej: Honda Civic 2018)" value={form.vehicleInfo} onChange={e => setForm({ ...form, vehicleInfo: e.target.value })} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none" />
                    <textarea placeholder="Describe el problema o servicio que necesitas *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none resize-none" />
                    <button onClick={() => onSubmit(form)} disabled={!form.clientName || !form.clientPhone || !form.description} className="w-full py-3 text-white font-bold rounded-lg disabled:opacity-50 transition" style={{ backgroundColor: theme.accentColor }}>
                        Enviar Solicitud
                    </button>
                </div>
            </div>
        </div>
    )
}
