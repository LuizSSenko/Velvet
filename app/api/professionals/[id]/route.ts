import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { Professional } from '@/lib/types'

// PUT - Update a specific professional
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const professionalId = params.id

    // Get existing professionals
    const professionals = await redis.get<Professional[]>(REDIS_KEYS.PROFESSIONALS) || []
    
    // Find and update the professional
    const updatedProfessionals = professionals.map(prof => 
      prof.id === professionalId ? { ...prof, ...body } : prof
    )

    // Save back to Redis
    await redis.set(REDIS_KEYS.PROFESSIONALS, updatedProfessionals)

    const updatedProfessional = updatedProfessionals.find(prof => prof.id === professionalId)
    return NextResponse.json(updatedProfessional)
  } catch (error) {
    console.error('Error updating professional:', error)
    return NextResponse.json({ error: 'Failed to update professional' }, { status: 500 })
  }
}

// DELETE - Remove a specific professional
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const professionalId = params.id

    // Get existing professionals
    const professionals = await redis.get<Professional[]>(REDIS_KEYS.PROFESSIONALS) || []
    
    // Remove the professional
    const updatedProfessionals = professionals.filter(prof => prof.id !== professionalId)

    // Save back to Redis
    await redis.set(REDIS_KEYS.PROFESSIONALS, updatedProfessionals)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting professional:', error)
    return NextResponse.json({ error: 'Failed to delete professional' }, { status: 500 })
  }
}