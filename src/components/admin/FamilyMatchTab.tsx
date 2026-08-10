'use client'

import { useState } from 'react'
import { Download, User, Eye, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface Character {
    id: string
    name: string
    age: number
    role: string
    phrase: string
    color: string
    colorHex: string
    personality: string
    physical: {
        skin: string
        hair: string
        eyes: string
        body: string
    }
    outfit: {
        jacket: string
        top: string
        pants: string
        shoes: string
        accessories: string[]
    }
    prompts: {
        portrait: string
        social: string
        thumbnail: string
    }
    expressions: string[]
    neverHave: string[]
    svgUrl: string
}

const characters: Character[] = [
    {
        id: 'don-match',
        name: 'Don Match',
        age: 45,
        role: 'Patriarca / Emprendedor',
        phrase: 'Si existe, se publica en CarMatch',
        color: 'Azul Marino',
        colorHex: '#0f172a',
        personality: 'Emprendedor nato, trabajador incansable, conoce a todos en el barrio. Siempre tiene la solución.',
        physical: {
            skin: 'Morena clara, bronceada',
            hair: 'Corto, negro con canas en las sienes',
            eyes: 'Café oscuro, mirada directa y confiada',
            body: 'Media, atlética para su edad, 1.78m'
        },
        outfit: {
            jacket: 'Chaqueta bomber azul oscuro (#0f172a) con logo naranja',
            top: 'Camiseta blanca limpia o camisa a cuadros',
            pants: 'Jeans oscuros o pantalón casual',
            shoes: 'Tenis blancos limpios',
            accessories: ['Celular mostrando la app', 'Reloj simple', 'Llavero con llave de auto']
        },
        prompts: {
            portrait: 'Mexican man, 45 years old, short black hair with gray temples, neatly trimmed 3-day beard, warm brown eyes, confident smile, wearing a dark navy blue bomber jacket with small orange car logo on left chest over white t-shirt, dark jeans, clean white sneakers, holding smartphone showing a car app, warm golden hour lighting, photorealistic portrait photography, friendly and trustworthy expression, urban background slightly blurred, 1024x1024',
            social: 'Mexican man in his 40s, confident stance, wearing dark navy blue jacket with orange logo, standing next to a modern car, pointing at smartphone screen, warm lighting, professional photography, approachable expression, urban street background, 1080x1920 vertical format',
            thumbnail: 'Mexican man 45, short black hair gray temples, trimmed beard, navy blue jacket orange logo, confident smile, holding phone, warm lighting, 512x512'
        },
        expressions: ['Confianza (sonrisa amplia)', 'Resolución (señalando)', 'Sorpresa (cejas levantadas)', 'Celebración (puño levantado)'],
        neverHave: ['Barba larga', 'Cabello largo', 'Ropa formal completa', 'Tatuajes visibles', 'Piercing'],
        svgUrl: '/familia-match/don-match/avatar.svg'
    },
    {
        id: 'car-mela',
        name: 'Car-mela',
        age: 42,
        role: 'Matriarca / Organizadora',
        phrase: 'Detrás de gran negocio, hay una gran mujer organizándolo todo',
        color: 'Naranja Cálido',
        colorHex: '#FF6B2C',
        personality: 'Columna vertebral de la familia, organizada, detallista, inteligente emocionalmente.',
        physical: {
            skin: 'Morena media, luminosa',
            hair: 'Castaño oscuro, largo hasta los hombros, ondas suaves',
            eyes: 'Café miel, expresivos y cálidos',
            body: 'Media, elegante, 1.65m'
        },
        outfit: {
            jacket: 'Chaqueta corta femenina azul oscuro con logo naranja',
            top: 'Blusa blanca o crema',
            pants: 'Jeans slim fit oscuros',
            shoes: 'Tenis blancos o botines de cuero',
            accessories: ['Celular o bolso pequeño', 'Aretes pequeños dorados', 'Pulsera simple']
        },
        prompts: {
            portrait: 'Mexican woman, 42 years old, long brown hair with soft waves, warm hazel eyes, kind smile, wearing a dark navy blue fitted jacket with small orange car logo on left chest over cream blouse, dark slim jeans, clean white sneakers, holding clipboard or smartphone, warm studio lighting, photorealistic portrait photography, organized and confident expression, modern home office background, 1024x1024',
            social: 'Mexican woman in her 40s, confident and organized, wearing dark navy blue jacket with orange logo, standing next to a family car, checking phone with checklist app, warm lighting, professional photography, approachable motherly expression, suburban home background, 1080x1920 vertical format',
            thumbnail: 'Mexican woman 42, long brown wavy hair, warm hazel eyes, navy blue fitted jacket orange logo, cream blouse, organized, 512x512'
        },
        expressions: ['Organizando (mirando celular)', 'Cuidando (sonrisa cálida)', 'Resolviendo (decidida)', 'Celebrando (manos juntas)'],
        neverHave: ['Cabello muy corto', 'Maquillaje excesivo', 'Ropa de dormir', 'Tatuajes visibles', 'Piercing facial'],
        svgUrl: '/familia-match/car-mela/avatar.svg'
    },
    {
        id: 'matchy',
        name: 'Matchy',
        age: 20,
        role: 'Influencer Gen Z',
        phrase: 'Si no está en TikTok, no existe',
        color: 'Púrpura Vibrante',
        colorHex: '#8B5CF6',
        personality: 'La influencer de la familia, creativa, conectada con Gen Z, siempre creando contenido.',
        physical: {
            skin: 'Morena clara, luminosa',
            hair: 'Negro azabache, largo, con mechas púrpura',
            eyes: 'Café oscuro, grandes, expresivos',
            body: 'Delgada, atlética, 1.68m'
        },
        outfit: {
            jacket: 'Chaqueta oversized azul oscuro con logo naranja',
            top: 'Crop top blanco o negro',
            pants: 'Jeans mom fit o wide leg',
            shoes: 'Tenis chunky blancos',
            accessories: ['Celular filmando', 'Audífonos Bluetooth', 'Gorra al revés', 'Pulseras coloridas']
        },
        prompts: {
            portrait: 'Mexican young woman, 20 years old, long straight black hair with purple highlights, large brown eyes, natural makeup with subtle eyeliner, trendy Gen Z style, wearing an oversized dark navy blue jacket with small orange car logo on left chest over white crop top, wide leg jeans, chunky white sneakers, holding smartphone filming, vibrant purple accent lighting, photorealistic portrait photography, energetic and creative expression, modern urban background with neon signs, 1024x1024',
            social: 'Mexican Gen Z woman, 20 years old, energetic pose, wearing dark navy blue jacket with orange logo, holding phone on selfie stick, filming content, vibrant lighting, professional photography, confident influencer expression, city street background, 1080x1920 vertical format',
            thumbnail: 'Mexican girl 20, long black hair purple highlights, trendy Gen Z, navy blue oversized jacket orange logo, crop top, filming phone, 512x512'
        },
        expressions: ['Filmando (celular en alto)', 'Reaccionando (boca abierta)', 'Enseñando (señalando app)', 'Celebrando (bailando)'],
        neverHave: ['Cabello corto pixie', 'Maquillaje neón excesivo', 'Ropa de oficina', 'Lentes muy oscuros', 'Piercing excesivo'],
        svgUrl: '/familia-match/matchy/avatar.svg'
    },
    {
        id: 'car-litos',
        name: 'Car-litos',
        age: 18,
        role: 'Aventurero / Mecánico',
        phrase: 'Si tiene motor, lo revolucionamos',
        color: 'Rojo Deportivo',
        colorHex: '#EF4444',
        personality: 'El más joven, aventurero, apasionado por autos y la mecánica. Energía pura.',
        physical: {
            skin: 'Morena clara, bronceada',
            hair: 'Negro, corto, texturizado con mecha naranja',
            eyes: 'Café oscuro, brillantes, llenos de energía',
            body: 'Atlética, delgada pero definida, 1.75m'
        },
        outfit: {
            jacket: 'Chaqueta bomber deportiva azul oscuro con logo naranja',
            top: 'Camiseta negra o gris',
            pants: 'Jeans oscuros o joggers',
            shoes: 'Tenis deportivos running o skate',
            accessories: ['Celular en bolsillo', 'Guantes de mecánico', 'Llavero con herramientas', 'Reloj deportivo']
        },
        prompts: {
            portrait: 'Mexican young man, 18 years old, short textured black hair with subtle orange streak, bright brown eyes, mischievous smile, athletic build, wearing a dark navy blue bomber jacket with small orange car logo on left chest over black t-shirt, dark joggers or jeans, athletic sneakers, holding car keys or wrench, warm golden hour lighting, photorealistic portrait photography, energetic and adventurous expression, garage or auto shop background, 1024x1024',
            social: 'Mexican teenager, 18 years old, energetic stance, wearing dark navy blue jacket with orange logo, standing next to sports car or motorcycle, holding helmet or tool, dynamic lighting, professional photography, excited and passionate expression, racetrack or garage background, 1080x1920 vertical format',
            thumbnail: 'Mexican boy 18, short textured black hair orange streak, athletic, navy blue bomber jacket orange logo, black t-shirt, car keys, 512x512'
        },
        expressions: ['Trabajando (concentrado)', 'Conduciendo (emocionado)', 'Enseñando (señalando auto)', 'Celebrando (puño levantado)'],
        neverHave: ['Cabello largo', 'Barba completa', 'Ropa formal', 'Zapatos de vestir', 'Expresión aburrida'],
        svgUrl: '/familia-match/car-litos/avatar.svg'
    }
]

const villains = [
    { id: 'el-bache', name: 'El Bache', realName: 'Don Bacho', problem: 'Destruye suspensiones, llantas, rines. $2,000-$5,000 de reparación', hero: 'Don Match', svg: '/familia-match/villanos/el-bache.svg' },
    { id: 'la-agencia', name: 'La Agencia', realName: 'Don Comisión', problem: 'Comisiones del 15-30%, presión para comprar', hero: 'Car-mela', svg: '/familia-match/villanos/la-agencia.svg' },
    { id: 'mecanico-tranero', name: 'Mecánico Trantero', realName: 'Don Trantero', problem: 'Cobra de más, no arregla nada, repuestos usados', hero: 'Don Match', svg: '/familia-match/villanos/mecanico-tranero.svg' },
    { id: 'estafa-odometro', name: 'Estafa Odómetro', realName: 'Don Kilometraje', problem: 'Kilometraje falsificado, venden chatarra', hero: 'Matchy', svg: '/familia-match/villanos/estafa-odometro.svg' },
    { id: 'vendedor-informal', name: 'Vendedor Informal', realName: 'Don Informal', problem: 'Problemas ocultos, sin garantía, desaparece', hero: 'Car-mela', svg: '/familia-match/villanos/vendedor-informal.svg' },
    { id: 'perfiles-falsos', name: 'Perfiles Falsos', realName: 'Don Perfil', problem: 'Estafadores en Marketplace, fotos de stock', hero: 'Matchy', svg: '/familia-match/villanos/perfiles-falsos.svg' },
    { id: 'gasolinazo', name: 'Gasolinazo', realName: 'Don Gasolina', problem: 'Gasolina cara + auto gastón = bolsillo vacío', hero: 'Car-litos', svg: '/familia-match/villanos/gasolinazo.svg' },
    { id: 'multa-sorpresa', name: 'Multa Sorpresa', realName: 'Don Multa', problem: 'Multas que no esperabas, infracciones invisibles', hero: 'Car-mela', svg: '/familia-match/villanos/multa-sorpresa.svg' },
    { id: 'robo-auto', name: 'Robo Auto', realName: 'Don Ratero', problem: 'Robo vehicular, inseguridad, pérdida total', hero: 'Car-litos', svg: '/familia-match/villanos/robo-auto.svg' },
    { id: 'seguro-caro', name: 'Seguro Caro', realName: 'Don Seguro', problem: 'Seguros abusivos, cobertura mínima', hero: 'Car-mela', svg: '/familia-match/villanos/seguro-caro.svg' },
]

export default function FamilyMatchTab() {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedPrompt(id)
        setTimeout(() => setCopiedPrompt(null), 2000)
    }

    const downloadSvg = (char: Character) => {
        const link = document.createElement('a')
        link.href = char.svgUrl
        link.download = `${char.id}-avatar.svg`
        link.click()
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">La Familia Match</h2>
                    <p className="text-zinc-500 text-sm">Personajes de marketing para contenido viral</p>
                </div>
            </div>

            {/* Family Group Preview */}
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-lg">Vista Previa de la Familia</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {characters.map((char) => (
                        <div key={char.id} className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/10 mb-2">
                                <img src={char.svgUrl} alt={char.name} className="w-full h-full object-cover" />
                            </div>
                            <p className="font-bold text-sm" style={{ color: char.colorHex }}>{char.name}</p>
                            <p className="text-zinc-500 text-xs">{char.age} años</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Characters Grid */}
            <div className="grid gap-4">
                {characters.map((char) => (
                    <div key={char.id} className="bg-[#09090b] border border-white/5 rounded-2xl overflow-hidden">
                        {/* Character Header */}
                        <div className="p-4 md:p-6 flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: char.colorHex }}>
                                <img src={char.svgUrl} alt={char.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-black text-xl" style={{ color: char.colorHex }}>{char.name}</h3>
                                    <span className="text-zinc-500 text-sm">({char.age} años)</span>
                                </div>
                                <p className="text-zinc-400 text-sm font-medium">{char.role}</p>
                                <p className="text-zinc-600 text-xs italic mt-1">"{char.phrase}"</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => downloadSvg(char)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                    title="Descargar SVG"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setExpandedId(expandedId === char.id ? null : char.id)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                >
                                    {expandedId === char.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === char.id && (
                            <div className="border-t border-white/5 p-4 md:p-6 space-y-6">
                                {/* Physical Description */}
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-400 mb-3 uppercase tracking-wider">Físico</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Piel</p>
                                            <p className="text-sm">{char.physical.skin}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Cabello</p>
                                            <p className="text-sm">{char.physical.hair}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Ojos</p>
                                            <p className="text-sm">{char.physical.eyes}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Complexión</p>
                                            <p className="text-sm">{char.physical.body}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Outfit */}
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-400 mb-3 uppercase tracking-wider">Uniforme</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Chaqueta</p>
                                            <p className="text-sm">{char.outfit.jacket}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Parte superior</p>
                                            <p className="text-sm">{char.outfit.top}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Pantalón</p>
                                            <p className="text-sm">{char.outfit.pants}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-zinc-500 text-xs">Zapatos</p>
                                            <p className="text-sm">{char.outfit.shoes}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 col-span-2">
                                            <p className="text-zinc-500 text-xs">Accesorios</p>
                                            <p className="text-sm">{char.outfit.accessories.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Prompts */}
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-400 mb-3 uppercase tracking-wider">Prompts para IA</h4>
                                    <div className="space-y-3">
                                        {Object.entries(char.prompts).map(([key, prompt]) => (
                                            <div key={key} className="bg-white/5 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-zinc-500 text-xs uppercase tracking-wider">{key === 'portrait' ? 'Retrato' : key === 'social' ? 'Redes Sociales' : 'Thumbnail'}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(prompt, `${char.id}-${key}`)}
                                                        className="p-1 rounded hover:bg-white/10 transition"
                                                    >
                                                        {copiedPrompt === `${char.id}-${key}` ? (
                                                            <Check className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-zinc-500" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-zinc-300 font-mono leading-relaxed">{prompt}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expressions */}
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-400 mb-3 uppercase tracking-wider">Expresiones</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {char.expressions.map((expr, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs">{expr}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Never Have */}
                                <div>
                                    <h4 className="font-bold text-sm text-red-400 mb-3 uppercase tracking-wider">Nunca Debe Tener</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {char.neverHave.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Villains Section */}
            <div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xl">😈</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Los Villanos</h3>
                        <p className="text-zinc-500 text-sm">Los enemigos de la Familia Match</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {villains.map((villain) => (
                        <div key={villain.id} className="bg-[#09090b] border border-white/5 rounded-xl p-4 text-center hover:border-red-500/30 transition">
                            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-red-500/30 mb-3">
                                <img src={villain.svg} alt={villain.name} className="w-full h-full object-cover" />
                            </div>
                            <p className="font-bold text-sm text-red-400">{villain.name}</p>
                            <p className="text-zinc-500 text-xs mt-1">{villain.realName}</p>
                            <p className="text-zinc-600 text-[10px] mt-2 line-clamp-2">{villain.problem}</p>
                            <div className="mt-2 flex items-center justify-center gap-1">
                                <span className="text-[10px] text-zinc-600">Derrota:</span>
                                <span className="text-[10px] text-primary-400 font-medium">{villain.hero}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
