
import Image from 'next/image'

interface LogoProps {
    className?: string
    showText?: boolean
    textClassName?: string
}

export function Logo({ className = "w-12 h-12", showText = false, textClassName = "text-2xl font-black tracking-tight" }: LogoProps) {
    return (
        <div className="flex items-center gap-2">
            <div className={`relative ${className} bg-transparent`}>
                <Image
                    src="/icon-512-v20-fixed.png"
                    alt="CarMatch"
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 768px) 48px, 56px"
                />
            </div>
            {showText && (
                <span className={`${textClassName} text-text-primary`}>CarMatch</span>
            )}
        </div>
    )
}
