import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { ClinicInfo, ClinicAddress } from '@/lib/types'

interface PublicClinic {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  especialidades: string[];
}

// GET - Fetch clinic information for public use
export async function GET() {
  try {
    const [clinicInfo, clinicAddress] = await Promise.all([
      redis.get<ClinicInfo>(REDIS_KEYS.CLINIC_INFO),
      redis.get<ClinicAddress>(REDIS_KEYS.CLINIC_ADDRESS)
    ])
    
    // Default values if not found
    const defaultClinicInfo: ClinicInfo = {
      nome: 'Clínica Médica Central',
      telefone: '(11) 3333-4444',
      email: 'contato@clinicacentral.com.br'
    }
    
    const defaultAddress: ClinicAddress = {
      rua: 'Av. Paulista',
      numero: '1000',
      complemento: '',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-000'
    }
    
    const currentClinicInfo = clinicInfo || defaultClinicInfo
    const currentAddress = clinicAddress || defaultAddress
    
    // Format address for display
    const enderecoFormatado = `${currentAddress.rua}, ${currentAddress.numero}${currentAddress.complemento ? ' - ' + currentAddress.complemento : ''} - ${currentAddress.cidade}/${currentAddress.estado}`
    
    const publicClinic: PublicClinic = {
      id: '1',
      nome: currentClinicInfo.nome,
      endereco: enderecoFormatado,
      telefone: currentClinicInfo.telefone,
      especialidades: ['Cardiologia', 'Dermatologia', 'Neurologia', 'Ortopedia', 'Ginecologia'] // Could be dynamic based on professionals
    }
    
    return NextResponse.json([publicClinic]) // Return as array for compatibility
  } catch (error) {
    console.error('Error fetching public clinic info:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic info' }, { status: 500 })
  }
}