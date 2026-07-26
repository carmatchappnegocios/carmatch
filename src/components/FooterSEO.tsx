"use client"

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const SEOCities = [
    { name: 'Monterrey', path: 'monterrey' },
    { name: 'Guadalajara', path: 'guadalajara' },
    { name: 'Ciudad de México', path: 'cdmx' },
    { name: 'Tijuana', path: 'tijuana' },
    { name: 'Puebla', path: 'puebla' },
    { name: 'Querétaro', path: 'queretaro' },
    { name: 'Mérida', path: 'merida' },
    { name: 'León', path: 'leon' },
];

const SEOCategories = [
    { name: 'Taller Mecánico', slug: 'mecanico' },
    { name: 'Desponchadoras', slug: 'llantera' },
    { name: 'Grúas 24 Hrs', slug: 'gruas' },
    { name: 'Autolavados', slug: 'estetica' },
    { name: 'Refaccionarias', slug: 'refacciones' },
    { name: 'Cerrajería', slug: 'cerrajeria' },
];

const VehicleTypes = ['Sedán', 'SUV', 'Pickup', 'Motocicleta', 'Camión Diésel', 'Maquinaria'];

export default function FooterSEO() {
    const { t } = useLanguage()
    return (
        <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-6 mt-8">
            <div className="max-w-7xl mx-auto">
                <details className="group bg-slate-900/50 rounded-2xl border border-white/5 p-4 transition-all duration-300">
                    <summary className="cursor-pointer text-slate-400 hover:text-white text-sm sm:text-base font-bold flex items-center justify-between outline-none list-none marker:hidden">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            {t('footer.global_directory')}
                        </div>
                        <span className="transition duration-300 group-open:rotate-180 bg-surface-highlight/50 p-1.5 rounded-full">
                            <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><polyline points="6 9 12 15 18 9"/></svg>
                        </span>
                    </summary>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-4">
                        {/* Columna 1: Autos por Ciudades Top */}
                        <div>
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('footer.top_locations')}</h3>
                            <ul className="space-y-2">
                                {SEOCities.map((city) => (
                                    <li key={`auto-${city.path}`}>
                                        <Link 
                                            href={`/autos-en/${city.path}`} 
                                            className="text-slate-400 hover:text-primary-400 transition-colors text-xs"
                                        >
                                            {t('footer.used_cars_in').replace('{city}', city.name)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Columna 2: Negocios MapStore por Categoria */}
                        <div>
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('footer.services')}</h3>
                            <ul className="space-y-2">
                                {SEOCategories.map((cat) => (
                                    <li key={`map-${cat.slug}`}>
                                        <Link 
                                            href={`/map-store?category=${cat.slug}`} 
                                            className="text-slate-400 hover:text-primary-400 transition-colors text-xs"
                                        >
                                            {cat.name} {t('footer.near_me')}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Columna 3: Tipos de Vehículos */}
                        <div>
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('footer.vehicles')}</h3>
                            <ul className="space-y-2">
                                {VehicleTypes.map((type) => (
                                    <li key={`type-${type}`}>
                                        <Link 
                                            href={`/market?query=${type}`} 
                                            className="text-slate-400 hover:text-primary-400 transition-colors text-xs"
                                        >
                                            {t('footer.sale_of').replace('{type}', type)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Columna 4: Enlaces Importantes */}
                        <div>
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('footer.quick_links')}</h3>
                            <ul className="space-y-2">
                                <li><Link href="/market" className="text-slate-400 hover:text-white text-xs block bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition w-fit">{t('footer.global_marketplace')}</Link></li>
                                <li><Link href="/map-store" className="text-slate-400 hover:text-white text-xs block bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition w-fit mt-1">MapStore 24/7</Link></li>
                                <li><Link href="/swipe" className="text-slate-400 hover:text-white text-xs block bg-primary-600/20 text-primary-400 px-3 py-1.5 rounded-lg hover:bg-primary-600/30 transition w-fit mt-1 border border-primary-500/20">CarMatch Swipe</Link></li>
                            </ul>
                        </div>
                    </div>
                </details>

                <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
                    <div className="font-medium text-center md:text-left mb-4 md:mb-0">
                        © {new Date().getFullYear()} CarMatch Social.<br className="md:hidden" />
                        <span className="hidden md:inline"> - </span>{t('footer.tagline')}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/terms" className="hover:text-white transition">{t('footer.privacy_terms')}</Link>
                        <Link href="/publishing-rules" className="hover:text-white transition">{t('footer.publishing_rules')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
