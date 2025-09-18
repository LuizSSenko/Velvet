"use client";
import React, { useState, useEffect } from 'react';
import { Professional, ProfessionalSchedule, ProfessionalBreak, Booking, CustomHour, ClinicHours, ClinicAddress, ClinicContacts, ClinicInfo } from '@/lib/types';

// API functions
async function fetchProfessionals(): Promise<Professional[]> {
  try {
    const response = await fetch('/api/professionals')
    if (!response.ok) throw new Error('Failed to fetch professionals')
    return await response.json()
  } catch (error) {
    console.error('Error fetching professionals:', error)
    return []
  }
}

async function saveProfessionals(professionals: Professional[]): Promise<void> {
  try {
    const response = await fetch('/api/professionals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professionals)
    })
    if (!response.ok) throw new Error('Failed to save professionals')
  } catch (error) {
    console.error('Error saving professionals:', error)
  }
}

async function fetchClinicConfig() {
  try {
    const [hoursRes, addressRes, contactsRes, customHoursRes] = await Promise.all([
      fetch('/api/clinic/hours'),
      fetch('/api/clinic/address'), 
      fetch('/api/clinic/contacts'),
      fetch('/api/clinic/custom-hours')
    ])

    const [hours, address, contacts, customHours] = await Promise.all([
      hoursRes.json(),
      addressRes.json(),
      contactsRes.json(), 
      customHoursRes.json()
    ])

    return { hours, address, contacts, customHours }
  } catch (error) {
    console.error('Error fetching clinic config:', error)
    return {
      hours: { start: '07:00', end: '19:00', saturday: true, sunday: false },
      address: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
      contacts: { telefone: '', email: '', whatsapp: '', site: '' },
      customHours: []
    }
  }
}

async function fetchBookings(): Promise<Booking[]> {
  try {
    const response = await fetch('/api/bookings')
    if (!response.ok) throw new Error('Failed to fetch bookings')
    return await response.json()
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

async function saveClinicHours(hours: ClinicHours): Promise<void> {
  try {
    const response = await fetch('/api/clinic/hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours)
    })
    if (!response.ok) throw new Error('Failed to save clinic hours')
  } catch (error) {
    console.error('Error saving clinic hours:', error)
  }
}

async function saveClinicInfo(info: ClinicInfo): Promise<void> {
  try {
    const response = await fetch('/api/clinic/info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    })
    if (!response.ok) throw new Error('Failed to save clinic info')
  } catch (error) {
    console.error('Error saving clinic info:', error)
  }
}

async function loadClinicInfo(): Promise<ClinicInfo | null> {
  try {
    const response = await fetch('/api/clinic/info')
    if (!response.ok) throw new Error('Failed to load clinic info')
    return await response.json()
  } catch (error) {
    console.error('Error loading clinic info:', error)
    return null
  }
}

async function saveClinicAddress(address: ClinicAddress): Promise<void> {
  try {
    const response = await fetch('/api/clinic/address', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    })
    if (!response.ok) throw new Error('Failed to save clinic address')
  } catch (error) {
    console.error('Error saving clinic address:', error)
  }
}

async function saveClinicContacts(contacts: ClinicContacts): Promise<void> {
  try {
    const response = await fetch('/api/clinic/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contacts)
    })
    if (!response.ok) throw new Error('Failed to save clinic contacts')
  } catch (error) {
    console.error('Error saving clinic contacts:', error)
  }
}

async function saveCustomHours(customHours: CustomHour[]): Promise<void> {
  try {
    const response = await fetch('/api/clinic/custom-hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customHours)
    })
    if (!response.ok) throw new Error('Failed to save custom hours')
  } catch (error) {
    console.error('Error saving custom hours:', error)
  }
}

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
  const [profissionais, setProfissionais] = useState<Professional[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]); // Integração com API de bookings
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [weeklyHours, setWeeklyHours] = useState<ClinicHours>({ start: '07:00', end: '19:00', saturday: true, sunday: false });
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({ 
    nome: 'Clínica Médica Central',
    telefone: '(11) 3333-4444',
    email: 'contato@clinicacentral.com.br'
  });
  const [customHours, setCustomHours] = useState<CustomHour[]>([]);
  const [customForm, setCustomForm] = useState({ type: 'weekday', target: 'Segunda', start: '09:00', end: '17:00', closed: false });
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmado' | 'pendente' | 'cancelado'>('all');
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário de profissional
  const [professionalForm, setProfessionalForm] = useState({
    nome: '',
    especialidade: '',
    cor: '#3b82f6',
    telefone: '',
    email: '',
    duracaoConsulta: 30, // padrão 30 minutos
    horarios: [] as ProfessionalSchedule[],
    horariosAlmoco: [] as ProfessionalBreak[]
  });

  // Estado para horário sendo editado
  const [editingSchedule, setEditingSchedule] = useState<ProfessionalSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    diaSemana: 'segunda' as const,
    horaInicio: '08:00',
    horaFim: '17:00'
  });

  // Estado para horários bloqueados (almoço)
  const [newBlockedHour, setNewBlockedHour] = useState<{inicio: string; fim: string}>({
    inicio: '12:00',
    fim: '13:00'
  });

  // Estados para endereço da clínica
  const [clinicAddress, setClinicAddress] = useState<ClinicAddress>({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  // Estados para contatos da clínica
  const [clinicContacts, setClinicContacts] = useState<ClinicContacts>({
    telefone: '',
    email: '',
    whatsapp: '',
    site: ''
  });

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [professionalsData, clinicData, clinicInfoData, bookingsData] = await Promise.all([
          fetchProfessionals(),
          fetchClinicConfig(),
          loadClinicInfo(),
          fetchBookings()
        ])

        setProfissionais(professionalsData)
        setWeeklyHours(clinicData.hours)
        setClinicAddress(clinicData.address)
        setClinicContacts(clinicData.contacts)
        setCustomHours(clinicData.customHours)
        setBookings(bookingsData)
        
        if (clinicInfoData) {
          setClinicInfo(clinicInfoData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Recarregar bookings periodicamente para mostrar novos agendamentos
  useEffect(() => {
    const interval = setInterval(reloadBookings, 30000) // Recarrega a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  // Save functions
  const handleSaveProfessionals = async () => {
    await saveProfessionals(profissionais)
  }

  const handleSaveClinicHours = async () => {
    await saveClinicHours(weeklyHours)
  }

  const handleSaveClinicInfo = async () => {
    try {
      await saveClinicInfo(clinicInfo)
      // Could add a toast notification here in the future
      console.log('Informações da clínica salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar informações da clínica:', error)
    }
  }

  const handleSaveClinicAddress = async () => {
    await saveClinicAddress(clinicAddress)
  }

  const handleSaveClinicContacts = async () => {
    await saveClinicContacts(clinicContacts)
  }

  const handleSaveCustomHours = async () => {
    await saveCustomHours(customHours)
  }

  // Função para recarregar bookings
  const reloadBookings = async () => {
    try {
      const bookingsData = await fetchBookings()
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error reloading bookings:', error)
    }
  }

  // Funções para gerenciar profissionais
  const handleOpenProfessionalForm = (professional?: Professional) => {
    if (professional) {
      // Editando profissional existente
      setSelectedProfessional(professional);
      setProfessionalForm({
        nome: professional.nome,
        especialidade: professional.especialidade,
        cor: professional.cor,
        telefone: professional.telefone || '',
        email: professional.email || '',
        duracaoConsulta: professional.duracaoConsulta || 30,
        horarios: professional.horarios,
        horariosAlmoco: professional.horariosAlmoco || []
      });
    } else {
      // Novo profissional
      setSelectedProfessional(null);
      setProfessionalForm({
        nome: '',
        especialidade: '',
        cor: '#3b82f6',
        telefone: '',
        email: '',
        duracaoConsulta: 30,
        horarios: [],
        horariosAlmoco: []
      });
    }
    setEditingProfessional(true);
  };

  const handleCloseProfessionalForm = () => {
    setEditingProfessional(false);
    setSelectedProfessional(null);
    setEditingSchedule(null);
    setProfessionalForm({
      nome: '',
      especialidade: '',
      cor: '#3b82f6',
      telefone: '',
      email: '',
      duracaoConsulta: 30,
      horarios: [],
      horariosAlmoco: []
    });
  };

  const handleSaveProfessional = async () => {
    try {
      if (selectedProfessional) {
        // Atualizando profissional existente
        const updatedProfessionals = profissionais.map(prof => 
          prof.id === selectedProfessional.id 
            ? { ...selectedProfessional, ...professionalForm }
            : prof
        );
        setProfissionais(updatedProfessionals);
        await saveProfessionals(updatedProfessionals);
      } else {
        // Criando novo profissional
        const newProfessional: Professional = {
          id: crypto.randomUUID(),
          ...professionalForm,
          ativo: true
        };
        
        const response = await fetch('/api/professionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfessional)
        });
        
        if (response.ok) {
          const createdProfessional = await response.json();
          setProfissionais(prev => [...prev, createdProfessional]);
        }
      }
      handleCloseProfessionalForm();
    } catch (error) {
      console.error('Error saving professional:', error);
    }
  };

  const handleAddSchedule = () => {
    const newSchedule: ProfessionalSchedule = {
      id: crypto.randomUUID(),
      ...scheduleForm
    };
    setProfessionalForm(prev => ({
      ...prev,
      horarios: [...prev.horarios, newSchedule]
    }));
    setScheduleForm({
      diaSemana: 'segunda',
      horaInicio: '08:00',
      horaFim: '17:00'
    });
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    setProfessionalForm(prev => ({
      ...prev,
      horarios: prev.horarios.filter(h => h.id !== scheduleId)
    }));
  };

  // Funções para gerenciar horários bloqueados
  const handleAddBlockedHour = () => {
    if (newBlockedHour.inicio && newBlockedHour.fim) {
      const diasUteis: Array<'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo'> = 
        ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
      
      const novosHorariosAlmoco: ProfessionalBreak[] = diasUteis.map(dia => ({
        id: `almoco-${dia}-${Date.now()}`,
        diaSemana: dia,
        horaInicio: newBlockedHour.inicio,
        horaFim: newBlockedHour.fim,
        descricao: 'Almoço'
      }));
      
      setProfessionalForm(prev => ({
        ...prev,
        horariosAlmoco: [...prev.horariosAlmoco, ...novosHorariosAlmoco]
      }));
      
      // Reset do formulário
      setNewBlockedHour({
        inicio: '12:00',
        fim: '13:00'
      });
    }
  };

  const handleRemoveBlockedHour = (index: number) => {
    setProfessionalForm(prev => ({
      ...prev,
      horariosAlmoco: prev.horariosAlmoco.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveBlockedHourGroup = (horaInicio: string, horaFim: string) => {
    setProfessionalForm(prev => ({
      ...prev,
      horariosAlmoco: prev.horariosAlmoco.filter(h => 
        !(h.horaInicio === horaInicio && h.horaFim === horaFim)
      )
    }));
  };

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
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dados da clínica...</p>
          </div>
        </div>
      ) : (
        <>
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
                  onClick={() => handleOpenProfessionalForm()}
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
                            onClick={() => handleOpenProfessionalForm(prof)}
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
                <p className="text-sm text-gray-400">Configure as informações gerais e horário de funcionamento da clínica</p>
              </div>

              {/* Informações da Clínica */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Informações da Clínica</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Nome da Clínica</label>
                    <input 
                      type="text" 
                      value={clinicInfo.nome} 
                      onChange={e => setClinicInfo(prev => ({...prev, nome: e.target.value}))}
                      placeholder="Ex: Clínica Médica Central"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Telefone Principal</label>
                    <input 
                      type="tel" 
                      value={clinicInfo.telefone} 
                      onChange={e => setClinicInfo(prev => ({...prev, telefone: e.target.value}))}
                      placeholder="(11) 3333-4444"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">E-mail da Clínica</label>
                    <input 
                      type="email" 
                      value={clinicInfo.email} 
                      onChange={e => setClinicInfo(prev => ({...prev, email: e.target.value}))}
                      placeholder="contato@clinica.com.br"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveClinicInfo}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Salvar Informações
                  </button>
                </div>
              </div>

              {/* Horário de Funcionamento */}
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

                  <button 
                    onClick={handleSaveClinicHours}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all"
                  >
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
                          onClick={async () => {
                            const updatedCustomHours = customHours.filter(h => h.id !== item.id);
                            setCustomHours(updatedCustomHours);
                            await saveCustomHours(updatedCustomHours);
                          }}
                          className="px-3 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={async e => {
                    e.preventDefault(); 
                    const newCustomHour = { 
                      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), 
                      type: customForm.type as 'weekday'|'date', 
                      target: customForm.target, 
                      start: customForm.start, 
                      end: customForm.end, 
                      closed: customForm.closed 
                    };
                    const updatedCustomHours = [...customHours, newCustomHour];
                    setCustomHours(updatedCustomHours);
                    await saveCustomHours(updatedCustomHours);
                  }}
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

              {/* Seção 3: Endereço da Clínica */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Endereço da Clínica</h4>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Rua/Avenida</label>
                      <input 
                        type="text" 
                        value={clinicAddress.rua} 
                        onChange={e => setClinicAddress(prev => ({...prev, rua: e.target.value}))}
                        placeholder="Ex: Rua das Flores"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Número</label>
                      <input 
                        type="text" 
                        value={clinicAddress.numero} 
                        onChange={e => setClinicAddress(prev => ({...prev, numero: e.target.value}))}
                        placeholder="123"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Complemento</label>
                      <input 
                        type="text" 
                        value={clinicAddress.complemento} 
                        onChange={e => setClinicAddress(prev => ({...prev, complemento: e.target.value}))}
                        placeholder="Sala 101, Andar 2º"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Bairro</label>
                      <input 
                        type="text" 
                        value={clinicAddress.bairro} 
                        onChange={e => setClinicAddress(prev => ({...prev, bairro: e.target.value}))}
                        placeholder="Centro"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Cidade</label>
                      <input 
                        type="text" 
                        value={clinicAddress.cidade} 
                        onChange={e => setClinicAddress(prev => ({...prev, cidade: e.target.value}))}
                        placeholder="São Paulo"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Estado</label>
                      <select 
                        value={clinicAddress.estado} 
                        onChange={e => setClinicAddress(prev => ({...prev, estado: e.target.value}))}
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">CEP</label>
                      <input 
                        type="text" 
                        value={clinicAddress.cep} 
                        onChange={e => setClinicAddress(prev => ({...prev, cep: e.target.value}))}
                        placeholder="01234-567"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveClinicAddress}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold hover:brightness-110 transition-all"
                  >
                    Salvar Endereço
                  </button>
                </div>
              </div>

              {/* Seção 4: Contatos da Clínica */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Contatos da Clínica</h4>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Telefone Principal
                      </label>
                      <input 
                        type="tel" 
                        value={clinicContacts.telefone} 
                        onChange={e => setClinicContacts(prev => ({...prev, telefone: e.target.value}))}
                        placeholder="(11) 3456-7890"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        E-mail
                      </label>
                      <input 
                        type="email" 
                        value={clinicContacts.email} 
                        onChange={e => setClinicContacts(prev => ({...prev, email: e.target.value}))}
                        placeholder="contato@clinica.com"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </label>
                      <input 
                        type="tel" 
                        value={clinicContacts.whatsapp} 
                        onChange={e => setClinicContacts(prev => ({...prev, whatsapp: e.target.value}))}
                        placeholder="(11) 99999-8888"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                        Site/URL
                      </label>
                      <input 
                        type="url" 
                        value={clinicContacts.site} 
                        onChange={e => setClinicContacts(prev => ({...prev, site: e.target.value}))}
                        placeholder="https://www.clinica.com"
                        className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleSaveClinicContacts}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all"
                    >
                      Salvar Contatos
                    </button>
                    <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:brightness-110 transition-all">
                      Testar WhatsApp
                    </button>
                  </div>
                </div>
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
        </>
      )}

      {/* Modal para Edição/Criação de Profissional */}
      {editingProfessional && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a2332] border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">
                {selectedProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Informações Básicas</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Nome Completo</label>
                    <input 
                      type="text" 
                      value={professionalForm.nome} 
                      onChange={e => setProfessionalForm(prev => ({...prev, nome: e.target.value}))}
                      placeholder="Dr. João Silva"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Especialidade</label>
                    <input 
                      type="text" 
                      value={professionalForm.especialidade} 
                      onChange={e => setProfessionalForm(prev => ({...prev, especialidade: e.target.value}))}
                      placeholder="Cardiologia"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Cor de Identificação</label>
                    <input 
                      type="color" 
                      value={professionalForm.cor} 
                      onChange={e => setProfessionalForm(prev => ({...prev, cor: e.target.value}))}
                      className="w-full h-10 bg-[#0e1822] border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Telefone</label>
                    <input 
                      type="tel" 
                      value={professionalForm.telefone} 
                      onChange={e => setProfessionalForm(prev => ({...prev, telefone: e.target.value}))}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">E-mail</label>
                    <input 
                      type="email" 
                      value={professionalForm.email} 
                      onChange={e => setProfessionalForm(prev => ({...prev, email: e.target.value}))}
                      placeholder="joao@clinica.com"
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Configurações de Consulta */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Configurações de Consulta</h4>
                
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Duração Média da Consulta</label>
                  <select 
                    value={professionalForm.duracaoConsulta} 
                    onChange={e => setProfessionalForm(prev => ({...prev, duracaoConsulta: parseInt(e.target.value)}))}
                    className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora e 30 minutos</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Horários Bloqueados (Almoço)</label>
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      value={newBlockedHour.inicio || '12:00'} 
                      onChange={e => setNewBlockedHour(prev => ({...prev, inicio: e.target.value}))}
                      className="flex-1 bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                      type="time" 
                      value={newBlockedHour.fim || '13:00'} 
                      onChange={e => setNewBlockedHour(prev => ({...prev, fim: e.target.value}))}
                      className="flex-1 bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <button
                      onClick={handleAddBlockedHour}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Lista de horários bloqueados */}
                {professionalForm.horariosAlmoco.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400">Horários Bloqueados:</p>
                    {Array.from(new Map(professionalForm.horariosAlmoco.map(h => 
                      [`${h.horaInicio}-${h.horaFim}`, h]
                    )).values()).map((horario, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-sm text-white">
                          das {horario.horaInicio} às {horario.horaFim} (todos os dias úteis)
                        </span>
                        <button
                          onClick={() => handleRemoveBlockedHourGroup(horario.horaInicio, horario.horaFim)}
                          className="px-3 py-1.5 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Horários de Atendimento */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Horários de Atendimento</h4>
                
                {professionalForm.horarios.length > 0 ? (
                  <div className="space-y-2">
                    {professionalForm.horarios.map(horario => (
                      <div key={horario.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-4 text-sm text-white">
                          <span className="font-medium">{formatDiaSemana(horario.diaSemana)}</span>
                          <span className="text-gray-400">das</span>
                          <span>{horario.horaInicio}</span>
                          <span className="text-gray-400">às</span>
                          <span>{horario.horaFim}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveSchedule(horario.id)}
                          className="px-3 py-1.5 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">Nenhum horário cadastrado</p>
                )}

                {/* Formulário para adicionar horário */}
                <div className="flex flex-wrap gap-3 items-end p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex-1 min-w-32">
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Dia da Semana</label>
                    <select 
                      value={scheduleForm.diaSemana} 
                      onChange={e => setScheduleForm(prev => ({...prev, diaSemana: e.target.value as any}))}
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="segunda">Segunda-feira</option>
                      <option value="terca">Terça-feira</option>
                      <option value="quarta">Quarta-feira</option>
                      <option value="quinta">Quinta-feira</option>
                      <option value="sexta">Sexta-feira</option>
                      <option value="sabado">Sábado</option>
                      <option value="domingo">Domingo</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-24">
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Início</label>
                    <input 
                      type="time" 
                      value={scheduleForm.horaInicio} 
                      onChange={e => setScheduleForm(prev => ({...prev, horaInicio: e.target.value}))}
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="flex-1 min-w-24">
                    <label className="block text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Fim</label>
                    <input 
                      type="time" 
                      value={scheduleForm.horaFim} 
                      onChange={e => setScheduleForm(prev => ({...prev, horaFim: e.target.value}))}
                      className="w-full bg-[#0e1822] border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <button
                    onClick={handleAddSchedule}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:brightness-110 transition-all"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
              <button
                onClick={handleCloseProfessionalForm}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfessional}
                disabled={!professionalForm.nome || !professionalForm.especialidade}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedProfessional ? 'Atualizar' : 'Criar'} Profissional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
