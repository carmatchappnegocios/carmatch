"use client"

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function FacebookPixel() {
    const PIXEL_ID = '2171758263755362'
    const [consent, setConsent] = useState<string | null>(null)

    useEffect(() => {
        setConsent(localStorage.getItem('cookieConsent'))

        const handleStorageChange = () => {
            setConsent(localStorage.getItem('cookieConsent'))
        }
        window.addEventListener('storage', handleStorageChange)

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
                id="facebook-pixel"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${PIXEL_ID}');
                        fbq('track', 'PageView');
                    `,
                }}
            />
            <noscript>
                <img height="1" width="1" src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
            </noscript>
        </>
    )
}
