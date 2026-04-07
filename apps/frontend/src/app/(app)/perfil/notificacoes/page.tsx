import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

const MOCK_NOTIFICATIONS = [
  { id: '1', icon: 'check_circle', color: 'text-savings bg-emerald-50', title: 'Profissional confirmou visita', description: 'Ricardo Silva confirmou a visita para amanha as 14h.', time: 'Hoje, 10:30' },
  { id: '2', icon: 'local_shipping', color: 'text-trust bg-blue-50', title: 'Pedido a caminho', description: 'Seu pedido #88421 saiu para entrega.', time: 'Hoje, 08:15' },
  { id: '3', icon: 'star', color: 'text-brand bg-orange-50', title: 'Avalie o profissional', description: 'Como foi o servico de Jose da Silva?', time: 'Ontem, 18:00' },
  { id: '4', icon: 'construction', color: 'text-trust bg-blue-50', title: 'Obra atualizada', description: 'Reforma Banheiro Social: progresso atualizado para 65%.', time: 'Ontem, 14:22' },
];

export default async function NotificacoesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Notificacoes" />

      <div className="px-4 mt-4 flex flex-col gap-2">
        {MOCK_NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.color}`}>
              <span className="material-symbols-outlined text-lg">{n.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.description}</p>
              <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
