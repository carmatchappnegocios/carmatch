import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false, // Disable to fix Leaflet "Map container already initialized" error
    compress: true, // 🚀 Enable Gzip/Brotli compression
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    experimental: {
        // 🔧 DESACTIVADO TEMPORALMENTE para depuración de raíz
        // optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'image.pollinations.ai',
            },
            {
                protocol: 'https',
                hostname: 'replicate.delivery',
            },
            {
                protocol: 'https',
                hostname: 'replicate.com', // Just in case
            }
        ],
        // 💰 OPTIMIZACIÓN PARA 100M USUARIOS
        formats: ['image/webp', 'image/avif'], // 30-50% más ligero que JPEG
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Tamaños de dispositivos comunes
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Para iconos y thumbnails
        minimumCacheTTL: 2592000, // 30 días de caché (reduce bandwidth 60%)
        dangerouslyAllowSVG: false, // Seguridad: bloquear SVGs
        contentDispositionType: 'attachment', // Prevenir XSS
        unoptimized: false, // Siempre optimizar
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    async headers() {
        return [
            {
                source: '/admin/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'credentialless',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://*.mapbox.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://*.mapbox.com https://api.mapbox.com https://events.mapbox.com https://res.cloudinary.com https://www.google-analytics.com https://www.googletagmanager.com wss://carmatchapp.net ws://localhost:3001; worker-src 'self' blob:; child-src blob:; frame-src 'none';"
                    }
                ]
            }
        ];
    }
};



export default nextConfig;
