import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

const getCachedVehicleOfTheDay = unstable_cache(
  async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const vehicleOfTheDay = await prisma.vehicleOfTheDay.findUnique({
      where: { date: today },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            price: true,
            city: true,
            images: true,
            currency: true,
            mileage: true,
            transmission: true,
            fuel: true,
            color: true,
          }
        }
      }
    })

    return vehicleOfTheDay
  },
  ['vehicle-of-the-day'],
  { revalidate: 3600, tags: ['vehicle-of-the-day'] }
)

export async function GET(request: NextRequest) {
  try {
    const vehicleOfTheDay = await getCachedVehicleOfTheDay()
    return NextResponse.json({ vehicleOfTheDay })
  } catch (error) {
    console.error('Error fetching vehicle of the day:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
