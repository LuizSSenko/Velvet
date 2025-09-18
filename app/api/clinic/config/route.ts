import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { ClinicConfig, ClinicHours, ClinicAddress, ClinicContacts, CustomHour } from '@/lib/types'

// GET - Fetch complete clinic configuration
export async function GET() {
  try {
    const [hours, address, contacts, customHours] = await Promise.all([
      redis.get<ClinicHours>(REDIS_KEYS.CLINIC_HOURS),
      redis.get<ClinicAddress>(REDIS_KEYS.CLINIC_ADDRESS),
      redis.get<ClinicContacts>(REDIS_KEYS.CLINIC_CONTACTS),
      redis.get<CustomHour[]>(REDIS_KEYS.CUSTOM_HOURS)
    ])

    const config: ClinicConfig = {
      hours: hours || { start: '07:00', end: '19:00', saturday: true, sunday: false },
      address: address || { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
      contacts: contacts || { telefone: '', email: '', whatsapp: '', site: '' },
      customHours: customHours || []
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching clinic config:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic configuration' }, { status: 500 })
  }
}

// PUT - Update complete clinic configuration
export async function PUT(request: NextRequest) {
  try {
    const config: ClinicConfig = await request.json()

    // Save each part separately for better granular updates
    await Promise.all([
      redis.set(REDIS_KEYS.CLINIC_HOURS, config.hours),
      redis.set(REDIS_KEYS.CLINIC_ADDRESS, config.address),
      redis.set(REDIS_KEYS.CLINIC_CONTACTS, config.contacts),
      redis.set(REDIS_KEYS.CUSTOM_HOURS, config.customHours)
    ])

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating clinic config:', error)
    return NextResponse.json({ error: 'Failed to update clinic configuration' }, { status: 500 })
  }
}