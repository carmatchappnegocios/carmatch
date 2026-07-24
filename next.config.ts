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
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
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
                    }
                ]
            }
        ];
    }
};



export default nextConfig;
