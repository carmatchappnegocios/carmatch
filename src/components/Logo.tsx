// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import React from 'react'
import Image from 'next/image'

interface LogoProps {
    className?: string
    showText?: boolean
    textClassName?: string
}

export function Logo({ className = "w-12 h-12", showText = false, textClassName = "text-2xl font-black tracking-tight" }: LogoProps) {
    return (
        <div className="flex items-center gap-2">
            <div className={`relative ${className}`}>
                <Image
                    src="/icon-192-v20.png"
                    alt="CarMatch® | Marketplace Oficial de Autos y Servicios"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            {showText && (
                <span className={`${textClassName} text-text-primary`}>CarMatch</span>
            )}
        </div>
    )
}
