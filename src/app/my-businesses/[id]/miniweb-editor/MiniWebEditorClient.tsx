"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe, Palette, Layout, Type, Image, Search, Save, Eye, ChevronLeft, ChevronRight, Check, X, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

const THEME_PRESETS = [
  { id: 'dark-carmatch', name: 'Oscuro CarMatch', primaryColor: '#0ea5e9', bgColor: '#050810', textColor: '#e2e8f0', accentColor: '#f97316', fontFamily: 'system', borderRadius: '16px' },
  { id: 'light-pro', name: 'Claro Profesional', primaryColor: '#0369a1', bgColor: '#ffffff', textColor: '#1e293b', accentColor: '#ea580c', fontFamily: 'inter', borderRadius: '12px' },
  { id: 'red-passion', name: 'Rojo Pasión', primaryColor: '#dc2626', bgColor: '#1a0505', textColor: '#fef2f2', accentColor: '#f97316', fontFamily: 'montserrat', borderRadius: '8px' },
  { id: 'green-eco', name: 'Verde Eco', primaryColor: '#16a34a', bgColor: '#051a0a', textColor: '#f0fdf4', accentColor: '#eab308', fontFamily: 'roboto', borderRadius: '12px' },
  { id: 'purple-luxury', name: 'Morado Luxury', primaryColor: '#9333ea', bgColor: '#0f0520', textColor: '#faf5ff', accentColor: '#f59e0b', fontFamily: 'playfair', borderRadius: '20px' },
  { id: 'orange-industrial', name: 'Naranja Industrial', primaryColor: '#ea580c', bgColor: '#1a0d00', textColor: '#fff7ed', accentColor: '#0ea5e9', fontFamily: 'oswald', borderRadius: '4px' },
]

const FONT_OPTIONS = [
  { id: 'system', name: 'System', value: 'Arial, Helvetica, sans-serif' },
  { id: 'inter', name: 'Inter', value: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', value: 'Playfair Display, serif' },
  { id: 'oswald', name: 'Oswald', value: 'Oswald, sans-serif' },
]

const RADIUS_OPTIONS = [
  { value: '0px', label: 'None' },
  { value: '8px', label: 'Small' },
  { value: '16px', label: 'Medium' },
  { value: '24px', label: 'Large' },
  { value: '9999px', label: 'Full' },
]

interface Business {
  id: string
  name: string
  category: string
  description: string | null
  images: string[]
  services: string[]
  hours: string | null
  phone: string | null
  whatsapp: string | null
  telegram: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  website: string | null
  is24Hours: boolean
  hasEmergencyService: boolean
  hasHomeService: boolean
  address: string
  city: string
  state: string | null
  slug: string | null
  miniWebTheme: any
  miniWebSections: any
  miniWebHero: any
  miniWebLogo: string | null
  miniWebSeo: any
  miniWebServices: any
  miniWebPromos: any
  miniWebFaq: any
}

export default function MiniWebEditorClient({ business }: { business: Business }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'theme' | 'sections' | 'hero' | 'content' | 'seo'>('theme')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  const [theme, setTheme] = useState({
    primaryColor: business.miniWebTheme?.primaryColor || THEME_PRESETS[0].primaryColor,
    bgColor: business.miniWebTheme?.bgColor || THEME_PRESETS[0].bgColor,
    textColor: business.miniWebTheme?.textColor || THEME_PRESETS[0].textColor,
    accentColor: business.miniWebTheme?.accentColor || THEME_PRESETS[0].accentColor,
    fontFamily: business.miniWebTheme?.fontFamily || THEME_PRESETS[0].fontFamily,
    borderRadius: business.miniWebTheme?.borderRadius || THEME_PRESETS[0].borderRadius,
  })

  const [sections, setSections] = useState({
    showHero: business.miniWebSections?.showHero ?? true,
    showAbout: business.miniWebSections?.showAbout ?? true,
    showServices: business.miniWebSections?.showServices ?? true,
    showGallery: business.miniWebSections?.showGallery ?? true,
    showInfo: business.miniWebSections?.showInfo ?? true,
    showSocial: business.miniWebSections?.showSocial ?? true,
    showFooter: business.miniWebSections?.showFooter ?? true,
    showWhatsApp: business.miniWebSections?.showWhatsApp ?? true,
    showReviews: business.miniWebSections?.showReviews ?? true,
    showPromos: business.miniWebSections?.showPromos ?? true,
    showFaq: business.miniWebSections?.showFaq ?? true,
    showAppointmentButton: business.miniWebSections?.showAppointmentButton ?? true,
    showQuoteButton: business.miniWebSections?.showQuoteButton ?? true,
  })

  const [hero, setHero] = useState({
    headline: business.miniWebHero?.headline || business.name,
    subtitle: business.miniWebHero?.subtitle || `${business.category} en ${business.city}`,
    ctaText: business.miniWebHero?.ctaText || 'Contactar',
    overlayOpacity: business.miniWebHero?.overlayOpacity ?? 60,
  })

  const [seo, setSeo] = useState({
    metaTitle: business.miniWebSeo?.metaTitle || `${business.name} - ${business.category} en ${business.city} | CarMatch`,
    metaDescription: business.miniWebSeo?.metaDescription || business.description || `${business.name} - ${business.category} en ${business.city}. Servicios automotrices de calidad.`,
    ogImage: business.miniWebSeo?.ogImage || business.images[0] || '',
  })

  const [services, setServices] = useState<Array<{ name: string; description: string; price: string; priceRange: string; duration: string }>>(
    business.miniWebServices || business.services.map(s => ({ name: s, description: '', price: '', priceRange: '', duration: '' }))
  )

  const [promos, setPromos] = useState<Array<{ title: string; description: string; discount: string; validUntil: string }>>(
    business.miniWebPromos || []
  )

  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>(
    business.miniWebFaq || []
  )

  const [logo, setLogo] = useState(business.miniWebLogo || '')

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setTheme({
      primaryColor: preset.primaryColor,
      bgColor: preset.bgColor,
      textColor: preset.textColor,
      accentColor: preset.accentColor,
      fontFamily: preset.fontFamily,
      borderRadius: preset.borderRadius,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${business.id}/miniweb-theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, sections, hero, seo, services, promos, faq, logo }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('MiniWeb guardada correctamente')
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const addService = () => setServices([...services, { name: '', description: '', price: '', priceRange: '', duration: '' }])
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i))
  const updateService = (i: number, field: string, value: string) => {
    const updated = [...services]
    updated[i] = { ...updated[i], [field]: value }
    setServices(updated)
  }

  const addPromo = () => setPromos([...promos, { title: '', description: '', discount: '', validUntil: '' }])
  const removePromo = (i: number) => setPromos(promos.filter((_, idx) => idx !== i))
  const updatePromo = (i: number, field: string, value: string) => {
    const updated = [...promos]
    updated[i] = { ...updated[i], [field]: value }
    setPromos(updated)
  }

  const addFaq = () => setFaq([...faq, { question: '', answer: '' }])
  const removeFaq = (i: number) => setFaq(faq.filter((_, idx) => idx !== i))
  const updateFaq = (i: number, field: string, value: string) => {
    const updated = [...faq]
    updated[i] = { ...updated[i], [field]: value }
    setFaq(updated)
  }

  const fontValue = FONT_OPTIONS.find(f => f.id === theme.fontFamily)?.value || FONT_OPTIONS[0].value

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/my-businesses')} className="p-2 hover:bg-surface rounded-lg transition">
              <ChevronLeft size={20} className="text-text-secondary" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Editor de MiniWeb</h1>
              <p className="text-sm text-text-secondary">{business.name} — /{business.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
              className="px-3 py-2 bg-surface text-text-secondary rounded-lg text-sm hover:bg-surface-highlight transition flex items-center gap-1"
            >
              <Eye size={16} />
              {previewMode === 'desktop' ? 'Desktop' : 'Móvil'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition flex items-center gap-1 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-1 bg-surface rounded-lg p-1">
              {[
                { id: 'theme' as const, icon: Palette, label: 'Tema' },
                { id: 'sections' as const, icon: Layout, label: 'Secciones' },
                { id: 'hero' as const, icon: Image, label: 'Hero' },
                { id: 'content' as const, icon: Type, label: 'Contenido' },
                { id: 'seo' as const, icon: Search, label: 'SEO' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition flex items-center justify-center gap-1 ${
                    activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Presets</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`p-3 rounded-lg border text-left transition ${
                          theme.primaryColor === preset.primaryColor && theme.bgColor === preset.bgColor
                            ? 'border-primary-500 bg-primary-600/10'
                            : 'border-surface-highlight hover:border-primary-500/30'
                        }`}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.bgColor }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                        </div>
                        <span className="text-xs text-text-primary font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Colores Personalizados</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'primaryColor', label: 'Primario' },
                      { key: 'bgColor', label: 'Fondo' },
                      { key: 'textColor', label: 'Texto' },
                      { key: 'accentColor', label: 'Acento' },
                    ].map(c => (
                      <div key={c.key}>
                        <label className="text-xs text-text-secondary mb-1 block">{c.label}</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={(theme as any)[c.key]}
                            onChange={e => setTheme({ ...theme, [c.key]: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={(theme as any)[c.key]}
                            onChange={e => setTheme({ ...theme, [c.key]: e.target.value })}
                            className="flex-1 bg-surface-highlight text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Tipografía</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map(font => (
                      <button
                        key={font.id}
                        onClick={() => setTheme({ ...theme, fontFamily: font.id })}
                        className={`p-2 rounded-lg border text-xs transition ${
                          theme.fontFamily === font.id
                            ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                            : 'border-surface-highlight text-text-secondary hover:border-primary-500/30'
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Bordes</h3>
                  <div className="flex gap-2">
                    {RADIUS_OPTIONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setTheme({ ...theme, borderRadius: r.value })}
                        className={`flex-1 py-2 text-xs transition border ${
                          theme.borderRadius === r.value
                            ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                            : 'border-surface-highlight text-text-secondary hover:border-primary-500/30'
                        }`}
                        style={{ borderRadius: r.value }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="bg-surface rounded-xl p-4 border border-surface-highlight space-y-3">
                <h3 className="text-sm font-bold text-text-primary mb-3">Secciones Visibles</h3>
                {Object.entries(sections).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between py-2 border-b border-surface-highlight last:border-0">
                    <span className="text-sm text-text-primary capitalize">{key.replace('show', '').replace(/([A-Z])/g, ' $1')}</span>
                    <button
                      onClick={() => setSections({ ...sections, [key]: !value })}
                      className={`w-10 h-6 rounded-full transition ${value ? 'bg-primary-600' : 'bg-surface-highlight'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div className="bg-surface rounded-xl p-4 border border-surface-highlight space-y-3">
                  <h3 className="text-sm font-bold text-text-primary">Hero Section</h3>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Headline</label>
                    <input
                      type="text"
                      value={hero.headline}
                      onChange={e => setHero({ ...hero, headline: e.target.value })}
                      className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none"
                      placeholder="Nombre del negocio"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Subtítulo</label>
                    <input
                      type="text"
                      value={hero.subtitle}
                      onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                      className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none"
                      placeholder="Categoría en Ciudad"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Texto del Botón CTA</label>
                    <input
                      type="text"
                      value={hero.ctaText}
                      onChange={e => setHero({ ...hero, ctaText: e.target.value })}
                      className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none"
                      placeholder="Contactar"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Opacidad del Overlay: {hero.overlayOpacity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={hero.overlayOpacity}
                      onChange={e => setHero({ ...hero, overlayOpacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Servicios con Precios</h3>
                  {services.map((svc, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={svc.name}
                        onChange={e => updateService(i, 'name', e.target.value)}
                        placeholder="Servicio"
                        className="flex-1 bg-surface-highlight text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                      />
                      <input
                        type="text"
                        value={svc.price}
                        onChange={e => updateService(i, 'price', e.target.value)}
                        placeholder="$Precio"
                        className="w-20 bg-surface-highlight text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                      />
                      <button onClick={() => removeService(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={addService} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-2">
                    <Plus size={14} /> Agregar servicio
                  </button>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Promociones</h3>
                  {promos.map((promo, i) => (
                    <div key={i} className="bg-surface-highlight rounded-lg p-3 mb-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promo.title}
                          onChange={e => updatePromo(i, 'title', e.target.value)}
                          placeholder="Título de la promo"
                          className="flex-1 bg-surface text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                        />
                        <button onClick={() => removePromo(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      </div>
                      <input
                        type="text"
                        value={promo.description}
                        onChange={e => updatePromo(i, 'description', e.target.value)}
                        placeholder="Descripción"
                        className="w-full bg-surface text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promo.discount}
                          onChange={e => updatePromo(i, 'discount', e.target.value)}
                          placeholder="Descuento (ej: 20%)"
                          className="flex-1 bg-surface text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                        />
                        <input
                          type="date"
                          value={promo.validUntil}
                          onChange={e => updatePromo(i, 'validUntil', e.target.value)}
                          className="bg-surface text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={addPromo} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-2">
                    <Plus size={14} /> Agregar promoción
                  </button>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-surface-highlight">
                  <h3 className="text-sm font-bold text-text-primary mb-3">Preguntas Frecuentes</h3>
                  {faq.map((item, i) => (
                    <div key={i} className="bg-surface-highlight rounded-lg p-3 mb-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.question}
                          onChange={e => updateFaq(i, 'question', e.target.value)}
                          placeholder="Pregunta"
                          className="flex-1 bg-surface text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none"
                        />
                        <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      </div>
                      <textarea
                        value={item.answer}
                        onChange={e => updateFaq(i, 'answer', e.target.value)}
                        placeholder="Respuesta"
                        rows={2}
                        className="w-full bg-surface text-text-primary text-xs px-2 py-1 rounded border border-surface-highlight focus:border-primary-500 outline-none resize-none"
                      />
                    </div>
                  ))}
                  <button onClick={addFaq} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-2">
                    <Plus size={14} /> Agregar pregunta
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="bg-surface rounded-xl p-4 border border-surface-highlight space-y-3">
                <h3 className="text-sm font-bold text-text-primary mb-3">SEO & Meta Tags</h3>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Meta Title</label>
                  <input
                    type="text"
                    value={seo.metaTitle}
                    onChange={e => setSeo({ ...seo, metaTitle: e.target.value })}
                    className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Meta Description</label>
                  <textarea
                    value={seo.metaDescription}
                    onChange={e => setSeo({ ...seo, metaDescription: e.target.value })}
                    rows={3}
                    className="w-full bg-surface-highlight text-text-primary text-sm px-3 py-2 rounded-lg border border-surface-highlight focus:border-primary-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-surface-highlight overflow-hidden">
            <div className="p-3 border-b border-surface-highlight flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Preview {previewMode === 'desktop' ? 'Desktop' : 'Móvil'}</span>
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                <Globe size={12} />
                Abrir MiniWeb
              </a>
            </div>
            <div className={`mx-auto bg-black ${previewMode === 'desktop' ? 'w-full' : 'w-[375px]'}`} style={{ minHeight: '500px' }}>
              <div
                style={{
                  backgroundColor: theme.bgColor,
                  color: theme.textColor,
                  fontFamily: fontValue,
                  borderRadius: theme.borderRadius,
                  overflow: 'hidden',
                }}
              >
                {sections.showHero && (
                  <div className="relative h-48 overflow-hidden">
                    {business.images[0] && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${business.images[0]})`, opacity: 1 - hero.overlayOpacity / 100 }}
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4" style={{ backgroundColor: `${theme.bgColor}cc` }}>
                      {logo && <img src={logo} alt="Logo" className="w-12 h-12 rounded-full mb-2 object-cover" />}
                      <h1 className="text-xl font-black uppercase italic" style={{ color: theme.textColor }}>{hero.headline}</h1>
                      <p className="text-xs mt-1 opacity-70">{hero.subtitle}</p>
                      <button className="mt-3 px-4 py-1.5 rounded-full text-white text-xs font-bold" style={{ backgroundColor: theme.primaryColor }}>
                        {hero.ctaText}
                      </button>
                    </div>
                  </div>
                )}

                {sections.showAbout && business.description && (
                  <div className="p-4">
                    <h2 className="text-sm font-bold mb-2" style={{ color: theme.primaryColor }}>Sobre Nosotros</h2>
                    <p className="text-xs opacity-70 leading-relaxed">{business.description}</p>
                  </div>
                )}

                {sections.showServices && services.length > 0 && (
                  <div className="p-4">
                    <h2 className="text-sm font-bold mb-2" style={{ color: theme.primaryColor }}>Servicios</h2>
                    <div className="space-y-1">
                      {services.filter(s => s.name).map((svc, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b opacity-70" style={{ borderColor: `${theme.textColor}20` }}>
                          <span className="text-xs">{svc.name}</span>
                          {svc.price && <span className="text-xs font-bold">{svc.price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sections.showPromos && promos.length > 0 && (
                  <div className="p-4">
                    <h2 className="text-sm font-bold mb-2" style={{ color: theme.accentColor }}>Promociones</h2>
                    {promos.filter(p => p.title).map((promo, i) => (
                      <div key={i} className="rounded-lg p-2 mb-2" style={{ backgroundColor: `${theme.accentColor}15` }}>
                        <div className="flex justify-between">
                          <span className="text-xs font-bold">{promo.title}</span>
                          {promo.discount && <span className="text-xs font-bold" style={{ color: theme.accentColor }}>{promo.discount}</span>}
                        </div>
                        {promo.description && <p className="text-xs opacity-70 mt-1">{promo.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {sections.showFaq && faq.length > 0 && (
                  <div className="p-4">
                    <h2 className="text-sm font-bold mb-2" style={{ color: theme.primaryColor }}>Preguntas Frecuentes</h2>
                    {faq.filter(f => f.question).map((item, i) => (
                      <div key={i} className="mb-2 border-b pb-2" style={{ borderColor: `${theme.textColor}20` }}>
                        <p className="text-xs font-bold">{item.question}</p>
                        <p className="text-xs opacity-70 mt-1">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {sections.showInfo && (
                  <div className="p-4">
                    <div className="rounded-xl p-3" style={{ backgroundColor: `${theme.textColor}08` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                          <Globe size={10} style={{ color: theme.primaryColor }} />
                        </div>
                        <span className="text-xs opacity-70">{business.address}, {business.city}</span>
                      </div>
                      {business.hours && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                            <span className="text-xs" style={{ color: theme.primaryColor }}>🕐</span>
                          </div>
                          <span className="text-xs opacity-70">{business.hours}</span>
                        </div>
                      )}
                      {business.phone && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                            <span className="text-xs" style={{ color: theme.primaryColor }}>📞</span>
                          </div>
                          <span className="text-xs opacity-70">{business.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sections.showFooter && (
                  <div className="p-4 text-center border-t" style={{ borderColor: `${theme.textColor}10` }}>
                    <p className="text-xs opacity-40">Powered by CarMatch</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
