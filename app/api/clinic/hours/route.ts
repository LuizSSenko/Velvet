import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { ClinicHours } from '@/lib/types'

// GET - Fetch clinic hours
export async function GET() {
  try {
    const hours = await redis.get<ClinicHours>(REDIS_KEYS.CLINIC_HOURS)
    return NextResponse.json(hours || { start: '07:00', end: '19:00', saturday: true, sunday: false })
  } catch (error) {
    console.error('Error fetching clinic hours:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic hours' }, { status: 500 })
  }
}

// PUT - Update clinic hours
export async function PUT(request: NextRequest) {
  try {
    const hours: ClinicHours = await request.json()
    await redis.set(REDIS_KEYS.CLINIC_HOURS, hours)
    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error updating clinic hours:', error)
    return NextResponse.json({ error: 'Failed to update clinic hours' }, { status: 500 })
  }
}