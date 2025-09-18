import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { Professional } from '@/lib/types'

// GET - Fetch all professionals
export async function GET() {
  try {
    const professionals = await redis.get<Professional[]>(REDIS_KEYS.PROFESSIONALS)
    return NextResponse.json(professionals || [])
  } catch (error) {
    console.error('Error fetching professionals:', error)
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 })
  }
}

// POST - Create a new professional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newProfessional: Professional = {
      id: crypto.randomUUID(),
      ...body,
      ativo: true
    }

    // Get existing professionals
    const existingProfessionals = await redis.get<Professional[]>(REDIS_KEYS.PROFESSIONALS) || []
    
    // Add new professional
    const updatedProfessionals = [...existingProfessionals, newProfessional]
    
    // Save back to Redis
    await redis.set(REDIS_KEYS.PROFESSIONALS, updatedProfessionals)

    return NextResponse.json(newProfessional, { status: 201 })
  } catch (error) {
    console.error('Error creating professional:', error)
    return NextResponse.json({ error: 'Failed to create professional' }, { status: 500 })
  }
}

// PUT - Update all professionals
export async function PUT(request: NextRequest) {
  try {
    const professionals: Professional[] = await request.json()
    await redis.set(REDIS_KEYS.PROFESSIONALS, professionals)
    return NextResponse.json(professionals)
  } catch (error) {
    console.error('Error updating professionals:', error)
    return NextResponse.json({ error: 'Failed to update professionals' }, { status: 500 })
  }
}