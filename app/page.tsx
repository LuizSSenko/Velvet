"use client";
import { useEffect, useState } from 'react';

interface NavItem { href: string; label: string }
const NAV_ITEMS: NavItem[] = [
  { href: '#inicio', label: 'Início' },
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#especialidades', label: 'Especialidades' },
  { href: '#para-clinicas', label: 'Para Clínicas' },
  { href: '#planos', label: 'Planos' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contato', label: 'Contato' },
];

interface ProfissionalPublico {
  id: string;
  nome: string;
  especialidade: string;
  cor?: string;
  telefone?: string;
  email?: string;
  horarios?: any;
  clinicaIds?: string[]; // Mudança: agora é um array de IDs
  clinicaNome?: string; // Nome real da clínica
  clinicaTelefone?: string; // Telefone real da clínica
  cidade: string;
  distancia?: number;
  avaliacao: number;
  numeroAvaliacoes: number;
  duracaoConsulta?: number; // Duração em minutos
  disponibilidade?: { [key: string]: string[] };
  proximasConsultas?: string[];
}

interface Clinica {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  especialidades: string[];
}

export default function Home() {
  const [audienceTab, setAudienceTab] = useState<'pacientes' | 'clinicas'>('pacientes');
  
  // Estados para o sistema de busca
  const [termoBusca, setTermoBusca] = useState('');
  const [cidadeBusca, setCidadeBusca] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [sugestoesProfissionais, setSugestoesProfissionais] = useState<ProfissionalPublico[]>([]);
  const [sugestoesEspecialidades, setSugestoesEspecialidades] = useState<string[]>([]);
  
  // Estados para agendamento integrado
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<ProfissionalPublico | null>(null);
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState('');
  const [clinicaSelecionada, setClinicaSelecionada] = useState<Clinica | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [profissionaisDaEspecialidade, setProfissionaisDaEspecialidade] = useState<ProfissionalPublico[]>([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  
  // Estados para modal de agendamento
  const [mostrarModalAgendamento, setMostrarModalAgendamento] = useState(false);
  const [dadosPaciente, setDadosPaciente] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  const [agendandoConsulta, setAgendandoConsulta] = useState(false);
  
  // Estados para dados da API
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState<ProfissionalPublico[]>([]);
  const [clinicasDisponiveis, setClinicasDisponiveis] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar profissionais e clínicas da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [professionalsResponse, clinicsResponse] = await Promise.all([
          fetch('/api/professionals/public'),
          fetch('/api/clinics/public')
        ]);
        
        if (professionalsResponse.ok) {
          const professionalsData = await professionalsResponse.json();
          setProfissionaisDisponiveis(professionalsData);
        }
        
        if (clinicsResponse.ok) {
          const clinicsData = await clinicsResponse.json();
          setClinicasDisponiveis(clinicsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Estados para o calendário
  const [dataAtual, setDataAtual] = useState(new Date());
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'semana' | 'mes'>('mes'); // Começa com visualização mensal

  // Função para gerar horários disponíveis por dia
  const getHorariosPorDia = (data: Date) => {
    if (!profissionalSelecionado && profissionaisDaEspecialidade.length === 0) {
      return [];
    }

    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][data.getDay()];
    
    // Se há um profissional específico selecionado
    if (profissionalSelecionado) {
      return profissionalSelecionado.disponibilidade?.[diaSemana] || [];
    }
    
    // Se há uma especialidade selecionada, combinar horários de todos os profissionais da especialidade
    if (profissionaisDaEspecialidade.length > 0) {
      const todosHorarios = profissionaisDaEspecialidade
        .flatMap(prof => prof.disponibilidade?.[diaSemana] || []);
      
      // Remover duplicatas e ordenar
      return [...new Set(todosHorarios)].sort();
    }
    
    return [];
  };

  // Função para gerar dias da semana
  const getWeekDays = (baseDate: Date) => {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Função para gerar dias do mês (incluindo dias anteriores/próximos para preencher grid)
  const getMonthDays = (baseDate: Date) => {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    
    // Ajustar para começar no domingo
    const startDay = start.getDay();
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDay);
    
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 semanas x 7 dias
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Função para verificar se uma data tem horários disponíveis
  const hasAvailableSlots = (date: Date) => {
    if (!profissionalSelecionado) return false;
    
    const dayOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][date.getDay()];
    const horarios = getHorariosPorDia(date);
    return horarios.length > 0;
  };

  // Função para lidar com clique no dia (mês -> semana)
  const handleDayClick = (date: Date) => {
    if (tipoVisualizacao === 'mes') {
      if (hasAvailableSlots(date)) {
        setDataAtual(date);
        setTipoVisualizacao('semana');
      }
    } else {
      setDataAtual(date);
    }
  };

  // Função para navegar no calendário
  const navegarCalendario = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataAtual);
    if (tipoVisualizacao === 'semana') {
      novaData.setDate(dataAtual.getDate() + (direcao === 'proximo' ? 7 : -7));
    } else {
      novaData.setMonth(dataAtual.getMonth() + (direcao === 'proximo' ? 1 : -1));
    }
    setDataAtual(novaData);
  };

  // Função para formatar data
  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Função para formatar dia da semana
  const formatarDiaSemana = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  // Função para selecionar horário
  const selecionarHorario = (data: Date, horario: string) => {
    setDataSelecionada(data.toISOString().split('T')[0]);
    setHorarioSelecionado(horario);
  };

  // Função para confirmar agendamento (abre modal)
  const confirmarAgendamento = () => {
    if (!profissionalSelecionado || !dataSelecionada || !horarioSelecionado) {
      alert('Por favor, selecione médico, data e horário');
      return;
    }
    setMostrarModalAgendamento(true);
  };

  // Função para finalizar agendamento
  const finalizarAgendamento = async () => {
    if (!dadosPaciente.nome || !dadosPaciente.telefone || !dadosPaciente.email) {
      alert('Por favor, preencha todos os dados do paciente');
      return;
    }

    if (!profissionalSelecionado || !dataSelecionada || !horarioSelecionado) {
      alert('Dados da consulta incompletos');
      return;
    }

    setAgendandoConsulta(true);

    try {
      // Calcular horário de fim (usar duração da consulta do profissional)
      const duracaoConsulta = profissionalSelecionado.duracaoConsulta || 30;
      const [hora, minuto] = horarioSelecionado.split(':').map(Number);
      const inicioDate = new Date(`${dataSelecionada}T${horarioSelecionado}:00`);
      const fimDate = new Date(inicioDate.getTime() + duracaoConsulta * 60000);

      const novoAgendamento = {
        paciente: dadosPaciente.nome,
        pacienteTelefone: dadosPaciente.telefone,
        pacienteEmail: dadosPaciente.email,
        profissionalId: profissionalSelecionado.id,
        profissionalNome: profissionalSelecionado.nome,
        especialidade: profissionalSelecionado.especialidade,
        inicio: inicioDate.toISOString(),
        fim: fimDate.toISOString(),
        status: 'confirmado' as const
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoAgendamento),
      });

      if (response.ok) {
        alert('Consulta agendada com sucesso! A clínica entrará em contato para confirmação.');
        
        // Reset dos estados
        setMostrarModalAgendamento(false);
        setDadosPaciente({ nome: '', telefone: '', email: '' });
        setProfissionalSelecionado(null);
        setDataSelecionada('');
        setHorarioSelecionado('');
        setMostrarCalendario(false);
        setTermoBusca('');
      } else {
        const error = await response.json();
        alert(`Erro ao agendar consulta: ${error.message || 'Tente novamente'}`);
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      alert('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setAgendandoConsulta(false);
    }
  };

  const todasEspecialidades = [...new Set(profissionaisDisponiveis.map(p => p.especialidade))];

  // Função de busca
  const handleBusca = (termo: string) => {
    setTermoBusca(termo);
    
    if (termo.length === 0) {
      setSugestoesProfissionais([]);
      setSugestoesEspecialidades([]);
      setMostrarSugestoes(false);
      return;
    }

    // Buscar especialidades
    const especialidadesFiltradas = todasEspecialidades.filter(esp =>
      esp.toLowerCase().includes(termo.toLowerCase())
    );

    // Buscar profissionais
    const profissionaisFiltrados = profissionaisDisponiveis.filter(prof =>
      prof.nome.toLowerCase().includes(termo.toLowerCase()) ||
      prof.especialidade.toLowerCase().includes(termo.toLowerCase())
    );

    setSugestoesEspecialidades(especialidadesFiltradas);
    setSugestoesProfissionais(profissionaisFiltrados);
    setMostrarSugestoes(true);
  };

  const selecionarProfissional = (profissional: ProfissionalPublico) => {
    setProfissionalSelecionado(profissional);
    setEspecialidadeSelecionada('');
    setProfissionaisDaEspecialidade([]);
    setTermoBusca(profissional.nome);
    setMostrarSugestoes(false);
    setMostrarCalendario(true);
    
    // Auto-selecionar clínica se há apenas uma disponível
    if (clinicasDisponiveis.length === 1) {
      setClinicaSelecionada(clinicasDisponiveis[0]);
    } else {
      setClinicaSelecionada(null);
    }
  };

  const selecionarEspecialidade = (especialidade: string) => {
    setEspecialidadeSelecionada(especialidade);
    setProfissionalSelecionado(null);
    setTermoBusca(especialidade);
    setMostrarSugestoes(false);
    
    // Filtrar profissionais da especialidade selecionada
    const profsFiltrados = profissionaisDisponiveis.filter(p => 
      p.especialidade === especialidade &&
      (cidadeBusca === '' || p.cidade.toLowerCase().includes(cidadeBusca.toLowerCase()))
    );
    setProfissionaisDaEspecialidade(profsFiltrados);
    setMostrarCalendario(true);
  };

  const realizarBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      // Se há um profissional ou especialidade selecionados, mostrar calendário
      if (profissionalSelecionado || especialidadeSelecionada) {
        setMostrarCalendario(true);
      } else {
        // Buscar automaticamente
        const profissionalEncontrado = profissionaisDisponiveis.find(p =>
          p.nome.toLowerCase().includes(termoBusca.toLowerCase())
        );
        const especialidadeEncontrada = todasEspecialidades.find(e =>
          e.toLowerCase().includes(termoBusca.toLowerCase())
        );

        if (profissionalEncontrado) {
          selecionarProfissional(profissionalEncontrado);
        } else if (especialidadeEncontrada) {
          selecionarEspecialidade(especialidadeEncontrada);
        }
      }
    }
  };

  const resetarBusca = () => {
    setTermoBusca('');
    setCidadeBusca('');
    setProfissionalSelecionado(null);
    setEspecialidadeSelecionada('');
    setProfissionaisDaEspecialidade([]);
    setClinicaSelecionada(null);
    setDataSelecionada('');
    setHorarioSelecionado('');
    setMostrarCalendario(false);
    setMostrarSugestoes(false);
  };

  // Função para obter clínicas disponíveis para um profissional
  const getClinicasDisponiveis = () => {
    if (profissionalSelecionado && profissionalSelecionado.clinicaIds) {
      return clinicasDisponiveis.filter(c => profissionalSelecionado.clinicaIds?.includes(c.id));
    }
    if (especialidadeSelecionada && profissionaisDaEspecialidade.length > 0) {
      const clinicaIds = [...new Set(profissionaisDaEspecialidade.flatMap(p => p.clinicaIds || []))];
      return clinicasDisponiveis.filter(c => clinicaIds.includes(c.id));
    }
    return [];
  };

  useEffect(() => {
    const navLinks: HTMLAnchorElement[] = Array.from(document.querySelectorAll('header nav a'));
    const sections: HTMLElement[] = Array.from(document.querySelectorAll('section[id]'));
    const map = new Map<HTMLElement, HTMLAnchorElement>();
    for (const sec of sections) {
      const link = navLinks.find(l => l.getAttribute('href') === `#${sec.id}`);
      if (link) map.set(sec, link);
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const link = map.get(entry.target as HTMLElement);
        if (!link) continue;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('nav-active'));
          link.classList.add('nav-active');
        }
      }
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0.25, 0.6] });
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col text-[15px]">
      {/* Sticky Header */}
  <header className="fixed top-0 inset-x-0 z-40 bg-[#0d1117d9] backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="#inicio" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/25 transition-transform group-hover:scale-105">
                C
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Clínica Agendamento</span>
            </a>
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="relative text-gray-400 hover:text-gray-100 transition">
                  {item.label}
                  <span className="nav-underline absolute -bottom-2 left-0 h-[2px] w-0 opacity-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all"></span>
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white px-5 py-2.5 rounded-md font-semibold shadow hover:shadow-md shadow-blue-600/30 hover:brightness-110 transition-all">
                Agendar Consulta
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="inicio" className="relative overflow-hidden pt-40 pb-36 pattern-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#111b27] to-[#0d1117] opacity-95" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center bg-white/70 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-blue-600/20 mb-6 animate-fade-up" data-anim="1">AGENDAMENTO MÉDICO SIMPLIFICADO</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight gradient-text animate-fade-up" data-anim="2">
              Cuide da sua saúde com tecnologia e acolhimento
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed animate-fade-up" data-anim="3">
              Plataforma completa para agendar consultas, gerenciar atendimentos e acessar serviços de saúde de forma rápida, segura e humanizada.
            </p>
            {/* Hero Search / Audience Switch */}
            <div className="mt-10 animate-fade-up" data-anim="4">
              <div className="mx-auto max-w-4xl glass rounded-2xl p-6 md:p-8 shadow-xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex bg-white/5 rounded-xl p-1 text-xs font-medium">
                    <button onClick={() => setAudienceTab('pacientes')} className={`px-4 py-2 rounded-lg transition ${audienceTab==='pacientes'?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow':''}`}>Para Pacientes</button>
                    <button onClick={() => setAudienceTab('clinicas')} className={`px-4 py-2 rounded-lg transition ${audienceTab==='clinicas'?'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow':''}`}>Para Clínicas</button>
                  </div>
                </div>
                {audienceTab === 'pacientes' && (
                  <div className="space-y-6">
                    {/* Busca Simplificada */}
                    {!mostrarCalendario && (
                      <form onSubmit={realizarBusca} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[2fr,1fr,auto]">
                          {/* Barra de Busca Principal */}
                          <div className="relative">
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <input
                                type="text"
                                placeholder="Especialidade ou nome do médico"
                                value={termoBusca}
                                onChange={(e) => handleBusca(e.target.value)}
                                onFocus={() => setMostrarSugestoes(termoBusca.length > 0)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                              />
                            </div>
                            
                            {/* Sugestões */}
                            {mostrarSugestoes && (sugestoesProfissionais.length > 0 || sugestoesEspecialidades.length > 0) && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e1822] border border-white/20 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                                {sugestoesEspecialidades.length > 0 && (
                                  <div className="p-3 border-b border-white/10">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Especialidades</p>
                                    {sugestoesEspecialidades.map(especialidade => (
                                      <button
                                        key={especialidade}
                                        type="button"
                                        onClick={() => selecionarEspecialidade(especialidade)}
                                        className="w-full text-left p-3 rounded hover:bg-white/10 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                          </svg>
                                          <span className="text-white font-medium">{especialidade}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                {loading && termoBusca.length > 0 && (
                                  <div className="p-6 text-center">
                                    <p className="text-gray-400">Carregando profissionais...</p>
                                  </div>
                                )}
                                
                                {!loading && sugestoesProfissionais.length > 0 && (
                                  <div className="p-3">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Profissionais</p>
                                    {sugestoesProfissionais.map(profissional => (
                                      <button
                                        key={profissional.id}
                                        type="button"
                                        onClick={() => selecionarProfissional(profissional)}
                                        className="w-full text-left p-3 rounded hover:bg-white/10 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                          </div>
                                          <div>
                                            <p className="text-white font-medium">{profissional.nome}</p>
                                            <p className="text-gray-400 text-sm">{profissional.especialidade} • {profissional.cidade}</p>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Campo Cidade */}
                          <div>
                            <input 
                              placeholder="Cidade" 
                              value={cidadeBusca}
                              onChange={(e) => setCidadeBusca(e.target.value)}
                              className="w-full px-4 py-4 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder:text-gray-400 text-lg" 
                            />
                          </div>

                          {/* Botão Pesquisar */}
                          <div>
                            <button type="submit" className="h-[60px] px-8 rounded-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow hover:brightness-110 transition-all">
                              <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Pesquisar
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Especialidades em Destaque */}
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-sm text-gray-400 mb-3">Especialidades populares:</p>
                          <div className="flex flex-wrap gap-2">
                            {['Cardiologia', 'Dermatologia', 'Psiquiatria', 'Ortopedia', 'Ginecologia', 'Neurologia'].map(esp => (
                              <button
                                key={esp}
                                type="button"
                                onClick={() => selecionarEspecialidade(esp)}
                                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-gray-300 hover:text-white transition-colors"
                              >
                                {esp}
                              </button>
                            ))}
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Calendário de Agendamento */}
                    {mostrarCalendario && (
                      <div className="space-y-6">
                        {/* Header com informações da seleção */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white">
                                {profissionalSelecionado ? profissionalSelecionado.nome : `Profissionais de ${especialidadeSelecionada}`}
                              </h3>
                              {profissionalSelecionado && (
                                <p className="text-gray-300">{profissionalSelecionado.especialidade}</p>
                              )}
                            </div>
                            <button
                              onClick={resetarBusca}
                              className="text-gray-400 hover:text-white underline text-sm"
                            >
                              Nova busca
                            </button>
                          </div>

                          {/* Seleção de Profissional (se busca por especialidade) */}
                          {especialidadeSelecionada && profissionaisDaEspecialidade.length > 0 && (
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-300 mb-3">Escolha o profissional:</label>
                              <div className="grid gap-3">
                                {profissionaisDaEspecialidade.map(prof => (
                                  <button
                                    key={prof.id}
                                    onClick={() => selecionarProfissional(prof)}
                                    className={`p-4 rounded-lg border transition-colors text-left ${
                                      profissionalSelecionado?.id === prof.id
                                        ? 'bg-blue-600/20 border-blue-500 text-white'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="font-medium">{prof.nome}</p>
                                        <p className="text-sm opacity-75">{prof.cidade} • Avaliação: {prof.avaliacao} ⭐</p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Seleção de Clínica - Apenas quando há múltiplas clínicas */}
                          {profissionalSelecionado && clinicasDisponiveis.length > 1 && (
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-300 mb-3">Escolha a clínica:</label>
                              <div className="grid gap-3">
                                {getClinicasDisponiveis().map(clinica => (
                                  <button
                                    key={clinica.id}
                                    onClick={() => setClinicaSelecionada(clinica)}
                                    className={`p-4 rounded-lg border transition-colors text-left ${
                                      clinicaSelecionada?.id === clinica.id
                                        ? 'bg-green-600/20 border-green-500 text-white'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                    }`}
                                  >
                                    <div>
                                      <p className="font-medium text-white">{clinica.nome}</p>
                                      <p className="text-sm text-gray-400 mt-1">📍 {clinica.endereco}</p>
                                      <p className="text-sm text-gray-400">📞 {clinica.telefone}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clínica única - Exibição simplificada */}
                          {profissionalSelecionado && clinicasDisponiveis.length === 1 && (
                            <div className="mb-6">
                              <div className="p-4 rounded-lg bg-green-600/20 border border-green-500">
                                <div>
                                  <p className="font-medium text-white">{clinicasDisponiveis[0].nome}</p>
                                  <p className="text-sm text-gray-400 mt-1">📍 {clinicasDisponiveis[0].endereco}</p>
                                  <p className="text-sm text-gray-400">📞 {clinicasDisponiveis[0].telefone}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Calendário Interativo */}
                          {profissionalSelecionado && (clinicaSelecionada || clinicasDisponiveis.length === 1) && (
                            <div className="space-y-6">
                              {/* Header do Calendário */}
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-white">Selecione data e horário</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex bg-white/10 rounded-lg p-1">
                                    <button
                                      onClick={() => setTipoVisualizacao('mes')}
                                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                                        tipoVisualizacao === 'mes'
                                          ? 'bg-blue-600 text-white'
                                          : 'text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      Mês
                                    </button>
                                    <button
                                      onClick={() => setTipoVisualizacao('semana')}
                                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                                        tipoVisualizacao === 'semana'
                                          ? 'bg-blue-600 text-white'
                                          : 'text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      Semana
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => navegarCalendario('anterior')}
                                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => navegarCalendario('proximo')}
                                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Calendário Mensal */}
                              {tipoVisualizacao === 'mes' && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                  <div className="mb-4">
                                    <h3 className="text-lg font-medium text-white text-center">
                                      {dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                    </h3>
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-2 mb-4">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => (
                                      <div key={index} className="text-center py-2 text-sm font-medium text-gray-400">
                                        {dia}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-2">
                                    {getMonthDays(dataAtual).map((data, index) => {
                                      const hoje = new Date();
                                      const isPast = data < hoje;
                                      const isToday = data.toDateString() === hoje.toDateString();
                                      const isCurrentMonth = data.getMonth() === dataAtual.getMonth();
                                      const hasSlots = hasAvailableSlots(data);
                                      
                                      return (
                                        <button
                                          key={index}
                                          onClick={() => handleDayClick(data)}
                                          disabled={isPast || !hasSlots}
                                          className={`
                                            aspect-square p-2 rounded-lg border transition-colors text-sm font-medium
                                            ${!isCurrentMonth ? 'text-gray-600 border-transparent' : ''}
                                            ${isPast ? 'text-gray-500 border-gray-700 cursor-not-allowed' :
                                              hasSlots ? 'text-white border-white/20 bg-blue-600/20 hover:bg-blue-600/40 cursor-pointer' :
                                              'text-gray-400 border-white/10 cursor-default'}
                                            ${isToday ? 'ring-2 ring-blue-500' : ''}
                                          `}
                                        >
                                          <div className="flex flex-col items-center">
                                            <span>{data.getDate()}</span>
                                            {hasSlots && !isPast && isCurrentMonth && (
                                              <div className="w-1 h-1 bg-green-400 rounded-full mt-1"></div>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Legenda */}
                                  <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-blue-600/20 border border-white/20 rounded"></div>
                                      <span className="text-gray-400">Com horários</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-gray-700 rounded"></div>
                                      <span className="text-gray-400">Sem horários</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-400">
                                      Clique em um dia com horários disponíveis para ver os detalhes
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Calendário Semanal */}
                              {tipoVisualizacao === 'semana' && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                  <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-white">
                                      Semana de {getWeekDays(dataAtual)[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a {getWeekDays(dataAtual)[6].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    </h3>
                                    <button
                                      onClick={() => setTipoVisualizacao('mes')}
                                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      ← Voltar ao mês
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-2 mb-4">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => (
                                      <div key={index} className="text-center py-2 text-sm font-medium text-gray-400">
                                        {dia}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-2">
                                    {getWeekDays(dataAtual).map((data, index) => {
                                      const hoje = new Date();
                                      const isPast = data < hoje;
                                      const isToday = data.toDateString() === hoje.toDateString();
                                      const horariosDisponiveis = isPast ? [] : getHorariosPorDia(data);
                                      
                                      return (
                                        <div key={index} className={`min-h-[200px] border border-white/10 rounded-lg p-2 ${
                                          isPast ? 'bg-gray-700/30' : 'bg-white/5'
                                        }`}>
                                          <div className={`text-center py-1 mb-2 text-sm font-medium rounded ${
                                            isToday ? 'bg-blue-600 text-white' : 
                                            isPast ? 'text-gray-500' : 'text-gray-300'
                                          }`}>
                                            {data.getDate()}
                                          </div>
                                          
                                          {!isPast && (
                                            <div className="space-y-1">
                                              {horariosDisponiveis.map((horario) => (
                                                <button
                                                  key={horario}
                                                  onClick={() => selecionarHorario(data, horario)}
                                                  className={`w-full text-xs py-1 px-1 rounded transition-colors ${
                                                    dataSelecionada === data.toISOString().split('T')[0] && horarioSelecionado === horario
                                                      ? 'bg-green-600 text-white font-medium'
                                                      : 'bg-blue-600/70 hover:bg-blue-600 text-white'
                                                  }`}
                                                >
                                                  {horario}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                          
                                          {isPast && (
                                            <div className="text-center text-xs text-gray-500 mt-4">
                                              Indisponível
                                            </div>
                                          )}
                                          
                                          {!isPast && horariosDisponiveis.length === 0 && (
                                            <div className="text-center text-xs text-gray-400 mt-4">
                                              Sem horários
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Legenda */}
                                  <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-blue-600/70 rounded"></div>
                                      <span className="text-gray-400">Disponível</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                                      <span className="text-gray-400">Selecionado</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-gray-700 rounded"></div>
                                      <span className="text-gray-400">Indisponível</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Resumo da Seleção */}
                              {dataSelecionada && horarioSelecionado && (
                                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                                  <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                      <p className="font-medium text-white">Horário Selecionado</p>
                                      <p className="text-green-100 text-sm">
                                        {new Date(dataSelecionada).toLocaleDateString('pt-BR', { 
                                          weekday: 'long', 
                                          day: 'numeric', 
                                          month: 'long', 
                                          year: 'numeric' 
                                        })} às {horarioSelecionado}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Botão de Confirmação */}
                          {profissionalSelecionado && (clinicaSelecionada || clinicasDisponiveis.length === 1) && dataSelecionada && horarioSelecionado && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                              <button
                                onClick={confirmarAgendamento}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-semibold hover:brightness-110 transition-all text-lg"
                              >
                                Agendar Consulta
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {audienceTab === 'clinicas' && (
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      ['Agenda Inteligente','Sincronize múltiplos profissionais e salas.'],
                      ['Perfil Otimizado','Atraia novos pacientes com SEO e reputação.'],
                      ['Relatórios & BI','Métricas de ocupação e desempenho em tempo real.']
                    ].map(([t,d]) => (
                      <div key={t} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-sm font-semibold text-white mb-1">{t}</p>
                        <p className="text-[12px] text-gray-400 leading-relaxed">{d}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-4 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Profissionais verificados</span>
                  <span>Dados protegidos (LGPD)</span>
                  <span>Confirmação instantânea</span>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" data-anim="4">
              <button className="group relative inline-flex items-center justify-center px-10 py-4 font-semibold rounded-lg text-white overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
                <span className="relative">Agendar Agora</span>
              </button>
              <button className="px-10 py-4 rounded-lg font-semibold border-2 border-transparent bg-gradient-to-r from-gray-100 to-white hover:from-white hover:to-gray-50 text-gray-800 ring-1 ring-gray-200">
                Conhecer Funcionalidades
              </button>
            </div>
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-gray-400 animate-fade-up" data-anim="5">
              {[
                ['+50k', 'Consultas Agendadas'],
                ['98%', 'Satisfação'],
                ['24/7', 'Acesso Online'],
                ['+120', 'Profissionais']
              ].map(([stat,label]) => (
                <div key={stat} className="p-4 rounded-xl bg-white/5 backdrop-blur shadow-sm border border-white/10">
                  <p className="text-2xl font-bold text-white">{stat}</p>
                  <p className="text-gray-400 text-[10px] tracking-wide uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="relative py-28 bg-[#0f1722]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.10),transparent_65%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight gradient-text">Como Funciona</h2>
            <p className="mt-6 text-lg text-gray-400">Três passos simples para conectar pacientes e clínicas.</p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              ['Busca Inteligente','Encontre profissionais por especialidade, local, convênio ou disponibilidade.','🔍'],
              ['Escolha & Agende','Veja horários em tempo real e receba confirmação imediata.','📅'],
              ['Acompanhe & Retorne','Lembretes automáticos e histórico centralizado de consultas.','🔔']
            ].map(([title,desc,icon],i)=> (
              <div key={title} className="group relative rounded-2xl p-[1px]">
                <div className="h-full rounded-2xl bg-gradient-to-br from-[#182635] to-[#1f3348] p-7 flex flex-col border border-white/5 shadow-sm group-hover:shadow-xl transition-all">
                  <div className="flex items-center mb-5 gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center text-xl shadow shadow-indigo-600/30">{icon}</div>
                    <span className="text-sm font-semibold text-cyan-300">Passo {i+1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed flex-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialidades (antes Serviços) */}
      <section id="especialidades" className="relative py-28 bg-[#0d1117]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight gradient-text">Especialidades</h2>
            <p className="mt-6 text-lg text-gray-400">Diversas áreas para atender cada necessidade de saúde com qualidade.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon:'🏥', title:'Consultas Gerais', desc:'Acompanhamento clínico completo com foco em prevenção, diagnóstico e orientação de saúde personalizada.' },
              { icon:'🦷', title:'Odontologia', desc:'Tratamentos odontológicos modernos: prevenção, estética e procedimentos avançados com tecnologia digital.' },
              { icon:'🩺', title:'Exames', desc:'Exames laboratoriais e de imagem com agilidade, precisão e integração segura ao seu histórico.' },
              { icon:'👶', title:'Pediatria', desc:'Acompanhamento dedicado ao desenvolvimento saudável das crianças em todas as fases.' },
              { icon:'🫀', title:'Cardiologia', desc:'Avaliação cardiológica com monitoramento, exames especializados e orientação preventiva.' },
              { icon:'🧪', title:'Telemedicina', desc:'Consultas online seguras para suporte rápido e acompanhamento contínuo à distância.' },
              { icon:'🧠', title:'Neurologia', desc:'Avaliação especializada do sistema nervoso e acompanhamento clínico.' },
              { icon:'🦴', title:'Ortopedia', desc:'Diagnóstico e tratamento de lesões e condições musculoesqueléticas.' },
              { icon:'👁️', title:'Oftalmologia', desc:'Cuidados preventivos e tratamentos para a saúde da visão.' }
            ].map((s) => (
              <div key={s.title} className="service-card group rounded-2xl p-[1px]">
                <div className="h-full rounded-2xl bg-gradient-to-br from-[#182635] to-[#1f3348] p-6 flex flex-col shadow-sm hover:shadow-xl transition-all border border-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-2xl text-white shadow-md shadow-indigo-600/30 mb-5 group-hover:scale-105 transition-transform">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed flex-1">{s.desc}</p>
                  <div className="mt-5 flex items-center text-sm font-medium text-cyan-400 group-hover:gap-2 transition-all">
                    Saiba mais
                    <span className="opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="para-clinicas" className="relative py-28 bg-[#0d1117]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-8">Plataforma para Clínicas</h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">Centralize agendas, reduza faltas e aumente a ocupação com nossa solução completa de gestão e relacionamento com o paciente.</p>
            <p className="text-gray-400 leading-relaxed mb-8">Ferramentas de automação, marketing, telemedicina, segurança de dados e relatórios avançados em um único painel.</p>
            <div className="grid grid-cols-2 gap-5 mb-10">
              {[
                ['-32%','faltas (no-show)'],
                ['+27%','ocupação média'],
                ['+40%','novos pacientes'],
                ['100%','LGPD compliance']
              ].map(([a,b]) => (
                <div key={a} className="p-5 rounded-xl bg-[#182635] shadow-sm border border-white/10">
                  <p className="text-2xl font-bold text-white">{a}</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">{b}</p>
                </div>
              ))}
            </div>
            <button className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600" />
              <span className="relative">Agendar Demonstração</span>
              <span className="relative opacity-0 group-hover:opacity-100 translate-x-[-6px] group-hover:translate-x-0 transition">→</span>
            </button>
          </div>
          <div className="space-y-6">
            <div className="glass rounded-2xl p-8 shadow-sm border border-white/10">
              <h3 className="text-xl font-semibold mb-4 text-white">Principais Recursos</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {[
                  'Agenda multi-profissional com bloqueios inteligentes',
                  'Confirmação automática por e-mail / WhatsApp',
                  'Teleconsulta integrada (vídeo seguros)',
                  'Painel de BI com ocupação e no-show',
                  'Integração com ERP e faturamento',
                  'Ferramentas de reputação & comentários',
                  'SEO para páginas de profissionais',
                  'Exportação segura de dados' 
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl">
              <h4 className="text-lg font-semibold mb-3">Nosso Compromisso</h4>
              <p className="text-sm leading-relaxed opacity-90">Transparência, ética e inovação para oferecer o melhor cuidado em saúde centrado no paciente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="relative py-28 bg-[#0f1722]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text">Planos</h2>
            <p className="mt-6 text-lg text-gray-400">Escolha o plano ideal e escale o cuidado com eficiência.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {name:'Essencial', price:'R$ 0', note:'/teste 14 dias', features:['Agenda online','Perfil público','E-mail de confirmação','Suporte base']},
              {name:'Profissional', price:'R$ 199', note:'/mês', featured:true, features:['Tudo do Essencial','WhatsApp confirmações','Telemedicina','Relatórios avançados','Remarcação automática','Suporte prioritário']},
              {name:'Enterprise', price:'Custom', note:'', features:['Multi-clínica','SLA dedicado','BI avançado','Integrações ERP','Treinamento equipe','Gestor de conta']},
            ].map(plan => (
              <div key={plan.name} className={`relative rounded-2xl p-[1px] ${plan.featured?'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500':'bg-white/10'} shadow-lg`}> 
                <div className={`h-full rounded-2xl ${plan.featured?'bg-[#0d1117]/95':'bg-gradient-to-br from-[#182635] to-[#1f3348]'} p-7 flex flex-col border border-white/10`}> 
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">{plan.name}{plan.featured && <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">Popular</span>}</h3>
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>{plan.note && <span className="ml-1 text-gray-400 text-sm font-medium">{plan.note}</span>}
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span><span>{f}</span></li>
                    ))}
                  </ul>
                  <button className={`mt-8 w-full h-12 rounded-lg font-semibold transition ${plan.featured? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:brightness-110':'bg-white/5 text-gray-200 hover:bg-white/10'}`}> {plan.featured ? 'Começar Agora' : 'Saiba Mais'} </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
  <section id="depoimentos" className="relative py-28 bg-[#0f1722]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text">Depoimentos</h2>
            <p className="mt-6 text-lg text-gray-600">O que nossos pacientes dizem sobre a experiência de cuidado.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ['Ana Paula','"Agendar consulta nunca foi tão fácil. Atendimento impecável e rápido."'],
              ['Marcos Silva','"Profissionais atenciosos e plataforma intuitiva. Recomendo demais!"'],
              ['Juliana Rocha','"Exames e resultados organizados em um só lugar. Fantástico!"']
            ].map(([name,text]) => (
              <div key={name} className="relative rounded-2xl p-6 bg-gradient-to-br from-[#1a2b3c] to-[#23394e] border border-white/5 shadow-sm hover:shadow-xl transition group">
                <div className="absolute -top-5 left-6 w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 font-bold">“</div>
                <p className="mt-6 text-gray-300 text-sm leading-relaxed">{text}</p>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <span className="text-xs text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full">Paciente</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
  <section id="faq" className="relative py-28 bg-[#0d1117]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.08),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text">Perguntas Frequentes</h2>
            <p className="mt-6 text-lg text-gray-600">Dúvidas comuns sobre a plataforma e o processo de agendamento.</p>
          </div>
          <div className="space-y-4">
            {[
              ['Como funciona o agendamento online?','Escolha o serviço, selecione o profissional e horário disponível. A confirmação é instantânea e você recebe um e-mail.'],
              ['Posso remarcar ou cancelar consultas?','Sim. Acesse sua área do paciente e gerencie seus agendamentos com antecedência mínima definida pela clínica.'],
              ['Meus dados são seguros?','Sim. Utilizamos criptografia, controle de acesso e seguimos práticas de conformidade com a LGPD.'],
              ['Há suporte por telefone?','Sim. Oferecemos suporte híbrido: online, telefone e presencial.'],
            ].map(([q,a],i) => (
              <details key={q} className="group border border-white/10 rounded-xl bg-[#182635] overflow-hidden">
                <summary className="cursor-pointer list-none flex items-start gap-4 p-5">
                  <span className="mt-1 w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold shadow">{i+1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{q}</p>
                  </div>
                  <span className="text-gray-400 group-open:rotate-45 transition text-xl leading-none">+</span>
                </summary>
                <div className="px-16 pb-6 -mt-2">
                  <p className="text-sm text-gray-300 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
  <section id="contato" className="relative py-28 bg-[#0f1722]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 md:grid-cols-2 items-start">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-8">Entre em Contato</h2>
            <p className="text-gray-400 leading-relaxed mb-8">Fale com nossa equipe para tirar dúvidas, suporte ou mais informações sobre planos corporativos.</p>
            <div className="space-y-5">
              {[
                ['📞','Telefone','(11) 1234-5678'],
                ['📧','E-mail','contato@clinicaagendamento.com'],
                ['💬','WhatsApp','(11) 90000-0000'],
                ['📍','Endereço','Rua da Saúde, 123 - São Paulo, SP']
              ].map(([icon,label,value]) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                    <p className="text-gray-200 font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-8 shadow-lg border border-white/10">
            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Nome</label>
                <input id="name" className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder:text-gray-500 transition" placeholder="Seu nome" />
              </div>
              <div>
                <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">E-mail</label>
                <input id="email" type="email" className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder:text-gray-500 transition" placeholder="voce@exemplo.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Mensagem</label>
                <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder:text-gray-500 transition" placeholder="Escreva sua mensagem" />
              </div>
              <button type="submit" className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg text-white overflow-hidden w-full">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
                <span className="relative">Enviar Mensagem</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-600" />
        <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">Pronto para facilitar sua jornada de saúde?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-3xl mx-auto">Agende em segundos, acompanhe resultados e mantenha seu histórico organizado em um só lugar.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group relative inline-flex items-center justify-center px-10 py-4 font-semibold rounded-lg text-white overflow-hidden">
              <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition" />
              <span className="relative">Criar Conta</span>
            </button>
            <button className="px-10 py-4 rounded-lg font-semibold bg-white text-blue-700 hover:brightness-105">Ver Planos</button>
          </div>
        </div>
      </section>

      {/* Footer */}
  <footer className="relative bg-[#05070a] text-gray-300 pt-20 pb-10 mt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/30">
                  C
                </div>
                <span className="ml-3 text-xl font-bold text-white">Clínica Agendamento</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">Cuidando da sua saúde com dedicação, inovação e excelência em cada etapa do seu atendimento.</p>
              <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
                <span>LGPD Ready</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>Infraestrutura Segura</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-5">Serviços</h4>
              <ul className="space-y-3 text-sm">
                {['Consultas Gerais','Odontologia','Exames','Pediatria','Cardiologia','Telemedicina'].map(l => (
                  <li key={l}><a className="hover:text-white transition" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-5">Institucional</h4>
              <ul className="space-y-3 text-sm">
                {['Sobre Nós','Política de Privacidade','Termos de Uso','Carreiras','Parcerias'].map(l => (
                  <li key={l}><a className="hover:text-white transition" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase mb-5">Conecte-se</h4>
              <div className="flex flex-wrap gap-3">
                {['Facebook','Instagram','LinkedIn','YouTube','WhatsApp'].map(s => (
                  <a key={s} href="#" className="px-3 py-1.5 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition border border-white/10">{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
            <p>© 2025 Clínica Agendamento. Todos os direitos reservados.</p>
            <p>Feito com cuidado e dedicação à saúde.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Dados do Paciente */}
      {mostrarModalAgendamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Dados do Paciente</h3>
              <button
                onClick={() => setMostrarModalAgendamento(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Resumo do Agendamento */}
            <div className="mb-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Resumo da Consulta:</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <p><span className="text-gray-400">Médico:</span> {profissionalSelecionado?.nome}</p>
                <p><span className="text-gray-400">Especialidade:</span> {profissionalSelecionado?.especialidade}</p>
                <p><span className="text-gray-400">Data:</span> {dataSelecionada && new Date(dataSelecionada).toLocaleDateString('pt-BR')}</p>
                <p><span className="text-gray-400">Horário:</span> {horarioSelecionado}</p>
                <p><span className="text-gray-400">Clínica:</span> {clinicaSelecionada?.nome || clinicasDisponiveis[0]?.nome}</p>
              </div>
            </div>

            {/* Formulário de Dados */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={dadosPaciente.nome}
                  onChange={(e) => setDadosPaciente(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone *</label>
                <input
                  type="tel"
                  value={dadosPaciente.telefone}
                  onChange={(e) => setDadosPaciente(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail *</label>
                <input
                  type="email"
                  value={dadosPaciente.email}
                  onChange={(e) => setDadosPaciente(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="joao@email.com"
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Aviso */}
            <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
              <p className="text-sm text-yellow-300">
                <span className="font-medium">📞 Confirmação:</span> A clínica entrará em contato para confirmar sua consulta.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModalAgendamento(false)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={finalizarAgendamento}
                disabled={agendandoConsulta || !dadosPaciente.nome || !dadosPaciente.telefone || !dadosPaciente.email}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {agendandoConsulta ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating CTA */}
      <button aria-label="Agendar consulta" className="floating-cta fixed bottom-6 right-6 z-50 group">
        <span className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-700/30 hover:scale-105 active:scale-95 transition-all">
          <span className="text-2xl">➕</span>
        </span>
      </button>
    </div>
  );
}
