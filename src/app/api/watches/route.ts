import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleId, currentPrice } = body

    if (!vehicleId || !currentPrice) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }

    const existing = await prisma.vehicleWatch.findUnique({
      where: { userId_vehicleId: { userId: session.user.id, vehicleId } }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ isWatching: true })
      }
      await prisma.vehicleWatch.update({
        where: { id: existing.id },
        data: { isActive: true, watchedPrice: currentPrice, lastCheckedPrice: currentPrice }
      })
      return NextResponse.json({ success: true, isWatching: true })
    }

    await prisma.vehicleWatch.create({
      data: {
        userId: session.user.id,
        vehicleId,
        watchedPrice: currentPrice,
        lastCheckedPrice: currentPrice,
        source: 'manual',
        isActive: true,
      }
    })

    return NextResponse.json({ success: true, isWatching: true })
  } catch (error) {
    console.error('Error creating watch:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleId } = body

    if (!vehicleId) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }

    await prisma.vehicleWatch.updateMany({
      where: { userId: session.user.id, vehicleId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true, isWatching: false })
  } catch (error) {
    console.error('Error deleting watch:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ isWatching: false })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')

    if (!vehicleId) {
      return NextResponse.json({ isWatching: false })
    }

    const watch = await prisma.vehicleWatch.findUnique({
      where: { userId_vehicleId: { userId: session.user.id, vehicleId } },
      select: { isActive: true }
    })

    return NextResponse.json({ isWatching: watch?.isActive || false })
  } catch (error) {
    return NextResponse.json({ isWatching: false })
  }
}
