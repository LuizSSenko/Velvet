import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { ClinicAddress } from '@/lib/types'

// GET - Fetch clinic address
export async function GET() {
  try {
    const address = await redis.get<ClinicAddress>(REDIS_KEYS.CLINIC_ADDRESS)
    return NextResponse.json(address || { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' })
  } catch (error) {
    console.error('Error fetching clinic address:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic address' }, { status: 500 })
  }
}

// PUT - Update clinic address
export async function PUT(request: NextRequest) {
  try {
    const address: ClinicAddress = await request.json()
    await redis.set(REDIS_KEYS.CLINIC_ADDRESS, address)
    return NextResponse.json(address)
  } catch (error) {
    console.error('Error updating clinic address:', error)
    return NextResponse.json({ error: 'Failed to update clinic address' }, { status: 500 })
  }
}