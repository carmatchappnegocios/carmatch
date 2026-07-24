import InstallReasonsBento from '@/components/InstallReasonsBento'

export default function BeneficiosPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12 md:py-24">
            <div className="w-full max-w-4xl mx-auto">
                <InstallReasonsBento />
                
                <div className="mt-12 text-center">
                    <p className="text-text-secondary text-sm">
                        Únete a miles de conductores en tu ciudad usando CarMatch.
                    </p>
                </div>
            </div>
        </div>
    )
}
