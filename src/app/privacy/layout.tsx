import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Política de Privacidad | CarMatch',
    description: 'Conoce cómo CarMatch protege tus datos personales. Política de privacidad completa y transparente.',
    alternates: {
        canonical: 'https://www.carmatchapp.net/privacy',
    },
    openGraph: {
        title: 'Política de Privacidad | CarMatch',
        description: 'Protección de datos personales en CarMatch.',
        url: 'https://www.carmatchapp.net/privacy',
        siteName: 'CarMatch',
    },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children
}
