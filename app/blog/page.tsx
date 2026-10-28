import { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts, getAllCategories } from '@/data/blog-posts'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Blog | CarMatch - Consejos de Autos y Negocios Automotrices',
    description: 'Articulos sobre compra y venta de autos, mantenimiento, talleres y negocios automotrices en Mexico. Consejos de expertos para automovilistas.',
    openGraph: {
        title: 'Blog CarMatch',
        description: 'Consejos de expertos para automovilistas mexicanos',
        url: 'https://www.carmatchapp.net/blog',
        siteName: 'CarMatch',
        locale: 'es_MX',
        type: 'website'
    },
    alternates: {
        canonical: 'https://www.carmatchapp.net/blog'
    }
}

export default function BlogPage() {
    const categories = getAllCategories()

    return (
        <div className="bg-[#0a0a0f] text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">
                        Blog <span className="text-primary-400">CarMatch</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Consejos de expertos para automovilistas, mecanicos y negocios automotrices en Mexico
                    </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {categories.map(category => (
                        <span key={category} className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium border border-primary-500/20">
                            {category}
                        </span>
                    ))}
                </div>

                {/* Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map(post => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group block bg-[#111114] rounded-2xl border border-white/5 overflow-hidden hover:border-primary-500/30 transition-all duration-300"
                        >
                            {/* Image placeholder */}
                            <div className="h-48 bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center">
                                <span className="text-6xl opacity-30">
                                    {post.category === 'Venta de Vehiculos' && '🚗'}
                                    {post.category === 'Mantenimiento' && '🔧'}
                                    {post.category === 'Compra de Vehiculos' && '🛒'}
                                    {post.category === 'Negocios' && '🏪'}
                                </span>
                            </div>

                            <div className="p-6">
                                {/* Category & Read Time */}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-bold text-primary-400 uppercase">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime} min
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                                    {post.title}
                                </h2>

                                {/* Description */}
                                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                                    {post.description}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.publishedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    <span className="text-primary-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Leer <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* SEO Text */}
                <div className="mt-16 max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">CarMatch Blog: Tu Fuente de Informacion Automotriz</h2>
                    <p className="text-zinc-400">
                        Encuentra los mejores consejos para comprar, vender y mantener tu auto en Mexico.
                        Nuestros expertos comparten anos de experiencia para que tomes las mejores decisiones.
                        Desde guias de compra hasta tips de mantenimiento, aqui tienes todo lo que necesitas saber.
                    </p>
                </div>
            </div>

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Blog',
                        name: 'Blog CarMatch',
                        description: 'Consejos de expertos para automovilistas mexicanos',
                        url: 'https://www.carmatchapp.net/blog',
                        publisher: {
                            '@type': 'Organization',
                            name: 'CarMatch',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.carmatchapp.net/logo.png'
                            }
                        },
                        blogPost: blogPosts.map(post => ({
                            '@type': 'BlogPosting',
                            headline: post.title,
                            description: post.description,
                            url: `https://www.carmatchapp.net/blog/${post.slug}`,
                            datePublished: post.publishedAt,
                            dateModified: post.updatedAt,
                            author: {
                                '@type': 'Person',
                                name: post.author
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: 'CarMatch'
                            }
                        }))
                    })
                }}
            />
        </div>
    )
}
