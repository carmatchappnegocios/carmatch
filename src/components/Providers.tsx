"use client"

import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { DataSaverProvider } from "@/contexts/DataSaverContext"
import dynamic from "next/dynamic"

const AIChatWidget = dynamic(() => import("@/components/AIChatWidget"), { ssr: false });
const RegisterSW = dynamic(() => import("@/components/RegisterSW"), { ssr: false });
const PushNotificationRequest = dynamic(() => import("@/components/PushNotificationRequest"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={false}>
            <LanguageProvider>
                <LocationProvider>
                    <DataSaverProvider>
                        <RegisterSW />
                        <PushNotificationRequest />
                        {children}
                        <AIChatWidget context="support" />
                    </DataSaverProvider>
                </LocationProvider>
            </LanguageProvider>
        </SessionProvider>
    )
}
