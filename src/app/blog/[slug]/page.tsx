import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { blogPosts, getBlogPost, getAllBlogSlugs } from '@/data/blog-posts'
import BlogPostClient from './BlogPostClient'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return getAllBlogSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getBlogPost(slug)

    if (!post) {
        return { title: 'Articulo no encontrado | CarMatch' }
    }

    return {
        title: `${post.title} | Blog CarMatch`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            url: `https://www.carmatchapp.net/blog/${post.slug}`,
            siteName: 'CarMatch',
            locale: 'es_MX',
            type: 'article',
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author],
            tags: post.tags
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description
        },
        alternates: {
            canonical: `https://www.carmatchapp.net/blog/${post.slug}`
        }
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = getBlogPost(slug)

    if (!post) {
        notFound()
    }

    const relatedPosts = blogPosts
        .filter(p => p.slug !== post.slug && p.category === post.category)
        .slice(0, 2)

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <BlogPostClient post={post} relatedPosts={relatedPosts} />

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: post.title,
                        description: post.description,
                        image: post.image || 'https://www.carmatchapp.net/og-blog.png',
                        datePublished: post.publishedAt,
                        dateModified: post.updatedAt,
                        author: {
                            '@type': 'Person',
                            name: post.author
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'CarMatch',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.carmatchapp.net/logo.png'
                            }
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': `https://www.carmatchapp.net/blog/${post.slug}`
                        },
                        keywords: post.tags.join(', '),
                        articleSection: post.category
                    })
                }}
            />
        </div>
    )
}
