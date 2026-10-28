import { NextRequest, NextResponse } from 'next/server'
import { monitorPriceDrops } from '@/lib/cron/price-monitor'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await monitorPriceDrops()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in price-monitor cron:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
