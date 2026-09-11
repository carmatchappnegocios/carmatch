import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, clientName, clientPhone, clientEmail, vehicleInfo, description } = body

    if (!businessId || !clientName || !clientPhone || !description) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, hasMiniWeb: true, name: true, userId: true }
    })

    if (!business || !business.hasMiniWeb) {
      return NextResponse.json({ error: 'Negocio no encontrado o MiniWeb no activa' }, { status: 404 })
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        businessId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        vehicleInfo: vehicleInfo || null,
        description,
        images: [],
        status: 'PENDING',
      }
    })

    await prisma.notification.create({
      data: {
        userId: business.userId,
        type: 'MINIWEB_QUOTE',
        title: 'Nueva solicitud de presupuesto',
        message: `${clientName} solicitó un presupuesto: ${description.substring(0, 80)}`,
        link: `/my-businesses`,
        businessId: business.id,
      }
    })

    return NextResponse.json({ success: true, quote })
  } catch (error) {
    console.error('Error creating quote request:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId requerido' }, { status: 400 })
    }

    const quotes = await prisma.quoteRequest.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
