
interface LogoProps {
    className?: string
    showText?: boolean
    textClassName?: string
}

export function Logo({ className = "w-12 h-12", showText = false, textClassName = "text-2xl font-black tracking-tight" }: LogoProps) {
    return (
        <div className="flex items-center gap-2">
            <div className={`relative flex items-center justify-center ${className} bg-transparent`}>
                <span className="font-black text-xl md:text-2xl tracking-tight text-[#ff7a00]">Car<span className="text-white">Match</span></span>
            </div>
            {showText && (
                <span className={`${textClassName} text-text-primary`}>CarMatch</span>
            )}
        </div>
    )
}
