'use client'

import { useState, useMemo, useEffect } from 'react'
import {
    Calendar, ChevronLeft, ChevronRight, Copy, Check,
    X, Megaphone
} from 'lucide-react'

type Platform = 'tiktok' | 'instagram' | 'facebook'
type ContentFormat = 'video' | 'reel' | 'image' | 'carousel' | 'story'
type GatilloKey = 'loss_aversion' | 'curiosity' | 'identity' | 'social_proof' | 'authority' | 'fomo' | 'security'

interface PlatformPost {
    format: ContentFormat
    caption: string
    hashtags: string[]
    postingTime: string
    capcutPrompt?: string
    geminiPrompt?: string
    carouselSlides?: number
    adCTA?: string
}

interface CalendarEntry {
    id: string
    week: number
    dayIndex: number
    title: string
    theme: string
    gatillo: GatilloKey
    gatilloIcon: string
    gatilloColor: string
    tiktok: PlatformPost
    instagram: PlatformPost
    facebook: PlatformPost
    adConfig: {
        tiktok: { enabled: boolean; budgetMXN: number; objective: string; audience: string; durationDays: number }
        meta: { enabled: boolean; budgetMXN: number; objective: string; audience: string; placement: string; durationDays: number }
    }
    isFestive?: boolean
    festiveDate?: string
    prePublishDays?: number
}

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
    1: { title: 'Gancho Inicial — Perder es peor', gradient: 'from-red-600 to-orange-500', icon: '🎣' },
    2: { title: 'Seguridad — Protege a los tuyos', gradient: 'from-cyan-600 to-blue-500', icon: '🛡️' },
    3: { title: 'Datos del Mercado', gradient: 'from-yellow-600 to-amber-500', icon: '📊' },
    4: { title: 'Prueba Social — Otros ya confían', gradient: 'from-green-600 to-emerald-500', icon: '✅' },
    5: { title: 'Activación de Compradores', gradient: 'from-blue-600 to-indigo-500', icon: '🎯' },
    6: { title: 'Vendedores — Tu auto vale más', gradient: 'from-purple-600 to-pink-500', icon: '💰' },
    7: { title: 'Funciones Avanzadas', gradient: 'from-indigo-600 to-violet-500', icon: '⚡' },
    8: { title: 'Frontera Digital — Juárez', gradient: 'from-teal-600 to-cyan-500', icon: '🇲🇽' },
    9: { title: 'Pre-Buen Fin — FOMO', gradient: 'from-orange-600 to-red-500', icon: '🔥' },
    10: { title: 'Buen Fin — Pérdida', gradient: 'from-red-700 to-pink-600', icon: '🏷️' },
    11: { title: 'Navidad — Familia y gratitud', gradient: 'from-green-700 to-red-600', icon: '🎄' },
    12: { title: 'Año Nuevo — Renacimiento', gradient: 'from-yellow-500 to-amber-400', icon: '🎆' },
}

const NO_CONFIG = { enabled: false, budgetMXN: 0, objective: '', audience: '', durationDays: 0 }
const NO_AD = { tiktok: NO_CONFIG, meta: { ...NO_CONFIG, placement: '' } }
const META_AD_21 = { tiktok: NO_CONFIG, meta: { enabled: true, budgetMXN: 21, objective: 'Tráfico', audience: 'Juárez 25-55', placement: 'Automático', durationDays: 7 } }

function p(format: ContentFormat, time: string, caption: string, hashtags: string[], capcut?: string, gemini?: string, cta?: string, slides?: number): PlatformPost {
    return { format, postingTime: time, caption, hashtags, capcutPrompt: capcut, geminiPrompt: gemini, adCTA: cta, carouselSlides: slides }
}

const ALL_ENTRIES: CalendarEntry[] = [
    // ═══ SEMANA 1: GANCHO INICIAL ═══
    { id:'s01-lun',week:1,dayIndex:0,title:'Estás perdiendo dinero',theme:'Educación financiera',gatillo:'loss_aversion',gatilloIcon:'🔴',gatilloColor:'text-red-400',
      tiktok:p('video','15:00','🔴 Estás perdiendo dinero cada día que tu auto está en la calle sin venderlo.\n\nCada semana que pasa, tu auto vale $2,000 menos.\n\n¿Cuánto llevas esperando?\n\n📲 Descarga CarMatch — link en bio',['#PerdiendoDinero','#VendeTuAuto','#CdJuarez','#AutoUsado','#CarMatch','#Chihuahua'],'Escena 1: Reloj avanzando rápido. Escena 2: Billetes volando. Escena 3: Auto con polvo. Texto: "Cada semana pierdes $2,000". Color grading oscuro. 9:16.'),
      instagram:p('carousel','13:00','🔴 Cada semana tu auto vale $2,000 menos.\n\nEl valor de un auto usado baja entre 1-2% mensual.\n\nSi llevas 3 meses esperando, ya perdiste $6,000-$12,000.\n\nDesliza para ver cuánto has perdido →\n\n📲 Descarga CarMatch gratis',['#PerdiendoDinero','#VendeTuAuto','#CdJuarez','#AutoUsado','#CarMatch','#Chihuahua','#FinanzasPersonales'],undefined,'Infografía dark fondo #0f172a. Título rojo "CADA SEMANA PIERDES $2,000". Gráfica descendente. Rojo #ef4444, naranja #f97316, azul #0ea5e9.','Más información',5),
      facebook:p('video','12:00','🔴 ATENCIÓN: Si tu auto está sin vender, estás perdiendo dinero.\n\nEl valor baja entre $1,500-$3,000 cada mes.\n\nCarMatch es la plataforma #1 para vender tu auto rápido en Cd. Juárez.\n\n📲 Descarga gratis: carmatchapp.net',['#PerdiendoDinero','#VendeTuAuto','#CdJuarez','#AutoUsado','#CarMatch'],'Video profesional: Persona con reloj. Auto en estacionamiento. Texto: "Cada semana pierdes $2,000". Persona con app CarMatch. 16:9.',undefined,'Más información'),
      adConfig:META_AD_21 },

    { id:'s01-mar',week:1,dayIndex:1,title:'Opinión impopular: Marketplace no sirve',theme:'Debate',gatillo:'curiosity',gatilloIcon:'🟡',gatilloColor:'text-yellow-400',
      tiktok:p('video','15:00','🟡 Opinión impopular: Marketplace no sirve para vender tu auto.\n\n50 mensajes y NINGUNO serio.\n\nEn CarMatch solo llegan compradores reales.\n\n¿Estás de acuerdo? Comenta 👇',['#OpiniónImpopular','#Marketplace','#VendeTuAuto','#CarMatch','#CdJuarez','#Debate'],'Persona hablando a cámara decepcionada. Mensajes de Marketplace. Texto: "50 mensajes, 0 serios". App CarMatch. Nativo TikTok.'),
      instagram:p('reel','13:00','🟡 Opinión impopular: Marketplace NO es la mejor forma de vender tu auto.\n\n50 mensajes falsos. 0 compradores reales.\n\nCarMatch conecta con compradores serios.\n\n¿Tú también estás frustrado?','#OpiniónImpopular Marketplace VendeTuAuto CarMatch CdJuarez Reels AutoUsado'.split(' '),'Talking head: celular con mensajes Marketplace. Transición a CarMatch. "Marketplace vs CarMatch". Casual.'),
      facebook:p('image','12:00','🟡 OPINIÓN IMPOPULAR: Marketplace no sirve para vender autos.\n\n❌ 50 mensajes de "¿A cuánto está?"\n❌ Nadie agenda cita\n✅ CarMatch: compradores reales verificados\n\nEntra a carmatchapp.net',['#OpiniónImpopular','#Marketplace','#VendeTuAuto','#CarMatch','#CdJuarez'],undefined,'Split screen: Rojo (Marketplace frustración) vs Azul (CarMatch sonrisa). "Marketplace vs CarMatch". #0f172a.','Más información'),
      adConfig:NO_AD },

    { id:'s01-mie',week:1,dayIndex:2,title:'¿Sabías que...? Datos del mercado',theme:'Datos',gatillo:'curiosity',gatilloIcon:'🟡',gatilloColor:'text-yellow-400',
      tiktok:p('video','15:00','🟡 ¿Sabías que el 70% de los autos usados en México se venden por debajo de su valor?\n\nLa mayoría no sabe cuánto vale su auto.\n\nCarMatch tiene valuación inteligente.\n\n📲 Link en bio',['#SabiasQue','#DatoCurioso','#ValorAuto','#CarMatch','#CdJuarez','#MercadoAuto'],'Texto "¿SABÍAS QUE?" zoom. Número "70%" animado. Auto con etiqueta incorrecta. App valuación. Educativo.'),
      instagram:p('carousel','13:00','🟡 3 datos que TODO vendedor debe saber:\n\n1️⃣ El 70% se vende por debajo de su valor\n2️⃣ Pierde 15% al sacarlo de agencia\n3️⃣ Mejor mes: octubre-noviembre\n\nDesliza para más →\n\n📲 CarMatch — tu auto al precio correcto',['#SabiasQue','#DatoCurioso','#ValorAuto','#CarMatch','#CdJuarez','#MercadoAuto','#Finanzas'],undefined,'3 datos: iconos auto, gráfica depreciación, calendario. Azul #0ea5e9, naranja #f97316, fondo oscuro. Clean.',undefined,4),
      facebook:p('image','12:00','🟡 ¿Sabías que el 70% de autos usados se venden por debajo de su valor?\n\nCarMatch te da valuación basada en el mercado real de Cd. Juárez.\n\n📲 Entra a carmatchapp.net',['#SabiasQue','#ValorAuto','#CarMatch','#CdJuarez'],undefined,'Gráfica circular 70% vs 30%. Auto con $. Fondo azul oscuro. "70% SE VENDEN BARATO". Profesional.','Más información'),
      adConfig:NO_AD },

    { id:'s01-jue',week:1,dayIndex:3,title:'La prueba está aquí',theme:'Social Proof',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 "Vendí mi auto en 3 días con CarMatch"\n\nMaría de Cd. Juárez.\n\n¿Tú cuánto llevas?\n\n📲 Descarga gratis — link en bio',['#TestimonioReal','#VendidoEn3Dias','#CarMatch','#CdJuarez','#ExitoReal'],'Screenshot reseña: "María vendió en 3 días". Fondo verde. Estadísticas. UGC style.'),
      instagram:p('reel','13:00','🟢 María publicó su auto el lunes.\n\nEl miércoles ya tenía comprador.\n\n3 días.\n\n¿Cuánto llevas tú?\n\n📲 carmatchapp.net — gratis',['#TestimonioReal','#VendidoEn3Dias','#CarMatch','#CdJuarez','#ExitoReal','#Reels'],undefined,'Timeline: Lunes publicado → Miércoles VENDIDO. Calendario. Testimonio.'),
      facebook:p('image','12:00','🟢 María publicó el lunes. El miércoles ya tenía comprador.\n\n3 días. Sin intermediarios.\n\nCarMatch funciona en Cd. Juárez.\n\n📲 carmatchapp.net',['#TestimonioReal','#VendidoEn3Dias','#CarMatch','#CdJuarez'],undefined,'Testimonio: fondo verde. Auto con "VENDIDO". "María, Cd. Juárez". "3 días".','Más información'),
      adConfig:META_AD_21 },

    { id:'s01-vie',week:1,dayIndex:4,title:'Tu competencia ya está aquí',theme:'Urgencia',gatillo:'fomo',gatilloIcon:'🟠',gatilloColor:'text-orange-400',
      tiktok:p('video','15:00','🟠 Ya hay 500+ autos publicados en CarMatch Juárez.\n\nLos primeros se venden más rápido.\n\n¿Ya publicaste el tuyo?',['#FOMO','#YaEstanAqui','#CarMatch','#CdJuarez','#500Autos'],'Contador a 500+. Autos en mapa Juárez. "¿El tuyo?". Naranja y rojo.'),
      instagram:p('reel','13:00','🟠 500+ autos ya están en CarMatch Cd. Juárez.\n\nLos primeros se venden más rápido.\n\n¿Ya publicaste el tuyo?',['#FOMO','#YaEstanAqui','#CarMatch','#CdJuarez','#Reels'],undefined,'Contador 0 a 500+. Mapa puntos. "No te quedes fuera". Cálidos.'),
      facebook:p('image','12:00','🟠 Ya hay 500+ autos en CarMatch Cd. Juárez.\n\nLos primeros se venden más rápido.\n\n📲 carmatchapp.net — gratis y sin comisiones',['#FOMO','#CarMatch','#CdJuarez'],undefined,'Mapa Juárez con 500+ puntos. "500+" naranja. "Los primeros se venden más rápido". Fondo oscuro.','Más información'),
      adConfig:NO_AD },

    { id:'s01-sab',week:1,dayIndex:5,title:'Tu familia depende de ti',theme:'Seguridad',gatillo:'security',gatilloIcon:'🛡️',gatilloColor:'text-cyan-400',
      tiktok:p('video','15:00','🛡️ Cada vez que manejas un auto sin mantenimiento...\n\nPones en riesgo a tu familia.\n\nCarMatch tiene servicios verificados.\n\n📲 Link en bio',['#SeguridadFamiliar','#MantenimientoAuto','#CarMatch','#CdJuarez'],'Familia en auto. "¿Tu auto está seguro?" Iconos mantenimiento. Lista verificación. Emotivo.'),
      instagram:p('carousel','13:00','🛡️ Tu familia depende de tu auto.\n\n5 cosas que debes revisar:\n1️⃣ Frenos\n2️⃣ Aceite\n3️⃣ Llantas\n4️⃣ Luces\n5️⃣ Documentos\n\nDesliza para el checklist →',['#SeguridadFamiliar','#ChecklistAuto','#CarMatch','#CdJuarez'],undefined,'Checklist visual 5 ítems con iconos. Fondo azul oscuro. Profesional.',undefined,5),
      facebook:p('image','12:00','🛡️ Pones en riesgo a tu familia con un auto sin mantenimiento.\n\nCarMatch tiene servicios verificados en Cd. Juárez.\n\n📲 carmatchapp.net',['#SeguridadFamiliar','#CarMatch','#CdJuarez'],undefined,'Familia feliz con auto. Iconos escudo. "Protege a los tuyos".','Más información'),
      adConfig:NO_AD },

    { id:'s01-dom',week:1,dayIndex:6,title:'Gracias Cd. Juárez',theme:'Comunidad',gatillo:'identity',gatilloIcon:'🔵',gatilloColor:'text-blue-400',
      tiktok:p('video','15:00','🔵 Cd. Juárez,gracias por confiar en CarMatch.\n\nHECHOS EN JUÁREZ, para JUÁREZ.',['#GraciasJuarez','#HechoEnJuarez','#CarMatch','#OrgulloJuarense'],'Montaje puntos icónicos Juárez. "Gracias Cd. Juárez". Logo CarMatch. Música emotiva.'),
      instagram:p('reel','13:00','🔵 Cd. Juárez,gracias.\n\nCarMatch nació aquí. Crece aquí.\nSomos de aquí.',['#GraciasJuarez','#HechoEnJuarez','#CarMatch','#OrgulloJuarense','#Reels'],undefined,'Puntos icónicos Juárez filtro cálido. "De Juárez, para Juárez". Storytelling.'),
      facebook:p('image','12:00','🔵 Cd. Juárez,gracias por confiar.\n\nSomos hechos en Juárez, para Juárez.',['#GraciasJuarez','#HechoEnJuarez','#CarMatch'],undefined,'Skyline Juárez atardecer. "Gracias Cd. Juárez". Logo. Cálidos.'),
      adConfig:NO_AD },

    // ═══ SEMANA 2: SEGURIDAD ═══
    { id:'s02-lun',week:2,dayIndex:0,title:'Estafas de autos: Cómo protegerte',theme:'Protección',gatillo:'security',gatilloIcon:'🛡️',gatilloColor:'text-cyan-400',
      tiktok:p('video','15:00','🛡️ Cada mes hay 200+ estafas de autos en Juárez.\n\nNo seas víctima.\n\nCarMatch verifica compradores y vendedores.',['#EstafaAuto','#Protegete','#CarMatch','#CdJuarez','#CompraSegura'],'Alerta roja "ESTAFA". Ejemplos estafas. Verificación CarMatch. Escudo.'),
      instagram:p('carousel','13:00','🛡️ 3 estafas comunes en Juárez:\n\n1️⃣ Cheque falsificado\n2️⃣ Documentos alterados\n3️⃣ "Te doy más si me dejas llevarlo"\n\nCómo protegerte → desliza',['#EstafaAuto','#Protegete','#CarMatch','#CdJuarez','#CompraSegura'],undefined,'3 estafas: iconos cheque, documentos, persona sospechosa. Rojo oscuro. Alerta.',undefined,6),
      facebook:p('video','12:00','🛡️ 200+ estafas de autos reportadas en Cd. Juárez cada mes.\n\nNo vendas ni compres sin verificar.\n\nCarMatch verifica cada usuario.',['#EstafaAuto','#Protegete','#CarMatch','#CdJuarez'],'3 estafas con ejemplos. Solución verificación. Profesional.','Más información'),
      adConfig:META_AD_21 },

    { id:'s02-mar',week:2,dayIndex:1,title:'Tu auto vale más de lo que crees',theme:'Valuación',gatillo:'curiosity',gatilloIcon:'🟡',gatilloColor:'text-yellow-400',
      tiktok:p('video','15:00','🟡 Tu auto puede valer $30,000 más de lo que crees.\n\nLa mayoría subestima.\n\nCarMatch te da la valuación correcta.',['#ValuaTuAuto','#MasDeLoQueCrees','#CarMatch','#CdJuarez'],'Persona sorprendida. "$180,000" vs "$150,000". App. Positivo.'),
      instagram:p('reel','13:00','🟡 ¿Cuánto crees que vale tu auto?\n\nProbablemente $20,000-$40,000 MENOS.\n\nCarMatch: valuación real.',['#ValuaTuAuto','#MasDeLoQueCrees','#CarMatch','#CdJuarez','#Reels'],undefined,'"¿Cuánto vale?" Opciones. Revelar más alto. Sorpresa.'),
      facebook:p('image','12:00','🟡 Tu auto puede valer $30,000 más de lo que crees.\n\nCarMatch te da la valuación precisa.',['#ValuaTuAuto','#CarMatch','#CdJuarez'],undefined,'Auto con dos etiquetas: tachada $150K, verde $180K. "¿Cuánto vale realmente?".','Más información'),
      adConfig:NO_AD },

    { id:'s02-mie',week:2,dayIndex:2,title:'Protege a tu familia: Mantenimiento',theme:'Cuidado',gatillo:'security',gatilloIcon:'🛡️',gatilloColor:'text-cyan-400',
      tiktok:p('video','15:00','🛡️ Si no cambias el aceite a tiempo...\n\nTu motor se destruye.\n\nCarMatch tiene servicios verificados.',['#MantenimientoAuto','#ProtegeATusTuyos','#CarMatch','#CdJuarez'],'Motor viejo vs limpio. Taller verificado. "Mantenimiento = Seguridad".'),
      instagram:p('carousel','13:00','🛡️ 4 señales de que necesitas mantenimiento YA:\n\n1️⃣ Ruido al frenar\n2️⃣ Aceite oscuro\n3️⃣ Luces dashboard\n4️⃣ Vibración al manejar\n\nNo esperes.',['#MantenimientoAuto','#SeñalesDeAlerta','#CarMatch','#CdJuarez'],undefined,'4 iconos alerta. Rojo/naranja. Fondo oscuro.',undefined,4),
      facebook:p('image','12:00','🛡️ Si no cambias el aceite, tu motor se destruye.\n\n4 señales de mantenimiento YA.',['#MantenimientoAuto','#CarMatch','#CdJuarez'],undefined,'Auto con síntomas. Iconos advertencia. Azul oscuro.','Más información'),
      adConfig:NO_AD },

    { id:'s02-jue',week:2,dayIndex:3,title:'Vendedor real, comprador real',theme:'Verificación',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 En CarMatch, cada usuario es verificado.\n\nNo estafadores. No perdedores de tiempo.\n\nSolo gente real.',['#UsuariosReales','#Verificado','#CarMatch','#CdJuarez','#CompraSegura'],'Personas con badges verificación. App checkmarks. Confiable.'),
      instagram:p('reel','13:00','🟢 Cada usuario pasa verificación.\n\nFoto, teléfono, email. Todo confirmado.\n\n¿Sabes con quién tratas?',['#UsuariosReales','#Verificado','#CarMatch','#CdJuarez','#Reels'],undefined,'Proceso verificación: foto → email → teléfono → badge verde. Clean.'),
      facebook:p('image','12:00','🟢 Cada usuario verificado.\n\nNo estafadores. Solo gente real.',['#UsuariosReales','#Verificado','#CarMatch','#CdJuarez'],undefined,'Personas con badges verde. Escudo. "100% Verificados".','Más información'),
      adConfig:META_AD_21 },

    { id:'s02-vie',week:2,dayIndex:4,title:'Los más buscados de la semana',theme:'Tendencia',gatillo:'fomo',gatilloIcon:'🟠',gatilloColor:'text-orange-400',
      tiktok:p('video','15:00','🟠 Los autos más buscados de Juárez.\n\n¿Ya publicaste el tuyo?','#Tendencia AutosBuscados CarMatch CdJuarez FOMO'.split(' '),'Lista autos buscados rápido. "AGOTADO" populares. Urgente.'),
      instagram:p('reel','13:00','🟠 Top 3 buscados:\n1. Nissan Sentra\n2. VW Jetta\n3. Chevrolet Aveo\n\n¿El tuyo está?',['#Tendencia','#AutosBuscados','#CarMatch','#CdJuarez','#Reels'],undefined,'Top 3 con animación. Auto "VENDIDO". Momentum.'),
      facebook:p('image','12:00','🟠 Autos más buscados:\n1. Nissan Sentra\n2. VW Jetta\n3. Chevrolet Aveo',['#Tendencia','#CarMatch','#CdJuarez'],undefined,'Top 3 ranking. Naranja. "Esta semana en Juárez".','Más información'),
      adConfig:NO_AD },

    { id:'s02-sab',week:2,dayIndex:5,title:'Juan vendió su truck en 2 horas',theme:'Testimonio',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 Juan tenía una truck que nadie compraba.\n\nLa publicó en CarMatch.\n\n3 llamadas en 2 horas.',['#HistoriaReal','#Vendido','#CarMatch','#CdJuarez','#ExitoReal'],'Truck solitaria → publicación → teléfono. "3 LLAMADAS EN 2 HORAS". UGC.'),
      instagram:p('reel','13:00','🟢 Juan llevaba 2 meses sin vender.\n\nPublicó viernes. Sábado: 3 llamadas.',['#HistoriaReal','#Vendido','#CarMatch','#CdJuarez','#Reels'],undefined,'Timeline: 2 meses → publica → 3 llamadas. Testimonio.'),
      facebook:p('image','12:00','🟢 2 meses vendiendo sin suerte. Publicó en CarMatch: 3 llamadas en 2 horas.',['#HistoriaReal','#CarMatch','#CdJuarez'],undefined,'Testimonio card: "Juan, Cd. Juárez". "3 llamadas en 2 horas". Verde.'),
      adConfig:NO_AD },

    { id:'s02-dom',week:2,dayIndex:6,title:'Domingo de revisión',theme:'Cuidado',gatillo:'security',gatilloIcon:'🛡️',gatilloColor:'text-cyan-400',
      tiktok:p('video','15:00','🛡️ Domingo = revisar tu auto.\n\n5 minutos que te ahorran $50,000.',['#DomingoDeRevisión','#Mantenimiento','#CarMatch','#CdJuarez'],'Persona revisando auto domingo. Checklist. App recordatorio.'),
      instagram:p('reel','13:00','🛡️ Domingo de revisión:\n✅ Aceite\n✅ Llantas\n✅ Frenos\n✅ Luces\n\n5 minutos = $50,000 ahorros.',['#DomingoDeRevisión','#Mantenimiento','#CarMatch','#CdJuarez','#Reels'],undefined,'5 revisiones 5 segundos. Checkmarks. Relajado.'),
      facebook:p('image','12:00','🛡️ 5 minutos revisando tu auto te ahorran miles.',['#DomingoDeRevisión','#CarMatch','#CdJuarez'],undefined,'Auto domingo. Checklist. "5 minutos = $50,000".'),
      adConfig:NO_AD },

    // ═══ SEMANA 3: DATOS DEL MERCADO ═══
    { id:'s03-lun',week:3,dayIndex:0,title:'El auto más vendido de Juárez',theme:'Datos',gatillo:'curiosity',gatilloIcon:'🟡',gatilloColor:'text-yellow-400',
      tiktok:p('video','15:00','🟡 ¿Cuál es el auto más vendido en Juárez?\n\nNo es el que crees.',['#DatoDelMercado','#AutoMásVendido','#CarMatch','#CdJuarez'],'Encuesta: "¿Cuál crees?" Revelar sorpresa. Datos visuales.'),
      instagram:p('carousel','13:00','🟡 Top 5 más vendidos Cd. Juárez:\n5. Honda Civic\n4. Toyota Corolla\n3. Chevrolet Aveo\n2. VW Jetta\n1. Nissan Sentra\n\n¿El tuyo está?',['#DatoDelMercado','#Top5','#CarMatch','#CdJuarez'],undefined,'Ranking 5-4-3-2-1 con fotos. Azul oscuro. Data visualization.',undefined,5),
      facebook:p('image','12:00','🟡 Auto más vendido: Nissan Sentra.\n\nTop 5: Sentra, Jetta, Aveo, Corolla, Civic.',['#DatoDelMercado','#CarMatch','#CdJuarez'],undefined,'Lista top 5 ranking. Datos claros.','Más información'),
      adConfig:NO_AD },

    { id:'s03-mar',week:3,dayIndex:1,title:'Precio promedio: $145,000',theme:'Valuación',gatillo:'curiosity',gatilloIcon:'🟡',gatilloColor:'text-yellow-400',
      tiktok:p('video','15:00','🟡 Promedio de auto usado en Juárez: $145,000.\n\n¿El tuyo vale más o menos?',['#ValorPromedio','#DatosJuárez','#CarMatch','#CdJuarez'],'Número "$145,000" animado. Gráfica. "¿El tuyo?". Data.'),
      instagram:p('reel','13:00','🟡 Precio promedio: $145,000 MXN.\n\nEl tuyo puede valer más.\n\nDescúbrelo gratis.',['#ValorPromedio','#DatosJuárez','#CarMatch','#CdJuarez','#Reels'],undefined,'Número "$145,000" animación. Comparación. Sorpresa.'),
      facebook:p('image','12:00','🟡 Promedio auto usado Juárez: $145,000.\n\n¿El tuyo vale más?',['#ValorPromedio','#CarMatch','#CdJuarez'],undefined,'Gráfica precios. $145K resaltado. Datos claros.','Más información'),
      adConfig:META_AD_21 },

    { id:'s03-mie',week:3,dayIndex:2,title:'Mejor mes para vender',theme:'Estrategia',gatillo:'authority',gatilloIcon:'🟣',gatilloColor:'text-purple-400',
      tiktok:p('video','15:00','🟣 El mejor mes para vender tu auto es...\n\nOctubre.\n\n¿Por qué? Datos que nadie te dice.',['#MejorMes','#EstrategiaVenta','#CarMatch','#CdJuarez'],'Calendario octubre resaltado. Datos demanda. Autoritativo.'),
      instagram:p('carousel','13:00','🟣 Mejor mes para vender: octubre-noviembre.\n\n1️⃣ Alta demanda pre-Buen Fin\n2️⃣ Bonos fin de año\n3️⃣ Más compradores activos\n\nPlanifica tu venta.',['#MejorMes','#EstrategiaVenta','#CarMatch','#CdJuarez'],undefined,'Calendario oct-nov naranja. Iconos demanda. Estratégico.',undefined,4),
      facebook:p('image','12:00','🟣 Mejor mes: octubre.\n\nAlta demanda + bonos = mejor precio.',['#MejorMes','#CarMatch','#CdJuarez'],undefined,'Calendario octubre destacado. Demanda y dinero.'),
      adConfig:NO_AD },

    { id:'s03-jue',week:3,dayIndex:3,title:'500 autos vendidos en CarMatch',theme:'Milestone',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 500 autos vendidos en CarMatch Juárez.\n\nGracias a ustedes.',['#500Vendidos','#Milestone','#CarMatch','#CdJuarez'],'Contador a 500. Celebración. Autos "VENDIDO". "GRACIAS".'),
      instagram:p('reel','13:00','🟢 500 autos vendidos.\n\n500 familias con su próximo auto.\n\nGracias Cd. Juárez.',['#500Vendidos','#Milestone','#CarMatch','#CdJuarez','#Reels'],undefined,'Contador animado 500. Autos mapa. Emotivo.'),
      facebook:p('image','12:00','🟢 500 autos vendidos. Gracias.',['#500Vendidos','#CarMatch','#CdJuarez'],undefined,'500 grande verde. Autos checkmarks. Festivo.'),
      adConfig:NO_AD },

    { id:'s03-vie',week:3,dayIndex:4,title:'Se está agotando este modelo',theme:'Escasez',gatillo:'fomo',gatilloIcon:'🟠',gatilloColor:'text-orange-400',
      tiktok:p('video','15:00','🟠 Este modelo se agota en Juárez.\n\nSolo quedan 12.',['#SeAgota','#Escasez','#CarMatch','#CdJuarez'],'Contador descendente 12... Autos desapareciendo. "ÚLTIMAS UNIDADES".'),
      instagram:p('reel','13:00','🟠 Solo quedan 12 unidades.\n\nNo esperes.',['#SeAgota','#Escasez','#CarMatch','#CdJuarez','#Reels'],undefined,'Contador rápido. Autos desapareciendo. FOMO.'),
      facebook:p('image','12:00','🟠 Solo quedan 12 unidades de este modelo.',['#SeAgota','#CarMatch','#CdJuarez'],undefined,'12 grande rojo. "ÚLTIMAS UNIDADES". Naranja.','Más información'),
      adConfig:META_AD_21 },

    { id:'s03-sab',week:3,dayIndex:5,title:'María vendió en 1 día',theme:'Testimonio',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 María publicó a las 10am.\nA las 6pm: comprador.\n\n1 día.',['#VendidoEn1Día','#HistoriaReal','#CarMatch','#CdJuarez'],'Reloj 10am→6pm. "VENDIDO". María sonriente.'),
      instagram:p('reel','13:00','🟢 Publicó 10am, vendió 6pm.\n\n1 día. Sin intermediarios.',['#VendidoEn1Día','#HistoriaReal','#CarMatch','#CdJuarez','#Reels'],undefined,'Timeline: 10am→6pm. Reloj rápido.'),
      facebook:p('image','12:00','🟢 María vendió en 1 día. Publicó 10am, vendió 6pm.',['#VendidoEn1Día','#CarMatch','#CdJuarez'],undefined,'Testimonio: "María" reloj 10-6. "VENDIDO".'),
      adConfig:NO_AD },

    { id:'s03-dom',week:3,dayIndex:6,title:'Domingo: revisa tus documentos',theme:'Organización',gatillo:'security',gatilloIcon:'🛡️',gatilloColor:'text-cyan-400',
      tiktok:p('video','15:00','🛡️ ¿Tus documentos al día?\n\nRevisa el domingo.',['#DomingoDeDocumentos','#CarMatch','#CdJuarez'],'Checklist documentos. Relajado domingo.'),
      instagram:p('reel','13:00','🛡️ Domingo de documentos:\n✅ Tenencia\n✅ Verificación\n✅ Seguro\n\n¿Todo al día?',['#DomingoDeDocumentos','#CarMatch','#CdJuarez','#Reels'],undefined,'Checklist documentos. Animación rápida.'),
      facebook:p('image','12:00','🛡️ ¿Documentos al día?\n✅ Tenencia ✅ Verificación ✅ Seguro',['#DomingoDeDocumentos','#CarMatch','#CdJuarez'],undefined,'Checklist documentos iconos. Cálido.'),
      adConfig:NO_AD },

    // ═══ SEMANA 4: PRUEBA SOCIAL ═══
    { id:'s04-lun',week:4,dayIndex:0,title:'3 razones por las que te compran',theme:'Psicología de venta',gatillo:'authority',gatilloIcon:'🟣',gatilloColor:'text-purple-400',
      tiktok:p('video','15:00','🟣 3 razones por las que compran tu auto:\n1. Fotos buenas\n2. Precio justo\n3. Confianza\n\nCarMatch te da las 3.',['#RazonesParaComprar','#TipDeVenta','#CarMatch','#CdJuarez'],'3 razones con iconos: cámara, precio, escudo. Educativo.'),
      instagram:p('carousel','13:00','🟣 3 razones:\n1️⃣ Fotos profesionales\n2️⃣ Precio justo\n3️⃣ Vendedor verificado\n\nCarMatch te da las 3.',['#RazonesParaComprar','#TipDeVenta','#CarMatch','#CdJuarez'],undefined,'3 cards: Fotos, Precio, Verificación. Moderno.',undefined,5),
      facebook:p('image','12:00','🟣 3 razones: Fotos, Precio, Confianza. CarMatch te da las 3.',['#RazonesParaComprar','#CarMatch','#CdJuarez'],undefined,'3 iconos grandes. Púrpura oscuro.','Más información'),
      adConfig:NO_AD },

    { id:'s04-mar',week:4,dayIndex:1,title:'Carlos busca sedan — $120K-$150K',theme:'Demanda real',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 Carlos busca sedan en Juárez.\nPresupuesto: $120,000-$150,000.\n\n¿Le vendes el tuyo?',['#CompradorReal','#BuscaAuto','#CarMatch','#CdJuarez'],'Perfil comprador. Matching auto. "Vende a Carlos".'),
      instagram:p('reel','13:00','🟢 Carlos busca sedan.\n$120K-$150K.\n\n¿Tu auto le sirve?\n\nPublica gratis.',['#CompradorReal','#BuscaAuto','#CarMatch','#CdJuarez','#Reels'],undefined,'"Comprador buscando" datos reales. Matching. Directo.'),
      facebook:p('image','12:00','🟢 Carlos busca sedan Cd. Juárez.\n$120K-$150K.\n\n¿Le sirve el tuyo?',['#CompradorReal','#CarMatch','#CdJuarez'],undefined,'Card comprador: "Carlos busca sedan". Matching. Verde.'),
      adConfig:NO_AD },

    { id:'s04-mie',week:4,dayIndex:2,title:'Ana busca SUV — $150K-$200K',theme:'Demanda real',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 Ana busca SUV para su familia.\n$150,000-$200,000.',['#CompradoraReal','#BuscaSUV','#CarMatch','#CdJuarez'],'Perfil Ana. SUV familia. "Vende a Ana".'),
      instagram:p('reel','13:00','🟢 Ana busca SUV familia.\n$150K-$200K.',['#CompradoraReal','#BuscaSUV','#CarMatch','#CdJuarez','#Reels'],undefined,'Ana buscando SUV. Familia feliz.'),
      facebook:p('image','12:00','🟢 Ana busca SUV. $150K-$200K.',['#CompradoraReal','#CarMatch','#CdJuarez'],undefined,'Card: "Ana busca SUV". Familia. Verde.'),
      adConfig:NO_AD },

    { id:'s04-jue',week:4,dayIndex:3,title:'1,000 usuarios en CarMatch',theme:'Milestone',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 1,000 usuarios en CarMatch Juárez.\n\nGracias.',['#1000Usuarios','#Crecimiento','#CarMatch','#CdJuarez'],'Contador 1,000. Personas conectándose. "GRACIAS".'),
      instagram:p('reel','13:00','🟢 1,000 usuarios.\n1,000 personas confiando.\n\nGracias.',['#1000Usuarios','#Crecimiento','#CarMatch','#CdJuarez','#Reels'],undefined,'Contador 1,000. Celebración. Emotivo.'),
      facebook:p('image','12:00','🟢 1,000 usuarios. Gracias.',['#1000Usuarios','#CarMatch','#CdJuarez'],undefined,'1,000 grande. Personas conectadas.'),
      adConfig:NO_AD },

    { id:'s04-vie',week:4,dayIndex:4,title:'Último día de precio regular',theme:'Urgencia',gatillo:'fomo',gatilloIcon:'🟠',gatilloColor:'text-orange-400',
      tiktok:p('video','15:00','🟠 Último día de este precio.\nMañana sube.',['#ÚltimoDía','#CarMatch','#CdJuarez'],'Reloj ticking. Precio cambiando. "ÚLTIMO DÍA".'),
      instagram:p('reel','13:00','🟠 Último día de este precio.\nMañana sube.\n\nNo digas que no te avisamos.',['#ÚltimoDía','#CarMatch','#CdJuarez','#Reels'],undefined,'Conteo regresivo. Precio cambiando. FOMO.'),
      facebook:p('image','12:00','🟠 Último día. Mañana sube.',['#ÚltimoDía','#CarMatch','#CdJuarez'],undefined,'Reloj. "ÚLTIMO DÍA" rojo. Tachadura. Naranja.','Más información'),
      adConfig:META_AD_21 },

    { id:'s04-sab',week:4,dayIndex:5,title:'50 autos vendidos esta semana',theme:'Momentum',gatillo:'social_proof',gatilloIcon:'🟢',gatilloColor:'text-green-400',
      tiktok:p('video','15:00','🟢 50 autos vendidos esta semana.\n\n¿Ya publicaste el tuyo?',['#50Vendidos','#Momentum','#CarMatch','#CdJuarez'],'Contador hasta 50. Autos "VENDIDO". Momentum.'),
      instagram:p('reel','13:00','🟢 50 autos vendidos solo esta semana.\n\nEl mercado está activo.',['#50Vendidos','#Momentum','#CarMatch','#CdJuarez','#Reels'],undefined,'Contador 50. Autos desapareciendo.'),
      facebook:p('image','12:00','🟢 50 autos vendidos esta semana. Publica gratis.',['#50Vendidos','#CarMatch','#CdJuarez'],undefined,'50 grande. Checkmarks.'),
      adConfig:NO_AD },

    { id:'s04-dom',week:4,dayIndex:6,title:'Gracias por un mes increíble',theme:'Agradecimiento',gatillo:'identity',gatilloIcon:'🔵',gatilloColor:'text-blue-400',
      tiktok:p('video','15:00','🔵 Un mes de CarMatch en Juárez.\n\nGracias. Esto apenas empieza.',['#UnMes','#Gracias','#CarMatch','#CdJuarez'],'Montaje primer mes. Logros. "GRACIAS".'),
      instagram:p('reel','13:00','🔵 Un mes en Juárez.\n\nGracias. Esto solo empieza.',['#UnMes','#Gracias','#CarMatch','#CdJuarez','#Reels'],undefined,'Resumen mes. Gracias. Futuro.'),
      facebook:p('image','12:00','🔵 Un mes. Gracias Cd. Juárez. Esto apenas empieza.',['#UnMes','#Gracias','#CarMatch','#CdJuarez'],undefined,'Calendario un mes. "GRACIAS". Azul.'),
      adConfig:NO_AD },
]

// ═══ SEMANA 5-12: Generated ═══

function genWeek5(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number}> = [
      {id:'s05-lun',t:'¿Qué tipo de comprador eres?',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'¿Sedan, SUV o pick-up?\n\nDescubre tu estilo.',ig:'¿Qué tipo de comprador eres?\n\nSedan = práctico\nSUV = familia\nPick-up = chamba',fb:'¿Sedan, SUV o pick-up?\n\nCarMatch tiene todo.',day:0},
      {id:'s05-mar',t:'Los 5 autos más confiables',gatillo:'authority',icon:'🟣',color:'text-purple-400',tt:'Los 5 autos más confiables de la historia.\n\n¿El tuyo está?',ig:'Los 5 más confiables:\n1. Toyota Corolla\n2. Honda Civic\n3. Mazda 3\n4. Hyundai Elantra\n5. Nissan Sentra',fb:'Los 5 autos más confiables.\n\nCarMatch los tiene.',day:1},
      {id:'s05-mie',t:'Prueba: ¿Vale la pena tu auto?',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'¿Vale la pena tu auto?\n\nDescúbrelo gratis.',ig:'¿Vale la pena tu auto?\n\nValuación gratis.',fb:'¿Vale la pena tu auto?\n\nValúalo gratis.',day:2},
      {id:'s05-jue',t:'Comprador real vs browsers',gatillo:'social_proof',icon:'🟢',color:'text-green-400',tt:'El 80% solo mira. El 20% compra.\n\nCarMatch tiene compradores reales.',ig:'80% browsean. 20% compran.\n\nCarMatch: compradores reales.',fb:'80% miran, 20% compran.',day:3},
      {id:'s05-vie',t:'Se fue tu modelo',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Se vendió el último de tu modelo.\n\n¿Ya publicaste el tuyo?',ig:'Se fue el último de tu modelo.\n\n¿Ya publicaste?',fb:'Se vendió el último.\n\n¿Y el tuyo?',day:4},
      {id:'s05-sab',t:'Tu auto soñado está aquí',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Tu auto soñado está en CarMatch.\n\nBúscalo.',ig:'Tu auto soñado está aquí.\n\nBúscalo.',fb:'Tu auto soñado está aquí.',day:5},
      {id:'s05-dom',t:'Domingo de desear un auto',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Domingo: ¿de qué auto sueñas?\n\nMira los que hay.',ig:'Domingo de soñar.\n\n¿Qué auto quieres?',fb:'Domingo de soñar.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:5,dayIndex:e.day,title:e.t,theme:'Activación Compradores',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#CompradorActivo','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#CompradorActivo','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#CompradorActivo','#CarMatch','#CdJuarez']),
      adConfig:NO_AD
    }))
}

function genWeek6(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number}> = [
      {id:'s06-lun',t:'Tu auto vale más de lo que crees',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'Tu auto vale $20,000 más.\n\nDescúbrelo.',ig:'Tu auto vale más.\n\nValúalo gratis.',fb:'Tu auto vale más de lo que crees.',day:0},
      {id:'s06-mar',t:'Cómo sacarle fotos que vendan',gatillo:'authority',icon:'🟣',color:'text-purple-400',tt:'3 tips para fotos que venden.',ig:'Tips fotos:\n1. Luz natural\n2. Ángulo frontal\n3. Interior limpio',fb:'Fotos que venden: 3 tips.',day:1},
      {id:'s06-mie',t:'¿A cuánto lo pongo?',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'¿A cuánto poner tu auto?\n\nCarMatch te dice.',ig:'¿A cuánto poner tu auto?\n\nValuación inteligente.',fb:'¿A cuánto poner tu auto?',day:2},
      {id:'s06-jue',t:'Pedro vendió su pickup en 5 días',gatillo:'social_proof',icon:'🟢',color:'text-green-400',tt:'Pedro vendió su pickup en 5 días.',ig:'Pedro: pickup en 5 días.',fb:'Pedro vendió en 5 días.',day:3},
      {id:'s06-vie',t:'No publicar = perder dinero',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'Cada día sin publicar = dinero perdido.',ig:'Sin publicar = perdiendo dinero.',fb:'Sin publicar = perdiendo dinero.',day:4},
      {id:'s06-sab',t:'Vende sin comisiones',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Cero comisiones. Cero intermediarios.',ig:'Cero comisiones.\n\nVende directo.',fb:'Sin comisiones.',day:5},
      {id:'s06-dom',t:'Domingo: prepárate para vender',gatillo:'security',icon:'🛡️',color:'text-cyan-400',tt:'Domingo: prepara tu auto para vender.',ig:'Domingo de preparación.',fb:'Domingo: prepara tu auto.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:6,dayIndex:e.day,title:e.t,theme:'Vendedores',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#VendeTuAuto','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#VendeTuAuto','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#VendeTuAuto','#CarMatch','#CdJuarez']),
      adConfig:NO_AD
    }))
}

function genWeek7(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number}> = [
      {id:'s07-lun',t:'MapStore: Negocios verificados',gatillo:'authority',icon:'🟣',color:'text-purple-400',tt:'MapStore: talleres y negocios verificados.',ig:'MapStore: negocios verificados cerca de ti.',fb:'MapStore: negocios verificados.',day:0},
      {id:'s07-mar',t:'GPS: servicios cerca',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'GPS: servicios de auto cerca de ti.',ig:'GPS: encuentra servicios cerca.',fb:'GPS: servicios cerca.',day:1},
      {id:'s07-mie',t:'SmartInstallBanner explicado',gatillo:'authority',icon:'🟣',color:'text-purple-400',tt:'SmartInstallBanner: instala la app fácil.',ig:'SmartInstallBanner: instala en un tap.',fb:'Instala la app en un tap.',day:2},
      {id:'s07-jue',t:'Notificaciones de precio',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Te avisamos cuando baja el precio.',ig:'Alertas de precio.\n\nNo te pierdas nada.',fb:'Alertas de precio.',day:3},
      {id:'s07-vie',t:'Favoritos: guarda tu auto ideal',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Guarda favoritos y compáralos.',ig:'Guarda favoritos y compáralos.',fb:'Guarda favoritos.',day:4},
      {id:'s07-sab',t:'Chat directo con vendedor',gatillo:'social_proof',icon:'🟢',color:'text-green-400',tt:'Chatea directo con el vendedor.',ig:'Chat directo sin intermediarios.',fb:'Chat directo.',day:5},
      {id:'s07-dom',t:'Domingo: explora la app',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Domingo: explora todo CarMatch.',ig:'Explora todo lo que CarMatch tiene.',fb:'Explora CarMatch.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:7,dayIndex:e.day,title:e.t,theme:'Funciones',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#Funciones','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#Funciones','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#Funciones','#CarMatch','#CdJuarez']),
      adConfig:NO_AD
    }))
}

function genWeek8(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number}> = [
      {id:'s08-lun',t:'Hecho en Juárez, para Juárez',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'CarMatch es de Juárez.\n\nPara Juárez.',ig:'De Juárez, para Juárez.\n\nCarMatch.',fb:'De Juárez, para Juárez.',day:0},
      {id:'s08-mar',t:'La frontera más activa',gatillo:'authority',icon:'🟣',color:'text-purple-400',tt:'Juárez: la frontera más activa.\n\nTu auto se vende aquí.',ig:'Juárez: frontera más activa.',fb:'Frontera más activa.',day:1},
      {id:'s08-mie',t:'Antes y después de CarMatch',gatillo:'social_proof',icon:'🟢',color:'text-green-400',tt:'Antes: 2 meses.\nDespués: 3 días.',ig:'Antes y después. Resultado: vendido.',fb:'Antes y después.',day:2},
      {id:'s08-jue',t:'Orgullo juarense: autos',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Juárez tiene los mejores autos.\n\nOrgullo.',ig:'Juárez tiene los mejores autos.',fb:'Los mejores de Juárez.',day:3},
      {id:'s08-vie',t:'Tu competencia ya está aquí',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Tu vecino ya publicó.\n\n¿Y tú?',ig:'Tu vecino ya está en CarMatch.',fb:'Tu competencia ya publicó.',day:4},
      {id:'s08-sab',t:'Sábado de paseo',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Sábado de paseo: mira autos.',ig:'Sábado de paseo virtual.',fb:'Sábado de paseo.',day:5},
      {id:'s08-dom',t:'Gracias Juárez — mes 2',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'2 meses en Juárez.\n\nGracias.',ig:'2 meses. Gracias.',fb:'2 meses. Gracias.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:8,dayIndex:e.day,title:e.t,theme:'Juárez Pride',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#JuárezPride','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#JuárezPride','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#JuárezPride','#CarMatch','#CdJuarez']),
      adConfig:NO_AD
    }))
}

function genWeek9(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number}> = [
      {id:'s09-lun',t:'Buen Fin se acerca',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'El Buen Fin se acerca.\n\nPrepárate.',ig:'Buen Fin se acerca.',fb:'Buen Fin se acerca.',day:0},
      {id:'s09-mar',t:'Precios del Buen Fin',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'Precios bajos del Buen Fin.\n\nNo esperes.',ig:'Precios del Buen Fin. No esperes.',fb:'Precios del Buen Fin.',day:1},
      {id:'s09-mie',t:'Checklist pre-Buen Fin',gatillo:'authority',icon:'🟣',color:'text-purple-400',tt:'Checklist antes del Buen Fin.',ig:'Checklist: prepárate.',fb:'Checklist.',day:2},
      {id:'s09-jue',t:'Ya hay lista de espera',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Lista de espera para el Buen Fin.',ig:'Lista de espera.',fb:'Ya hay lista.',day:3},
      {id:'s09-vie',t:'Último día pre-Buen Fin',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'Último día antes del Buen Fin.',ig:'Último día.',fb:'Último día.',day:4},
      {id:'s09-sab',t:'Buen Fin empieza mañana',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Mañana empieza el Buen Fin.',ig:'Mañana empieza.',fb:'Mañana.',day:5},
      {id:'s09-dom',t:'Domingo de anticipación',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Domingo de anticipación.',ig:'Domingo de anticipación.',fb:'Domingo.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:9,dayIndex:e.day,title:e.t,theme:'Pre-Buen Fin',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#BuenFin','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#BuenFin','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#BuenFin','#CarMatch','#CdJuarez']),
      adConfig:NO_AD
    }))
}

function genWeek10(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number;festive?:boolean;fDate?:string;preDays?:number}> = [
      {id:'s10-lun',t:'Buen Fin: Ofertas de autos',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'Buen Fin: precios que no vuelven.',ig:'Buen Fin: ofertas reales.',fb:'Buen Fin: ofertas.',day:0,festive:true,fDate:'2026-11-27',preDays:3},
      {id:'s10-mar',t:'50% descuento mantenimiento',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'50% descuento en mantenimiento.\n\nSolo Buen Fin.',ig:'50% descuento mantenimiento.',fb:'50% descuento.',day:1,festive:true,fDate:'2026-11-28'},
      {id:'s10-mie',t:'Se agotó el primero',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Se agotó en 1 hora.\n\n¿Vas a esperar?',ig:'Agotado en 1 hora.',fb:'Se agotó rápido.',day:2,festive:true,fDate:'2026-11-29'},
      {id:'s10-jue',t:'Último día Buen Fin',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'Último día. Mañana se acabó.',ig:'Último día de ofertas.',fb:'Último día.',day:3,festive:true,fDate:'2026-11-30'},
      {id:'s10-vie',t:'Buen Fin: RESUMEN',gatillo:'social_proof',icon:'🟢',color:'text-green-400',tt:'Buen Fin: autos vendidos. Gracias.',ig:'Resumen Buen Fin.',fb:'Resumen.',day:4,festive:true,fDate:'2026-12-01'},
      {id:'s10-sab',t:'Post-Buen Fin: qué sigue',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'¿Qué sigue después del Buen Fin?',ig:'Después del Buen Fin.',fb:'Qué sigue.',day:5},
      {id:'s10-dom',t:'Gracias por el Buen Fin',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Gracias por el Buen Fin.\n\nGracias Juárez.',ig:'Gracias Buen Fin.',fb:'Gracias.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:10,dayIndex:e.day,title:e.t,theme:'Buen Fin',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#BuenFin','#Ofertas','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#BuenFin','#Ofertas','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#BuenFin','#Ofertas','#CarMatch','#CdJuarez']),
      adConfig:NO_AD,
      isFestive:e.festive, festiveDate:e.fDate, prePublishDays:e.preDays
    }))
}

function genWeek11(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number;festive?:boolean;fDate?:string;preDays?:number}> = [
      {id:'s11-lun',t:'Navidad: Regala seguridad',gatillo:'security',icon:'🛡️',color:'text-cyan-400',tt:'Regala seguridad este Navidad.\n\nUn auto nuevo para tu familia.',ig:'Regala seguridad.',fb:'Navidad: regala seguridad.',day:0,festive:true,fDate:'2026-12-20',preDays:5},
      {id:'s11-mar',t:'Navidad: 5 autos para regalar',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'5 autos ideales para regalar.',ig:'5 autos para regalar.',fb:'5 autos para regalar.',day:1,festive:true,fDate:'2026-12-21',preDays:4},
      {id:'s11-mie',t:'Navidad: Familia + auto',gatillo:'security',icon:'🛡️',color:'text-cyan-400',tt:'Tu familia merece un auto seguro.',ig:'Familia + auto seguro.',fb:'Familia + auto.',day:2,festive:true,fDate:'2026-12-22',preDays:3},
      {id:'s11-jue',t:'Navidad: Ofertas navideñas',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Ofertas navideñas. Solo esta semana.',ig:'Ofertas navideñas.',fb:'Ofertas.',day:3,festive:true,fDate:'2026-12-23',preDays:2},
      {id:'s11-vie',t:'Feliz Navidad CarMatch',gatillo:'social_proof',icon:'🟢',color:'text-green-400',tt:'Feliz Navidad de parte de CarMatch.',ig:'Feliz Navidad.',fb:'Feliz Navidad.',day:4,festive:true,fDate:'2026-12-25'},
      {id:'s11-sab',t:'Post-Navidad: qué sigue',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'Después de Navidad: qué sigue.',ig:'Post-Navidad.',fb:'Después.',day:5},
      {id:'s11-dom',t:'Domingo de gratitud',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Gracias por este año increíble.',ig:'Gracias por este año.',fb:'Gracias.',day:6},
    ]
    return d.map(e => ({
      id:e.id,week:11,dayIndex:e.day,title:e.t,theme:'Navidad',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#Navidad','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#Navidad','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#Navidad','#CarMatch','#CdJuarez']),
      adConfig:NO_AD,
      isFestive:e.festive, festiveDate:e.fDate, prePublishDays:e.preDays
    }))
}

function genWeek12(): CalendarEntry[] {
    const d: Array<{id:string;t:string;gatillo:GatilloKey;icon:string;color:string;tt:string;ig:string;fb:string;day:number;festive?:boolean;fDate?:string;preDays?:number}> = [
      {id:'s12-lun',t:'Año Nuevo: Auto nuevo',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'2027: auto nuevo.\n\nEmpieza con CarMatch.',ig:'Año nuevo, auto nuevo.',fb:'Año nuevo, auto nuevo.',day:0,festive:true,fDate:'2026-12-30',preDays:2},
      {id:'s12-mar',t:'Resolución: vender mi auto',gatillo:'loss_aversion',icon:'🔴',color:'text-red-400',tt:'Tu resolución: vender tu auto.\n\nEmpieza hoy.',ig:'Resolución: vender mi auto.',fb:'Resolución: vender.',day:1,festive:true,fDate:'2026-12-31',preDays:1},
      {id:'s12-mie',t:'Feliz Año Nuevo 2027',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Feliz 2027.\n\nGracias por confiar.',ig:'Feliz 2027.',fb:'Feliz 2027.',day:2,festive:true,fDate:'2027-01-01'},
      {id:'s12-jue',t:'Primer día de 2027',gatillo:'curiosity',icon:'🟡',color:'text-yellow-400',tt:'Primer día de 2027.\n\n¿Qué auto quieres?',ig:'Primer día de 2027.',fb:'Primer día.',day:3},
      {id:'s12-vie',t:'Metas de auto 2027',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Metas 2027: auto nuevo.\n\nCarMatch te ayuda.',ig:'Metas 2027.',fb:'Metas 2027.',day:4},
      {id:'s12-sab',t:'Año nuevo, nuevos autos',gatillo:'fomo',icon:'🟠',color:'text-orange-400',tt:'Nuevos autos para 2027.',ig:'Nuevos autos.',fb:'Nuevos autos 2027.',day:5},
      {id:'s12-dom',t:'Gracias 2026 — Hola 2027',gatillo:'identity',icon:'🔵',color:'text-blue-400',tt:'Gracias 2026.\n\nHola 2027.\n\nGracias Juárez.',ig:'Gracias 2026. Hola 2027.',fb:'Gracias 2026. Hola 2027.',day:6,festive:true,fDate:'2027-01-01'},
    ]
    return d.map(e => ({
      id:e.id,week:12,dayIndex:e.day,title:e.t,theme:'Año Nuevo',gatillo:e.gatillo,gatilloIcon:e.icon,gatilloColor:e.color,
      tiktok:p('video','15:00',e.tt,['#AñoNuevo','#2027','#CarMatch','#CdJuarez']),
      instagram:p('reel','13:00',e.ig,['#AñoNuevo','#2027','#CarMatch','#CdJuarez','#Reels']),
      facebook:p('image','12:00',e.fb,['#AñoNuevo','#2027','#CarMatch','#CdJuarez']),
      adConfig:NO_AD,
      isFestive:e.festive, festiveDate:e.fDate, prePublishDays:e.preDays
    }))
}

const ALL_ENTRIES_COMPLETE: CalendarEntry[] = [
  ...ALL_ENTRIES,
  ...genWeek5(), ...genWeek6(), ...genWeek7(), ...genWeek8(),
  ...genWeek9(), ...genWeek10(), ...genWeek11(), ...genWeek12()
]

// ═══ COMPONENT ═══

export default function CalendarTab() {
    const [activeWeek, setActiveWeek] = useState(1)
    const [expandedDay, setExpandedDay] = useState<string | null>(null)
    const [showAdConfig, setShowAdConfig] = useState<CalendarEntry | null>(null)
    const [filterGatillo, setFilterGatillo] = useState('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [activePlatformTab, setActivePlatformTab] = useState<Platform>('tiktok')

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

    const getEntryDate = (entryIndex: number): Date => {
        const today = new Date(); today.setHours(0,0,0,0)
        const completedBefore = ALL_ENTRIES_COMPLETE.slice(0, entryIndex).filter(e => publishedIds.includes(e.id) || skippedIds.includes(e.id)).length
        const date = new Date(today); date.setDate(date.getDate() + entryIndex - completedBefore); return date
    }

    const todayEntry = ALL_ENTRIES_COMPLETE.find(e => !publishedIds.includes(e.id) && !skippedIds.includes(e.id)) || null

    const markPublished = (id: string) => { setPublishedIds(p => p.includes(id)?p:[...p,id]); setSkippedIds(p=>p.filter(x=>x!==id)) }
    const markSkipped = (id: string) => { setSkippedIds(p => p.includes(id)?p:[...p,id]); setPublishedIds(p=>p.filter(x=>x!==id)) }
    const restoreEntry = (id: string) => { setPublishedIds(p=>p.filter(x=>x!==id)); setSkippedIds(p=>p.filter(x=>x!==id)) }

    const queueStats = useMemo(() => {
        const published = publishedIds.length, skipped = skippedIds.length, pending = ALL_ENTRIES_COMPLETE.length - published - skipped
        return { published, skipped, pending, total: ALL_ENTRIES_COMPLETE.length }
    }, [publishedIds, skippedIds])

    const weekEntries = useMemo(() => {
        let entries = ALL_ENTRIES_COMPLETE.filter(e => e.week === activeWeek).map(entry => {
            const globalIdx = ALL_ENTRIES_COMPLETE.findIndex(e => e.id === entry.id)
            return { ...entry, dynamicDate: getEntryDate(globalIdx), isPublished: publishedIds.includes(entry.id), isSkipped: skippedIds.includes(entry.id), isToday: todayEntry?.id === entry.id }
        })
        if (filterGatillo !== 'all') entries = entries.filter(e => e.gatillo === filterGatillo)
        return entries
    }, [activeWeek, filterGatillo, publishedIds, skippedIds, todayEntry])

    const theme = WEEK_THEMES[activeWeek] || WEEK_THEMES[1]

    const copyText = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(()=>setCopiedId(null),2000) }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary-500" />
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">Calendario</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>📅 {queueStats.pending} pendientes</span>
                    <span>✅ {queueStats.published}/{queueStats.total} publicados</span>
                    {queueStats.skipped > 0 && <span>⏭️ {queueStats.skipped} saltados</span>}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select value={filterGatillo} onChange={e=>setFilterGatillo(e.target.value)} className="bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500">
                    <option value="all">Todos los gatillos</option>
                    {Object.entries(GATILLOS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
                <div className="flex bg-surface-dark border border-white/10 rounded-lg overflow-hidden">
                    {(['tiktok','instagram','facebook'] as Platform[]).map(pl=>(
                        <button key={pl} onClick={()=>setActivePlatformTab(pl)} className={`px-3 py-2 text-xs font-bold transition-colors ${activePlatformTab===pl?'bg-primary-500 text-white':'text-white/50 hover:text-white'}`}>
                            {pl==='tiktok'?'🎵 TikTok':pl==='instagram'?'📸 Instagram':'👥 Facebook'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button onClick={()=>setActiveWeek(w=>Math.max(1,w-1))} disabled={activeWeek===1} className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"><ChevronLeft className="w-5 h-5"/></button>
                {Array.from({length:12},(_,i)=>i+1).map(w=>(
                    <button key={w} onClick={()=>setActiveWeek(w)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeWeek===w?`bg-gradient-to-r ${WEEK_THEMES[w]?.gradient||'from-blue-500 to-cyan-500'} text-white shadow-lg`:'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>
                        S{w}
                    </button>
                ))}
                <button onClick={()=>setActiveWeek(w=>Math.min(12,w+1))} disabled={activeWeek===12} className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"><ChevronRight className="w-5 h-5"/></button>
            </div>

            {/* Week Summary */}
            <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-10 rounded-xl p-4 border border-white/10`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h4 className="text-lg font-black text-white">{theme.icon} Semana {activeWeek}: {theme.title}</h4>
                        <p className="text-sm text-white/70">{weekEntries.length} días × 3 plataformas = {weekEntries.length*3} publicaciones</p>
                    </div>
                </div>
            </div>

            {/* Days */}
            <div className="space-y-3">
                {weekEntries.map(entry => {
                    const isExpanded = expandedDay === entry.id
                    const gatilloData = GATILLOS[entry.gatillo]
                    const post = entry[activePlatformTab]

                    return (
                        <div key={entry.id} className={`bg-surface-dark border rounded-xl overflow-hidden ${entry.isToday?'border-green-500/50 shadow-lg shadow-green-500/10':entry.isPublished?'border-green-500/20 opacity-70':entry.isSkipped?'border-yellow-500/20 opacity-50':'border-white/10'}`}>
                            <button onClick={()=>setExpandedDay(isExpanded?null:entry.id)} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {entry.isToday && <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">🟢 HOY</span>}
                                    {entry.isPublished && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">✅</span>}
                                    {entry.isSkipped && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">⏭️</span>}
                                    {entry.isFestive && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">🎄</span>}
                                    <span className="text-xs text-white/40 font-mono">{entry.dynamicDate.toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activePlatformTab==='tiktok'?'bg-black text-white':activePlatformTab==='instagram'?'bg-gradient-to-r from-purple-500 to-pink-500 text-white':'bg-blue-600 text-white'}`}>
                                        {activePlatformTab==='tiktok'?'🎵 TikTok':activePlatformTab==='instagram'?'📸 IG':'👥 FB'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${post.format==='video'||post.format==='reel'?'bg-green-500/20 text-green-400':post.format==='carousel'?'bg-blue-500/20 text-blue-400':'bg-orange-500/20 text-orange-400'}`}>{post.format.toUpperCase()}</span>
                                    <span className="text-sm font-bold text-white">{entry.title}</span>
                                </div>
                                <span className={`text-xs ${gatilloData.color}`}>{entry.gatilloIcon} {gatilloData.label}</span>
                            </button>

                            {isExpanded && (
                                <div className="p-4 border-t border-white/10 space-y-4">
                                    {/* 3 platforms side by side */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(['tiktok','instagram','facebook'] as Platform[]).map(platform=>{
                                            const pp = entry[platform]
                                            const isActive = platform===activePlatformTab
                                            return (
                                                <div key={platform} className={`rounded-lg p-3 space-y-2 border ${isActive?'border-primary-500/50 bg-primary-500/5':'border-white/10 bg-white/5'}`}>
                                                    <h6 className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${platform==='tiktok'?'bg-black text-white':platform==='instagram'?'bg-gradient-to-r from-purple-500 to-pink-500 text-white':'bg-blue-600 text-white'}`}>
                                                        {platform==='tiktok'?'🎵 TikTok':platform==='instagram'?'📸 Instagram':'👥 Facebook'}
                                                    </h6>
                                                    <p className="text-xs text-white/40">{pp.format.toUpperCase()} • {pp.postingTime}</p>
                                                    <p className="text-sm text-white/70 whitespace-pre-wrap line-clamp-4">{pp.caption}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {pp.hashtags.slice(0,4).map((tag,i)=><span key={i} className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-[10px]">{tag}</span>)}
                                                    </div>
                                                    {pp.adCTA && <p className="text-[10px] text-yellow-400">CTA: {pp.adCTA}</p>}
                                                    <button onClick={()=>copyText(pp.caption,`caption-${entry.id}-${platform}`)} className="flex items-center gap-1 px-2 py-1 bg-white/10 text-white/60 rounded text-[10px] font-bold hover:bg-white/20 transition-colors">
                                                        {copiedId===`caption-${entry.id}-${platform}`?<Check className="w-3 h-3 text-green-400"/>:<Copy className="w-3 h-3"/>}
                                                        {copiedId===`caption-${entry.id}-${platform}`?'¡Copiado!':'Copiar'}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Prompt */}
                                    <div className="space-y-2">
                                        <h5 className="text-xs font-bold text-white/40 uppercase">Prompt {activePlatformTab==='tiktok'||(activePlatformTab==='instagram'&&post.format==='reel')?'CapCut AI':'Gemini'}</h5>
                                        <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                                            {activePlatformTab==='tiktok'?post.capcutPrompt:post.format==='reel'?post.capcutPrompt:post.geminiPrompt||'Sin prompt para este formato'}
                                        </div>
                                        <button onClick={()=>{const txt=activePlatformTab==='tiktok'?post.capcutPrompt||'':post.format==='reel'?post.capcutPrompt||'':post.geminiPrompt||'';copyText(txt,`prompt-${entry.id}-${activePlatformTab}`)}} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-500/30 transition-colors">
                                            {copiedId===`prompt-${entry.id}-${activePlatformTab}`?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}
                                            {copiedId===`prompt-${entry.id}-${activePlatformTab}`?'Copiado!':'Copiar Prompt'}
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={()=>setShowAdConfig(entry)} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-500/30 transition-colors"><Megaphone className="w-3.5 h-3.5"/> Configurar Anuncio</button>
                                        {!entry.isPublished&&!entry.isSkipped&&(<>
                                            <button onClick={()=>markPublished(entry.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30"><Check className="w-3.5 h-3.5"/> Publicado</button>
                                            <button onClick={()=>markSkipped(entry.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500/30">⏭️ Saltado</button>
                                        </>)}
                                        {(entry.isPublished||entry.isSkipped)&&<button onClick={()=>restoreEntry(entry.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-bold hover:bg-white/20">↩️ Restaurar</button>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Ad Config Modal */}
            {showAdConfig&&(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setShowAdConfig(null)}>
                    <div className="bg-surface-dark border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">Configurar Anuncio</h3>
                            <button onClick={()=>setShowAdConfig(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white"/></button>
                        </div>
                        <p className="text-sm text-white/60">{showAdConfig.title}</p>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-blue-400 uppercase">📱 Meta Ads (Facebook + Instagram)</h4>
                            <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm text-white/70">
                                <p><span className="font-bold text-white">Objetivo:</span> <span className="text-blue-400">{showAdConfig.adConfig.meta.objective||'Tráfico'}</span></p>
                                <p><span className="font-bold text-white">Budget:</span> <span className="text-green-400">${showAdConfig.adConfig.meta.budgetMXN||21}/día</span></p>
                                <p><span className="font-bold text-white">CTA:</span> &quot;Más información&quot;</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-pink-400 uppercase">🎵 TikTok Ads</h4>
                            <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm text-white/70">
                                <p><span className="font-bold text-white">Objetivo:</span> <span className="text-pink-400">{showAdConfig.adConfig.tiktok.objective||'Código de conversión'}</span></p>
                                <p><span className="font-bold text-white">Budget:</span> <span className="text-green-400">${showAdConfig.adConfig.tiktok.budgetMXN||21}/día</span></p>
                                <p><span className="font-bold text-white">CTA:</span> &quot;Descubre más&quot;</p>
                            </div>
                        </div>

                        <button onClick={()=>copyText(`Meta: $${showAdConfig.adConfig.meta.budgetMXN||21}/día | TikTok: $${showAdConfig.adConfig.tiktok.budgetMXN||21}/día`, 'adconfig-'+showAdConfig.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-bold hover:bg-primary-500/30 transition-colors">
                            {copiedId==='adconfig-'+showAdConfig.id?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}
                            {copiedId==='adconfig-'+showAdConfig.id?'Copiado!':'Copiar configuración'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
