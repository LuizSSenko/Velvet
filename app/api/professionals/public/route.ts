import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { Professional, ClinicInfo } from '@/lib/types'

// GET - Fetch professionals for public use (patients booking)
export async function GET() {
  try {
    const [professionalsData, clinicInfo] = await Promise.all([
      redis.get<Professional[]>(REDIS_KEYS.PROFESSIONALS),
      redis.get<ClinicInfo>(REDIS_KEYS.CLINIC_INFO)
    ])
    
    const professionals = professionalsData || []
    
    // Default clinic info if not found
    const defaultClinicInfo: ClinicInfo = {
      nome: 'Clínica Médica Central',
      telefone: '(11) 3333-4444',
      email: 'contato@clinicacentral.com.br'
    }
    
    const currentClinicInfo = clinicInfo || defaultClinicInfo
    
    // Helper function to convert professional schedules to availability format
    const convertScheduleToAvailability = (horarios: any[], duracaoConsulta: number = 30, horariosAlmoco: any[] = []) => {
      const availability: { [key: string]: string[] } = {}
      
      horarios.forEach(schedule => {
        const day = schedule.diaSemana
        const startTime = schedule.horaInicio
        const endTime = schedule.horaFim
        
        // Get blocked hours for this day
        const blockedHours = horariosAlmoco.filter(blocked => blocked.diaSemana === day)
        
        // Generate time slots between start and end time using consultation duration
        const timeSlots = generateTimeSlots(startTime, endTime, duracaoConsulta, blockedHours)
        
        if (!availability[day]) {
          availability[day] = []
        }
        availability[day].push(...timeSlots)
      })
      
      // Remove duplicates and sort
      Object.keys(availability).forEach(day => {
        availability[day] = [...new Set(availability[day])].sort()
      })
      
      return availability
    }

    // Helper function to generate time slots considering consultation duration and blocked hours
    const generateTimeSlots = (startTime: string, endTime: string, duration: number, blockedHours: any[]): string[] => {
      const slots = []
      const start = new Date(`2000-01-01 ${startTime}:00`)
      const end = new Date(`2000-01-01 ${endTime}:00`)
      
      const current = new Date(start)
      while (current < end) {
        const currentTimeStr = current.toTimeString().slice(0, 5)
        
        // Check if this time slot conflicts with any blocked hours
        const isBlocked = blockedHours.some(blocked => {
          const blockedStart = new Date(`2000-01-01 ${blocked.horaInicio}:00`)
          const blockedEnd = new Date(`2000-01-01 ${blocked.horaFim}:00`)
          const slotEnd = new Date(current.getTime() + duration * 60000) // Add consultation duration
          
          // Check if the slot overlaps with blocked time
          return (current >= blockedStart && current < blockedEnd) || 
                 (slotEnd > blockedStart && slotEnd <= blockedEnd) ||
                 (current < blockedStart && slotEnd > blockedEnd)
        })
        
        if (!isBlocked) {
          slots.push(currentTimeStr)
        }
        
        current.setMinutes(current.getMinutes() + duration)
      }
      
      return slots
    }
    
    // Filter only active professionals and return public data
    const publicProfessionals = professionals
      .filter(prof => prof.ativo)
      .map(prof => ({
        id: prof.id,
        nome: prof.nome,
        especialidade: prof.especialidade,
        cor: prof.cor,
        telefone: prof.telefone,
        email: prof.email,
        horarios: prof.horarios,
        // Add compatibility fields for frontend using real clinic info
        clinicaIds: ['1'], // Keep ID structure for now
        clinicaNome: currentClinicInfo.nome, // Real clinic name
        clinicaTelefone: currentClinicInfo.telefone, // Real clinic phone
        cidade: 'São Paulo', // Default city - could be configurable from clinic address
        distancia: Math.floor(Math.random() * 15) + 1, // Random distance 1-15km
        avaliacao: Number((4.5 + Math.random() * 0.5).toFixed(1)), // Random rating between 4.5-5.0
        numeroAvaliacoes: Math.floor(Math.random() * 100) + 20, // Random reviews 20-120
        disponibilidade: convertScheduleToAvailability(
          prof.horarios || [], 
          prof.duracaoConsulta || 30, 
          prof.horariosAlmoco || []
        ),
        proximasConsultas: [
          new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // 1 week
        ]
      }))

    return NextResponse.json(publicProfessionals)
  } catch (error) {
    console.error('Error fetching public professionals:', error)
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 })
  }
}