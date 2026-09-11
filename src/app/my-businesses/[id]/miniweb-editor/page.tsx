import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import MiniWebEditorClient from './MiniWebEditorClient'

export default async function MiniWebEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth')

  const { id } = await params

  const business = await prisma.business.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      hasMiniWeb: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      images: true,
      services: true,
      hours: true,
      phone: true,
      whatsapp: true,
      telegram: true,
      facebook: true,
      instagram: true,
      tiktok: true,
      website: true,
      is24Hours: true,
      hasEmergencyService: true,
      hasHomeService: true,
      address: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      miniWebTheme: true,
      miniWebSections: true,
      miniWebHero: true,
      miniWebLogo: true,
      miniWebSeo: true,
      miniWebServices: true,
      miniWebPromos: true,
      miniWebFaq: true,
    }
  })

  if (!business || business.userId !== session.user.id) redirect('/my-businesses')
  if (!business.hasMiniWeb) redirect('/my-businesses')

  return <MiniWebEditorClient business={business as any} />
}
