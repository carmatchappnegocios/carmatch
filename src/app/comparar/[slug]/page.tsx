
import { prisma } from "@/lib/db"
import { Metadata } from 'next'
import Image from 'next/image'

import { Check, X, ShieldCheck, Zap, Info, ArrowLeft } from 'lucide-react'
import Link from "next/link"

interface Props {
    params: Promise<{ slug: string }>
}

function parseVsSlugs(slug: string) {
    return slug.split('-vs-')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const slugs = parseVsSlugs(slug)
    const names = slugs.map(s => s.split('-').slice(0, -1).join(' ').toUpperCase())

    const title = `✓ ${names.join(' vs ')}: Comparativa Técnica | CarMatch®`
    return {
        title,
        description: `Duelo de titanes: ${names.join(' vs ')}. Comparamos specs, motores, seguridad y precios para ayudarte a decidir tu próxima compra en CarMatch.`,
    }
}

export default async function ComparativePage({ params }: Props) {
    const { slug } = await params
    const slugs = parseVsSlugs(slug)

    // Helper to find representative vehicle
    const findVehicle = async (term: string) => {
        const parts = term.split('-')
        const id = parts[parts.length - 1] // Last part is ID
        
        // Try finding by ID first
        if (id && id.length > 10) { // Simple check if it looks like a cuid/uuid
            const v = await prisma.vehicle.findUnique({
                where: { id },
            })
            if (v) return v
        }

        // Fallback to fuzzy search if ID fails
        const brand = parts[0]
        const model = parts.slice(1, -1).join(' ')

        return await prisma.vehicle.findFirst({
            where: {
                brand: { contains: brand, mode: 'insensitive' },
                model: { contains: model, mode: 'insensitive' },
                status: 'ACTIVE'
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    const vehicles = await Promise.all(slugs.map(s => findVehicle(s)))
    const activeVehicles = vehicles.filter((v): v is NonNullable<typeof v> => v !== null)

    if (activeVehicles.length < 2) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
                <Info size={48} className="text-primary-500" />
                <h1 className="text-2xl font-bold">Comparativa insuficiente</h1>
                <p className="text-text-secondary">Necesitamos al menos 2 vehículos para realizar una comparativa técnica.</p>
                <Link href="/market" className="px-6 py-2 bg-primary-600 rounded-full font-bold">Ir al MarketCar</Link>
            </div>
        )
    }

    const specs = [
        { label: 'Precio', key: 'price', format: (v: any) => `$${v.price.toLocaleString()} ${v.currency || 'MXN'}` },
        { label: 'Motor', key: 'engine' },
        { label: 'Transmisión', key: 'transmission' },
        { label: 'Tracción', key: 'traction' },
        { label: 'Combustible', key: 'fuel' },
        { label: 'Año', key: 'year' },
        { label: 'Kilometraje', key: 'mileage', format: (v: any) => `${v.mileage?.toLocaleString() || 0} ${v.mileageUnit || 'km'}` },
        { label: 'Pasajeros', key: 'passengers' },
    ]

    return (
        <main className="min-h-screen bg-background pb-20">


            <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                     <Link
                        href="/favorites"
                        className="inline-flex items-center text-text-secondary hover:text-primary-400 transition"
                    >
                        <ArrowLeft className="mr-2" size={20} />
                        Volver a Favoritos
                    </Link>
                </div>

                <div className="text-center mb-16">
                    <span className="px-4 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-black uppercase tracking-widest border border-primary-500/20 mb-4 inline-block">Duelo de Titanes</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        {activeVehicles.map((v, i) => (
                            <span key={v.id}>
                                {v.brand} {i < activeVehicles.length - 1 && <span className="text-primary-500 mx-2">VS</span>}
                            </span>
                        ))}
                    </h1>
                    <p className="text-lg text-text-secondary max-w-3xl mx-auto">
                        Comparativa técnica detallada entre {activeVehicles.map(v => v.model).join(', ')}. ¿Cuál merece un lugar en tu cochera?
                    </p>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-${activeVehicles.length} gap-6 md:gap-8`}>
                    {activeVehicles.map((vehicle, idx) => (
                        <div key={vehicle.id} className="space-y-6">
                            <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-highlight border border-white/5 relative group shadow-2xl">
                                <Image src={vehicle.images[0]} alt={vehicle.title} width={400} height={400} unoptimized className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <h2 className="text-2xl font-black text-white leading-tight">{vehicle.brand} {vehicle.model}</h2>
                                    <p className="text-primary-400 font-black text-xl">${vehicle.price.toLocaleString()} {vehicle.currency}</p>
                                </div>
                                <div className="absolute top-4 right-4 bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black italic shadow-lg">
                                    {idx + 1}
                                </div>
                            </div>

                            <div className="bg-surface/30 backdrop-blur-sm border border-surface-highlight rounded-[2rem] p-6 space-y-2">
                                {specs.map(spec => (
                                    <div key={spec.key} className="flex flex-col py-3 border-b border-white/5 last:border-0">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{spec.label}</span>
                                        <span className="text-sm font-bold text-text-primary">
                                            {spec.format ? spec.format(vehicle) : ((vehicle as any)[spec.key] || 'N/A')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link 
                                href={`/vehicle/${vehicle.id}`} 
                                className={`block w-full py-4 text-center rounded-2xl font-black transition shadow-xl ${
                                    idx === 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-500'
                                }`}
                            >
                                VER DETALLES
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Verdict Section */}
                <div className="mt-20 p-8 md:p-12 bg-primary-950/20 border-2 border-primary-500/20 rounded-[3rem] text-center border-dashed relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-4 tracking-tighter">VEREDICTO CARMATCH SOCIAL</h3>
                        <p className="text-text-secondary mb-8 max-w-4xl mx-auto leading-relaxed italic">
                            Esta comparativa destaca las fortalezas individuales de cada ingeniería. El <span className="text-white font-bold">{activeVehicles[0].brand} {activeVehicles[0].model}</span> representa una opción sólida en su segmento, mientras que {activeVehicles.length > 2 ? 'las demás opciones ofrecen' : 'el ' + activeVehicles[1].brand + ' ' + activeVehicles[1].model + ' ofrece'} matices técnicos que pueden inclinar la balanza según tu estilo de vida. La decisión final depende de tu pasión y presupuesto.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                <ShieldCheck className="text-green-500" size={18} />
                                <span className="text-xs font-black uppercase">Compra Protegida</span>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                <Zap className="text-amber-500" size={18} />
                                <span className="text-xs font-black uppercase">Verificado por Expertos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
