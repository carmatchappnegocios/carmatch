'use client'

interface LoadingSpinnerProps {
    text?: string
    fullScreen?: boolean
}

export default function LoadingSpinner({ text = 'Cargando...', fullScreen = true }: LoadingSpinnerProps) {
    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[200px]'} flex items-center justify-center bg-background ${fullScreen ? 'pt-[70px]' : ''}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary text-sm animate-pulse">{text}</p>
            </div>
        </div>
    )
}
