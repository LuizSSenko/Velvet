import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { ClinicContacts } from '@/lib/types'

// GET - Fetch clinic contacts
export async function GET() {
  try {
    const contacts = await redis.get<ClinicContacts>(REDIS_KEYS.CLINIC_CONTACTS)
    return NextResponse.json(contacts || { telefone: '', email: '', whatsapp: '', site: '' })
  } catch (error) {
    console.error('Error fetching clinic contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic contacts' }, { status: 500 })
  }
}

// PUT - Update clinic contacts
export async function PUT(request: NextRequest) {
  try {
    const contacts: ClinicContacts = await request.json()
    await redis.set(REDIS_KEYS.CLINIC_CONTACTS, contacts)
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error updating clinic contacts:', error)
    return NextResponse.json({ error: 'Failed to update clinic contacts' }, { status: 500 })
  }
}