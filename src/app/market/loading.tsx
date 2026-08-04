export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background pt-[70px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary text-sm animate-pulse">Cargando vehículos...</p>
            </div>
        </div>
    )
}
