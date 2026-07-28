"use client"

import { useState, useEffect, useCallback } from 'react'

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
    try {
        const reg = await navigator.serviceWorker.getRegistration('/')
        if (reg) return reg
        const reg2 = await navigator.serviceWorker.getRegistration()
        if (reg2) return reg2
        return await navigator.serviceWorker.ready
    } catch {
        return null
    }
}

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [permission, setPermission] = useState<NotificationPermission>('default')

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

        const perm = Notification.permission
        setPermission(perm)
        if (perm !== 'granted') return

        const check = async () => {
            for (let attempt = 0; attempt < 10; attempt++) {
                const reg = await getRegistration()
                if (reg) {
                    try {
                        const sub = await reg.pushManager.getSubscription()
                        if (sub) {
                            setIsSubscribed(true)
                            setSubscription(sub)
                        }
                    } catch (e) {
                        console.error('[PUSH] Error checking subscription:', e)
                    }
                    return
                }
                await new Promise(r => setTimeout(r, 500))
            }
        }
        check()
    }, [])

    const subscribe = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Tu navegador no soporta notificaciones push.')
            return
        }

        if (!PUBLIC_KEY) {
            alert('Error de configuración. Las notificaciones no están disponibles.')
            return
        }

        try {
            const perm = await Notification.requestPermission()
            if (perm !== 'granted') {
                alert('Permiso de notificaciones denegado.')
                return
            }

            let reg = await getRegistration()
            if (!reg) {
                reg = await navigator.serviceWorker.register('/sw.js')
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
            })

            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            })

            if (!res.ok) throw new Error(`Backend error: ${res.status}`)

            setIsSubscribed(true)
            setSubscription(sub)
            setPermission('granted')
            alert('¡Notificaciones Activadas!')

        } catch (error) {
            console.error('[PUSH] Error suscribiendo a push:', error)
            alert('Error activando notificaciones. Revisa permisos.')
        }
    }, [])

    const unsubscribe = useCallback(async () => {
        if (!('serviceWorker' in navigator)) return

        try {
            const reg = await getRegistration()
            if (!reg) return

            const sub = await reg.pushManager.getSubscription()
            if (sub) {
                await sub.unsubscribe()
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint })
                }).catch(() => {})
            }

            setIsSubscribed(false)
            setSubscription(null)
            setPermission('default')
            alert('Notificaciones desactivadas')

        } catch (error) {
            console.error('[PUSH] Error desuscribiendo:', error)
            alert('Error desactivando notificaciones.')
        }
    }, [])

    return { isSubscribed, subscribe, unsubscribe, permission }
}
