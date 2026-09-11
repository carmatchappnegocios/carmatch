import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, clientName, clientPhone, clientEmail, service, date, time, description, vehicleInfo } = body

    if (!businessId || !clientName || !clientPhone || !service || !date || !time) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, hasMiniWeb: true, name: true, userId: true }
    })

    if (!business || !business.hasMiniWeb) {
      return NextResponse.json({ error: 'Negocio no encontrado o MiniWeb no activa' }, { status: 404 })
    }

    const appointment = await prisma.miniWebAppointment.create({
      data: {
        businessId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        service,
        date: new Date(date),
        time,
        description: description || null,
        vehicleInfo: vehicleInfo || null,
        status: 'PENDING',
      }
    })

    await prisma.notification.create({
      data: {
        userId: business.userId,
        type: 'MINIWEB_APPOINTMENT',
        title: 'Nueva cita agendada',
        message: `${clientName} agendó una cita para ${service} el ${new Date(date).toLocaleDateString('es-MX')}`,
        link: `/my-businesses`,
        businessId: business.id,
      }
    })

    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error('Error creating miniweb appointment:', error)
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

    const appointments = await prisma.miniWebAppointment.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching miniweb appointments:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
