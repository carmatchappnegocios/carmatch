// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/llms.txt'],
                disallow: ['/admin/', '/api/', '/messages/', '/settings/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/messages/', '/settings/'],
                crawlDelay: 0
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/messages/', '/settings/'],
            },
            // 🤖 AI Crawler Allowlist (GEO - Generative Engine Optimization)
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'cohere-ai'],
                allow: ['/', '/llms.txt'],
                disallow: ['/admin/', '/api/', '/messages/', '/settings/'],
            }
        ],
        sitemap: 'https://carmatchapp.net/sitemap.xml',
        host: 'https://carmatchapp.net'
    }
}
