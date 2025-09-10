export const metadata = {
  title: 'Área da Clínica | Plataforma de Agendamentos',
};

export default function ClinicaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-gray-100">
      {children}
    </div>
  );
}
