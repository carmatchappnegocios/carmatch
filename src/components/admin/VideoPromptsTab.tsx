'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, Search, Swords, Shield, Zap, Heart, Mountain, Skull } from 'lucide-react'

type Character = 'don-match' | 'car-mela' | 'matchy' | 'car-litos'
type Villain = 'el-bache' | 'la-agencia' | 'mecanico-tranero' | 'estafa-odometro' | 'vendedor-informal' | 'perfiles-falsos' | 'gasolinazo' | 'multa-sorpresa' | 'robo-auto' | 'seguro-caro'

interface VideoPrompt {
    id: number
    title: string
    hero: Character
    villain: Villain
    villainName: string
    hook: string
    vozEnOff: string
    escenas: string
    musica: string
    textoEnPantalla: string
    segmentacion: { edad: string; ubicacion: string; plataformas: string; intereses: string }
}

const characters: Record<Character, { name: string; age: number; icon: any; color: string }> = {
    'don-match': { name: 'Don Match', age: 45, icon: Shield, color: 'text-blue-400' },
    'car-mela': { name: 'Car-mela', age: 42, icon: Heart, color: 'text-pink-400' },
    'matchy': { name: 'Matchy', age: 20, icon: Zap, color: 'text-purple-400' },
    'car-litos': { name: 'Car-litos', age: 18, icon: Mountain, color: 'text-orange-400' }
}

const villains: Record<Villain, { name: string; color: string }> = {
    'el-bache': { name: 'El Bache', color: 'text-yellow-500' },
    'la-agencia': { name: 'La Agencia', color: 'text-red-500' },
    'mecanico-tranero': { name: 'El Mecanico Trantero', color: 'text-gray-500' },
    'estafa-odometro': { name: 'Estafa Odometro', color: 'text-orange-600' },
    'vendedor-informal': { name: 'Vendedor Informal', color: 'text-amber-600' },
    'perfiles-falsos': { name: 'Perfiles Falsos', color: 'text-cyan-500' },
    'gasolinazo': { name: 'El Gasolinazo', color: 'text-red-600' },
    'multa-sorpresa': { name: 'Multa Sorpresa', color: 'text-slate-500' },
    'robo-auto': { name: 'Robo de Auto', color: 'text-zinc-800' },
    'seguro-caro': { name: 'Seguro Caro', color: 'text-emerald-600' }
}

const allPrompts: VideoPrompt[] = [
    { id: 1, title: 'El Bache vs Don Match', hero: 'don-match', villain: 'el-bache', villainName: 'Don Bacho', hook: 'EL BACHE TE DESTRUYO EL AUTO! No dejes que te deje varado!', vozEnOff: 'Cuidado con ese bache! Va a destrozar tu auto! Mira, Don Bacho se trago tu llanta. Que haces ahora? Relajate! Don Match llego con la solucion. Abre CarMatch y encuentra el taller mecanico mas cercano. Talleres verificados, precios justos! Adios a los baches, hola a la carretera! Descarga CarMatch ahora.', escenas: 'ESCENA 1 (0-3s): Un auto estrella contra un bache enorme. El bache cobra vida: Don Bacho, un villano con forma de agujero oscuro, sonrie malvadamente. Texto: EL BACHE TE DESTRUYO EL AUTO.\nESCENA 2 (3-8s): El conductor sale angustiado, revisando la llanta pinchada. Don Bacho crece y causa mas caos.\nESCENA 3 (8-15s): Don Match llega con su chaqueta azul, saca su telefono y muestra la app CarMatch con talleres cercanos.\nESCENA 4 (15-20s): Don Bacho se encoge y desaparece. El auto es reparado. El conductor sonrie.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Encuentra el taller mas cercano.', musica: 'Electronica alta energia con beats de reggaeton, estilo viral TikTok.', textoEnPantalla: 'EL BACHE TE DESTRUYO EL AUTO -> DON BACHO ATACA -> DON MATCH RESCATA -> TALLERES CERCANOS VERIFICADOS -> CARMATCH', segmentacion: { edad: '18-45', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Mecanica, suspension, llantas, baches, carreteras, autos, reparacion' } },
    { id: 2, title: 'La Agencia vs Car-mela', hero: 'car-mela', villain: 'la-agencia', villainName: 'Don Comision', hook: 'LA AGENCIA TE COBRA DE MAS! Cuanto te estan robando?', vozEnOff: 'Ya viste la factura de la agencia? Comision del 20%! Te estan robando! Don Comision se rie con tu dinero. Pero Car-mela tiene el plan. En CarMatch compras directo, sin intermediarios, sin comisiones. El vendedor te da el precio real! Ahorra miles! Descarga CarMatch y compra tu auto sin que te roben.', escenas: 'ESCENA 1 (0-3s): Familia en concesionaria viendo precio inflado. Don Comision (hombre de traje) se rie con calculadora. Texto: LA AGENCIA TE COBRA DE MAS.\nESCENA 2 (3-8s): La familia mira preocupada el presupuesto. Don Comision sube el precio.\nESCENA 3 (8-15s): Car-mela llega con su chaqueta azul, muestra CarMatch con ventas directas.\nESCENA 4 (15-20s): Don Comision llora. La familia compra directo. Ahorro visible.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Compra directo sin comisiones.', musica: 'Reggaeton con ritmo de negocios, estilo emprendedor.', textoEnPantalla: 'LA AGENCIA TE COBRA DE MAS -> DON COMISION SE RIE -> CAR-MELA DETIENE LA ESTAFA -> COMPRA DIRECTA SIN COMISIONES -> CARMATCH', segmentacion: { edad: '25-55', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Compra-venta, agencia, comisiones, ahorro, negocios, autos' } },
    { id: 3, title: 'El Mecanico Trantero vs Don Match', hero: 'don-match', villain: 'mecanico-tranero', villainName: 'Don Trantero', hook: 'EL MECANICO TE ESTAFO! Te cambio piezas que no necesitabas?', vozEnOff: 'Te paso? Llevas tu auto al mecanico y te dice hay que cambiar todo. Don Trantero te cobro de mas! Piezas que no necesitabas, trabajo que no hizo. Pero tranquilo! Don Match conoce a los buenos. En CarMatch solo hay mecanicos verificados con resenas reales. Sin sorpresas! Descarga CarMatch y olvidate de las estafas.', escenas: 'ESCENA 1 (0-3s): Mecanico con grasa falsa mostrando factura inflada. Don Trantero sonrie malvadamente. Texto: EL MECANICO TE ESTAFO.\nESCENA 2 (3-8s): Cliente revisando piezas viejas que supuestamente eran nuevas. Enojo.\nESCENA 3 (8-15s): Don Match aparece con CarMatch, mostrando resenas de mecanicos honestos.\nESCENA 4 (15-20s): Don Trantero se desmaya. Cliente sonrie con factura justa.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Solo mecanicos verificados.', musica: 'Hip-hop mexicano con ritmo de justicia social.', textoEnPantalla: 'EL MECANICO TE ESTAFO -> DON TRANTERO COBRA DE MAS -> DON MATCH PROTEGE -> MECANICOS VERIFICADOS -> CARMATCH', segmentacion: { edad: '25-55', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Mecanica, estafas, reparacion, confianza, resenas, talleres' } },
    { id: 4, title: 'La Estafa del Odometro vs Matchy', hero: 'matchy', villain: 'estafa-odometro', villainName: 'Don Kilometraje', hook: 'TE VENDIERON KILOMETRAJE FALSO! Sabes cuantos km tiene de verdad?', vozEnOff: 'Compraste un seminuevo con pocos kilometros y ya se desarmo. Don Kilometraje bajo el odometro! Estafa clasica. Pero Matchy tiene la tecnologia. En CarMatch los autos vienen verificados, con historial real. No mas sorpresas! Descarga CarMatch y compra con confianza.', escenas: 'ESCENA 1 (0-3s): Tablero mostrando km bajos. Don Kilometraje (hombre con gafas) baja el odometro con martillo. Texto: TE VENDIERON KILOMETRAJE FALSO.\nESCENA 2 (3-8s): Auto desarmándose mientras el comprador shocked.\nESCENA 3 (8-15s): Matchy aparece con CarMatch, muestra verificacion de km real.\nESCENA 4 (15-20s): Don Kilometraje es exposed. Auto verificado aparece.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Autos verificados.', musica: 'Pop electronico con ritmo de investigacion.', textoEnPantalla: 'KILOMETRAJE FALSO -> DON KILOMETRAJE ESTAFA -> MATCHY VERIFICA -> HISTORIAL REAL -> CARMATCH', segmentacion: { edad: '22-45', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Seminuevo, kilometraje, estafa, compra-venta, verificacion' } },
    { id: 5, title: 'El Vendedor Informal vs Car-mela', hero: 'car-mela', villain: 'vendedor-informal', villainName: 'Don Informal', hook: 'EL VENDEDOR DESAPARECIO! Te vendio el auto y ya no contesta.', vozEnOff: 'Compraste el auto por WhatsApp. El vendedor te dijo esta perfecto. Desaparecio! Don Informal se esfuma con tu dinero. Pero Car-mela tiene la solucion! En CarMatch el trato es directo, verificado, con garantia. Sin que desaparezcan! Descarga CarMatch y compra seguro.', escenas: 'ESCENA 1 (0-3s): Persona llamando al vendedor. No contesta. Don Informal desaparece en humo. Texto: EL VENDEDOR DESAPARECIO.\nESCENA 2 (3-8s): Auto con problemas ocultos. Comprador frustrado.\nESCENA 3 (8-15s): Car-mela aparece con CarMatch, trato directo verificado.\nESCENA 4 (15-20s): Don Informal atrapado. Comprador feliz con garantia.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Trato directo y seguro.', musica: 'Reggaeton romantico con giro de suspenso.', textoEnPantalla: 'EL VENDEDOR DESAPARECIO -> DON INFORMAL SE ESFUMA -> CAR-MELA ATRAPA -> TRATO DIRECTO VERIFICADO -> CARMATCH', segmentacion: { edad: '25-55', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Compra-venta, vendedor, segunda mano, confianza, verificado' } },
    { id: 6, title: 'Los Perfiles Falsos vs Matchy', hero: 'matchy', villain: 'perfiles-falsos', villainName: 'Don Perfil', hook: 'PERFIL FALSO EN VENTA! Te estan vendiendo un fantasma.', vozEnOff: 'Viste un auto perfecto en linea, pero el vendedor no existe. Don Perfil crea perfiles falsos para estafarte! Fotos robadas, precios imposibles. Pero Matchy tiene la solucion. En CarMatch cada vendedor es verificado con identidad real. No mas fantasmas! Descarga CarMatch y compra seguro.', escenas: 'ESCENA 1 (0-3s): Perfil de venta perfecto en pantalla. Don Perfil (silueta borrosa) se rie. Texto: PERFIL FALSO EN VENTA.\nESCENA 2 (3-8s): Comprador llega a la direccion y no hay nada. Perfil desaparece.\nESCENA 3 (8-15s): Matchy aparece con CarMatch, vendedores verificados con ID.\nESCENA 4 (15-20s): Don Perfil se desvanece. Comprador compra seguro.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Vendedores verificados.', musica: 'Pop electronico con misterio, estilo investigacion.', textoEnPantalla: 'PERFIL FALSO EN VENTA -> DON PERFIL ESTAFA -> MATCHY VERIFICA -> VENDEDORES REALES -> CARMATCH', segmentacion: { edad: '18-40', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Compra-venta, perfiles falsos, verificacion, seguridad, online' } },
    { id: 7, title: 'El Gasolinazo vs Car-litos', hero: 'car-litos', villain: 'gasolinazo', villainName: 'Don Gasolina', hook: 'EL GASOLINAZO TE DEVORA! Cuanto pagaste la ultima vez?', vozEnOff: 'Otra vez subio la gasolina! Don Gasolina se alimenta de tu billetera. Cada vez pagas mas y tu auto consume igual. Pero Car-litos tiene la estrategia. En CarMatch encuentras autos eficientes y economicos. Cambia a un auto que no te devore! Descarga CarMatch y ahorra en gasolina.', escenas: 'ESCENA 1 (0-3s): Estacion de gasolina. Precios suben dramaticamente. Don Gasolina (monstruo de gasolina) crece. Texto: EL GASOLINAZO TE DEVORA.\nESCENA 2 (3-8s): Conductor viendo su tanque vacio, billetes volando.\nESCENA 3 (8-15s): Car-litos aparece con CarMatch, autos eficientes economicos.\nESCENA 4 (15-20s): Don Gasolina se encoge. Conductor con nuevo auto ahorrando.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Autos eficientes.', musica: 'Reggaeton con ritmo de accion, estilo aventura.', textoEnPantalla: 'EL GASOLINAZO TE DEVORA -> DON GASOLINA CRECE -> CAR-LITOS LIBERA -> AUTOS EFICIENTES -> CARMATCH', segmentacion: { edad: '18-45', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Gasolina, eficiencia, ahorro, consumo, autos, economia' } },
    { id: 8, title: 'La Multa Sorpresa vs Don Match', hero: 'don-match', villain: 'multa-sorpresa', villainName: 'Don Multa', hook: 'TE LLEGO UNA MULTA SORPRESA! Cuanto te van a cobrar?', vozEnOff: 'Cuidado! Don Multa te esta vigilando. Multas que no esperabas, infracciones que no viste. Tu billetera sangra. Pero Don Match tiene la defensa. En CarMatch encuentras talleres que revisan tu auto antes de que te multen. Prevencion antes que sancion! Descarga CarMatch y evita multas.', escenas: 'ESCENA 1 (0-3s): Sobre de multa aparece en buzon. Don Multa (hombre con lentes oscuros) sonrie. Texto: TE LLEGO UNA MULTA SORPRESA.\nESCENA 2 (3-8s): Persona abriendo sobre, shockeado por el monto.\nESCENA 3 (8-15s): Don Match aparece con CarMatch, talleres preventivos.\nESCENA 4 (15-20s): Don Multa pierde poder. Persona evita multas con revision preventiva.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Preveni multas.', musica: 'Hip-hop mexicano con ritmo de alerta.', textoEnPantalla: 'MULTA SORPRESA -> DON MULTA ATACA -> DON MATCH PREVIENE -> TALLERES PREVENTIVOS -> CARMATCH', segmentacion: { edad: '25-55', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Multas, infracciones, prevencion,Revision tecnica, verificacion' } },
    { id: 9, title: 'El Robo de Auto vs Car-litos', hero: 'car-litos', villain: 'robo-auto', villainName: 'Don Ratero', hook: 'TE ROBARON EL AUTO! Don Ratero no perdona.', vozEnOff: 'No lo veiste venir. Don Ratero se llevo tu auto. Policia que no encuentra, seguro que no cubre. Desespero total. Pero Car-litos tiene la red. En CarMatch registra tu auto, conecta con vigilancia comunitaria. No mas impunidad! Descarga CarMatch y protege tu auto.', escenas: 'ESCENA 1 (0-3s): Estacionamiento vacio donde estaba el auto. Don Ratero (sombrilla) escapa. Texto: TE ROBARON EL AUTO.\nESCENA 2 (3-8s): Persona regresando, shock, llamando a policia sin respuesta.\nESCENA 3 (8-15s): Car-litos aparece con CarMatch, registro de auto y vigilancia.\nESCENA 4 (15-20s): Don Ratero atrapado por red comunitaria.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Protege tu auto.', musica: 'Trap mexicano con ritmo de suspenso y accion.', textoEnPantalla: 'TE ROBARON EL AUTO -> DON RATERO ESCAPA -> CAR-LITOS RED -> VIGILANCIA COMUNITARIA -> CARMATCH', segmentacion: { edad: '20-45', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Robo, seguridad, vigilancia, proteccion, auto, comunidad' } },
    { id: 10, title: 'El Seguro Caro vs Car-mela', hero: 'car-mela', villain: 'seguro-caro', villainName: 'Don Seguro', hook: 'EL SEGURO TE DEVORA! Cuanto pagas al mes por nada?', vozEnOff: 'Otra vez pago el seguro y ni siquiera lo use. Don Seguro se alimenta de tu miedo. Pagas de mas por cobertura que no te protege. Pero Car-mela tiene la alternativa. En CarMatch encuentras seguros comparados, precio real, cobertura verdadera. No mas abusos! Descarga CarMatch y paga justo.', escenas: 'ESCENA 1 (0-3s): Factura de seguro enorme. Don Seguro (hombre con maletin) sonrie. Texto: EL SEGURO TE DEVORA.\nESCENA 2 (3-8s): Persona pagando, viendo que no cubre nada.\nESCENA 3 (8-15s): Car-mela aparece con CarMatch, comparador de seguros justos.\nESCENA 4 (15-20s): Don Seguro pierde poder. Persona con seguro justo.\nESCENA 5 (20-25s): Logo CarMatch. Texto: Seguros justos.', musica: 'Reggaeton de negocios con ritmo de empoderamiento.', textoEnPantalla: 'EL SEGURO TE DEVORA -> DON SEGURO COBRA -> CAR-MELA COMPARA -> SEGUROS JUSTOS -> CARMATCH', segmentacion: { edad: '25-55', ubicacion: 'Mexico', plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels', intereses: 'Seguro, precio, cobertura, comparar, ahorro, abusos' } },
]

export default function VideoPromptsTab() {
    const [search, setSearch] = useState('')
    const [filterHero, setFilterHero] = useState<string>('all')
    const [filterVillain, setFilterVillain] = useState<string>('all')
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    const filteredPrompts = useMemo(() => {
        return allPrompts.filter(p => {
            const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.hook.toLowerCase().includes(search.toLowerCase()) || p.villainName.toLowerCase().includes(search.toLowerCase())
            const matchHero = filterHero === 'all' || p.hero === filterHero
            const matchVillain = filterVillain === 'all' || p.villain === filterVillain
            return matchSearch && matchHero && matchVillain
        })
    }, [search, filterHero, filterVillain])

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        })
    }

    const buildFullPrompt = (p: VideoPrompt) => {
        return `TITULO: ${p.title}\nHEROE: ${characters[p.hero].name} (${characters[p.hero].age} anios)\nVILLANO: ${p.villainName} (${villains[p.villain].name})\n\nHOOK: ${p.hook}\n\nVOZ EN OFF: ${p.vozEnOff}\n\nESCENAS: ${p.escenas}\n\nMUSICA: ${p.musica}\n\nTEXTO EN PANTALLA: ${p.textoEnPantalla}\n\nSEGMENTACION:\n- Edad: ${p.segmentacion.edad}\n- Ubicacion: ${p.segmentacion.ubicacion}\n- Plataformas: ${p.segmentacion.plataformas}\n- Intereses: ${p.segmentacion.intereses}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Swords className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">Familia Match vs Villanos - Video Prompts (10)</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por titulo, hook o villano..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                </div>
                <select
                    value={filterHero}
                    onChange={(e) => setFilterHero(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                    <option value="all">Todos los heroes</option>
                    {Object.entries(characters).map(([key, c]) => (
                        <option key={key} value={key}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={filterVillain}
                    onChange={(e) => setFilterVillain(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                    <option value="all">Todos los villanos</option>
                    {Object.entries(villains).map(([key, v]) => (
                        <option key={key} value={key}>{v.name}</option>
                    ))}
                </select>
            </div>

            <div className="text-sm text-gray-500">{filteredPrompts.length} prompts encontrados</div>

            <div className="space-y-4">
                {filteredPrompts.map((prompt) => {
                    const HeroIcon = characters[prompt.hero].icon
                    const isExpanded = expandedId === prompt.id
                    return (
                        <div key={prompt.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <HeroIcon className={`w-5 h-5 ${characters[prompt.hero].color}`} />
                                    <div>
                                        <div className="font-medium text-sm">{prompt.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-md">{prompt.hook}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${villains[prompt.villain].color} bg-opacity-10`}>
                                        {prompt.villainName}
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t p-4 space-y-4 text-sm">
                                    <div>
                                        <div className="font-medium text-xs text-gray-500 mb-1">HOOK</div>
                                        <div className="text-red-500 font-bold">{prompt.hook}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-xs text-gray-500 mb-1">VOZ EN OFF</div>
                                        <div className="text-gray-700 dark:text-gray-300">{prompt.vozEnOff}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-xs text-gray-500 mb-1">ESCENAS</div>
                                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{prompt.escenas}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="font-medium text-xs text-gray-500 mb-1">MUSICA</div>
                                            <div className="text-gray-700 dark:text-gray-300">{prompt.musica}</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-xs text-gray-500 mb-1">SEGMENTACION</div>
                                            <div className="text-gray-700 dark:text-gray-300 text-xs space-y-1">
                                                <div>Edad: {prompt.segmentacion.edad}</div>
                                                <div>Ubicacion: {prompt.segmentacion.ubicacion}</div>
                                                <div>Plataformas: {prompt.segmentacion.plataformas}</div>
                                                <div>Intereses: {prompt.segmentacion.intereses}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(buildFullPrompt(prompt), prompt.id) }}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                                    >
                                        {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copiedId === prompt.id ? 'Copiado!' : 'Copiar prompt completo'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
