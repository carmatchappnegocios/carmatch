
"use client"

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function GoogleAnalytics() {
    const GA_MEASUREMENT_ID = 'G-Q84TC96LDB'
    const [consent, setConsent] = useState<string | null>(null)

    useEffect(() => {
        setConsent(localStorage.getItem('cookieConsent'))

        const handleStorageChange = () => {
            setConsent(localStorage.getItem('cookieConsent'))
        }
        window.addEventListener('storage', handleStorageChange)

        // Also poll localStorage periodically in case storage event doesn't fire (same-tab changes)
        const interval = setInterval(() => {
            setConsent(localStorage.getItem('cookieConsent'))
        }, 1000)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [])

    if (consent !== 'accepted') return null

    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_MEASUREMENT_ID}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
        </>
    )
}
