// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

// ✅ DISEÑO DE TARJETAS VALIDADO - ASÍ DEBE SER
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion'
import { X as XIcon, ThumbsUp, MapPin, Plus, ArrowRight } from 'lucide-react'

import Link from 'next/link'
import ContactButton from './ContactButton'
import ShareButton from './ShareButton'
import ReportImageButton from './ReportImageButton'
import { formatPrice } from '@/lib/vehicleTaxonomy'
import { useLanguage } from '@/contexts/LanguageContext'
import { generateVehicleSlug, generateBusinessSlug } from '@/lib/slug'

interface FeedItem {
    id: string
    title: string
    brand?: string
    model?: string
    category?: string
    year?: number
    price?: number
    currency?: string | null
    city: string
    images?: string[]
    description?: string | null // ✅ Added description
    feedType?: 'VEHICLE' | 'BUSINESS'
    user: {
        name: string
        image: string | null
    }
    _count?: {
        favorites: number
    }
}

interface SwipeCardProps {
    item: FeedItem
    onSwipe: (direction: 'left' | 'right') => void
    isTop: boolean
    exitX?: number
}

function SwipeCard({ item, onSwipe, isTop, exitX }: SwipeCardProps) {
    const { t } = useLanguage()
    const [activeImage, setActiveImage] = useState(0)
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
    const likeOpacity = useTransform(x, [0, 80], [0, 1])
    const nopeOpacity = useTransform(x, [-80, 0], [1, 0])

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100

        if (info.offset.x > threshold) {
            onSwipe('right')
        } else if (info.offset.x < -threshold) {
            onSwipe('left')
        }
    }

    const isBusiness = item.feedType === 'BUSINESS'

    return (
        <motion.div
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0, y: 0 }}
            animate={{
                scale: isTop ? 1 : 0.95,
                opacity: 1,
                y: 0, // ✅ Fix: Align perfectly behind (no peeking footer)
                zIndex: isTop ? 60 : 10
            }}
            style={{
                x,
                rotate,
                opacity,
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: '100%',
                margin: 'auto'
            }}
            className={`touch-none flex flex-col absolute inset-0 ${!isTop && 'pointer-events-none'}`}
            exit={{
                x: exitX !== undefined ? exitX : (x.get() <= 0 ? -1000 : 1000),
                opacity: 0,
                rotate: x.get() <= 0 ? -45 : 45,
                zIndex: 200,
                transition: { duration: 0.8, ease: "easeOut" }
            }}
        >
            <div className="bg-[#111114] rounded-3xl lg:rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col lg:flex-row h-full w-full lg:max-w-5xl mx-auto">
                
                {/* CENTRAL CONTAINER: Main Image + Info */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Imagen Principal - altura adaptativa por viewport */}
                    <div className="relative w-full flex-1 max-h-[45vh] lg:max-h-none lg:shrink lg:h-auto lg:flex-1 lg:min-h-[40vh] flex items-center justify-center bg-black overflow-hidden group">
                        <Link
                            href={isBusiness ? `/map-store?id=${item.id}` : `/vehicle/${item.id}`}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="block w-full h-full relative"
                        >
                            {item.images && item.images[activeImage] ? (
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImage}
                                        src={item.images[activeImage]}
                                        alt={item.title}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                    />
                                </AnimatePresence>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <MapPin className="w-20 h-20 text-slate-700 animate-pulse" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/40 pointer-events-none" />
                        </Link>

                        {isBusiness && (
                            <div className="absolute top-6 left-6 z-30 px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black rounded-full flex items-center gap-1.5 uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">
                                <MapPin size={12} className="animate-bounce" /> {t('swipe.business_badge')}
                            </div>
                        )}

                        <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
                            <ReportImageButton
                                imageUrl={item.images?.[activeImage] || ''}
                                vehicleId={!isBusiness ? item.id : undefined}
                                businessId={isBusiness ? item.id : undefined}
                            />
                            <div className="p-0.5 bg-slate-900/40 backdrop-blur-xl rounded-full border border-white/10">
                                <ShareButton
                                    title={item.title}
                                    text={isBusiness ? `¡Mira este negocio en CarMatch! ${item.title}` : `¡Mira este ${item.title} en CarMatch!`}
                                    url={isBusiness
                                        ? `/negocio/${generateBusinessSlug(item.title, item.city)}-${item.id}`
                                        : `/comprar/${generateVehicleSlug(item.brand || '', item.model || '', item.year || 0, item.city)}-${item.id}`
                                    }
                                    variant="minimal"
                                    className="bg-transparent text-white hover:bg-white/20 transition-all rounded-full"
                                />
                            </div>
                        </div>

                        {/* Swipe overlays */}
                        <AnimatePresence>
                            <motion.div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none" style={{ opacity: likeOpacity }}>
                                <div className="px-12 py-6 bg-green-500/20 backdrop-blur-md text-green-400 rounded-3xl font-black text-5xl border-4 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)] uppercase tracking-tighter -rotate-12 italic">{t('swipe.overlay_like')}</div>
                            </motion.div>
                            <motion.div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none" style={{ opacity: nopeOpacity }}>
                                <div className="px-12 py-6 bg-red-500/20 backdrop-blur-md text-red-400 rounded-3xl font-black text-5xl border-4 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] uppercase tracking-tighter rotate-12 italic">{t('swipe.overlay_nope')}</div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Info Area — nunca se desborda en ningún teléfono */}
                    <div className="flex flex-col bg-[#111114] shrink-0 relative z-10 px-4 lg:px-10 py-4 lg:py-6 overflow-hidden">

                        {/* Título — siempre 1 línea */}
                        <Link href={isBusiness ? `/map-store?id=${item.id}` : `/vehicle/${item.id}`} className="block mb-0.5 lg:mb-2">
                            <h2 className="text-sm lg:text-2xl font-black text-white hover:text-primary-400 transition leading-tight tracking-tight uppercase line-clamp-1">
                                {item.title}
                            </h2>
                        </Link>

                        {/* Precio — gradiente, nunca desborda */}
                        {!isBusiness && (
                            <Link href={`/vehicle/${item.id}`} className="block mb-1.5 lg:mb-4">
                                <div className="text-xl lg:text-3xl font-black leading-none truncate" style={{ background: 'linear-gradient(90deg, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {formatPrice(item.price || 0, item.currency || 'MXN')}
                                </div>
                            </Link>
                        )}

                        {/* Ubicación + CTA — siempre visibles */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <Link href={isBusiness ? `/map-store?id=${item.id}` : `/vehicle/${item.id}`} className="flex items-center gap-1 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 transition hover:border-white/20">
                                <MapPin size={10} className="text-primary-400 shrink-0" />
                                <span className="font-semibold uppercase text-[10px] lg:text-xs tracking-tight">{item.city}</span>
                            </Link>
                            <Link href={isBusiness ? `/map-store?id=${item.id}` : `/vehicle/${item.id}`} className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold px-2.5 py-1 rounded-lg hover:bg-indigo-500/25 transition-all text-[10px] lg:text-xs">
                                Ver Detalles <ArrowRight size={10} />
                            </Link>
                        </div>
                    </div>

                    {/* 📱 MOBILE THUMBNAILS (BOTTOM ROW) */}
                    <div className="lg:hidden flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar shrink-0 border-t border-white/5 bg-black/40 backdrop-blur-md">
                        {item.images && item.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                                className={`relative aspect-video w-[18%] min-w-[60px] shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${activeImage === idx 
                                    ? 'border-primary-500 scale-[1.05] z-10 shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
                                    : 'border-white/10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                                }`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} draggable={false} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 📸 DESKTOP THUMBNAILS (RIGHT COLUMN) */}
                <div className="hidden lg:flex flex-col w-[180px] xl:w-[240px] shrink-0 border-l border-white/5 bg-black/60 p-4 gap-4 overflow-y-auto no-scrollbar backdrop-blur-md">
                    <div className="text-center pb-3 border-b border-white/5 shrink-0">
                        <span className="text-[10px] xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500">Galería</span>
                    </div>
                    {item.images && item.images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                            className={`relative aspect-video w-full shrink-0 rounded-xl xl:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx 
                                ? 'border-primary-500 scale-[1.02] shadow-[0_0_20px_rgba(14,165,233,0.4)] z-20' 
                                : 'border-white/5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} draggable={false} />
                        </button>
                    ))}
                </div>

            </div>
        </motion.div >
    )
}

interface SwipeFeedProps {
    items: FeedItem[]
    onLike: (id: string) => void
    onDislike: (id: string) => void
    onNeedMore: () => void
}

export default function SwipeFeed({ items, onLike, onDislike, onNeedMore }: SwipeFeedProps) {
    const { t } = useLanguage()
    const [isSwiping, setIsSwiping] = useState(false)
    const [exitX, setExitX] = useState<number | undefined>(undefined)

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        if (isSwiping || items.length === 0) return

        const currentItem = items[0]
        setIsSwiping(true)
        setExitX(swipeDirection === 'left' ? -1000 : 1000)

        // Pequeño retraso antes de ejecutar la acción para que Framer Motion 
        // pueda registrar el exitX correcto antes de desmontar el componente.
        setTimeout(() => {
            if (swipeDirection === 'right') {
                onLike(currentItem.id)
            } else {
                onDislike(currentItem.id)
            }
        }, 50)

        // Resetear estado ligeramente después para permitir que la animación respire
        setTimeout(() => {
            setExitX(undefined)
            setIsSwiping(false)
        }, 800)
    }

    const currentItem = items[0]
    const nextItem = items[1]

    if (items.length === 0 && !isSwiping) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-[70vh]">
                <div className="w-24 h-24 bg-surface-highlight rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">
                    {t('swipe.seen_all_title')}
                </h2>
                <p className="text-text-secondary mb-8 max-w-md">
                    {t('swipe.seen_all_desc')}
                </p>
                <button
                    onClick={onNeedMore}
                    className="px-8 py-4 bg-primary-700 text-text-primary rounded-xl font-bold text-lg hover:bg-primary-600 transition flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('swipe.expand_btn')}
                </button>


                <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-col items-center">
                    <p className="text-sm text-text-secondary mb-4">{t('market.cant_find_desc')}</p>
                    <Link
                        href="/publish"
                        className="px-8 py-4 bg-white text-primary-900 rounded-xl font-bold text-lg hover:bg-white/90 transition flex items-center gap-2 shadow-xl"
                    >
                        <Plus size={20} />
                        {t('swipe.publish') || t('market.publish_cta')}
                    </Link>
                </div>
            </div >

        )
    }

    return (
        <div className="relative w-full max-w-md lg:max-w-7xl mx-auto flex flex-col h-full justify-center items-center">
            {/* 🌌 ATMOSPHERIC BACKGROUND (Desktop Only) */}
            <div className="hidden lg:block absolute inset-0 -z-10 pointer-events-none transition-all duration-1000">
                <AnimatePresence mode="wait">
                    {currentItem?.images?.[0] && (
                        <motion.div
                            key={currentItem.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0"
                        >
                            <img 
                                src={currentItem.images[0]} 
                                className="w-full h-full object-cover blur-[100px] scale-110"
                                alt="background"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/60 to-[#0f172a]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Animated Background Blobs (Mobile/Fallback) */}
            <div className="lg:hidden absolute top-1/4 -left-20 w-80 h-80 bg-primary-600/10 rounded-full blur-[100px] animate-blob pointer-events-none" />
            <div className="lg:hidden absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-primary-900/5 to-transparent pointer-events-none" />

            <div className="relative w-full flex-1 flex justify-center perspective-2000">
                
                {/* Escritorio Floating Buttons (Anchored exactly 112px outside the 1024px card boundary) */}
                <div className="hidden xl:block absolute top-1/2 left-1/2 w-full max-w-[1024px] -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none">
                    <div className="absolute top-1/2 -left-28 -translate-y-1/2 pointer-events-auto">
                        <button
                            onClick={() => handleSwipe('left')}
                            disabled={isSwiping}
                            className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/30 hover:text-red-400 transition-all hover:scale-110 hover:-rotate-12 shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-xl disabled:opacity-50"
                        >
                            <XIcon size={40} className="stroke-[3]" />
                        </button>
                    </div>
                    
                    <div className="absolute top-1/2 -right-32 -translate-y-1/2 pointer-events-auto">
                        <button
                            onClick={() => handleSwipe('right')}
                            disabled={isSwiping}
                            className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 text-green-500 rounded-full flex items-center justify-center hover:bg-green-500/30 hover:text-green-400 transition-all hover:scale-110 hover:rotate-12 shadow-[0_0_30px_rgba(34,197,94,0.2)] backdrop-blur-xl disabled:opacity-50"
                        >
                            <ThumbsUp size={40} className="stroke-[3]" />
                        </button>
                    </div>
                </div>
                <AnimatePresence mode="popLayout">
                    {items.slice(0, 2).map((item, index) => {
                        const isTop = index === 0;
                        return (
                            <SwipeCard
                                key={item.id}
                                item={item}
                                onSwipe={isTop ? handleSwipe : () => { }}
                                isTop={isTop}
                                exitX={isTop ? exitX : undefined}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* 📱 FIXED MOBILE FOOTER BUTTONS (Static, no animation) */}
            <div className="lg:hidden w-full px-6 pb-6 pt-2 flex items-center justify-center gap-8 z-30 bg-background">
                <button 
                    onClick={() => handleSwipe('left')} 
                    disabled={isSwiping}
                    className="w-16 h-16 flex items-center justify-center rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-500 active:scale-95 transition-transform disabled:opacity-50"
                >
                    <XIcon size={32} strokeWidth={4} />
                </button>
                <button 
                    onClick={() => handleSwipe('right')} 
                    disabled={isSwiping}
                    className="w-16 h-16 flex items-center justify-center rounded-2xl bg-green-500/10 border-2 border-green-500/30 text-green-500 active:scale-95 transition-transform disabled:opacity-50"
                >
                    <ThumbsUp size={32} strokeWidth={4} />
                </button>
            </div>

        </div>
    )
}
