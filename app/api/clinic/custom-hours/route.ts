import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { CustomHour } from '@/lib/types'

// GET - Fetch custom hours (exceptions)
export async function GET() {
  try {
    const customHours = await redis.get<CustomHour[]>(REDIS_KEYS.CUSTOM_HOURS)
    return NextResponse.json(customHours || [])
  } catch (error) {
    console.error('Error fetching custom hours:', error)
    return NextResponse.json({ error: 'Failed to fetch custom hours' }, { status: 500 })
  }
}

// PUT - Update custom hours
export async function PUT(request: NextRequest) {
  try {
    const customHours: CustomHour[] = await request.json()
    await redis.set(REDIS_KEYS.CUSTOM_HOURS, customHours)
    return NextResponse.json(customHours)
  } catch (error) {
    console.error('Error updating custom hours:', error)
    return NextResponse.json({ error: 'Failed to update custom hours' }, { status: 500 })
  }
}