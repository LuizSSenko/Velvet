"use client";
import React, { useState } from 'react';

// Placeholder types (futuro: mover para /lib/types)
interface Professional { 
  id: string; 
  nome: string; 
  especialidade: string; 
  cor: string;
  horarios: ProfessionalSchedule[];
  telefone?: string;
  email?: string;
  ativo: boolean;
}
interface ProfessionalSchedule {
  id: string;
  diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  horaInicio: string;
  horaFim: string;
}
interface Booking { id: string; paciente: string; profissionalId: string; inicio: string; fim: string; status: 'confirmado' | 'pendente' | 'cancelado' }
interface CustomHour { id: string; type: 'weekday' | 'date'; target: string; start: string; end: string; closed: boolean }

const profissionaisSeed: Professional[] = [
  { 
    id: 'p1', 
    nome: 'Dra. Ana Silva', 
    especialidade: 'Cardiologia', 
    cor: '#3b82f6',
    telefone: '(11) 99999-1234',
    email: 'ana@clinica.com',
    ativo: true,
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
    horarios: [
      { id: 'h4', diaSemana: 'terca', horaInicio: '09:00', horaFim: '17:00' },
      { id: 'h5', diaSemana: 'quinta', horaInicio: '13:00', horaFim: '18:00' }
    ]
  },
  { 
    id: 'p3', 
    nome: 'Dra. Carla Mendes', 
    especialidade: 'Pediatria', 
    cor: '#06b6d4',
    telefone: '(11) 97777-9012',
    email: 'carla@clinica.com',
    ativo: true,
    horarios: [
      { id: 'h6', diaSemana: 'segunda', horaInicio: '14:00', horaFim: '18:00' },
      { id: 'h7', diaSemana: 'terca', horaInicio: '08:00', horaFim: '12:00' },
      { id: 'h8', diaSemana: 'quinta', horaInicio: '08:00', horaFim: '12:00' },
      { id: 'h9', diaSemana: 'sabado', horaInicio: '08:00', horaFim: '14:00' }
    ]
  },
];

const hoje = new Date();
const yyyy = hoje.getFullYear();
const mm = String(hoje.getMonth() + 1).padStart(2,'0');
const dd = String(hoje.getDate()).padStart(2,'0');
const baseDate = `${yyyy}-${mm}-${dd}`;

const bookingsSeed: Booking[] = [
  { id: 'b1', paciente: 'João Silva', profissionalId: 'p1', inicio: `${baseDate}T09:00`, fim: `${baseDate}T09:30`, status: 'confirmado' },
  { id: 'b2', paciente: 'Mariana Costa', profissionalId: 'p2', inicio: `${baseDate}T10:00`, fim: `${baseDate}T10:45`, status: 'pendente' },
  { id: 'b3', paciente: 'Pedro Gomes', profissionalId: 'p1', inicio: `${baseDate}T11:15`, fim: `${baseDate}T11:45`, status: 'confirmado' },
  { id: 'b4', paciente: 'Laura Dias', profissionalId: 'p3', inicio: `${baseDate}T14:00`, fim: `${baseDate}T14:30`, status: 'cancelado' },
  { id: 'b5', paciente: 'Carlos Souza', profissionalId: 'p2', inicio: `${baseDate}T15:30`, fim: `${baseDate}T16:15`, status: 'confirmado' },
  // Exemplo de agendamentos no mesmo horário para médicos diferentes
  { id: 'b6', paciente: 'Ana Oliveira', profissionalId: 'p1', inicio: `${baseDate}T14:00`, fim: `${baseDate}T14:30`, status: 'confirmado' },
  { id: 'b7', paciente: 'Roberto Lima', profissionalId: 'p2', inicio: `${baseDate}T14:00`, fim: `${baseDate}T14:30`, status: 'pendente' },
];

// Utilitários simples
function formatHour(dateStr: string) { return dateStr.split('T')[1].slice(0,5); }
function sameDay(a: string, dayIso: string) { return a.startsWith(dayIso); }
function formatDiaSemana(dia: string) {
  const map: Record<string, string> = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira', 
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };
  return map[dia] || dia;
}

// Gera matriz de dias (semana atual - domingo a sábado)
function getWeekDays(base: Date) {
  const start = new Date(base);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// Gera matriz de dias do mês
function getMonthDays(base: Date) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) { // 6 semanas x 7 dias
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

export default function ClinicaPage() {
  const [tab, setTab] = useState<'agenda' | 'dashboard' | 'config' | 'helpdesk'>('agenda');
  const [profissionais, setProfissionais] = useState<Professional[]>(profissionaisSeed);
  const [bookings] = useState<Booking[]>(bookingsSeed);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [weeklyHours, setWeeklyHours] = useState({ start: '07:00', end: '19:00', saturday: true, sunday: false });
  const [customHours, setCustomHours] = useState<CustomHour[]>([]);
  const [customForm, setCustomForm] = useState({ type: 'weekday', target: 'Segunda', start: '09:00', end: '17:00', closed: false });
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmado' | 'pendente' | 'cancelado'>('all');
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(selectedDate);
  const isoDay = (d: Date) => d.toISOString().split('T')[0];

  // Data efetiva para filtrar lista (clique ou selecionada)
  const effectiveDate = clickedDate || selectedDate;

  // Filtrar agendamentos com base nos filtros
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = searchPatient === '' || booking.paciente.toLowerCase().includes(searchPatient.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats para dashboard
  const todayBookings = bookings.filter(b => sameDay(b.inicio, isoDay(new Date())));
  const todayStats = {
    total: todayBookings.length,
    confirmados: todayBookings.filter(b => b.status === 'confirmado').length,
    pendentes: todayBookings.filter(b => b.status === 'pendente').length,
    cancelados: todayBookings.filter(b => b.status === 'cancelado').length
  };

  // Função para lidar com clique duplo no calendário mensal
  const handleDayClick = (day: Date) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) { // Duplo clique (menos de 300ms entre cliques)
      // Duplo clique: mudar para vista semanal e focar no dia
      setViewMode('week');
      setSelectedDate(day);
      setClickedDate(day);
    } else {
      // Clique simples: apenas filtrar agendamentos
      setClickedDate(day);
      setSelectedDate(day);
    }
    
    setLastClickTime(currentTime);
  };

  // Slots (simplificação: 08:00-18:00, intervalos de 30min)
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2,'0')}:${min}`;
  });

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-[#0a1220] via-[#0e1822] to-[#1a2332]">
      {/* Header melhorado com breadcrumb e stats */}
      <div className="relative bg-[#0b141d]/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-cyan-500/10"></div>
        <div className="relative px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>Dashboard</span>
                <span>•</span>
                <span className="text-blue-400">Área da Clínica</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {tab === 'agenda' ? 'Agenda & Agendamentos' : tab === 'dashboard' ? 'Business Intelligence' : tab === 'config' ? 'Configurações' : 'Central de Suporte'}
              </h1>
            </div>
            
            {/* Stats rápidas só na agenda */}
            {tab === 'agenda' && (
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Hoje:</span>
                  <span className="font-semibold text-white">{todayStats.total}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Confirmados:</span>
                  <span className="font-semibold text-green-400">{todayStats.confirmados}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">Pendentes:</span>
                  <span className="font-semibold text-yellow-400">{todayStats.pendentes}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Navegação por abas melhorada */}
          <div className="flex items-center gap-1 mt-4 bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              onClick={()=>setTab('agenda')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${tab==='agenda'?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg':'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agenda
            </button>
            <button 
              onClick={()=>setTab('dashboard')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${tab==='dashboard'?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg':'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
            <button 
              onClick={()=>setTab('config')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${tab==='config'?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg':'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </button>
            <button 
              onClick={()=>setTab('helpdesk')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${tab==='helpdesk'?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg':'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25A9.75 9.75 0 1021.75 12 9.75 9.75 0 0012 2.25z" />
              </svg>
              Suporte
            </button>
          </div>
        </div>
      </div>

      {tab === 'agenda' && (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Calendário semanal melhorado */}
          <div className="flex-1 overflow-auto">
            {/* Controles do calendário */}
            <div className="sticky top-0 bg-[#0e1822]/95 backdrop-blur-sm border-b border-white/10 p-6 z-20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Botão Hoje separado */}
                  <button 
                    onClick={()=> setSelectedDate(new Date())} 
                    className="px-4 h-10 text-sm font-medium bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    title="Hoje"
                  >
                    Hoje
                  </button>
                  
                  {/* Seletor de visualização com setas */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg">
                    <button 
                      onClick={()=> setSelectedDate(d=> new Date(d.getTime() - (viewMode === 'week' ? 7*86400000 : 30*86400000)))} 
                      className="h-10 w-10 flex items-center justify-center rounded-l-lg hover:bg-white/10 transition-colors"
                      title={viewMode === 'week' ? 'Semana anterior' : 'Mês anterior'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1 p-1 border-x border-white/10">
                      <button 
                        onClick={()=> setViewMode('week')} 
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                      >
                        Semana
                      </button>
                      <button 
                        onClick={()=> setViewMode('month')} 
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                      >
                        Mês
                      </button>
                    </div>
                    <button 
                      onClick={()=> setSelectedDate(d=> new Date(d.getTime() + (viewMode === 'week' ? 7*86400000 : 30*86400000)))} 
                      className="h-10 w-10 flex items-center justify-center rounded-r-lg hover:bg-white/10 transition-colors"
                      title={viewMode === 'week' ? 'Próxima semana' : 'Próximo mês'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-base font-semibold text-gray-200">
                      {viewMode === 'week' 
                        ? weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                        : selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                      }
                    </h2>
                    <p className="text-xs text-gray-400">
                      {viewMode === 'week' 
                        ? `${weekDays[0].getDate()} a ${weekDays[6].getDate()}`
                        : `${monthDays[0].getDate()} a ${monthDays[41].getDate()}`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-green-500"/>
                      Confirmado
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"/>
                      Pendente
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500"/>
                      Cancelado
                    </span>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Agendamento
                  </button>
                </div>
              </div>
            </div>

            {/* Grid do calendário */}
            <div className="p-6 pt-4">
              {viewMode === 'week' ? (
                <div className="grid rounded-xl overflow-hidden border border-white/10 bg-white/5" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
                  {/* Header dias */}
                  <div className="h-12 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-b border-white/10"></div>
                  {weekDays.map(d => (
                    <div key={d.toISOString()} className="h-12 flex flex-col items-center justify-center text-xs font-medium bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-b border-white/10 border-l border-white/10">
                      <span className="text-gray-300 text-[10px]">{d.toLocaleDateString('pt-BR',{ weekday:'short'}).replace('.','')}</span>
                      <span className={`mt-0.5 text-sm w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isoDay(d)===isoDay(new Date())?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold':'text-gray-300 hover:bg-white/10'}`}>
                        {d.getDate()}
                      </span>
                    </div>
                  ))}

                  {/* Linhas horários */}
                  {timeSlots.map(ts => {
                    // Verifica se existe algum agendamento neste horário em qualquer dia da semana
                    const hasBookingsInSlot = weekDays.some(day => {
                      const dayIso = isoDay(day);
                      const dayBookings = filteredBookings.filter(b => sameDay(b.inicio, dayIso));
                      return dayBookings.some(b => formatHour(b.inicio) === ts);
                    });
                    
                    const cellHeight = hasBookingsInSlot ? 'h-20' : 'h-12';
                    
                    return (
                    <React.Fragment key={`slot-${ts}`}>
                      <div key={`label-${ts}`} className={`${cellHeight} border-b border-white/5 text-xs pr-3 pt-2 text-gray-500 flex items-start justify-end font-medium bg-white/5`}>
                        {ts}
                      </div>
                      {weekDays.map(day => {
                        const dayIso = isoDay(day);
                        const dayBookings = filteredBookings.filter(b => sameDay(b.inicio, dayIso));
                        const slotBookings = dayBookings.filter(b => formatHour(b.inicio) === ts);
                        return (
                          <div key={`${dayIso}-${ts}`} className={`relative ${cellHeight} border-b border-white/5 border-l border-white/5 overflow-hidden group hover:bg-white/5 transition-colors`}>
                            {slotBookings.map((b, index) => {
                              const prof = profissionais.find(p => p.id === b.profissionalId)!;
                              const totalBookings = slotBookings.length;
                              const left = totalBookings > 1 ? `${(index * 100) / totalBookings}%` : '1px';
                              const widthPercent = totalBookings > 1 ? `${100 / totalBookings}%` : '100%';
                              
                              return (
                                <button
                                  key={b.id}
                                  onClick={()=> setSelectedBooking(b)}
                                  className={`absolute rounded-lg text-left px-3 py-2 flex flex-col justify-between text-xs font-medium shadow-lg border transition-all hover:scale-105 hover:z-10 ${
                                    b.status==='confirmado'? 'bg-gradient-to-br from-green-600/80 to-emerald-500/70 border-green-400/30 text-white': 
                                    b.status==='pendente' ? 'bg-gradient-to-br from-yellow-600/70 to-amber-500/60 border-yellow-400/30 text-white' : 
                                    'bg-gradient-to-br from-red-600/70 to-rose-500/60 border-red-400/30 text-white'
                                  }`}
                                  style={{ 
                                    left: left,
                                    width: widthPercent,
                                    top: '2px',
                                    bottom: '2px',
                                    boxShadow: `0 4px 12px -2px ${prof.cor}40`,
                                    marginRight: totalBookings > 1 ? '1px' : '0'
                                  }}
                                >
                                  <span className="truncate font-semibold">{b.paciente}</span>
                                  <span className="text-[10px] opacity-90 truncate">{prof.nome}</span>
                                </button>
                              );
                            })}
                            {/* Indicador para adicionar agendamento */}
                            {slotBookings.length === 0 && (
                              <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className={`${hasBookingsInSlot ? 'w-6 h-6' : 'w-4 h-4'} rounded-full bg-blue-600/20 border-2 border-blue-400/50 flex items-center justify-center`}>
                                  <svg className={`${hasBookingsInSlot ? 'w-3 h-3' : 'w-2 h-2'} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                /* Visualização mensal */
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {/* Header dias da semana */}
                  <div className="grid grid-cols-7 bg-gradient-to-r from-blue-600/20 to-cyan-500/20">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="h-12 flex items-center justify-center text-xs font-semibold text-gray-300 border-r border-white/10 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid mensal */}
                  <div className="grid grid-cols-7">
                    {monthDays.map((day, index) => {
                      const dayIso = isoDay(day);
                      const dayBookings = filteredBookings.filter(b => sameDay(b.inicio, dayIso));
                      const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                      const isToday = dayIso === isoDay(new Date());
                      const isSelected = clickedDate && isoDay(clickedDate) === dayIso;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDayClick(day)}
                          className={`relative h-20 border-r border-b border-white/5 p-2 transition-all duration-200 hover:bg-white/10 ${
                            !isCurrentMonth ? 'opacity-40' : ''
                          } ${isSelected ? 'bg-blue-600/20 ring-1 ring-blue-400/50' : ''}`}
                          title={`${dayBookings.length} agendamento(s) - Duplo clique para ver detalhes`}
                        >
                          <div className="flex flex-col h-full">
                            <span className={`text-sm font-medium mb-2 ${
                              isToday ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs' : 
                              isCurrentMonth ? 'text-gray-200' : 'text-gray-500'
                            }`}>
                              {day.getDate()}
                            </span>
                            
                            {/* Contador de consultas */}
                            {dayBookings.length > 0 && (
                              <div className="flex-1 flex flex-col items-center justify-center">
                                <div className={`
                                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                  ${dayBookings.length <= 3 ? 'bg-green-500/80' :
                                    dayBookings.length <= 6 ? 'bg-yellow-500/80' : 'bg-red-500/80'}
                                `}>
                                  {dayBookings.length}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1">
                                  {dayBookings.length === 1 ? 'consulta' : 'consultas'}
                                </span>
                              </div>
                            )}
                            
                            {/* Indicador visual para dias sem agendamentos */}
                            {dayBookings.length === 0 && isCurrentMonth && (
                              <div className="flex-1 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-gray-600/50"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista lateral melhorada */}
          <aside className="w-full lg:w-96 border-l border-white/10 bg-gradient-to-b from-[#0b141d] to-[#0e1822] flex flex-col h-[600px] lg:h-auto">
            {/* Header da lista */}
            <div className="p-6 border-b border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Agendamentos</h3>
                <div className="flex items-center gap-2">
                  {clickedDate && (
                    <button
                      onClick={() => {setClickedDate(null); setSelectedDate(new Date());}}
                      className="text-xs text-gray-400 hover:text-gray-200 underline"
                    >
                      Limpar filtro
                    </button>
                  )}
                  <input
                    type="date"
                    value={isoDay(effectiveDate)}
                    onChange={(e)=> {
                      const newDate = new Date(e.target.value);
                      setSelectedDate(newDate);
                      setClickedDate(newDate);
                    }}
                    className="bg-white/10 border border-white/20 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              
              {/* Filtros e busca */}
              <div className="space-y-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Todos', color: 'bg-gray-500' },
                    { key: 'confirmado', label: 'Confirmados', color: 'bg-green-500' },
                    { key: 'pendente', label: 'Pendentes', color: 'bg-yellow-500' },
                    { key: 'cancelado', label: 'Cancelados', color: 'bg-red-500' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterStatus(filter.key as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterStatus === filter.key 
                          ? 'bg-white/20 text-white ring-1 ring-white/30' 
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${filter.color}`}></span>
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Detalhes do agendamento selecionado */}
            {selectedBooking && (
              <div className="border-b border-white/10 bg-gradient-to-r from-[#0a1220] to-[#0e1822] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg text-white">Detalhes do Agendamento</h4>
                  <button 
                    onClick={()=> setSelectedBooking(null)} 
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Paciente</p>
                    <p className="font-semibold text-white">{selectedBooking.paciente}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Horário</p>
                      <p className="font-medium text-white">{formatHour(selectedBooking.inicio)} - {formatHour(selectedBooking.fim)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
                      <p className="font-medium text-white">{selectedBooking.status}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Profissional</p>
                    <p className="font-medium text-white">{profissionais.find(p=> p.id===selectedBooking.profissionalId)?.nome}</p>
                    <p className="text-xs text-gray-400">{profissionais.find(p=> p.id===selectedBooking.profissionalId)?.especialidade}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button className="flex-1 h-10 rounded-lg bg-white/10 text-gray-300 font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            
            {/* Lista de agendamentos */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {filteredBookings
                .filter(b => sameDay(b.inicio, isoDay(effectiveDate)))
                .sort((a, b) => a.inicio.localeCompare(b.inicio))
                .map(b => {
                  const prof = profissionais.find(p=> p.id===b.profissionalId)!;
                  const isSelected = selectedBooking?.id === b.id;
                  return (
                    <button 
                      key={b.id} 
                      onClick={()=> setSelectedBooking(b)} 
                      className={`w-full text-left rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-blue-400/50 ring-1 ring-blue-400/30' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {formatHour(b.inicio)} - {formatHour(b.fim)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              b.status==='confirmado'?'bg-green-500/20 text-green-300 ring-1 ring-green-500/30': 
                              b.status==='pendente' ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30' : 
                              'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-base font-semibold text-white mb-1">{b.paciente}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: prof.cor}}></div>
                          <span>{prof.nome}</span>
                          <span>•</span>
                          <span>{prof.especialidade}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              
              {filteredBookings.filter(b => sameDay(b.inicio, isoDay(effectiveDate))).length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Nenhum agendamento encontrado</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {searchPatient ? 'Tente ajustar os filtros ou busca' : 'para esta data'}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {tab === 'dashboard' && (
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Business Intelligence</h2>
                <p className="text-gray-400">Análise de desempenho e métricas da clínica</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Últimos 30 dias</option>
                  <option>Últimos 7 dias</option>
                  <option>Este mês</option>
                  <option>Mês anterior</option>
                  <option>Este ano</option>
                </select>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:brightness-110 transition-all">
                  Exportar Relatório
                </button>
              </div>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-medium">+15%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">247</h3>
                <p className="text-sm text-gray-300">Consultas este mês</p>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-medium">+22%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">R$ 42.850</h3>
                <p className="text-sm text-gray-300">Receita este mês</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-violet-500/20 border border-purple-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-medium">+8%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">185</h3>
                <p className="text-sm text-gray-300">Pacientes ativos</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-red-400 font-medium">-3%</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">92%</h3>
                <p className="text-sm text-gray-300">Taxa de ocupação</p>
              </div>
            </div>

            {/* Gráficos e análises */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Gráfico de consultas */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Consultas por Período</h3>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">Diário</button>
                    <button className="px-3 py-1 text-xs text-gray-400 hover:text-white">Semanal</button>
                    <button className="px-3 py-1 text-xs text-gray-400 hover:text-white">Mensal</button>
                  </div>
                </div>
                
                {/* Simulação de gráfico */}
                <div className="h-64 bg-gradient-to-t from-blue-600/10 to-transparent rounded-lg border border-white/10 flex items-end justify-center p-4">
                  <div className="flex items-end gap-2 h-full w-full max-w-lg">
                    {[65, 45, 78, 52, 67, 89, 76, 34, 56, 23, 67, 45, 78, 56].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-sm" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top profissionais */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Top Profissionais</h3>
                <div className="space-y-4">
                  {profissionais.map((prof, index) => (
                    <div key={prof.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: prof.cor}}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{prof.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" 
                              style={{width: `${85 - index * 15}%`}}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{85 - index * 15}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Análises detalhadas */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Especialidades mais procuradas */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Especialidades Mais Procuradas</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Cardiologia', value: 45, color: '#3b82f6' },
                    { name: 'Dermatologia', value: 32, color: '#6366f1' },
                    { name: 'Pediatria', value: 28, color: '#06b6d4' },
                    { name: 'Ortopedia', value: 18, color: '#8b5cf6' },
                    { name: 'Neurologia', value: 12, color: '#ec4899' }
                  ].map(spec => (
                    <div key={spec.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: spec.color}}></div>
                        <span className="text-sm text-gray-300">{spec.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{
                              width: `${spec.value}%`,
                              backgroundColor: spec.color
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-white font-medium w-8 text-right">{spec.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horários de pico */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Horários de Maior Demanda</h3>
                <div className="space-y-3">
                  {[
                    { time: '09:00 - 10:00', percentage: 85 },
                    { time: '10:00 - 11:00', percentage: 92 },
                    { time: '14:00 - 15:00', percentage: 78 },
                    { time: '15:00 - 16:00', percentage: 88 },
                    { time: '16:00 - 17:00', percentage: 76 }
                  ].map(slot => (
                    <div key={slot.time} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{slot.time}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full" 
                            style={{width: `${slot.percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-xs text-white font-medium w-8 text-right">{slot.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="bg-gradient-to-r from-green-600/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Resumo Financeiro</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">R$ 42.850</p>
                  <p className="text-sm text-gray-400 mt-1">Receita Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">R$ 38.190</p>
                  <p className="text-sm text-gray-400 mt-1">Receita Líquida</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">R$ 4.660</p>
                  <p className="text-sm text-gray-400 mt-1">Comissões</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">R$ 173</p>
                  <p className="text-sm text-gray-400 mt-1">Ticket Médio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Configurações da Clínica</h2>
            </div>

            {/* Seção 1: Profissionais/Médicos */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Profissionais & Médicos</h3>
                  <p className="text-sm text-gray-400">Gerencie os profissionais que utilizam as salas da clínica e seus horários de disponibilidade</p>
                </div>
                <button 
                  onClick={() => {setSelectedProfessional(null); setEditingProfessional(true);}}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:brightness-110 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Novo Profissional
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {profissionais.map(prof => (
                  <div key={prof.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: prof.cor}}></div>
                          <div>
                            <h4 className="font-semibold text-white">{prof.nome}</h4>
                            <p className="text-sm text-gray-400">{prof.especialidade}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${prof.ativo ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                            {prof.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          <button 
                            onClick={() => {setSelectedProfessional(prof); setEditingProfessional(true);}}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {prof.telefone && (
                        <div className="text-xs text-gray-400 mb-3">
                          <span className="font-medium">Tel:</span> {prof.telefone}
                        </div>
                      )}

                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Horários na Clínica</h5>
                        {prof.horarios.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">Nenhum horário configurado</p>
                        ) : (
                          <div className="space-y-1">
                            {prof.horarios.map(horario => (
                              <div key={horario.id} className="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2 border border-white/10">
                                <span className="text-gray-300">{formatDiaSemana(horario.diaSemana)}</span>
                                <span className="font-medium text-white">{horario.horaInicio} - {horario.horaFim}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Seção 2: Configurações da Clínica */}
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Configurações da Clínica</h3>
                <p className="text-sm text-gray-400">Defina o horário geral de funcionamento da clínica</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Horário de Funcionamento</h4>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col text-sm">
                      <label className="mb-2 text-xs uppercase tracking-wide text-gray-400 font-semibold">Abertura</label>
                      <input 
                        type="time" 
                        value={weeklyHours.start} 
                        onChange={e=> setWeeklyHours(v=> ({...v,start:e.target.value}))} 
                        className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col text-sm">
                      <label className="mb-2 text-xs uppercase tracking-wide text-gray-400 font-semibold">Fechamento</label>
                      <input 
                        type="time" 
                        value={weeklyHours.end} 
                        onChange={e=> setWeeklyHours(v=> ({...v,end:e.target.value}))} 
                        className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-3 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={weeklyHours.saturday} 
                        onChange={e=> setWeeklyHours(v=> ({...v,saturday:e.target.checked}))} 
                        className="accent-blue-600"
                      />
                      Funciona aos Sábados
                    </label>
                    <label className="inline-flex items-center gap-3 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={weeklyHours.sunday} 
                        onChange={e=> setWeeklyHours(v=> ({...v,sunday:e.target.checked}))} 
                        className="accent-blue-600"
                      />
                      Funciona aos Domingos
                    </label>
                  </div>

                  <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all">
                    Salvar Configurações
                  </button>
                </div>
              </div>

              {/* Exceções de funcionamento */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Feriados & Exceções</h4>
                
                {customHours.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Nenhuma exceção cadastrada</p>
                    <p className="text-xs text-gray-500 mt-1">Adicione feriados ou dias com horário diferenciado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customHours.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          <span><span className="text-gray-400">Tipo:</span> <span className="text-white">{item.type === 'weekday' ? 'Dia da Semana' : 'Data'}</span></span>
                          <span><span className="text-gray-400">Alvo:</span> <span className="text-white">{item.target}</span></span>
                          {item.closed ? (
                            <span className="text-red-300 font-medium">Fechado</span>
                          ) : (
                            <span><span className="text-gray-400">Horário:</span> <span className="text-white">{item.start} - {item.end}</span></span>
                          )}
                        </div>
                        <button
                          onClick={()=> setCustomHours(list => list.filter(h => h.id !== item.id))}
                          className="px-3 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={e=> {e.preventDefault(); setCustomHours(list => [...list, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), type: customForm.type as 'weekday'|'date', target: customForm.target, start: customForm.start, end: customForm.end, closed: customForm.closed }]); }}
                  className="mt-6 grid md:grid-cols-5 gap-4 text-sm items-end bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tipo</label>
                    <select
                      value={customForm.type}
                      onChange={e=> setCustomForm(f=> ({...f,type:e.target.value, target: e.target.value==='weekday'?'Segunda':''}))}
                      className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekday">Dia da Semana</option>
                      <option value="date">Data Específica</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">{customForm.type==='weekday'?'Dia':'Data'}</label>
                    {customForm.type==='weekday' ? (
                      <select value={customForm.target} onChange={e=> setCustomForm(f=> ({...f,target:e.target.value}))} className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    ) : (
                      <input type="date" value={customForm.target} onChange={e=> setCustomForm(f=> ({...f,target:e.target.value}))} className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Início</label>
                    <input type="time" value={customForm.start} disabled={customForm.closed} onChange={e=> setCustomForm(f=> ({...f,start:e.target.value}))} className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fim</label>
                    <input type="time" value={customForm.end} disabled={customForm.closed} onChange={e=> setCustomForm(f=> ({...f,end:e.target.value}))} className="bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={customForm.closed} onChange={e=> setCustomForm(f=> ({...f,closed:e.target.checked}))} className="accent-blue-600"/> 
                      Fechado
                    </label>
                    <button className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:brightness-110 transition-all">
                      Adicionar
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'helpdesk' && (
        <div className="flex-1 overflow-auto p-8 space-y-10">
          <h2 className="text-xl font-semibold">Helpdesk</h2>
          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-400">Abrir Chamado</h3>
                <form className="space-y-4 text-sm">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1 font-semibold">Título</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded px-3 py-2" placeholder="Ex: Problema ao confirmar consulta" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1 font-semibold">Categoria</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2">
                        <option>Suporte Técnico</option>
                        <option>Financeiro</option>
                        <option>Solicitação</option>
                        <option>Outro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1 font-semibold">Descrição</label>
                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2" placeholder="Detalhe o problema ou solicitação"></textarea>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                    <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600"/> Urgente</label>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600"/> Enviar cópia para e-mail</label>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 h-10 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:brightness-110">Enviar</button>
                    <button type="reset" className="px-6 h-10 rounded-md bg-white/5 text-gray-300 text-sm font-semibold hover:bg-white/10">Limpar</button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-400">Chamados Recentes</h3>
                <div className="space-y-3 text-xs">
                  {[1,2,3].map(i => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between hover:bg-white/10 transition">
                      <div className="pr-4">
                        <p className="font-semibold text-gray-100">#{1200+i} Problema ao gerar relatório</p>
                        <p className="text-gray-400 mt-0.5">Aberto há 2h · Prioridade: Média</p>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] uppercase tracking-wide">Em Andamento</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-400">Status Plataforma</h3>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-center justify-between"><span>API Principal</span><span className="text-green-400">Operacional</span></li>
                  <li className="flex items-center justify-between"><span>Envio de E-mails</span><span className="text-green-400">Operacional</span></li>
                  <li className="flex items-center justify-between"><span>Telemedicina</span><span className="text-green-400">Operacional</span></li>
                  <li className="flex items-center justify-between"><span>Processamento Relatórios</span><span className="text-yellow-400">Lento</span></li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-400">Atalhos Rápidos</h3>
                <div className="grid gap-3 text-xs">
                  {[
                    ['Importar Agenda','⚙️'],
                    ['Exportar Dados','📤'],
                    ['Faturamento','💰'],
                    ['Relatórios BI','📊'],
                    ['Logs Acesso','🗂️'],
                    ['Base Conhecimento','📘']
                  ].map(([label,icon]) => (
                    <button key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
                      <span className="text-lg">{icon}</span>
                      <span className="font-medium text-gray-200">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white">
                <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide">Suporte Premium</h3>
                <p className="text-[12px] opacity-90 mb-4 leading-relaxed">Tenha SLA dedicado, gestor de conta e suporte avançado para escalar operações.</p>
                <button className="w-full h-9 rounded-md font-semibold bg-white/15 hover:bg-white/25 transition">Falar com Vendas</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
