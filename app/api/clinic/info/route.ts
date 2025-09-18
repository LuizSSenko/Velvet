import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { ClinicInfo } from '@/lib/types'

// GET - Fetch clinic information
export async function GET() {
  try {
    const clinicInfo = await redis.get<ClinicInfo>(REDIS_KEYS.CLINIC_INFO)
    
    // Return default values if no clinic info is stored
    if (!clinicInfo) {
      const defaultInfo: ClinicInfo = {
        nome: 'Clínica Médica Central',
        telefone: '(11) 3333-4444',
        email: 'contato@clinicacentral.com.br'
      }
      return NextResponse.json(defaultInfo)
    }
    
    return NextResponse.json(clinicInfo)
  } catch (error) {
    console.error('Error fetching clinic info:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic info' }, { status: 500 })
  }
}

// PUT - Update clinic information
export async function PUT(request: Request) {
  try {
    const clinicInfo: ClinicInfo = await request.json()
    
    // Validate required fields
    if (!clinicInfo.nome || !clinicInfo.telefone || !clinicInfo.email) {
      return NextResponse.json(
        { error: 'Nome, telefone e email são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Save to Redis
    await redis.set(REDIS_KEYS.CLINIC_INFO, clinicInfo)
    
    return NextResponse.json({ success: true, message: 'Informações da clínica salvas com sucesso' })
  } catch (error) {
    console.error('Error saving clinic info:', error)
    return NextResponse.json({ error: 'Failed to save clinic info' }, { status: 500 })
  }
}