import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Términos y Condiciones | CarMatch',
    description: 'Lee los términos y condiciones de uso de CarMatch. Reglas para publicar vehículos, servicios y utilizar la plataforma.',
    alternates: {
        canonical: 'https://www.carmatchapp.net/terms',
    },
    openGraph: {
        title: 'Términos y Condiciones | CarMatch',
        description: 'Reglas para publicar vehículos, servicios y utilizar la plataforma CarMatch.',
        url: 'https://www.carmatchapp.net/terms',
        siteName: 'CarMatch',
    },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children
}
