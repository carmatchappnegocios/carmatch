'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Copy, Check, X, Megaphone } from 'lucide-react'

type Format = 'video' | 'imagen' | 'carrusel'
type Platform = 'tiktok' | 'instagram' | 'facebook'
type GatilloKey = 'loss_aversion' | 'curiosity' | 'identity' | 'social_proof' | 'authority' | 'fomo' | 'security'

interface CarouselSlide {
 slideNumber: number
 prompt: string
 textOverlay: string
}

interface CalendarEntry {
 id: string
 dayNumber: number
 week: number
 title: string
 theme: string
 gatillo: GatilloKey
 gatilloIcon: string
 format: Format
 platforms: Platform[]
 caption: string
 hashtags: string[]
 postingTimes: { tiktok: string; instagram: string; facebook: string }
 creenPrompt?: string
 creenModel?: string
 geminiPrompt?: string
 carouselSlides?: CarouselSlide[]
 adConfig?: { platform: 'meta' | 'tiktok'; budgetMXN: number; objective: string }
 isFestive?: boolean
 festiveDate?: string
 prePublishDays?: number
}

// ─── CONSTANTS ────────────────────────────────────

const GATILLOS: Record<GatilloKey, { label: string; icon: string; color: string }> = {
 loss_aversion: { label: 'Pérdida', icon: '🔴', color: 'text-red-400' },
 curiosity: { label: 'Curiosidad', icon: '🟡', color: 'text-yellow-400' },
 identity: { label: 'Identidad', icon: '🔵', color: 'text-blue-400' },
 social_proof: { label: 'Prueba Social', icon: '🟢', color: 'text-green-400' },
 authority: { label: 'Autoridad', icon: '🟣', color: 'text-purple-400' },
 fomo: { label: 'FOMO', icon: '🟠', color: 'text-orange-400' },
 security: { label: 'Seguridad', icon: '🛡️', color: 'text-cyan-400' },
}

const WEEK_THEMES: Record<number, { title: string; gradient: string; icon: string }> = {
 1: { title: 'Gancho Inicial — Independencia', gradient: 'from-red-600 to-orange-500', icon: '🇲🇽' },
 2: { title: 'Seguridad — Protege a los tuyos', gradient: 'from-cyan-600 to-blue-500', icon: '🛡️' },
 3: { title: 'Datos del Mercado', gradient: 'from-yellow-600 to-amber-500', icon: '📊' },
 4: { title: 'Prueba Social', gradient: 'from-green-600 to-emerald-500', icon: '✅' },
 5: { title: 'Activación de Compradores', gradient: 'from-blue-600 to-indigo-500', icon: '🎯' },
 6: { title: 'Vendedores — Tu auto vale más', gradient: 'from-purple-600 to-pink-500', icon: '💰' },
 7: { title: 'Día de Muertos + Funciones', gradient: 'from-orange-600 to-red-600', icon: '💀' },
 8: { title: 'Funciones Avanzadas', gradient: 'from-indigo-600 to-violet-500', icon: '⚡' },
 9: { title: 'Día de la Revolución', gradient: 'from-green-700 to-red-600', icon: '🇲🇽' },
 10: { title: 'Pre-Buen Fin', gradient: 'from-orange-600 to-red-500', icon: '🔥' },
 11: { title: 'Buen Fin 🏷️', gradient: 'from-red-700 to-pink-600', icon: '🏷️' },
 12: { title: 'Navidad + Guadalupe', gradient: 'from-green-700 to-red-500', icon: '🎄' },
}

const TIMES = { tiktok: '15:00', instagram: '13:00', facebook: '12:00' }

// ─── HELPER ────────────────────────────────────────

function entry(
 id: string, dayNumber: number, week: number, title: string, theme: string,
 gatillo: GatilloKey, format: Format, platforms: Platform[],
 caption: string, hashtags: string[],
 opts: Partial<Omit<CalendarEntry, 'id' | 'dayNumber' | 'week' | 'title' | 'theme' | 'gatillo' | 'format' | 'platforms' | 'caption' | 'hashtags'>> = {}
): CalendarEntry {
 return {
 id, dayNumber, week, title, theme, gatillo,
 gatilloIcon: GATILLOS[gatillo].icon,
 format, platforms, caption, hashtags,
  postingTimes: TIMES,
  ...opts,
  }
}

// ─── DATA: 84 ENTRIES ─────────────────────────────

const ALL_ENTRIES: CalendarEntry[] = [

 // ════════════ SEMANA 1: GANCHO + INDEPENDENCIA ════════════

 entry('s01-lun', 1, 1, 'Estás perdiendo dinero', 'Educación', 'loss_aversion', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🔴 Estás perdiendo dinero cada día que tu auto está en la calle sin venderlo.\n\nCada semana que pasa, tu auto vale $2,000 menos.\n\n¿Cuánto llevas esperando?\n\n📲 Descarga CarMatch — link en bio',
 ['#PerdiendoDinero', '#VendeTuAuto', '#CdJuarez', '#AutoUsado', '#CarMatch'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Scene 1 (3s): Close-up of a clock spinning fast on a wall, urgency feeling, dark room. Scene 2 (3s): Bills of Mexican pesos flying away from a dusty parked car in an empty lot. Scene 3 (3s): Same dusty car sitting idle with time passing effect, dark mood. Scene 4 (3s): Person picking up phone, CarMatch app opens on screen, expression changes to hope. Cinematic dark blue-orange color grading, 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s01-mar', 2, 1, 'Opinión impopular: Marketplace no sirve', 'Debate', 'curiosity', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟡 Opinión impopular: Marketplace no sirve para vender tu auto.\n\n50 mensajes y NINGUNO serio.\n\nEn CarMatch solo llegan compradores reales.\n\n¿Estás de acuerdo? Comenta 👇',
 ['#OpiniónImpopular', '#Marketplace', '#VendeTuAuto', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Person talking directly to camera with frustrated expression, casual room background. Quick cut to phone screen showing dozens of unread messages. Transition to CarMatch app notification showing serious buyer. TikTok native style, casual, authentic. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s01-mie', 3, 1, '¿Sabías que.? 70% se venden barato', 'Datos', 'curiosity', 'carrusel',
 ['instagram', 'facebook'],
 '🟡 3 datos que TODO vendedor debe saber:\n\n1️⃣ El 70% de autos se venden por debajo de su valor\n2️⃣ Pierde 15% solo al sacarlo de agencia\n3️⃣ El mejor mes para vender es octubre\n\nDesliza para más →\n\n📲 CarMatch — tu auto al precio correcto',
 ['#SabiasQue', '#DatoCurioso', '#ValorAuto', '#CarMatch', '#CdJuarez', '#Finanzas'],
 { carouselSlides: [
 { slideNumber: 1, prompt: 'Dark infographic style, background #0f172a. Large bold red text "70%" in center with downward arrow. Below in white: "SE VENDEN POR DEBAJO DE SU VALOR". Small car silhouette icon. Clean, modern, professional design.', textOverlay: '70% se venden por debajo de su valor' },
 { slideNumber: 2, prompt: 'Bar chart infographic showing car value declining from left to right. First bar high labeled "Agencia", last bar low labeled "3 meses después". Red gradient. Dark background #0f172a.', textOverlay: 'Pierde 15% al sacarlo de agencia' },
 { slideNumber: 3, prompt: 'Calendar infographic, October and November highlighted in orange/gold. Car icon with dollar sign. Dark background #0f172a. Clean modern design.', textOverlay: 'Octubre-noviembre: mejor mes para vender' },
 ]}),

 entry('s01-jue', 4, 1, 'María vendió en 3 días', 'Social Proof', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 "Vendí mi auto en 3 días con CarMatch"\n\nMaría de Cd. Juárez.\n\n¿Tú cuánto llevas?\n\n📲 Descarga gratis — link en bio',
 ['#TestimonioReal', '#VendidoEn3Dias', '#CarMatch', '#CdJuarez', '#ExitoReal'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Screenshot-style testimonial card: "María, Cd. Juárez — Vendí en 3 días" with green checkmark. Background soft green gradient. Transition to calendar animation: Monday "PUBLICADO" → Wednesday "VENDIDO" with stamp effect. UGC authentic style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s01-vie', 5, 1, '500+ autos publicados en Juárez', 'Urgencia', 'fomo', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟠 Ya hay 500+ autos publicados en CarMatch Juárez.\n\nLos primeros se venden más rápido.\n\n¿Ya publicaste el tuyo?',
 ['#FOMO', '#YaEstanAqui', '#CarMatch', '#CdJuarez', '#500Autos'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Counter rapidly ascending from 0 to 500+ with car icons popping up on a map of Cd. Juárez. Orange and red color scheme. Final text "¿EL TUYO?" in bold. Urgency feeling, fast cuts. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s01-sab', 6, 1, 'Tu familia depende de ti', 'Seguridad', 'security', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🛡️ Cada vez que manejas un auto sin mantenimiento.\n\nPones en riesgo a tu familia.\n\nCarMatch tiene servicios verificados.',
 ['#SeguridadFamiliar', '#MantenimientoAuto', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Sora 2 Pro', creenPrompt: 'Family in a car, warm lighting. Cut to icons of car maintenance: oil, brakes, tires, lights. Final shot: checklist with green checkmarks appearing one by one. Emotional, warm tone. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s01-dom', 7, 1, 'Gracias Cd. Juárez 🇲🇽', 'Independencia', 'identity', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🇲🇽 Cd. Juárez, gracias por confiar en CarMatch.\n\nHECHOS EN JUÁREZ, para JUÁREZ.\n\nFeliz Día de la Independencia.',
 ['#GraciasJuarez', '#16DeSeptiembre', '#CarMatch', '#OrgulloJuarense', '#VivaMéxico'],
 { creenModel: 'Sora 2 Pro', creenPrompt: 'Mexican flag waving majestically over Cd. Juárez skyline at golden hour. Confetti in Mexican flag colors (green, white, red) falling. Warm, patriotic, emotional. Transition to CarMatch logo with text "HECHOS EN JUÁREZ". Professional quality. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 // ════════════ SEMANA 2: SEGURIDAD ════════════

 entry('s02-lun', 8, 2, 'Estafas de autos: cómo protegerte', 'Protección', 'security', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🛡️ Cada mes hay 200+ estafas de autos en Juárez.\n\nNo seas víctima.\n\nCarMatch verifica compradores y vendedores.',
 ['#EstafaAuto', '#Protegete', '#CarMatch', '#CdJuarez', '#CompraSegura'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Red alert screen "ESTAFA" flashing. Examples of common scams: fake check, altered documents. Transition to CarMatch verification badge animation — shield with checkmark. Reassuring tone shift. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s02-mar', 9, 2, 'Tu auto vale más de lo que crees', 'Valuación', 'curiosity', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟡 Tu auto puede valer $30,000 más de lo que crees.\n\nLa mayoría subestima.\n\nCarMatch te da la valuación correcta.',
 ['#ValuaTuAuto', '#MasDeLoQueCrees', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Person looking at phone with surprised expression. Phone screen shows "$150,000" crossed out and "$180,000" appearing in green. Positive, surprising moment. Transition to CarMatch app valuation screen. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s02-mie', 10, 2, '4 señales de mantenimiento YA', 'Cuidado', 'security', 'carrusel',
 ['instagram', 'facebook'],
 '🛡️ 4 señales de que necesitas mantenimiento YA:\n\n1️⃣ Ruido al frenar\n2️⃣ Aceite oscuro\n3️⃣ Luces del dashboard\n4️⃣ Vibración al manejar\n\nNo esperes a que sea tarde.',
 ['#MantenimientoAuto', '#SeñalesDeAlerta', '#CarMatch', '#CdJuarez'],
 { carouselSlides: [
 { slideNumber: 1, prompt: 'Warning icon with brake disc. Red alert style. Dark background. Clean infographic.', textOverlay: 'Ruido extraño al frenar' },
 { slideNumber: 2, prompt: 'Oil dipstick showing dark dirty oil vs clean golden oil comparison. Red circle on dirty side. Dark background.', textOverlay: 'Aceite oscuro en el dipstick' },
 { slideNumber: 3, prompt: 'Car dashboard with warning lights illuminated. Red and orange alert icons. Dark background.', textOverlay: 'Luces del dashboard encendidas' },
 { slideNumber: 4, prompt: 'Steering wheel with vibration motion lines. Warning symbol. Dark background.', textOverlay: 'Vibración al manejar' },
 ]}),

 entry('s02-jue', 11, 2, 'Cada usuario verificado', 'Verificación', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 En CarMatch, cada usuario pasa verificación.\n\nFoto, teléfono, email. Todo confirmado.\n\n¿Sabes con quién tratas?',
 ['#UsuariosReales', '#Verificado', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Verification process animation: phone icon → photo icon → email icon → green checkmark badge appearing. People silhouettes getting verified one by one. Clean, trustworthy design. Green and white colors. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s02-vie', 12, 2, 'Los más buscados de la semana', 'Tendencia', 'fomo', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟠 Autos más buscados de Juárez esta semana:\n\n1. Nissan Sentra\n2. VW Jetta\n3. Chevrolet Aveo\n\n¿El tuyo está en la lista?',
 ['#Tendencia', '#AutosBuscados', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Top 3 ranking animation with car silhouettes appearing one by one. Number 3 Nissan Sentra, 2 VW Jetta, 1 Chevrolet Aveo with crown. Orange accent color on dark background. Counter effect. "ESTA SEMANA EN JUÁREZ" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s02-sab', 13, 2, 'Juan vendió su truck en 2 horas', 'Testimonio', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 Juan tenía una truck que nadie compraba.\n\nLa publicó en CarMatch.\n\n3 llamadas en 2 horas.',
 ['#HistoriaReal', '#Vendido', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Lone truck sitting in dusty lot, sad mood. Cut to phone notification popping up. Person answering phone with smile. UGC authentic style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s02-dom', 14, 2, 'Domingo de revisión', 'Cuidado', 'security', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🛡️ Domingo = revisar tu auto.\n\n5 minutos que te ahorran $50,000.\n\n✅ Aceite ✅ Llantas ✅ Frenos ✅ Luces',
 ['#DomingoDeRevisión', '#Mantenimiento', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Person checking car on Sunday morning, warm light. Close-up of oil dipstick, tire pressure check, brake inspection, lights working. Checklist animation with green checkmarks appearing one by one. Calm, reassuring tone. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 // ════════════ SEMANA 3: DATOS DEL MERCADO ════════════

 entry('s03-lun', 15, 3, 'Auto más vendido de Juárez', 'Datos', 'curiosity', 'carrusel',
 ['instagram', 'facebook'],
 '🟡 Top 5 más vendidos Cd. Juárez:\n\n5. Honda Civic\n4. Toyota Corolla\n3. Chevrolet Aveo\n2. VW Jetta\n1. Nissan Sentra\n\n¿El tuyo está?',
 ['#DatoDelMercado', '#Top5', '#CarMatch', '#CdJuarez'],
 { carouselSlides: [
 { slideNumber: 1, prompt: 'Number 5 with Honda Civic silhouette. Blue accent on dark background. Clean ranking style.', textOverlay: '5. Honda Civic' },
 { slideNumber: 2, prompt: 'Number 4 with Toyota Corolla silhouette. Blue accent on dark background.', textOverlay: '4. Toyota Corolla' },
 { slideNumber: 3, prompt: 'Number 3 with Chevrolet Aveo silhouette. Orange accent on dark background.', textOverlay: '3. Chevrolet Aveo' },
 { slideNumber: 4, prompt: 'Number 2 with VW Jetta silhouette. Orange accent on dark background.', textOverlay: '2. VW Jetta' },
 { slideNumber: 5, prompt: 'Number 1 with Nissan Sentra silhouette, golden crown above. Gold accent on dark background. "EL MÁS VENDIDO" text.', textOverlay: '1. Nissan Sentra — EL MÁS VENDIDO' },
 ]}),

 entry('s03-mar', 16, 3, 'Precio promedio: $145,000', 'Valuación', 'curiosity', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟡 Promedio de auto usado en Juárez: $145,000.\n\n¿El tuyo vale más o menos?\n\nDescúbrelo gratis.',
 ['#ValorPromedio', '#DatosJuárez', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Large number "$145,000" animating onto screen with counting effect. Background graph showing price distribution. Car silhouette with question mark. Text "¿EL TUYO?" appearing. Data-driven visual style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s03-mie', 17, 3, 'Mejor mes para vender: octubre', 'Estrategia', 'authority', 'carrusel',
 ['instagram', 'facebook'],
 '🟣 Mejor mes para vender: octubre-noviembre.\n\n1️⃣ Alta demanda pre-Buen Fin\n2️⃣ Bonos de fin de año\n3️⃣ Más compradores activos\n\nPlanifica tu venta.',
 ['#MejorMes', '#EstrategiaVenta', '#CarMatch', '#CdJuarez'],
 { carouselSlides: [
 { slideNumber: 1, prompt: 'Calendar with October highlighted in bright orange. Car icon with dollar sign. Dark background.', textOverlay: 'Octubre: el mejor mes para vender' },
 { slideNumber: 2, prompt: 'Upward arrow with "DEMANDA ALTA" text. Shopping cart icons. Orange accent. Dark background.', textOverlay: 'Alta demanda pre-Buen Fin' },
 { slideNumber: 3, prompt: 'Money bag icon with "BONOS" text. Dollar signs. Gold accent on dark background.', textOverlay: 'Bonos de fin de año = mejor precio' },
 ]}),

 entry('s03-jue', 18, 3, '500 autos vendidos en CarMatch', 'Milestone', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 500 autos vendidos en CarMatch Juárez.\n\nGracias a ustedes.',
 ['#500Vendidos', '#Milestone', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Counter animation going from 0 to 500 with car icons appearing. Confetti celebration effect. "GRACIAS Cd. Juárez" fade in. Celebratory mood. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s03-vie', 19, 3, 'Se agotó — solo quedan 12', 'Escasez', 'fomo', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟠 Este modelo se agota en Juárez.\n\nSolo quedan 12 unidades.\n\n¿Vas a esperar?',
 ['#SeAgota', '#Escasez', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Counter descending: 12, 11, 10. cars disappearing from inventory grid. Red urgency colors. Text "ÚLTIMAS UNIDADES" pulsing. Fast-paced, urgent editing. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s03-sab', 20, 3, 'María vendió en 1 día', 'Testimonio', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 María publicó a las 10am.\n\nA las 6pm: comprador.\n\n1 día.',
 ['#VendidoEn1Día', '#HistoriaReal', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Clock animation: 10:00 AM "PUBLICADO" → 6:00 PM "VENDIDO" stamp. Calendar flip effect. María smiling with phone. Green success colors. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s03-dom', 21, 3, 'Domingo: revisa tus documentos', 'Organización', 'security', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🛡️ ¿Tus documentos al día?\n\n✅ Tenencia ✅ Verificación ✅ Seguro\n\nRevisa el domingo.',
 ['#DomingoDeDocumentos', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Person checking car documents at desk on Sunday. Tenencia, Verificación, Seguro papers with green checkmarks appearing. Calm Sunday morning light. Reassuring, organized feeling. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 // ════════════ SEMANA 4: PRUEBA SOCIAL ════════════

 entry('s04-lun', 22, 4, '3 razones por las que te compran', 'Psicología', 'authority', 'carrusel',
 ['instagram', 'facebook'],
 '🟣 3 razones por las que compran tu auto:\n\n1️⃣ Fotos profesionales\n2️⃣ Precio justo\n3️⃣ Vendedor verificado\n\nCarMatch te da las 3.',
 ['#RazonesParaComprar', '#TipDeVenta', '#CarMatch', '#CdJuarez'],
 { carouselSlides: [
 { slideNumber: 1, prompt: 'Camera icon with sparkles. Purple accent. Dark background.', textOverlay: '1. Fotos que captan atención' },
 { slideNumber: 2, prompt: 'Price tag icon with checkmark. Green accent. Dark background.', textOverlay: '2. Precio que genera confianza' },
 { slideNumber: 3, prompt: 'Shield with checkmark icon. Blue accent. Dark background.', textOverlay: '3. Confianza que cierra la venta' },
 ]}),

 entry('s04-mar', 23, 4, 'Carlos busca sedan — $120K-$150K', 'Demanda Real', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 Carlos busca sedan en Juárez.\n\nPresupuesto: $120,000-$150,000.\n\n¿Le vendes el tuyo?',
 ['#CompradorReal', '#BuscaAuto', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Buyer profile card: "Carlos, Cd. Juárez — Busca sedan — $120K-$150K". Car matching animation connecting buyer to vehicle. Green match indicator. Clean, modern UI style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s04-mie', 24, 4, 'Ana busca SUV — $150K-$200K', 'Demanda Real', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 Ana busca SUV para su familia.\n\n$150,000-$200,000.\n\n¿Tu auto le sirve?',
 ['#CompradoraReal', '#BuscaSUV', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Buyer profile: "Ana — Busca SUV para familia — $150K-$200K". Family silhouette next to SUV icon. Matching animation. Warm family colors. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s04-jue', 25, 4, '1,000 usuarios en CarMatch', 'Milestone', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 1,000 usuarios en CarMatch Juárez.\n\n1,000 personas confiando.\n\nGracias.',
 ['#1000Usuarios', '#Crecimiento', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Counter going to 1,000 with people icons connecting on a network map of Cd. Juárez. Celebration confetti. "GRACIAS" in large text. Green and blue colors. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s04-vie', 26, 4, 'Último día de este precio', 'Urgencia', 'fomo', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟠 Último día de este precio.\n\nMañana sube.\n\nNo digas que no te avisamos.',
 ['#ÚltimoDía', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Ticking clock countdown. Price tag with "$" being crossed out and higher price appearing. Urgency, fast cuts. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s04-sab', 27, 4, '50 autos vendidos esta semana', 'Momentum', 'social_proof', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🟢 50 autos vendidos solo esta semana.\n\nEl mercado está activo.\n\n¿Ya publicaste el tuyo?',
 ['#50Vendidos', '#Momentum', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Counter rapidly going to 50 with car icons popping up. Confetti celebration. "50 VENDIDOS" text pulsing. Green success energy. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),

 entry('s04-dom', 28, 4, 'Gracias por un mes increíble', 'Agradecimiento', 'identity', 'video',
 ['tiktok', 'instagram', 'facebook'],
 '🔵 Un mes de CarMatch en Juárez.\n\nGracias. Esto apenas empieza.',
 ['#UnMes', '#Gracias', '#CarMatch', '#CdJuarez'],
 { creenModel: 'Seedance 2.0', creenPrompt: 'Month 1 celebration animation. Calendar flipping through 30 days. Confetti effect. "1 MES" text with heart. People icons connecting on map. Blue gradient background. Warm, grateful tone. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).' }),
]

// ═══ WEEKS 5-12 GENERATED ═══

function genWeek5(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cp?:string;cm?:string;gp?:string}> = [
 {id:'s05-lun',dn:29,t:'¿Qué tipo de comprador eres?',th:'Identidad',g:'identity',f:'video',cap:'🔵 ¿Sedan, SUV o pick-up?\n\nDescubre cuál es tu estilo.\n\n📲 Link en bio',tags:['#CompradorActivo','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Split screen showing three car types: sedan (practical, blue), SUV (family, warm), pick-up (work, rugged). Each side lights up as mentioned. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s05-mar',dn:30,t:'Los 5 autos más confiables',th:'Autoridad',g:'authority',f:'carrusel',cap:'🟣 Los 5 autos más confiables:\n1. Toyota Corolla\n2. Honda Civic\n3. Mazda 3\n4. Hyundai Elantra\n5. Nissan Sentra\n\n¿El tuyo está?',tags:['#AutosConfiables','#Top5','#CarMatch','#CdJuarez']},
 {id:'s05-mie',dn:31,t:'Prueba: ¿vale tu auto?',th:'Curiosidad',g:'curiosity',f:'video',cap:'🟡 ¿Vale la pena tu auto?\n\nDescúbrelo gratis en CarMatch.',tags:['#ValuaTuAuto','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Person typing car info into phone. Valuation result appears: price in green with upward arrow. Surprised happy expression. "¿VALE MÁS DE LO QUE CREES?" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s05-jue',dn:32,t:'80% miran, 20% compran',th:'Prueba Social',g:'social_proof',f:'video',cap:'🟢 El 80% solo mira.\n\nEl 20% compra.\n\nCarMatch tiene compradores reales.',tags:['#CompradoresReales','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Pie chart: 80% gray "SOLO MIRAN", 20% green "COMPRAN DE VERDAD". Transition to CarMatch buyer notification. Data visualization style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s05-vie',dn:33,t:'Se fue tu modelo',th:'Urgencia',g:'fomo',f:'video',cap:'🟠 Se vendió el último de tu modelo.\n\n¿Ya publicaste el tuyo?',tags:['#SeFue','#FOMO','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Car silhouette fading away with "VENDIDO" stamp in red. Counter going to 0. "SE FUE TU MODELO" text. Urgency, red colors. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s05-sab',dn:34,t:'Tu auto soñado está aquí',th:'Identidad',g:'identity',f:'video',cap:'🔵 Tu auto soñado está en CarMatch.\n\nBúscalo ahora.',tags:['#AutoSoñado','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Dreamy sequence: person imagining their ideal car. Car appears with sparkle effect. Hopeful, aspirational mood. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s05-dom',dn:35,t:'Domingo de desear un auto',th:'Identidad',g:'identity',f:'video',cap:'🔵 Domingo: ¿de qué auto sueñas?\n\nMira los que hay en CarMatch.',tags:['#DomingoDeSoñar','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Person relaxing on Sunday, scrolling through car listings on phone. Dreamy filter. Car silhouettes floating. Warm lighting. Aspirational mood. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,5,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp,
 ...(x.f==='carrusel'?{carouselSlides:[ // add default slides for carruseles
 {slideNumber:1,prompt:'Slide 1 infographic, dark background.',textOverlay:x.tags[0]},
 {slideNumber:2,prompt:'Slide 2 infographic, dark background.',textOverlay:'Dato 2'},
 {slideNumber:3,prompt:'Slide 3 infographic, dark background.',textOverlay:'Dato 3'},
 ]}:{})
 }))
}

function genWeek6(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string}> = [
 {id:'s06-lun',dn:36,t:'Tu auto vale más de lo que crees',th:'Valuación',g:'curiosity',f:'video',cap:'🟡 Tu auto vale $20,000 más.\n\nDescúbrelo.',tags:['#ValuaTuAuto','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Person shocked looking at phone. Price comparison: low crossed out, higher value revealed. "VALE MÁS DE LO QUE CREES" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s06-mar',dn:37,t:'3 tips para fotos que venden',th:'Tips',g:'authority',f:'carrusel',cap:'🟣 Tips fotos:\n1. Luz natural\n2. Ángulo frontal\n3. Interior limpio\n\nCarMatch te guía.',tags:['#TipsFotos','#VendeTuAuto','#CarMatch','#CdJuarez']},
 {id:'s06-mie',dn:38,t:'¿A cuánto poner tu auto?',th:'Valuación',g:'curiosity',f:'video',cap:'🟡 ¿A cuánto poner tu auto?\n\nCarMatch te dice.',tags:['#A_cuánto','#Valuación','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Person confused with price tag. CarMatch valuation tool calculates. Green checkmark with correct price. "EL PRECIO JUSTO" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s06-jue',dn:39,t:'Pedro vendió pickup en 5 días',th:'Testimonio',g:'social_proof',f:'video',cap:'🟢 Pedro vendió su pickup en 5 días.\n\nCarMatch funciona.',tags:['#TestimonioReal','#Vendido','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Testimonial card: "Pedro, Cd. Juárez — Pickup vendida en 5 días". Timeline animation. Green success theme. UGC style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s06-vie',dn:40,t:'Sin publicar = perdiendo dinero',th:'Pérdida',g:'loss_aversion',f:'video',cap:'🔴 Cada día sin publicar = dinero perdido.\n\nPublica gratis.',tags:['#PérdidaDeDinero','#VendeTuAuto','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Money counter decreasing while car sits idle. Calendar days flying by. "CADA DÍA PIERDES $700" text in red. Urgency feeling. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s06-sab',dn:41,t:'Vende sin comisiones',th:'Identidad',g:'identity',f:'video',cap:'🔵 Cero comisiones.\n\nCero intermediarios.\n\nVende directo.',tags:['#SinComisiones','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Commission percentage "0%" crossed out with money staying in hand. Dollar bills floating. "CERO COMISIONES" text in green. Empowering feeling. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s06-dom',dn:42,t:'Domingo: prepárate para vender',th:'Preparación',g:'security',f:'video',cap:'🛡️ Domingo: prepara tu auto para vender.\n\nLimpieza + fotos + precio.',tags:['#DomingoDePreparación','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Car being washed and polished on Sunday morning. Checklist floating: Limpieza ✓, Fotos ✓, Precio ✓. Warm light. Satisfying transformation. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,6,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp }))
}

function genWeek7(): CalendarEntry[] {
 // Week 7: Día de Muertos + Funciones
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string;fest?:boolean;fDate?:string;pre?:number}> = [
 {id:'s07-lun',dn:43,t:'MapStore: Negocios verificados',th:'Funciones',g:'authority',f:'video',cap:'🟣 MapStore: talleres y negocios verificados cerca de ti.',tags:['#MapStore','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Map interface showing verified business pins popping up around Cd. Juárez. Green checkmarks on each. "NEGOCIOS VERIFICADOS" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s07-mar',dn:44,t:'GPS: servicios cerca de ti',th:'Funciones',g:'curiosity',f:'video',cap:'🟡 GPS: servicios de auto cerca de ti.',tags:['#GPS','#ServiciosCerca','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'GPS navigation screen showing nearby car services with distance indicators. "SERVICIOS CERCA DE TI" text. Blue tech style. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s07-mie',dn:45,t:'Recuerda: tu familia depende de ti',th:'Día de Muertos',g:'security',f:'carrusel',cap:'💀 Día de Muertos: recuerda a los que ya no están.\n\nCuida tu auto para cuidar a los tuyos.\n\nCarMatch te protege.',tags:['#DíaDeMuertos','#Recuerda','#CarMatch','#CdJuarez'],fest:true,fDate:'2026-11-01',pre:3},
 {id:'s07-jue',dn:46,t:'Notificaciones de precio',th:'Funciones',g:'fomo',f:'video',cap:'🟠 Te avisamos cuando baja el precio.\n\nNo te pierdas nada.',tags:['#AlertasDePrecio','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Bell notification icon with price tag dropping. "ALERTA DE PRECIO" text pulsing. Orange accent. Phone buzzing with alert. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s07-vie',dn:47,t:'Guarda favoritos y compáralos',th:'Funciones',g:'identity',f:'video',cap:'🔵 Guarda favoritos y compáralos.\n\nTu auto ideal a un tap.',tags:['#Favoritos','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Heart icon with multiple car silhouettes. Comparison view animation. "GUARDA TUS FAVORITOS" text. Blue accent. Swipe animation between cars. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s07-sab',dn:48,t:'Chat directo con vendedor',th:'Funciones',g:'social_proof',f:'video',cap:'🟢 Chatea directo con el vendedor.\n\nSin intermediarios.',tags:['#ChatDirecto','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Chat bubble interface between buyer and seller. Messages appearing in real time. Green checkmarks. "DIRECTO, SIN INTERMEDIARIOS" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s07-dom',dn:49,t:'Día de Muertos: paz y descanso',th:'Día de Muertos',g:'identity',f:'video',cap:'💀 Día de Muertos: paz y descanso.\n\nRecuerda a los tuyos.',tags:['#DíaDeMuertos','#Paz','#CarMatch','#CdJuarez'],cm:'Sora 2 Pro',cp:'Ofrenda with candles and marigolds. Peaceful, respectful mood. Calaveras and sugar skulls. Warm orange lighting. Emotional, cultural. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-11-02'},
 ]
 return d.map(x => entry(x.id,x.dn,7,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp,
 isFestive:x.fest, festiveDate:x.fDate, prePublishDays:x.pre }))
}

function genWeek8(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string}> = [
 {id:'s08-lun',dn:50,t:'De Juárez, para Juárez',th:'Orgullo',g:'identity',f:'video',cap:'🔵 CarMatch es de Juárez.\n\nPara Juárez.',tags:['#JuárezPride','#HechoEnJuarez','#CarMatch'],cm:'Seedance 2.0',cp:'Cd. Juárez skyline montage: puente, centro, monumentos. Emotional music mood. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s08-mar',dn:51,t:'Frontera más activa de México',th:'Orgullo',g:'authority',f:'video',cap:'🟣 Juárez: la frontera más activa.\n\nTu auto se vende aquí.',tags:['#FronteraDigital','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Cd. Juárez border bridge at sunset. Cars crossing. Patriotic purple accent. City skyline montage. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s08-mie',dn:52,t:'Antes y después de CarMatch',th:'Transformación',g:'social_proof',f:'video',cap:'🟢 Antes: 2 meses vendiendo.\n\nDespués: 3 días.',tags:['#AntesYDespués','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Split screen before/after: Left "2 MESES" with sad face and dusty car. Right "3 DÍAS" with happy face and "VENDIDO" stamp. Transformation effect. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s08-jue',dn:53,t:'Orgullo juarense: los mejores autos',th:'Orgullo',g:'identity',f:'video',cap:'🔵 Juárez tiene los mejores autos.\n\nOrgullo juarense.',tags:['#OrgulloJuarense','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Cars lined up with Cd. Juárez flag waving. Patriotic blue tones. City landmarks. Proud, emotional. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s08-vie',dn:54,t:'Tu vecino ya publicó',th:'FOMO',g:'fomo',f:'video',cap:'🟠 Tu vecino ya publicó su auto.\n\n¿Y tú?',tags:['#FOMO','#YaPublicó','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Neighbor waving from next house with car keys. Phone notification: "Tu vecino publicó en CarMatch". "¿Y EL TUYO?" text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s08-sab',dn:55,t:'Sábado de paseo virtual',th:'Diversión',g:'identity',f:'video',cap:'🔵 Sábado de paseo: mira autos en CarMatch.',tags:['#SábadoDePaseo','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Person relaxing on couch browsing car listings on phone. Cozy Saturday vibes. Warm lighting. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s08-dom',dn:56,t:'Gracias Juárez — 2 meses',th:'Agradecimiento',g:'identity',f:'video',cap:'🔵 2 meses en Juárez.\n\nGracias.',tags:['#2Meses','#Gracias','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Calendar animation: month 1, month 2. Heart icon growing. People icons connecting. Blue background. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,8,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp }))
}

function genWeek9(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string;fest?:boolean;fDate?:string;pre?:number}> = [
 {id:'s09-lun',dn:57,t:'Día de la Revolución: México avanza',th:'Revolución',g:'identity',f:'video',cap:'🇲🇽 Día de la Revolución.\n\nMéxico avanza. Tú también.',tags:['#Revolución','#16DeNoviembre','#CarMatch','#CdJuarez'],cm:'Sora 2 Pro',cp:'Historical revolution imagery transitioning to modern Cd. Juárez progress. Mexican flag colors. Patriotic, inspiring. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-11-16',pre:3},
 {id:'s09-mar',dn:58,t:'Buen Fin se acerca',th:'Pre-Buen Fin',g:'fomo',f:'video',cap:'🟠 El Buen Fin se acerca.\n\nPrepárate.',tags:['#BuenFin','#SeAcerca','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Calendar pages flipping to November 27. Countdown timer. "BUEN FIN SE ACERCA" text pulsing in orange. Excitement building. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s09-mie',dn:59,t:'Precios bajos del Buen Fin',th:'Pre-Buen Fin',g:'loss_aversion',f:'video',cap:'🔴 Precios bajos del Buen Fin.\n\nNo esperes.',tags:['#BuenFin','#PreciosBajos','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Price tags dropping down with red urgency arrows. Price numbers decreasing. Exciting deal energy. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s09-jue',dn:60,t:'Checklist pre-Buen Fin',th:'Preparación',g:'authority',f:'carrusel',cap:'🟣 Checklist antes del Buen Fin:\n1️⃣ Define tu presupuesto\n2️⃣ investiga modelos\n3️⃣ Compara precios\n\nDesliza.',tags:['#Checklist','#BuenFin','#CarMatch','#CdJuarez']},
 {id:'s09-vie',dn:61,t:'Ya hay lista de espera',th:'FOMO',g:'fomo',f:'video',cap:'🟠 Lista de espera para el Buen Fin.\n\n¿Ya estás?',tags:['#ListaDeEspera','#BuenFin','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Queue line of people silhouettes forming. Orange urgency text. FOMO energy. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s09-sab',dn:62,t:'Mañana empieza el Buen Fin',th:'FOMO',g:'fomo',f:'video',cap:'🟠 Mañana empieza el Buen Fin.\n\nNo te lo pierdas.',tags:['#BuenFin','#Mañana','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Calendar with tomorrow circled in red. Countdown timer. Clock ticking. Excitement building. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s09-dom',dn:63,t:'Domingo de anticipación',th:'FOMO',g:'fomo',f:'video',cap:'🟠 Domingo de anticipación.\n\nMañana Buying.',tags:['#DomingoDeAnticipación','#BuenFin','#CarMatch'],cm:'Seedance 2.0',cp:'Calm before the storm. Person preparing shopping list on Sunday. Warm anticipation. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,9,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp,
 isFestive:x.fest, festiveDate:x.fDate, prePublishDays:x.pre }))
}

function genWeek10(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string;fest?:boolean;fDate?:string;pre?:number}> = [
 {id:'s10-lun',dn:64,t:'Buen Fin: Ofertas de autos',th:'Buen Fin',g:'loss_aversion',f:'video',cap:'🏷️ Buen Fin: precios que no vuelven.\n\nSolo esta semana.',tags:['#BuenFin','#Ofertas','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Price tags with slashes through high prices. New low prices appearing in green. "BUEN FIN" logo with sparkles. Exciting deal energy. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-11-27',pre:3},
 {id:'s10-mar',dn:65,t:'50% descuento mantenimiento',th:'Buen Fin',g:'loss_aversion',f:'video',cap:'🏷️ 50% descuento en mantenimiento.\n\nSolo Buen Fin.',tags:['#BuenFin','#50Porciento','#Descuento','#CarMatch'],cm:'Seedance 2.0',cp:'Big 50 percent animation with discount text. Car maintenance icons floating. Savings celebration. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s10-mie',dn:66,t:'Se agotó en 1 hora',th:'Buen Fin',g:'fomo',f:'video',cap:'🟠 Se agotó en 1 hora.\n\n¿Vas a esperar?',tags:['#SeAgotó','#BuenFin','#FOMO','#CarMatch'],cm:'Seedance 2.0',cp:'Counter going from available to "AGOTADO" in 1 hour. Fast clock. "¿VAS A ESPERAR?" text in red. FOMO urgency. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s10-jue',dn:67,t:'Último día Buen Fin',th:'Buen Fin',g:'loss_aversion',f:'video',cap:'🏷️ Último día. Mañana se acabó.\n\nNo digas que no te avisamos.',tags:['#ÚltimoDía','#BuenFin','#CarMatch'],cm:'Seedance 2.0',cp:'Countdown to midnight. "ÚLTIMO DÍA" in red. Price tags disappearing. "MAÑANA SE ACABÓ" warning. Urgency. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s10-vie',dn:68,t:'Buen Fin: resumen',th:'Buen Fin',g:'social_proof',f:'video',cap:'🟢 Buen Fin: autos vendidos.\n\nGracias.',tags:['#BuenFin','#Resumen','#Gracias','#CarMatch'],cm:'Seedance 2.0',cp:'Summary infographic animating: cars sold during Buen Fin. Checkmarks appearing. Green confetti. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s10-sab',dn:69,t:'Después del Buen Fin',th:'Post-Buen Fin',g:'curiosity',f:'video',cap:'🟡 Después del Buen Fin: qué sigue.\n\nNavidad se acerca.',tags:['#PostBuenFin','#QuéSigue','#CarMatch'],cm:'Seedance 2.0',cp:'Calendar transitioning from November to December. Winter colors appearing. Snowflakes. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s10-dom',dn:70,t:'Gracias por el Buen Fin',th:'Agradecimiento',g:'identity',f:'video',cap:'🔵 Gracias por el Buen Fin.\n\nGracias Juárez.',tags:['#GraciasBuenFin','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Heart with gratitude text pulsing. CarMatch logo fading in. Warm gratitude tone. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,10,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp,
 isFestive:x.fest, festiveDate:x.fDate, prePublishDays:x.pre }))
}

function genWeek11(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string;fest?:boolean;fDate?:string;pre?:number}> = [
 {id:'s11-lun',dn:71,t:'Navidad: regala seguridad',th:'Navidad',g:'security',f:'video',cap:'🎄 Regala seguridad este Navidad.\n\nUn auto nuevo para tu familia.',tags:['#Navidad','#RegalaSeguridad','#CarMatch'],cm:'Sora 2 Pro',cp:'Family gathered around Christmas tree. Gift box opens to reveal car keys. Warm golden lighting. Emotional, heartfelt. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-12-20',pre:5},
 {id:'s11-mar',dn:72,t:'5 autos ideales para regalar',th:'Navidad',g:'identity',f:'carrusel',cap:'🎄 5 autos ideales para regalar:\n1. Nissan Sentra\n2. VW Jetta\n3. Chevrolet Aveo\n4. Toyota Corolla\n5. Honda Civic\n\nDesliza.',tags:['#Navidad','#AutosParaRegalar','#CarMatch'],fest:true,fDate:'2026-12-21',pre:4},
 {id:'s11-mie',dn:73,t:'Familia + auto seguro',th:'Navidad',g:'security',f:'video',cap:'🎄 Tu familia merece un auto seguro.\n\nNavidad en CarMatch.',tags:['#Familia','#AutoSeguro','#Navidad','#CarMatch'],cm:'Seedance 2.0',cp:'Happy family next to safe car. Christmas lights twinkling. Warm golden lighting. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-12-22',pre:3},
 {id:'s11-jue',dn:74,t:'Ofertas navideñas',th:'Navidad',g:'fomo',f:'video',cap:'🎄 Ofertas navideñas.\n\nSolo esta semana.',tags:['#OfertasNavideñas','#Navidad','#CarMatch'],cm:'Seedance 2.0',cp:'Christmas-wrapped price tags with discounts. Snowflakes falling. "OFERTAS NAVIDEñas" in red and green. Festive urgency. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-12-23',pre:2},
 {id:'s11-vie',dn:75,t:'Feliz Navidad CarMatch',th:'Navidad',g:'identity',f:'video',cap:'🎄 Feliz Navidad de parte de CarMatch.\n\nGracias por confiar.',tags:['#FelizNavidad','#CarMatch'],cm:'Seedance 2.0',cp:'Christmas scene with CarMatch logo. Gold text. Warm festive atmosphere. Snow falling. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-12-25'},
 {id:'s11-sab',dn:76,t:'Post-Navidad: qué sigue',th:'Post-Navidad',g:'curiosity',f:'video',cap:'🟡 Después de Navidad: qué sigue.\n\nAño Nuevo se acerca.',tags:['#PostNavidad','#QuéSigue','#CarMatch'],cm:'Seedance 2.0',cp:'Calendar transitioning to January. New year colors appearing. Anticipation. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s11-dom',dn:77,t:'Domingo de gratitud',th:'Gratitud',g:'identity',f:'video',cap:'🔵 Gracias por este año increíble.\n\nGracias Cd. Juárez.',tags:['#Gratitud','#Gracias','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Heart with gratitude text. Warm grateful tone. Blue background. Year recap montage. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,11,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp,
 isFestive:x.fest, festiveDate:x.fDate, prePublishDays:x.pre }))
}

function genWeek12(): CalendarEntry[] {
 const d: Array<{id:string;dn:number;t:string;th:string;g:GatilloKey;f:Format;cap:string;tags:string[];cm?:string;cp?:string;gp?:string;fest?:boolean;fDate?:string;pre?:number}> = [
 {id:'s12-lun',dn:78,t:'Año Nuevo: auto nuevo',th:'Año Nuevo',g:'identity',f:'video',cap:'🎆 2027: auto nuevo.\n\nEmpieza el año con CarMatch.',tags:['#AñoNuevo','#2027','#CarMatch'],cm:'Seedance 2.0',cp:'Fireworks over Cd. Juárez skyline. Calendar flipping to 2027. New car appearing. Celebratory. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2026-12-30',pre:2},
 {id:'s12-mar',dn:79,t:'Resolución: vender mi auto',th:'Año Nuevo',g:'loss_aversion',f:'video',cap:'🔴 Tu resolución 2027: vender tu auto.\n\nEmpieza hoy.',tags:['#Resolución2027','#VendeTuAuto','#CarMatch'],cm:'Seedance 2.0',cp:'New Year resolution list with selling car highlighted. Checkmark animation. Bold text. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s12-mie',dn:80,t:'Feliz Año Nuevo 2027',th:'Año Nuevo',g:'identity',f:'video',cap:'🎆 Feliz 2027.\n\nGracias por confiar en CarMatch.',tags:['#FelizAñoNuevo','#2027','#CarMatch'],cm:'Seedance 2.0',cp:'2027 in gold with fireworks. Festive celebratory. Confetti falling. New year energy. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).',fest:true,fDate:'2027-01-01'},
 {id:'s12-jue',dn:81,t:'Primer día de 2027',th:'Año Nuevo',g:'curiosity',f:'video',cap:'🟡 Primer día de 2027.\n\n¿Qué auto quieres?',tags:['#PrimerDía2027','#CarMatch'],cm:'Seedance 2.0',cp:'Fresh calendar page January 1 2027. Question mark with car silhouette. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s12-vie',dn:82,t:'Metas 2027: auto nuevo',th:'Año Nuevo',g:'identity',f:'video',cap:'🔵 Metas 2027: auto nuevo.\n\nCarMatch te ayuda.',tags:['#Metas2027','#CarMatch'],cm:'Seedance 2.0',cp:'Goal target icon with car. Motivational blue energy. Target achieved animation. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s12-sab',dn:83,t:'Nuevos autos 2027',th:'Año Nuevo',g:'fomo',f:'video',cap:'🟠 Nuevos autos para 2027.\n\nCarMatch los tiene.',tags:['#NuevosAutos2027','#CarMatch'],cm:'Seedance 2.0',cp:'Fresh inventory of cars for 2027. Orange excitement text. New year new cars. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 {id:'s12-dom',dn:84,t:'Gracias 2026 — Hola 2027',th:'Despedida',g:'identity',f:'video',cap:'🔵 Gracias 2026.\n\nHola 2027.\n\nGracias Juárez.',tags:['#Gracias2026','#Hola2027','#CarMatch','#CdJuarez'],cm:'Seedance 2.0',cp:'Two calendars: 2026 fading out 2027 bright. Warm transition. Gratitude and hope. 9:16 vertical. Silent video, no audio, no text. Characters talking with lip sync. Post-production in CapCut: add Mexican Spanish voice (TTS), ambient sound, and auto captions (subtitles).'},
 ]
 return d.map(x => entry(x.id,x.dn,12,x.t,x.th,x.g,x.f,
 x.f==='imagen'?['facebook']:['tiktok','instagram','facebook'],
 x.cap,x.tags,{ creenModel:x.cm, creenPrompt:x.cp, geminiPrompt:x.gp,
 isFestive:x.fest, festiveDate:x.fDate, prePublishDays:x.pre }))
}

const ALL_ENTRIES_COMPLETE: CalendarEntry[] = [
 ...ALL_ENTRIES,
 ...genWeek5(), ...genWeek6(), ...genWeek7(), ...genWeek8(),
 ...genWeek9(), ...genWeek10(), ...genWeek11(), ...genWeek12(),
]

// ═══ COMPONENT ═══

export default function CalendarTab() {
 const [currentDay, setCurrentDay] = useState(0)
 const [showAdConfig, setShowAdConfig] = useState<CalendarEntry | null>(null)
 const [filterGatillo, setFilterGatillo] = useState('all')
 const [filterFormat, setFilterFormat] = useState('all')
 const [copiedId, setCopiedId] = useState<string | null>(null)

 const [publishedIds, setPublishedIds] = useState<string[]>(() => {
 if (typeof window !== 'undefined') return JSON.parse(localStorage.getItem('carmatch-published') || '[]')
 return []
 })
 const [skippedIds, setSkippedIds] = useState<string[]>(() => {
 if (typeof window !== 'undefined') return JSON.parse(localStorage.getItem('carmatch-skipped') || '[]')
 return []
 })

 useEffect(() => { localStorage.setItem('carmatch-published', JSON.stringify(publishedIds)) }, [publishedIds])
 useEffect(() => { localStorage.setItem('carmatch-skipped', JSON.stringify(skippedIds)) }, [skippedIds])

 const filteredEntries = useMemo(() => {
 let entries = ALL_ENTRIES_COMPLETE
 if (filterGatillo !== 'all') entries = entries.filter(e => e.gatillo === filterGatillo)
 if (filterFormat !== 'all') entries = entries.filter(e => e.format === filterFormat)
 return entries
 }, [filterGatillo, filterFormat])

 const todayEntry = filteredEntries[currentDay] || null
 const todayId = todayEntry?.id

 const stats = useMemo(() => {
 const total = filteredEntries.length
 const published = filteredEntries.filter(e => publishedIds.includes(e.id)).length
 const skipped = filteredEntries.filter(e => skippedIds.includes(e.id)).length
 const pending = total - published - skipped
 return { total, published, skipped, pending }
 }, [filteredEntries, publishedIds, skippedIds])

 const markPublished = (id: string) => { setPublishedIds(p => p.includes(id)?p:[...p,id]); setSkippedIds(p=>p.filter(x=>x!==id)) }
 const markSkipped = (id: string) => { setSkippedIds(p => p.includes(id)?p:[...p,id]); setPublishedIds(p=>p.filter(x=>x!==id)) }
 const restoreEntry = (id: string) => { setPublishedIds(p=>p.filter(x=>x!==id)); setSkippedIds(p=>p.filter(x=>x!==id)) }

 const copyText = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(()=>setCopiedId(null),2000) }

 const theme = todayEntry ? WEEK_THEMES[todayEntry.week] || WEEK_THEMES[1] : WEEK_THEMES[1]
 const isPublished = todayId ? publishedIds.includes(todayId) : false
 const isSkipped = todayId ? skippedIds.includes(todayId) : false
 const progress = stats.total > 0 ? ((stats.published + stats.skipped) / stats.total * 100) : 0

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 {/* Header + Progress */}
 <div className="space-y-3">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div className="flex items-center gap-3">
 <Calendar className="w-8 h-8 text-primary-500" />
 <h3 className="text-3xl font-black italic tracking-tighter uppercase">Calendario</h3>
 </div>
 <div className="flex items-center gap-4 text-sm text-white/50">
 <span>📋 {stats.pending} pendientes</span>
 <span>✅ {stats.published} publicados</span>
 {stats.skipped > 0 && <span>⏭️ {stats.skipped} saltados</span>}
 </div>
 </div>
 {/* Progress bar */}
 <div className="w-full bg-white/10 rounded-full h-2">
 <div className="bg-gradient-to-r from-primary-500 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
 </div>
 <p className="text-xs text-white/40">Día {currentDay + 1} de {stats.total} — {Math.round(progress)}% completado</p>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-3">
 <select value={filterGatillo} onChange={e=>{setFilterGatillo(e.target.value);setCurrentDay(0)}} className="bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500">
 <option value="all">Todos los gatillos</option>
 {Object.entries(GATILLOS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
 </select>
 <select value={filterFormat} onChange={e=>{setFilterFormat(e.target.value);setCurrentDay(0)}} className="bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500">
 <option value="all">Todos los formatos</option>
 <option value="video">🎬 Video</option>
 <option value="carrusel">📊 Carrusel</option>
 <option value="imagen">🖼️ Imagen</option>
 </select>
 </div>

 {/* Day Navigation */}
 <div className="flex items-center justify-center gap-4">
 <button onClick={()=>setCurrentDay(d=>Math.max(0,d-1))} disabled={currentDay===0} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white">
 <ChevronLeft className="w-6 h-6" />
 </button>
 <div className="text-center">
 {todayEntry ? (
 <>
 <div className="flex items-center gap-2 justify-center flex-wrap">
 {isPublished && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">✅ Publicado</span>}
 {isSkipped && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">⏭️ Saltado</span>}
 {todayEntry.isFestive && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">🎄 Festivo</span>}
 </div>
 <h4 className="text-xl font-black text-white mt-1">{todayEntry.title}</h4>
 <div className="flex items-center gap-2 justify-center mt-1">
 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
 todayEntry.format==='video'?'bg-green-500/20 text-green-400':
 todayEntry.format==='carrusel'?'bg-blue-500/20 text-blue-400':
 'bg-orange-500/20 text-orange-400'
 }`}>
 {todayEntry.format==='video'?'🎬 Video':todayEntry.format==='carrusel'?'📊 Carrusel':'🖼️ Imagen'}
 </span>
 <span className={`text-xs ${GATILLOS[todayEntry.gatillo].color}`}>
 {GATILLOS[todayEntry.gatillo].icon} {GATILLOS[todayEntry.gatillo].label}
 </span>
 {todayEntry.isFestive && todayEntry.festiveDate && (
 <span className="text-xs text-red-400">📅 {todayEntry.festiveDate}</span>
 )}
 </div>
 </>
 ) : (
 <p className="text-white/50">No hay publicaciones con estos filtros</p>
 )}
 </div>
 <button onClick={()=>setCurrentDay(d=>Math.min(filteredEntries.length-1,d+1))} disabled={currentDay>=filteredEntries.length-1} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white">
 <ChevronRight className="w-6 h-6" />
 </button>
 </div>

 {/* Day Content */}
 {todayEntry && (
 <div className="bg-surface-dark border border-white/10 rounded-xl p-4 space-y-4">
 {/* Platforms + Times */}
 <div className="flex flex-wrap gap-3 text-sm text-white/60">
 {todayEntry.platforms.includes('tiktok') && <span className="flex items-center gap-1">🎵 TikTok {todayEntry.postingTimes.tiktok}</span>}
 {todayEntry.platforms.includes('instagram') && <span className="flex items-center gap-1">📸 Instagram {todayEntry.postingTimes.instagram}</span>}
 {todayEntry.platforms.includes('facebook') && <span className="flex items-center gap-1">👥 Facebook {todayEntry.postingTimes.facebook}</span>}
 </div>

 {/* Caption */}
 <div className="space-y-2">
 <h5 className="text-xs font-bold text-white/40 uppercase">📝 Caption</h5>
 <div className="bg-black/30 rounded-lg p-3 text-sm text-white/80 whitespace-pre-wrap">{todayEntry.caption}</div>
 <button onClick={()=>copyText(todayEntry.caption, `caption-${todayEntry.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">
 {copiedId===`caption-${todayEntry.id}`?<Check className="w-3.5 h-3.5 text-green-400"/>:<Copy className="w-3.5 h-3.5"/>}
 {copiedId===`caption-${todayEntry.id}`?'¡Copiado!':'Copiar Caption'}
 </button>
 </div>

 {/* Hashtags */}
 <div className="space-y-2">
 <h5 className="text-xs font-bold text-white/40 uppercase">#️⃣ Hashtags</h5>
 <div className="flex flex-wrap gap-1">
 {todayEntry.hashtags.map((tag,i)=><span key={i} className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full text-xs">{tag}</span>)}
 </div>
 <button onClick={()=>copyText(todayEntry.hashtags.join(' '), `tags-${todayEntry.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">
 {copiedId===`tags-${todayEntry.id}`?<Check className="w-3.5 h-3.5 text-green-400"/>:<Copy className="w-3.5 h-3.5"/>}
 {copiedId===`tags-${todayEntry.id}`?'¡Copiado!':'Copiar Hashtags'}
 </button>
 </div>

 {/* Prompt — Video (Creen AI) */}
 {todayEntry.format === 'video' && todayEntry.creenPrompt && (
 <div className="space-y-2">
 <h5 className="text-xs font-bold text-white/40 uppercase">🎬 Prompt — Creen AI {todayEntry.creenModel ? `(${todayEntry.creenModel})` : ''}</h5>
 <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">{todayEntry.creenPrompt}</div>
 <button onClick={()=>copyText(todayEntry.creenPrompt!, `prompt-${todayEntry.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-500/30 transition-colors">
 {copiedId===`prompt-${todayEntry.id}`?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}
 {copiedId===`prompt-${todayEntry.id}`?'Copiado!':'Copiar Prompt'}
 </button>
 </div>
 )}

 {/* Prompt — Imagen (Gemini) */}
 {todayEntry.format === 'imagen' && todayEntry.geminiPrompt && (
 <div className="space-y-2">
 <h5 className="text-xs font-bold text-white/40 uppercase">🖼️ Prompt — Gemini</h5>
 <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">{todayEntry.geminiPrompt}</div>
 <button onClick={()=>copyText(todayEntry.geminiPrompt!, `prompt-${todayEntry.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors">
 {copiedId===`prompt-${todayEntry.id}`?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}
 {copiedId===`prompt-${todayEntry.id}`?'Copiado!':'Copiar Prompt Gemini'}
 </button>
 </div>
 )}

 {/* Prompt — Carrusel (Gemini slides) */}
 {todayEntry.format === 'carrusel' && todayEntry.carouselSlides && (
 <div className="space-y-3">
 <h5 className="text-xs font-bold text-white/40 uppercase">📊 Carrusel — {todayEntry.carouselSlides.length} slides (Gemini)</h5>
 {todayEntry.carouselSlides.map((slide) => (
 <div key={slide.slideNumber} className="bg-black/30 rounded-lg p-3 space-y-2 border border-white/5">
 <p className="text-xs font-bold text-primary-400">SLIDE {slide.slideNumber}</p>
 <p className="text-xs text-yellow-400/80 italic">Texto en imagen: "{slide.textOverlay}"</p>
 <div className="text-sm text-white/70 whitespace-pre-wrap font-mono">{slide.prompt}</div>
 <button onClick={()=>copyText(`Prompt: ${slide.prompt}\nTexto: ${slide.textOverlay}`, `slide-${todayEntry.id}-${slide.slideNumber}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors">
 {copiedId===`slide-${todayEntry.id}-${slide.slideNumber}`?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}
 {copiedId===`slide-${todayEntry.id}-${slide.slideNumber}`?'Copiado!':`Copiar Slide ${slide.slideNumber}`}
 </button>
 </div>
 ))}
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex flex-wrap gap-2 pt-2">
 {!isPublished && !isSkipped && (<>
 <button onClick={()=>markPublished(todayId!)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors"><Check className="w-4 h-4"/> Publicado</button>
 <button onClick={()=>markSkipped(todayId!)} className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold hover:bg-yellow-500/30 transition-colors">⏭️ Saltado</button>
 </>)}
 {(isPublished||isSkipped) && <button onClick={()=>restoreEntry(todayId!)} className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white/60 rounded-lg text-sm font-bold hover:bg-white/20">↩️ Restaurar</button>}
 </div>
 </div>
 )}
 </div>
 )
}
