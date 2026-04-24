import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { OportunidadeActions } from './OportunidadeActions';
import type { VisitWithClient } from '@obrafacil/shared';

export default async function OportunidadesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Busca visitas do profissional (actingAs=professional é enviado via cookie pelo api client)
  const visits = await api.get<VisitWithClient[]>('/v1/visits').catch(() => []);

  const pending = visits.filter((v) => v.status === 'pending');
  const confirmed = visits.filter((v) => v.status === 'confirmed');
  const completed = visits.filter((v) => v.status === 'completed');

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Oportunidades" />

      <div className="px-4 mt-4 space-y-4">
        {/* Solicitações pendentes de aceite */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Aguardando Aceite
          </h2>

          {pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">
                pending_actions
              </span>
              <p className="text-sm text-slate-500">Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-white rounded-xl border border-amber-200 shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-amber-500 text-xl">
                        person
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {visit.client?.full_name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {visit.scheduled_at
                          ? new Date(visit.scheduled_at).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Data a definir'}
                      </p>
                      {visit.notes && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{visit.notes}</p>
                      )}
                      {visit.address && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="truncate">{visit.address}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap border border-amber-200">
                      Pendente
                    </span>
                  </div>
                  <OportunidadeActions visitId={visit.id} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Visitas confirmadas */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Visitas Agendadas
          </h2>

          {confirmed.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">
                event_available
              </span>
              <p className="text-sm text-slate-500">Nenhuma visita agendada no momento</p>
              <p className="text-xs text-slate-400 mt-1">
                Aceite solicitações para que apareçam aqui
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmed.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-trust/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-trust text-xl">
                        person
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {visit.client?.full_name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {visit.scheduled_at
                          ? new Date(visit.scheduled_at).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Data a definir'}
                      </p>
                      {visit.notes && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{visit.notes}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Confirmada
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Histórico */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Concluídas
            </h2>
            <div className="space-y-2">
              {completed.slice(0, 5).map((visit) => (
                <div
                  key={visit.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500 text-xl">
                      check_circle
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {visit.client?.full_name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {visit.scheduled_at
                          ? new Date(visit.scheduled_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Concluída
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

