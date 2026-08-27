// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.

"use client"

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

function getSocket(): Socket {
    if (socketInstance && socketInstance.connected) return socketInstance;

    if (!socketInstance) {
        const url = typeof window !== 'undefined' ? window.location.origin : '';
        socketInstance = io(url, {
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10,
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect_error', () => {
            // Silently handle connection errors — polling fallback will work
        });
    }

    return socketInstance;
}

// Export a compatible API that matches the old stub interface
export const socket = {
    get connected() {
        return getSocket().connected;
    },
    connect: () => {
        const s = getSocket();
        if (!s.connected) s.connect();
    },
    disconnect: () => {
        const s = getSocket();
        if (s.connected) s.disconnect();
    },
    emit: (...args: unknown[]) => {
        const s = getSocket();
        if (s.connected) s.emit(args[0] as string, ...args.slice(1));
    },
    on: (event: string, callback: (...args: unknown[]) => void) => {
        getSocket().on(event, callback);
    },
    off: (event: string, callback?: (...args: unknown[]) => void) => {
        getSocket().off(event, callback);
    },
};
