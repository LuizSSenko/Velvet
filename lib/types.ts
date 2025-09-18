// Professional and schedule types
export interface Professional { 
  id: string; 
  nome: string; 
  especialidade: string; 
  cor: string;
  horarios: ProfessionalSchedule[];
  duracaoConsulta: number; // em minutos (ex: 30, 60)
  horariosAlmoco: ProfessionalBreak[]; // horários de almoço/bloqueios
  telefone?: string;
  email?: string;
  ativo: boolean;
}

export interface ProfessionalSchedule {
  id: string;
  diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  horaInicio: string;
  horaFim: string;
}

export interface ProfessionalBreak {
  id: string;
  diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  horaInicio: string;
  horaFim: string;
  descricao?: string; // ex: "Almoço", "Pausa"
}

// Booking types
export interface Booking { 
  id: string; 
  paciente: string;
  pacienteTelefone?: string;
  pacienteEmail?: string;
  profissionalId: string;
  profissionalNome?: string; // Para facilitar exibição
  especialidade?: string;
  inicio: string; 
  fim: string; 
  status: 'confirmado' | 'pendente' | 'cancelado';
  createdAt?: string;
}

// Custom hours types
export interface CustomHour { 
  id: string; 
  type: 'weekday' | 'date'; 
  target: string; 
  start: string; 
  end: string; 
  closed: boolean;
}

// Clinic configuration types
export interface ClinicHours {
  start: string;
  end: string;
  saturday: boolean;
  sunday: boolean;
}

export interface ClinicAddress {
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface ClinicContacts {
  telefone: string;
  email: string;
  whatsapp: string;
  site: string;
}

export interface ClinicInfo {
  nome: string;
  telefone: string;
  email: string;
}

export interface ClinicConfig {
  info: ClinicInfo;
  hours: ClinicHours;
  address: ClinicAddress;
  contacts: ClinicContacts;
  customHours: CustomHour[];
}