import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { Booking } from '@/lib/types'

// GET - Fetch all bookings
export async function GET() {
  try {
    const bookings = await redis.get<Booking[]>(REDIS_KEYS.BOOKINGS) || []
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

// POST - Create new booking
export async function POST(request: Request) {
  try {
    const newBooking: Omit<Booking, 'id' | 'createdAt'> = await request.json()
    
    // Validate required fields
    if (!newBooking.paciente || !newBooking.profissionalId || !newBooking.inicio || !newBooking.fim) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: paciente, profissionalId, inicio, fim' },
        { status: 400 }
      )
    }
    
    // Get existing bookings
    const existingBookings = await redis.get<Booking[]>(REDIS_KEYS.BOOKINGS) || []
    
    // Create booking with ID and timestamp
    const booking: Booking = {
      ...newBooking,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: newBooking.status || 'confirmado'
    }
    
    // Add to bookings list
    const updatedBookings = [...existingBookings, booking]
    await redis.set(REDIS_KEYS.BOOKINGS, updatedBookings)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agendamento criado com sucesso',
      booking 
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

// PUT - Update booking
export async function PUT(request: Request) {
  try {
    const updatedBooking: Booking = await request.json()
    
    if (!updatedBooking.id) {
      return NextResponse.json({ error: 'ID do agendamento é obrigatório' }, { status: 400 })
    }
    
    const existingBookings = await redis.get<Booking[]>(REDIS_KEYS.BOOKINGS) || []
    const bookingIndex = existingBookings.findIndex(b => b.id === updatedBooking.id)
    
    if (bookingIndex === -1) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }
    
    existingBookings[bookingIndex] = updatedBooking
    await redis.set(REDIS_KEYS.BOOKINGS, existingBookings)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agendamento atualizado com sucesso',
      booking: updatedBooking 
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

// DELETE - Remove booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    
    if (!bookingId) {
      return NextResponse.json({ error: 'ID do agendamento é obrigatório' }, { status: 400 })
    }
    
    const existingBookings = await redis.get<Booking[]>(REDIS_KEYS.BOOKINGS) || []
    const filteredBookings = existingBookings.filter(b => b.id !== bookingId)
    
    if (filteredBookings.length === existingBookings.length) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }
    
    await redis.set(REDIS_KEYS.BOOKINGS, filteredBookings)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agendamento removido com sucesso' 
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}