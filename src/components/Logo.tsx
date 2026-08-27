
import Image from 'next/image'

interface LogoProps {
    className?: string
    showText?: boolean
    textClassName?: string
}

export function Logo({ className = "w-12 h-12", showText = false, textClassName = "text-2xl font-black tracking-tight" }: LogoProps) {
    return (
        <div className="flex items-center gap-2">
            <div className={`relative overflow-hidden ${className}`}>
                <Image
                    src="/icon-192-v20.png"
                    alt="CarMatch® | Marketplace Oficial de Autos y Servicios"
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                    priority
                />
            </div>
            {showText && (
                <span className={`${textClassName} text-text-primary`}>CarMatch</span>
            )}
        </div>
    )
}
