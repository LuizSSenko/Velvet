import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { Professional, ClinicHours, ClinicAddress, ClinicContacts } from '@/lib/types'

// Initial seed data based on your current mock data
const profissionaisSeed: Professional[] = [
  { 
    id: 'p1', 
    nome: 'Dra. Ana Silva', 
    especialidade: 'Cardiologia', 
    cor: '#3b82f6',
    telefone: '(11) 99999-1234',
    email: 'ana@clinica.com',
    ativo: true,
    duracaoConsulta: 30,
    horariosAlmoco: [
      { id: 'a1', diaSemana: 'segunda', horaInicio: '12:00', horaFim: '13:00' },
      { id: 'a2', diaSemana: 'quarta', horaInicio: '12:00', horaFim: '13:00' },
      { id: 'a3', diaSemana: 'sexta', horaInicio: '12:00', horaFim: '13:00' }
    ],
    horarios: [
      { id: 'h1', diaSemana: 'segunda', horaInicio: '08:00', horaFim: '12:00' },
      { id: 'h2', diaSemana: 'quarta', horaInicio: '14:00', horaFim: '18:00' },
      { id: 'h3', diaSemana: 'sexta', horaInicio: '08:00', horaFim: '16:00' }
    ]
  },
  { 
    id: 'p2', 
    nome: 'Dr. Bruno Costa', 
    especialidade: 'Dermatologia', 
    cor: '#6366f1',
    telefone: '(11) 98888-5678',
    email: 'bruno@clinica.com',
    ativo: true,
    duracaoConsulta: 45,
    horariosAlmoco: [
      { id: 'a4', diaSemana: 'terca', horaInicio: '12:00', horaFim: '13:00' },
      { id: 'a5', diaSemana: 'quinta', horaInicio: '12:00', horaFim: '13:00' }
    ],
    horarios: [
      { id: 'h4', diaSemana: 'terca', horaInicio: '09:00', horaFim: '17:00' },
      { id: 'h5', diaSemana: 'quinta', horaInicio: '13:00', horaFim: '18:00' }
    ]
  },
  { 
    id: 'p3', 
    nome: 'Dra. Carla Mendes', 
    especialidade: 'Neurologia', 
    cor: '#10b981',
    telefone: '(11) 97777-9012',
    email: 'carla@clinica.com',
    ativo: true,
    duracaoConsulta: 60,
    horariosAlmoco: [
      { id: 'a6', diaSemana: 'segunda', horaInicio: '12:00', horaFim: '13:00' },
      { id: 'a7', diaSemana: 'quarta', horaInicio: '12:00', horaFim: '13:00' }
    ],
    horarios: [
      { id: 'h6', diaSemana: 'segunda', horaInicio: '14:00', horaFim: '18:00' },
      { id: 'h7', diaSemana: 'quarta', horaInicio: '08:00', horaFim: '12:00' }
    ]
  }
]

const initialClinicHours: ClinicHours = {
  start: '07:00',
  end: '19:00', 
  saturday: true,
  sunday: false
}

const initialClinicAddress: ClinicAddress = {
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: ''
}

const initialClinicContacts: ClinicContacts = {
  telefone: '',
  email: '',
  whatsapp: '',
  site: ''
}

// POST - Seed the database with initial data
export async function POST(request: NextRequest) {
  try {
    // Check if data already exists
    const existingProfessionals = await redis.get(REDIS_KEYS.PROFESSIONALS)
    
    if (existingProfessionals) {
      return NextResponse.json({ 
        message: 'Database already seeded. Use force=true to overwrite.',
        skipReason: 'Data exists'
      }, { status: 200 })
    }

    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'

    if (!existingProfessionals || force) {
      // Seed all data
      await Promise.all([
        redis.set(REDIS_KEYS.PROFESSIONALS, profissionaisSeed),
        redis.set(REDIS_KEYS.CLINIC_HOURS, initialClinicHours),
        redis.set(REDIS_KEYS.CLINIC_ADDRESS, initialClinicAddress),
        redis.set(REDIS_KEYS.CLINIC_CONTACTS, initialClinicContacts),
        redis.set(REDIS_KEYS.CUSTOM_HOURS, [])
      ])

      return NextResponse.json({ 
        message: 'Database seeded successfully',
        data: {
          professionals: profissionaisSeed.length,
          clinicConfig: 'initialized'
        }
      })
    }

    return NextResponse.json({ message: 'Database already contains data' })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}