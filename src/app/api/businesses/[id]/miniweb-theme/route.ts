import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { theme, sections, hero, logo, seo, services, promos, faq } = body

    const business = await prisma.business.findUnique({
      where: { id },
      select: { id: true, userId: true, hasMiniWeb: true }
    })

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    if (business.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (!business.hasMiniWeb) {
      return NextResponse.json({ error: 'MiniWeb no activada' }, { status: 400 })
    }

    if (theme) {
      if (theme.primaryColor && !HEX_REGEX.test(theme.primaryColor)) {
        return NextResponse.json({ error: 'Color primario inválido' }, { status: 400 })
      }
      if (theme.bgColor && !HEX_REGEX.test(theme.bgColor)) {
        return NextResponse.json({ error: 'Color de fondo inválido' }, { status: 400 })
      }
      if (theme.textColor && !HEX_REGEX.test(theme.textColor)) {
        return NextResponse.json({ error: 'Color de texto inválido' }, { status: 400 })
      }
      if (theme.accentColor && !HEX_REGEX.test(theme.accentColor)) {
        return NextResponse.json({ error: 'Color de acento inválido' }, { status: 400 })
      }
    }

    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(theme && { miniWebTheme: theme }),
        ...(sections && { miniWebSections: sections }),
        ...(hero && { miniWebHero: hero }),
        ...(logo !== undefined && { miniWebLogo: logo }),
        ...(seo && { miniWebSeo: seo }),
        ...(services && { miniWebServices: services }),
        ...(promos && { miniWebPromos: promos }),
        ...(faq && { miniWebFaq: faq }),
      },
      select: {
        id: true,
        hasMiniWeb: true,
        slug: true,
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

    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error('Error updating MiniWeb theme:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

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

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    if (business.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Error fetching MiniWeb theme:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
