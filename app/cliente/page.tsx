"use client";
import { useState, useEffect } from 'react';

// Types para a área do cliente
interface ClienteConsulta {
  id: string;
  data: string;
  horario: string;
  profissional: string;
  especialidade: string;
  clinica: string;
  endereco: string;
  status: 'confirmada' | 'pendente' | 'cancelada' | 'concluida';
  observacoes?: string;
}

interface Clinica {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  especialidades: string[];
}

interface ProfissionalPublico {
  id: string;
  nome: string;
  especialidade: string;
  clinicaIds: string[]; // Mudança: agora é um array de IDs
  foto?: string;
  cidade: string;
  distancia?: number; // em km
  avaliacao: number;
  numeroAvaliacoes: number;
  disponibilidade: {
    [key: string]: string[]; // dia da semana: array de horários
  };
  proximasConsultas: string[]; // próximas datas disponíveis
}

interface ClientePerfil {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
}

// Dados mock para demonstração
const consultasHistorico: ClienteConsulta[] = [
  {
    id: 'c1',
    data: '2025-09-10',
    horario: '14:00',
    profissional: 'Dra. Ana Silva',
    especialidade: 'Cardiologia',
    clinica: 'Clínica São Paulo',
    endereco: 'Rua das Flores, 123 - Centro',
    status: 'concluida',
    observacoes: 'Consulta de retorno - exames normais'
  },
  {
    id: 'c2',
    data: '2025-09-15',
    horario: '09:30',
    profissional: 'Dr. Bruno Costa',
    especialidade: 'Dermatologia',
    clinica: 'Clínica São Paulo',
    endereco: 'Rua das Flores, 123 - Centro',
    status: 'confirmada'
  },
  {
    id: 'c3',
    data: '2025-08-20',
    horario: '16:00',
    profissional: 'Dra. Carla Mendes',
    especialidade: 'Pediatria',
    clinica: 'Clínica Norte',
    endereco: 'Av. Principal, 456 - Norte',
    status: 'concluida'
  },
  {
    id: 'c4',
    data: '2025-09-22',
    horario: '11:00',
    profissional: 'Dr. Eduardo Santos',
    especialidade: 'Ortopedia',
    clinica: 'Clínica Norte',
    endereco: 'Av. Principal, 456 - Norte',
    status: 'pendente'
  },
  {
    id: 'c5',
    data: '2025-08-05',
    horario: '08:30',
    profissional: 'Dra. Ana Silva',
    especialidade: 'Cardiologia',
    clinica: 'Clínica São Paulo',
    endereco: 'Rua das Flores, 123 - Centro',
    status: 'concluida',
    observacoes: 'Primeira consulta - check-up geral'
  },
  {
    id: 'c6',
    data: '2025-07-18',
    horario: '15:15',
    profissional: 'Dr. Fernando Lima',
    especialidade: 'Oftalmologia',
    clinica: 'Clínica Vision',
    endereco: 'Rua dos Olhos, 789 - Vila Nova',
    status: 'cancelada',
    observacoes: 'Cancelada pelo paciente'
  },
  {
    id: 'c7',
    data: '2025-10-05',
    horario: '13:45',
    profissional: 'Dra. Gabriela Rocha',
    especialidade: 'Ginecologia',
    clinica: 'Clínica Mulher',
    endereco: 'Av. Feminina, 321 - Centro',
    status: 'confirmada'
  },
  {
    id: 'c8',
    data: '2025-06-30',
    horario: '10:20',
    profissional: 'Dr. Bruno Costa',
    especialidade: 'Dermatologia',
    clinica: 'Clínica São Paulo',
    endereco: 'Rua das Flores, 123 - Centro',
    status: 'concluida',
    observacoes: 'Remoção de verruga - procedimento bem-sucedido'
  }
];

const clinicasDisponiveis: Clinica[] = [
  {
    id: 'cl1',
    nome: 'Clínica São Paulo',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 3333-4444',
    especialidades: ['Cardiologia', 'Dermatologia', 'Pediatria']
  },
  {
    id: 'cl2',
    nome: 'Clínica Norte',
    endereco: 'Av. Principal, 456 - Norte',
    telefone: '(11) 5555-6666',
    especialidades: ['Psiquiatria', 'Psicologia', 'Neurologia']
  },
  {
    id: 'cl3',
    nome: 'Clínica Guarulhos',
    endereco: 'Rua Central, 789 - Guarulhos',
    telefone: '(11) 7777-8888',
    especialidades: ['Ortopedia', 'Fisioterapia']
  },
  {
    id: 'cl4',
    nome: 'Clínica Osasco',
    endereco: 'Av. dos Autonomistas, 321 - Osasco',
    telefone: '(11) 9999-0000',
    especialidades: ['Psiquiatria', 'Clínica Geral']
  }
];

const profissionaisDisponiveis: ProfissionalPublico[] = [
  {
    id: 'p1',
    nome: 'Dra. Ana Silva',
    especialidade: 'Cardiologia',
    clinicaIds: ['cl1', 'cl2'], // Trabalha em 2 clínicas
    cidade: 'São Paulo',
    distancia: 2.5,
    avaliacao: 4.8,
    numeroAvaliacoes: 156,
    disponibilidade: {
      'segunda': ['08:00', '09:00', '10:00', '14:00', '15:00'],
      'quarta': ['14:00', '15:00', '16:00', '17:00'],
      'sexta': ['08:00', '09:00', '10:00', '11:00']
    },
    proximasConsultas: ['2025-09-16', '2025-09-18', '2025-09-20']
  },
  {
    id: 'p2',
    nome: 'Dr. Bruno Costa',
    especialidade: 'Dermatologia',
    clinicaIds: ['cl1', 'cl3'], // Trabalha em 2 clínicas
    cidade: 'São Paulo',
    distancia: 2.5,
    avaliacao: 4.6,
    numeroAvaliacoes: 89,
    disponibilidade: {
      'terca': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'quinta': ['13:00', '14:00', '15:00', '16:00', '17:00']
    },
    proximasConsultas: ['2025-09-17', '2025-09-19', '2025-09-24']
  },
  {
    id: 'p3',
    nome: 'Dr. Carlos Oliveira',
    especialidade: 'Psiquiatria',
    clinicaIds: ['cl2', 'cl3'], // Trabalha em 2 clínicas
    cidade: 'São Paulo',
    distancia: 5.2,
    avaliacao: 4.9,
    numeroAvaliacoes: 203,
    disponibilidade: {
      'segunda': ['07:00', '08:00', '09:00', '18:00', '19:00'],
      'terca': ['07:00', '08:00', '18:00', '19:00'],
      'quinta': ['07:00', '18:00', '19:00', '20:00']
    },
    proximasConsultas: ['2025-09-16', '2025-09-17', '2025-09-19']
  },
  {
    id: 'p4',
    nome: 'Dra. Fernanda Lima',
    especialidade: 'Psicologia',
    clinicaIds: ['cl2', 'cl4'], // Trabalha em 2 clínicas
    cidade: 'São Paulo',
    distancia: 5.2,
    avaliacao: 4.7,
    numeroAvaliacoes: 134,
    disponibilidade: {
      'segunda': ['14:00', '15:00', '16:00', '17:00'],
      'quarta': ['14:00', '15:00', '16:00', '17:00'],
      'sexta': ['08:00', '09:00', '10:00', '14:00']
    },
    proximasConsultas: ['2025-09-18', '2025-09-20', '2025-09-23']
  },
  {
    id: 'p5',
    nome: 'Dr. Roberto Santos',
    especialidade: 'Ortopedia',
    clinicaIds: ['cl3', 'cl4'], // Trabalha em 2 clínicas
    cidade: 'Guarulhos',
    distancia: 12.8,
    avaliacao: 4.5,
    numeroAvaliacoes: 67,
    disponibilidade: {
      'segunda': ['08:00', '09:00', '10:00'],
      'terca': ['08:00', '09:00', '10:00', '14:00'],
      'quinta': ['14:00', '15:00', '16:00']
    },
    proximasConsultas: ['2025-09-16', '2025-09-17', '2025-09-19']
  },
  {
    id: 'p6',
    nome: 'Dra. Mariana Rocha',
    especialidade: 'Pediatria',
    clinicaIds: ['cl1', 'cl3'], // Trabalha em 2 clínicas
    cidade: 'São Paulo',
    distancia: 2.5,
    avaliacao: 4.9,
    numeroAvaliacoes: 245,
    disponibilidade: {
      'segunda': ['08:00', '09:00', '10:00', '11:00'],
      'terca': ['08:00', '09:00', '10:00', '11:00'],
      'quarta': ['13:00', '14:00', '15:00', '16:00'],
      'quinta': ['08:00', '09:00', '10:00'],
      'sexta': ['13:00', '14:00', '15:00']
    },
    proximasConsultas: ['2025-09-16', '2025-09-17', '2025-09-18']
  },
  {
    id: 'p7',
    nome: 'Dr. Eduardo Ferreira',
    especialidade: 'Psiquiatria',
    clinicaIds: ['cl3', 'cl4'], // Trabalha em 2 clínicas
    cidade: 'Osasco',
    distancia: 18.3,
    avaliacao: 4.4,
    numeroAvaliacoes: 98,
    disponibilidade: {
      'terca': ['19:00', '20:00', '21:00'],
      'quinta': ['19:00', '20:00', '21:00'],
      'sabado': ['08:00', '09:00', '10:00', '11:00']
    },
    proximasConsultas: ['2025-09-17', '2025-09-19', '2025-09-21']
  }
];

const perfilCliente: ClientePerfil = {
  id: 'u1',
  nome: 'João Silva Santos',
  email: 'joao.santos@email.com',
  telefone: '(11) 99999-8888',
  cpf: '123.456.789-00',
  dataNascimento: '1985-03-15',
  endereco: {
    rua: 'Rua dos Exemplo',
    numero: '789',
    bairro: 'Vila Nova',
    cidade: 'São Paulo',
    cep: '01234-567'
  }
};

export default function ClientePage() {
  const [activeTab, setActiveTab] = useState<'historico' | 'agendar' | 'perfil'>('historico');
  
  // Estados para histórico
  const [filtroData, setFiltroData] = useState('');
  const [filtroClinica, setFiltroClinica] = useState('');
  const [filtroProfissional, setFiltroProfissional] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  
  // Estados para agendamento
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [tipoResultado, setTipoResultado] = useState<'profissional' | 'especialidade' | null>(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<ProfissionalPublico | null>(null);
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [ordenacao, setOrdenacao] = useState<'distancia' | 'avaliacao' | 'proximidade'>('distancia');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');

  // Verificar parâmetros da URL ao carregar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Definir aba ativa
      const tab = urlParams.get('tab');
      if (tab === 'agendar') {
        setActiveTab('agendar');
      }
      
      // Pré-preencher busca
      const busca = urlParams.get('busca');
      if (busca) {
        setTermoBusca(busca);
        handleBusca(busca);
      }
      
      // Selecionar profissional específico
      const profissionalId = urlParams.get('profissional');
      if (profissionalId) {
        const prof = profissionaisDisponiveis.find(p => p.id === profissionalId);
        if (prof) {
          selecionarProfissional(prof);
        }
      }
      
      // Selecionar especialidade específica
      const especialidade = urlParams.get('especialidade');
      if (especialidade) {
        selecionarEspecialidade(especialidade);
      }
      
      // Pré-preencher cidade
      const cidade = urlParams.get('cidade');
      if (cidade) {
        setFiltroCidade(cidade);
      }
      
      // Pré-preencher data
      const data = urlParams.get('data');
      if (data) {
        setDataSelecionada(data);
      }
    }
  }, []);
  
  // Extrair opções únicas para os dropdowns
  const clinicasUnicas = Array.from(new Set(consultasHistorico.map(c => c.clinica)));
  const profissionaisUnicos = Array.from(new Set(consultasHistorico.map(c => c.profissional)));
  const especialidadesUnicas = Array.from(new Set(consultasHistorico.map(c => c.especialidade)));
  
  // Estados para perfil
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilEditado, setPerfilEditado] = useState(perfilCliente);

  // Filtrar consultas
  const consultasFiltradas = consultasHistorico.filter(consulta => {
    const matchData = !filtroData || consulta.data.includes(filtroData);
    const matchClinica = !filtroClinica || consulta.clinica === filtroClinica;
    const matchProfissional = !filtroProfissional || consulta.profissional === filtroProfissional;
    const matchEspecialidade = !filtroEspecialidade || consulta.especialidade === filtroEspecialidade;
    const matchStatus = filtroStatus === 'all' || consulta.status === filtroStatus;
    
    return matchData && matchClinica && matchProfissional && matchEspecialidade && matchStatus;
  });

  // Obter todas as especialidades únicas
  const todasEspecialidades = Array.from(new Set(profissionaisDisponiveis.map(p => p.especialidade))).sort();
  
  // Obter todas as cidades únicas
  const todasCidades = Array.from(new Set(profissionaisDisponiveis.map(p => p.cidade))).sort();

  // Filtrar sugestões baseadas no termo de busca
  const sugestoesProfissionais = profissionaisDisponiveis.filter(prof => 
    prof.nome.toLowerCase().includes(termoBusca.toLowerCase())
  ).slice(0, 5);

  const sugestoesEspecialidades = todasEspecialidades.filter(esp => 
    esp.toLowerCase().includes(termoBusca.toLowerCase())
  ).slice(0, 5);

  // Filtrar profissionais por especialidade e cidade
  const profissionaisFiltrados = profissionaisDisponiveis
    .filter(prof => {
      const matchEspecialidade = !especialidadeSelecionada || prof.especialidade === especialidadeSelecionada;
      const matchCidade = !filtroCidade || prof.cidade === filtroCidade;
      return matchEspecialidade && matchCidade;
    })
    .sort((a, b) => {
      if (ordenacao === 'distancia') return (a.distancia || 0) - (b.distancia || 0);
      if (ordenacao === 'avaliacao') return b.avaliacao - a.avaliacao;
      return 0; // proximidade - implementar lógica se necessário
    });

  // Obter horários disponíveis para uma data
  const getHorariosDisponiveis = (data: string) => {
    if (!profissionalSelecionado) return [];
    
    const dataObj = new Date(data);
    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][dataObj.getDay()];
    
    return profissionalSelecionado.disponibilidade[diaSemana] || [];
  };

  const handleBusca = (termo: string) => {
    setTermoBusca(termo);
    setMostrarSugestoes(termo.length > 0);
    
    if (termo.length === 0) {
      setTipoResultado(null);
      setProfissionalSelecionado(null);
      setEspecialidadeSelecionada('');
    }
  };

  const selecionarProfissional = (prof: ProfissionalPublico) => {
    setProfissionalSelecionado(prof);
    setTipoResultado('profissional');
    setTermoBusca(prof.nome);
    setMostrarSugestoes(false);
  };

  const selecionarEspecialidade = (especialidade: string) => {
    setEspecialidadeSelecionada(especialidade);
    setTipoResultado('especialidade');
    setTermoBusca(especialidade);
    setMostrarSugestoes(false);
    setProfissionalSelecionado(null);
  };

  const limparFiltros = () => {
    setFiltroData('');
    setFiltroClinica('');
    setFiltroProfissional('');
    setFiltroEspecialidade('');
    setFiltroStatus('all');
  };

  const resetarAgendamento = () => {
    setTermoBusca('');
    setMostrarSugestoes(false);
    setTipoResultado(null);
    setProfissionalSelecionado(null);
    setEspecialidadeSelecionada('');
    setFiltroCidade('');
    setOrdenacao('distancia');
    setDataSelecionada('');
    setHorarioSelecionado('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1220] via-[#0e1822] to-[#1a2332]">
      {/* Header */}
      <header className="bg-[#0e1822]/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Área do Cliente</h1>
                <p className="text-sm text-gray-400">Olá, {perfilCliente.nome}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h8" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {[
            { key: 'historico', label: 'Histórico', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { key: 'agendar', label: 'Agendar Consulta', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { key: 'perfil', label: 'Meu Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.key 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === 'historico' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Filtros</h2>
                <button 
                  onClick={limparFiltros}
                  className="text-sm text-gray-400 hover:text-white underline"
                >
                  Limpar filtros
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Clínica</label>
                  <select
                    value={filtroClinica}
                    onChange={(e) => setFiltroClinica(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as clínicas</option>
                    {clinicasUnicas.map(clinica => (
                      <option key={clinica} value={clinica} className="bg-gray-800 text-white">
                        {clinica}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profissional</label>
                  <select
                    value={filtroProfissional}
                    onChange={(e) => setFiltroProfissional(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os profissionais</option>
                    {profissionaisUnicos.map(profissional => (
                      <option key={profissional} value={profissional} className="bg-gray-800 text-white">
                        {profissional}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Especialidade</label>
                  <select
                    value={filtroEspecialidade}
                    onChange={(e) => setFiltroEspecialidade(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as especialidades</option>
                    {especialidadesUnicas.map(especialidade => (
                      <option key={especialidade} value={especialidade} className="bg-gray-800 text-white">
                        {especialidade}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="pendente">Pendente</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Consultas */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Histórico de Consultas</h2>
              
              {consultasFiltradas.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400">Nenhuma consulta encontrada</p>
                  <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros ou agende sua primeira consulta</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {consultasFiltradas.map(consulta => (
                    <div key={consulta.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{consulta.profissional}</h3>
                            <p className="text-sm text-gray-300">{consulta.especialidade}</p>
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          consulta.status === 'confirmada' ? 'bg-green-500/20 text-green-300' :
                          consulta.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                          consulta.status === 'concluida' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {consulta.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Data e Horário</p>
                          <p className="text-white font-medium">
                            {new Date(consulta.data).toLocaleDateString('pt-BR')} às {consulta.horario}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Local</p>
                          <p className="text-white font-medium">{consulta.clinica}</p>
                          <p className="text-gray-300 text-xs">{consulta.endereco}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Observações</p>
                          <p className="text-white font-medium">{consulta.observacoes || 'Nenhuma observação'}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        {consulta.status === 'confirmada' && (
                          <>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                              Reagendar
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                              Cancelar
                            </button>
                          </>
                        )}
                        {consulta.status === 'concluida' && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                            Agendar Retorno
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'agendar' && (
          <div className="space-y-6">
            {/* Barra de Busca */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Buscar Profissional ou Especialidade</h2>
                <button 
                  onClick={resetarAgendamento}
                  className="text-sm text-gray-400 hover:text-white underline"
                >
                  Limpar busca
                </button>
              </div>
              
              <div className="relative">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Digite o nome do médico ou especialidade (ex: Psi... para Psiquiatria, Psicologia)"
                    value={termoBusca}
                    onChange={(e) => handleBusca(e.target.value)}
                    onFocus={() => setMostrarSugestoes(termoBusca.length > 0)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onClick={() => selecionarEspecialidade(especialidade)}
                            className="w-full text-left p-2 rounded hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span className="text-white">{especialidade}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {sugestoesProfissionais.length > 0 && (
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Profissionais</p>
                        {sugestoesProfissionais.map(profissional => (
                          <button
                            key={profissional.id}
                            onClick={() => selecionarProfissional(profissional)}
                            className="w-full text-left p-2 rounded hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>

            {/* Resultado: Profissional Selecionado */}
            {tipoResultado === 'profissional' && profissionalSelecionado && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Profissional Selecionado</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">{profissionalSelecionado.nome}</h4>
                      <p className="text-gray-300">{profissionalSelecionado.especialidade}</p>
                      <p className="text-gray-400 text-sm">Múltiplas clínicas disponíveis • {profissionalSelecionado.cidade}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-white font-medium">{profissionalSelecionado.avaliacao}</span>
                          <span className="text-gray-400 text-sm">({profissionalSelecionado.numeroAvaliacoes} avaliações)</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          📍 {profissionalSelecionado.distancia}km
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seleção de Data e Hora */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Selecionar Data e Horário</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                      <div className="relative w-48">
                        <input
                          type="date"
                          value={dataSelecionada}
                          onChange={(e) => {
                            setDataSelecionada(e.target.value);
                            setHorarioSelecionado('');
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white/15 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div 
                          className="absolute inset-0 cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement;
                            input?.focus();
                            input?.showPicker?.();
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {dataSelecionada && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Horários Disponíveis</label>
                        <div className="grid grid-cols-3 gap-2">
                          {getHorariosDisponiveis(dataSelecionada).map(horario => (
                            <button
                              key={horario}
                              onClick={() => setHorarioSelecionado(horario)}
                              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                horarioSelecionado === horario 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              {horario}
                            </button>
                          ))}
                        </div>
                        
                        {getHorariosDisponiveis(dataSelecionada).length === 0 && (
                          <p className="text-gray-400 text-sm">Nenhum horário disponível para esta data</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {dataSelecionada && horarioSelecionado && (
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          // Aqui seria feita a chamada à API para confirmar o agendamento
                          alert('Consulta agendada com sucesso!');
                          resetarAgendamento();
                          setActiveTab('historico');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:brightness-110 transition-all"
                      >
                        Confirmar Agendamento
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resultado: Lista de Profissionais por Especialidade */}
            {tipoResultado === 'especialidade' && especialidadeSelecionada && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Profissionais de {especialidadeSelecionada}</h3>
                  
                  {/* Filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                      <select
                        value={filtroCidade}
                        onChange={(e) => setFiltroCidade(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todas as cidades</option>
                        {todasCidades.map(cidade => (
                          <option key={cidade} value={cidade} className="bg-gray-800 text-white">{cidade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
                      <select
                        value={ordenacao}
                        onChange={(e) => setOrdenacao(e.target.value as any)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="distancia" className="bg-gray-800 text-white">Distância</option>
                        <option value="avaliacao" className="bg-gray-800 text-white">Avaliação</option>
                        <option value="proximidade" className="bg-gray-800 text-white">Próxima consulta</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Lista de Profissionais */}
                  <div className="space-y-4">
                    {profissionaisFiltrados.map(profissional => {
                      const clinicas = clinicasDisponiveis.filter(c => profissional.clinicaIds.includes(c.id));
                      return (
                        <div key={profissional.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{profissional.nome}</h4>
                                <p className="text-gray-300">{profissional.especialidade}</p>
                                <p className="text-gray-400 text-sm">{clinicas.length} clínica(s) disponível(is) • {profissional.cidade}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white font-medium">{profissional.avaliacao}</span>
                                    <span className="text-gray-400 text-sm">({profissional.numeroAvaliacoes})</span>
                                  </div>
                                  <div className="text-gray-400 text-sm">📍 {profissional.distancia}km</div>
                                  <div className="text-gray-400 text-sm">
                                    📅 Próxima: {new Date(profissional.proximasConsultas[0]).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => selecionarProfissional(profissional)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              Selecionar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {profissionaisFiltrados.length === 0 && (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400">Nenhum profissional encontrado</p>
                        <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros de busca</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Meu Perfil</h2>
                <button
                  onClick={() => setEditandoPerfil(!editandoPerfil)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editandoPerfil ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                      {editandoPerfil ? (
                        <input
                          type="text"
                          value={perfilEditado.nome}
                          onChange={(e) => setPerfilEditado(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.nome}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      {editandoPerfil ? (
                        <input
                          type="email"
                          value={perfilEditado.email}
                          onChange={(e) => setPerfilEditado(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                      {editandoPerfil ? (
                        <input
                          type="tel"
                          value={perfilEditado.telefone}
                          onChange={(e) => setPerfilEditado(prev => ({ ...prev, telefone: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.telefone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CPF</label>
                      <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.cpf}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Data de Nascimento</label>
                      {editandoPerfil ? (
                        <input
                          type="date"
                          value={perfilEditado.dataNascimento}
                          onChange={(e) => setPerfilEditado(prev => ({ ...prev, dataNascimento: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">
                          {new Date(perfilCliente.dataNascimento).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rua</label>
                      {editandoPerfil ? (
                        <input
                          type="text"
                          value={perfilEditado.endereco.rua}
                          onChange={(e) => setPerfilEditado(prev => ({ 
                            ...prev, 
                            endereco: { ...prev.endereco, rua: e.target.value }
                          }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.endereco.rua}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Número</label>
                      {editandoPerfil ? (
                        <input
                          type="text"
                          value={perfilEditado.endereco.numero}
                          onChange={(e) => setPerfilEditado(prev => ({ 
                            ...prev, 
                            endereco: { ...prev.endereco, numero: e.target.value }
                          }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.endereco.numero}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bairro</label>
                      {editandoPerfil ? (
                        <input
                          type="text"
                          value={perfilEditado.endereco.bairro}
                          onChange={(e) => setPerfilEditado(prev => ({ 
                            ...prev, 
                            endereco: { ...prev.endereco, bairro: e.target.value }
                          }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.endereco.bairro}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                      {editandoPerfil ? (
                        <input
                          type="text"
                          value={perfilEditado.endereco.cidade}
                          onChange={(e) => setPerfilEditado(prev => ({ 
                            ...prev, 
                            endereco: { ...prev.endereco, cidade: e.target.value }
                          }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.endereco.cidade}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CEP</label>
                      {editandoPerfil ? (
                        <input
                          type="text"
                          value={perfilEditado.endereco.cep}
                          onChange={(e) => setPerfilEditado(prev => ({ 
                            ...prev, 
                            endereco: { ...prev.endereco, cep: e.target.value }
                          }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{perfilCliente.endereco.cep}</p>
                      )}
                    </div>
                  </div>
                </div>

                {editandoPerfil && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Aqui seria feita a chamada à API para salvar as alterações
                        alert('Perfil atualizado com sucesso!');
                        setEditandoPerfil(false);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:brightness-110 transition-all"
                    >
                      Salvar Alterações
                    </button>
                    <button
                      onClick={() => {
                        setPerfilEditado(perfilCliente);
                        setEditandoPerfil(false);
                      }}
                      className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ações da Conta */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Configurações da Conta</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <div>
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm opacity-75">Modificar sua senha de acesso</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-600/30 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-medium">Privacidade e Segurança</p>
                      <p className="text-sm opacity-75">Configurações de privacidade dos dados</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <div>
                      <p className="font-medium">Excluir Conta</p>
                      <p className="text-sm opacity-75">Remover permanentemente sua conta e dados</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
