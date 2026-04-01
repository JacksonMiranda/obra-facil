// Detalhe da Obra — progress tracking detail screen
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth-bypass';
import { api } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

const OBRA_STATUS_MAP: Record<string, { label: string; variant: 'ativo' | 'agendado' | 'entregue' | 'cancelado' | 'pendente' | 'a-caminho' }> = {
  in_progress: { label: 'Em Andamento', variant: 'ativo' },
  scheduled: { label: 'Agendada', variant: 'agendado' },
  completed: { label: 'Concluída', variant: 'entregue' },
  cancelled: { label: 'Cancelada', variant: 'cancelado' },
  pending: { label: 'Pendente', variant: 'pendente' },
};

export default async function ObraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let work: any = null;
  try {
    work = await api.get(`/v1/works/${id}`);
  } catch {
    notFound();
  }

  if (!work) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = work as any;
  const status = OBRA_STATUS_MAP[w.status] ?? { label: w.status, variant: 'pendente' as const };
  const progress = w.progress_pct ?? 0;
  const prof = w.professionals?.profiles;
  const isActive = w.status === 'in_progress';

  return (
    <div className="pb-24 bg-[#f8f6f6] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-10 pb-3">
          <Link href="/obras" className="w-8 h-8 flex items-center justify-center -ml-1">
            <span className="material-symbols-outlined text-slate-700 text-xl">arrow_back</span>
          </Link>
          <h1 className="text-base font-bold text-slate-900 flex-1 truncate">{w.title}</h1>
          <StatusBadge variant={status.variant} label={status.label} />
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* ── Progress card ───────────────────────────────────── */}
        {isActive && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Progresso da Obra
            </p>
            <div className="flex justify-between items-end mb-2">
              <p className="text-3xl font-black text-trust">{progress}%</p>
              <p className="text-xs text-slate-400">concluído</p>
            </div>
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-trust rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Next step ───────────────────────────────────────── */}
        {isActive && w.next_step && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust text-xl mt-0.5">flag</span>
              <div>
                <p className="text-[10px] font-bold text-trust uppercase tracking-wide">Próximo Passo</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{w.next_step}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Professional ────────────────────────────────────── */}
        {prof && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Profissional Responsável
            </p>
            <div className="flex items-center gap-3">
              <Avatar src={prof.avatar_url} name={prof.full_name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{prof.full_name}</p>
                <p className="text-xs text-slate-400">{w.professionals?.specialty}</p>
              </div>
              <Link
                href={`/profissional/${w.professionals?.id}`}
                className="text-xs font-semibold text-trust bg-blue-50 px-3 py-1.5 rounded-full"
              >
                Ver perfil
              </Link>
            </div>
          </div>
        )}

        {/* ── Photos ──────────────────────────────────────────── */}
        {Array.isArray(w.photos) && w.photos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Fotos da Evolução
            </p>
            <div className="grid grid-cols-3 gap-2">
              {w.photos.map((photo: string, idx: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={photo}
                  alt={`Foto ${idx + 1}`}
                  className="w-full aspect-square rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Dates ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            Datas
          </p>
          <div className="flex flex-col gap-2">
            {w.started_at && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Início</p>
                <p className="text-xs font-semibold text-slate-900">
                  {new Date(w.started_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {w.completed_at && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Conclusão</p>
                <p className="text-xs font-semibold text-slate-900">
                  {new Date(w.completed_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Cadastro</p>
              <p className="text-xs font-semibold text-slate-900">
                {new Date(w.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
