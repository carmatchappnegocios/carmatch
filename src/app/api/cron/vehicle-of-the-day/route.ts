import { NextRequest, NextResponse } from 'next/server'
import { selectVehicleOfTheDay, sendVehicleOfTheDayNotifications } from '@/lib/cron/vehicle-of-the-day'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vehicleOfTheDay = await selectVehicleOfTheDay()

    if (!vehicleOfTheDay) {
      return NextResponse.json({ success: true, message: 'No eligible vehicles found' })
    }

    await sendVehicleOfTheDayNotifications(vehicleOfTheDay)

    return NextResponse.json({ success: true, vehicleOfTheDay })
  } catch (error) {
    console.error('Error in vehicle-of-the-day cron:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
