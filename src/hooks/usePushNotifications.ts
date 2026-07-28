// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

"use client"

import { useState, useEffect } from 'react'

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

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [permission, setPermission] = useState<NotificationPermission>('default')

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPermission(Notification.permission)
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsSubscribed(true)
                        setSubscription(sub)
                    }
                })
            })
        }
    }, [])

    const subscribe = async () => {
        if (!('serviceWorker' in navigator)) {
            console.warn('[PUSH] Service Worker not supported')
            alert('Tu navegador no soporta notificaciones push.')
            return
        }

        if (!PUBLIC_KEY) {
            console.error('[PUSH] VAPID public key not configured')
            alert('Error de configuración. Las notificaciones no están disponibles.')
            return
        }

        try {
            console.log('[PUSH] Requesting notification permission...')
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                alert('Permiso de notificaciones denegado.')
                return
            }

            console.log('[PUSH] Waiting for service worker ready...')
            const registration = await navigator.serviceWorker.ready
            console.log('[PUSH] Service worker ready, subscribing...')

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
            })

            console.log('[PUSH] Subscribed, saving to backend...')
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            })

            if (!res.ok) {
                throw new Error(`Backend error: ${res.status}`)
            }

            console.log('[PUSH] Subscription saved successfully')
            setIsSubscribed(true)
            setSubscription(sub)
            setPermission('granted')
            alert('¡Notificaciones Activadas!')

        } catch (error) {
            console.error('[PUSH] Error suscribiendo a push:', error)
            alert('Error activando notificaciones. Revisa permisos.')
        }
    }

    return { isSubscribed, subscribe, permission }
}
