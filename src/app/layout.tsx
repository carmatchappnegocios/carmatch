
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 🚀 Vercel Deployment Trigger: 0.1.4

import Providers from "@/components/Providers";
import MobileNav from "@/components/MobileNav";
import OpenInBrowserBanner from "@/components/OpenInBrowserBanner";
// import { ResponsiveViewportFix } from "./responsive-viewport-fix";
import RestoringSessionOverlay from "@/components/RestoringSessionOverlay";
import RestoreSessionModal from "@/components/RestoreSessionModal";
import { Toaster } from "sonner";

import InstallInvasiveBanner from "@/components/InstallInvasiveBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import FooterSEO from "@/components/FooterSEO";
import BetaSessionTracker from "@/components/BetaSessionTracker";
import GlobalSOSWatcher from "@/components/GlobalSOSWatcher";
import DynamicHeader from "@/components/DynamicHeader";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("https://www.carmatchapp.net"),
    title: "CarMatch | Compra y Vende Autos Gratis en México",
    description: "La red social automotriz #1 de México. Vende tu auto sin comisiones, encuentra talleres mecánicos 24/7 y descubre tu próximo vehículo.",
    alternates: {
        canonical: "https://www.carmatchapp.net",
        languages: {
            'es': 'https://www.carmatchapp.net',
        },
    },
    verification: {
        google: "SvcQwBoBmW_4aag-2hKwxP_r7YXuoARuC9sMyJ41wcs",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    keywords: [
        "vender auto gratis", "compra venta autos mexico", "autos usados", 
        "mecanicos 24 horas", "car match", "red social automotriz",
        "donde vender mi carro rapido", "comprar auto usado seguro", 
        "vender carro sin intermediarios", "marketplace autos confiable", 
        "comprar carro particular", "autos usados certificados"
    ],
    manifest: "/site.webmanifest",
    authors: [{ name: "CarMatch" }],
    creator: "CarMatch",
    publisher: "CarMatch",
    other: {
        'fb:app_id': '1792641761453760',
    },
    openGraph: {
        type: "website",
        locale: "es_MX",
        url: "https://www.carmatchapp.net",
        siteName: "CarMatch Social",
        title: "CarMatch | Vende tu Auto Gratis en México",
        description: "Publica tu vehículo gratis y sin comisiones. Encuentra mecánicos y servicios 24/7 en nuestra comunidad.",
        images: [
            {
                url: "https://www.carmatchapp.net/portada_1024x500.png?v=23",
                width: 1024,
                height: 500,
                alt: "CarMatch",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "CarMatch | Compra y Vende Autos Gratis en México",
        description: "La red social automotriz que revoluciona el mercado. Publica gratis y encuentra talleres 24/7.",
        images: ["https://www.carmatchapp.net/portada_1024x500.png?v=23"],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "CarMatch",
    },
    icons: {
        icon: [
            { url: "/icon-192-v20.png?v=22", sizes: "192x192" },
            { url: "/favicon-v20.png?v=22", sizes: "32x32" },
        ],
        shortcut: "/icon-192-v20.png?v=22",
        apple: "/icon-192-v20.png?v=22",
        other: [
            {
                rel: 'maskable-icon',
                url: '/maskable-192-v20.png?v=22',
            },
        ],
    }
};

export const viewport: Viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    colorScheme: "dark",
};



import PushNotificationRequest from "@/components/PushNotificationRequest";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
            <head>
                <meta name="theme-color" content="#0f172a" />
                <meta name="application-name" content="CarMatch" />
                <link rel="preconnect" href="https://api.mapbox.com" />
                <link rel="preconnect" href="https://events.mapbox.com" />
                <link rel="apple-touch-icon" href="/icon-192-v20.png?v=22" />
                <style dangerouslySetInnerHTML={{ __html: 'html,body{background-color:#0f172a!important}' }} />
            </head>
            <body className={`${inter.className} min-h-screen-safe bg-[#0f172a]`}>
                <GoogleAnalytics />
                <Providers>
                    <Toaster position="top-center" richColors closeButton />
                    {/* <InstallInvasiveBanner /> */}
                    <PushNotificationRequest />
                    {/* <OpenInBrowserBanner /> */}
                    {/* <ResponsiveViewportFix /> */}
                    <RestoringSessionOverlay />
                    <RestoreSessionModal />
                    <CookieConsentBanner />

                    <BetaSessionTracker />
                    <GlobalSOSWatcher />
                    {/* 📱 Native Body Scroll Architecture: Standard Mobile Web Pattern */}
                    <div className="flex flex-col min-h-screen w-full relative bg-slate-950">
                        {/* Header: Sticky at top, scrolls with page */}
                        <DynamicHeader />

                        {/* MainContent Area: Natural body scroll, no clipping */}
                        <main className="flex-1 flex flex-col pb-[80px] md:pb-0 relative z-10 bg-background overflow-x-hidden">
                            {children}
                            <div className="px-4">
                                <FooterSEO />
                            </div>
                        </main>

                        {/* MobileNav: Fixed at bottom, independent of scroll */}
                        <MobileNav />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
