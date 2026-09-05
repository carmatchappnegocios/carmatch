'use client'

import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BlogPost {
    slug: string
    title: string
    description: string
    category: string
    readTime: number
    author: string
    publishedAt: string
    updatedAt: string
    image?: string
    tags: string[]
    content: string
}

interface BlogPostClientProps {
    post: BlogPost
    relatedPosts: BlogPost[]
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
    const { t } = useLanguage()

    return (
        <article className="max-w-3xl mx-auto px-4 py-12">
            {/* Back Link */}
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary-400 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver al Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold uppercase border border-primary-500/20">
                        {post.category}
                    </span>
                    <span className="text-zinc-500 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime} min de lectura
                    </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-tight mb-4">
                    {post.title}
                </h1>

                <p className="text-zinc-400 text-lg mb-6">
                    {post.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {post.author}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </header>

            {/* Content */}
            <div
                className="prose prose-invert prose-lg max-w-none
                    prose-headings:text-white prose-headings:font-black
                    prose-p:text-zinc-300 prose-p:leading-relaxed
                    prose-strong:text-primary-400
                    prose-li:text-zinc-300
                    prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-white/5 text-zinc-400 rounded-full text-xs flex items-center gap-1"
                        >
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-xl font-bold mb-6">{t('blog_related.related_articles')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {relatedPosts.map(related => (
                            <Link
                                key={related.slug}
                                href={`/blog/${related.slug}`}
                                className="block p-4 bg-[#111114] rounded-xl border border-white/5 hover:border-primary-500/30 transition-all"
                            >
                                <span className="text-xs text-primary-400 font-bold uppercase">{related.category}</span>
                                <h4 className="text-white font-bold mt-1 mb-2 line-clamp-2">{related.title}</h4>
                                <p className="text-zinc-400 text-sm line-clamp-2">{related.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="mt-12 p-6 bg-primary-500/10 rounded-2xl border border-primary-500/20 text-center">
                <h3 className="text-xl font-bold mb-2">¿Necesitas vender o comprar un auto?</h3>
                <p className="text-zinc-400 mb-4">{t('blog_related.publish_free')}</p>
                <Link
                    href="/publish"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
                >
                    Publicar Gratis
                </Link>
            </div>
        </article>
    )
}
