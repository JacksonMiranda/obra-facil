// Minhas Obras — work tracking screen
// seed.sql data: Reforma Banheiro Social (65%), Pintura Fachada (agendada)
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import type { WorkWithProfessional } from '@obrafacil/shared';

const OBRA_STATUS_MAP: Record<string, { label: string; variant: 'ativo' | 'agendado' | 'entregue' | 'cancelado' | 'pendente' | 'a-caminho' }> = {
  in_progress: { label: 'Em andamento', variant: 'ativo' },
  scheduled: { label: 'Agendada', variant: 'agendado' },
  completed: { label: 'Concluída', variant: 'entregue' },
  cancelled: { label: 'Cancelada', variant: 'cancelado' },
  pending: { label: 'Pendente', variant: 'pendente' },
};

export default async function ObrasPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const works = await api.get<WorkWithProfessional[]>('/v1/works').catch(() => []);

  return (
    <div className="pb-6">
      <PageHeader title="Minhas Obras" hideBack />

      {works.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">
            construction
          </span>
          <p className="text-sm font-semibold text-slate-500">Nenhuma obra em andamento</p>
          <p className="text-xs text-slate-400 mt-1">
            Quando você contratar um profissional, a obra aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="px-4 mt-2 flex flex-col gap-4">
          {works.map((work: WorkWithProfessional) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = work as any;
            const status = OBRA_STATUS_MAP[w.status] ?? { label: w.status, variant: 'pendente' };
            const progress = w.progress_pct ?? 0;
            const prof = w.professionals?.profiles;

            return (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Photos strip (if any) */}
                {Array.isArray(w.photos) && w.photos.length > 0 && (
                  <div className="h-36 bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.photos[0]}
                      alt={w.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{w.title}</p>
                      {w.address && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{w.address}</p>
                      )}
                    </div>
                    <StatusBadge variant={status.variant} label={status.label} />
                  </div>

                  {/* Progress bar — shown when in_progress */}
                  {w.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-medium text-slate-500">Progresso da obra</p>
                        <p className="text-xs font-bold text-trust">{progress}%</p>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-trust rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Professional */}
                  {prof && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                      <Avatar
                        src={prof.avatar_url}
                        name={prof.full_name}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{prof.full_name}</p>
                        <p className="text-[10px] text-slate-400">Profissional responsável</p>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex gap-4 mt-3 pt-2 border-t border-slate-50">
                    {w.start_date && (
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Início</p>
                        <p className="text-xs font-medium text-slate-700">
                          {new Date(w.start_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    {w.end_date && (
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Previsão</p>
                        <p className="text-xs font-medium text-slate-700">
                          {new Date(w.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    {w.total_value && (
                      <div className="ml-auto">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Valor</p>
                        <p className="text-xs font-bold text-slate-900">
                          R$ {Number(w.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
