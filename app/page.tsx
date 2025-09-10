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

export default function Home() {
  const [audienceTab, setAudienceTab] = useState<'pacientes' | 'clinicas'>('pacientes');
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
                  <form onSubmit={(e)=>{e.preventDefault();}} className="grid gap-4 md:grid-cols-[2fr,1.5fr,1fr,auto]">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1 font-semibold">Especialidade ou Profissional</label>
                      <input placeholder="Cardiologista, Dr. Silva..." className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-100 placeholder:text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1 font-semibold">Localização</label>
                      <input placeholder="Cidade ou Bairro" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-100 placeholder:text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1 font-semibold">Data (Opcional)</label>
                      <input type="date" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-100" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full h-[52px] rounded-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow hover:brightness-110 transition">Buscar</button>
                    </div>
                  </form>
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

      {/* Floating CTA */}
      <button aria-label="Agendar consulta" className="floating-cta fixed bottom-6 right-6 z-50 group">
        <span className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-700/30 hover:scale-105 active:scale-95 transition-all">
          <span className="text-2xl">➕</span>
        </span>
      </button>
    </div>
  );
}
