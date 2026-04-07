'use client';

import { useState, useMemo } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

const OBRA_STATUS_MAP: Record<string, { label: string; variant: 'ativo' | 'agendado' | 'entregue' | 'cancelado' | 'pendente' | 'a-caminho' }> = {
  in_progress: { label: 'Ativo', variant: 'ativo' },
  scheduled: { label: 'Agendado', variant: 'agendado' },
  completed: { label: 'Concluida', variant: 'entregue' },
  cancelled: { label: 'Cancelada', variant: 'cancelado' },
  pending: { label: 'Pendente', variant: 'pendente' },
};

const IN_PROGRESS_STATUSES = ['in_progress', 'scheduled', 'pending'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ObrasClient({ works }: { works: any[] }) {
  const [activeTab, setActiveTab] = useState<'andamento' | 'finalizadas'>('andamento');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const byTab = works.filter((w) =>
      activeTab === 'andamento'
        ? IN_PROGRESS_STATUSES.includes(w.status)
        : !IN_PROGRESS_STATUSES.includes(w.status),
    );
    if (!search.trim()) return byTab;
    const q = search.toLowerCase();
    return byTab.filter((w) => w.title?.toLowerCase().includes(q));
  }, [works, activeTab, search]);

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-slate-200" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'andamento'}
          onClick={() => setActiveTab('andamento')}
          className={`flex-1 text-center py-3 text-sm transition-colors ${
            activeTab === 'andamento'
              ? 'font-semibold text-trust border-b-2 border-trust'
              : 'font-medium text-slate-400'
          }`}
        >
          Em andamento
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'finalizadas'}
          onClick={() => setActiveTab('finalizadas')}
          className={`flex-1 text-center py-3 text-sm transition-colors ${
            activeTab === 'finalizadas'
              ? 'font-semibold text-trust border-b-2 border-trust'
              : 'font-medium text-slate-400'
          }`}
        >
          Finalizadas
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
          <input
            type="text"
            placeholder="Buscar obra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Limpar busca">
              <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Works list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">construction</span>
          <p className="text-sm font-semibold text-slate-500">
            {activeTab === 'andamento' ? 'Nenhuma obra em andamento' : 'Nenhuma obra finalizada'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'Tente buscar por outro termo.' : 'Quando voce contratar um profissional, a obra aparecera aqui.'}
          </p>
        </div>
      ) : (
        <div className="px-4 mt-3 flex flex-col gap-4" role="tabpanel">
          {filtered.map((work) => {
            const w = work;
            const status = OBRA_STATUS_MAP[w.status] ?? { label: w.status, variant: 'pendente' as const };
            const progress = w.progress_pct ?? 0;
            const prof = w.professionals?.profiles;
            const isActive = w.status === 'in_progress';

            return (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900">{w.title}</h3>
                    <StatusBadge variant={status.variant} label={status.label} />
                  </div>

                  {prof && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar src={prof.avatar_url} name={prof.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{prof.full_name}</p>
                        <p className="text-[10px] text-slate-400">Profissional Responsavel</p>
                      </div>
                    </div>
                  )}

                  {isActive && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-slate-700">Progresso Geral</p>
                        <p className="text-xs font-bold text-trust">{progress}% concluido</p>
                      </div>
                      <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-trust rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {isActive && w.next_step && (
                    <div className="flex items-start gap-2 mb-3 bg-blue-50 rounded-xl p-3">
                      <span className="material-symbols-outlined text-trust text-lg mt-0.5">flag</span>
                      <div>
                        <p className="text-[10px] font-bold text-trust uppercase tracking-wide">Proximo Passo</p>
                        <p className="text-xs text-slate-700 mt-0.5">{w.next_step}</p>
                      </div>
                    </div>
                  )}

                  {Array.isArray(w.photos) && w.photos.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-700">Fotos da Evolucao</p>
                        <Link href={`/obras/${w.id}`} className="text-[10px] font-semibold text-trust">
                          Ver todas →
                        </Link>
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {w.photos.slice(0, 4).map((photo: string, idx: number) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={idx} src={photo} alt={`Foto ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        ))}
                        {w.photos.length > 4 && (
                          <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-slate-500">+{w.photos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/obras/${w.id}`}
                    className="block w-full text-center text-sm font-bold text-white bg-trust py-3 rounded-xl active:scale-[0.98] transition-transform"
                  >
                    Ver Detalhes da Obra
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
