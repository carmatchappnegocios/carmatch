
import { NextResponse } from 'next/server'
import { processAppointmentSafety } from '@/lib/cron/monitor'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const result = await processAppointmentSafety()
        return NextResponse.json({ ...result })
    } catch (error) {
        console.error('Error in appointment monitor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

