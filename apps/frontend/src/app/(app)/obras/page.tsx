// Minhas Obras — work tracking screen
// seed.sql data: Reforma Banheiro Social (65%), Pintura Fachada (agendada)
import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

const OBRA_STATUS_MAP: Record<string, { label: string; variant: 'ativo' | 'agendado' | 'entregue' | 'cancelado' | 'pendente' | 'a-caminho' }> = {
  in_progress: { label: 'Ativo', variant: 'ativo' },
  scheduled: { label: 'Agendado', variant: 'agendado' },
  completed: { label: 'Concluída', variant: 'entregue' },
  cancelled: { label: 'Cancelada', variant: 'cancelado' },
  pending: { label: 'Pendente', variant: 'pendente' },
};

export default async function ObrasPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const worksList: any[] = await api.get<any[]>('/v1/works').catch(() => []);

  const inProgress = worksList.filter((w) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (w as any).status;
    return status === 'in_progress' || status === 'scheduled' || status === 'pending';
  });
  const finished = worksList.filter((w) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (w as any).status;
    return status === 'completed' || status === 'cancelled';
  });

  return (
    <div className="pb-24 bg-[#f8f6f6] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 pt-10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1E40AF] text-xl">construction</span>
            <h1 className="text-lg font-bold text-slate-900">Minhas Obras</h1>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined text-slate-500 text-2xl">notifications</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#1E40AF] rounded-full" />
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex border-b border-slate-200">
          <div className="flex-1 text-center py-3 text-sm font-semibold text-[#1E40AF] border-b-2 border-[#1E40AF]">
            Em andamento
          </div>
          <div className="flex-1 text-center py-3 text-sm font-medium text-slate-400">
            Finalizadas
          </div>
        </div>
      </div>

      {/* ── Search bar ────────────────────────────────────────── */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
          <span className="text-sm text-slate-400">Buscar obra...</span>
        </div>
      </div>

      {worksList.length === 0 ? (
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
        <div className="px-4 mt-3 flex flex-col gap-4">
          {/* Show in-progress works first, then finished */}
          {[...inProgress, ...finished].map((work: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = work as any;
            const status = OBRA_STATUS_MAP[w.status] ?? { label: w.status, variant: 'pendente' };
            const progress = w.progress_pct ?? 0;
            const prof = w.professionals?.profiles;
            const isActive = w.status === 'in_progress';

            return (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900">{w.title}</h3>
                    <StatusBadge variant={status.variant} label={status.label} />
                  </div>

                  {/* Professional */}
                  {prof && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar
                        src={prof.avatar_url}
                        name={prof.full_name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{prof.full_name}</p>
                        <p className="text-[10px] text-slate-400">Profissional Responsável</p>
                      </div>
                    </div>
                  )}

                  {/* Progress bar — shown when in_progress */}
                  {isActive && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-slate-700">Progresso Geral</p>
                        <p className="text-xs font-bold text-[#1E40AF]">{progress}% concluído</p>
                      </div>
                      <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1E40AF] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* PRÓXIMO PASSO section */}
                  {isActive && w.next_step && (
                    <div className="flex items-start gap-2 mb-3 bg-blue-50 rounded-xl p-3">
                      <span className="material-symbols-outlined text-[#1E40AF] text-lg mt-0.5">flag</span>
                      <div>
                        <p className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wide">Próximo Passo</p>
                        <p className="text-xs text-slate-700 mt-0.5">{w.next_step}</p>
                      </div>
                    </div>
                  )}

                  {/* Fotos da Evolução */}
                  {Array.isArray(w.photos) && w.photos.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-700">Fotos da Evolução</p>
                        <button className="text-[10px] font-semibold text-[#1E40AF]">Ver todas →</button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {w.photos.slice(0, 4).map((photo: string, idx: number) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={idx}
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          />
                        ))}
                        {w.photos.length > 4 && (
                          <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-slate-500">+{w.photos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ver Detalhes da Obra button */}
                  <Link
                    href={`/obras/${w.id}`}
                    className="block w-full text-center text-sm font-bold text-white bg-[#1E40AF] py-3 rounded-xl active:scale-[0.98] transition-transform"
                  >
                    Ver Detalhes da Obra
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
