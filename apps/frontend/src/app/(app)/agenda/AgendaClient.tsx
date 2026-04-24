'use client';

import { useState } from 'react';
import { AgendaCalendar } from './AgendaCalendar';
import { AgendaVisitCard } from './AgendaVisitCard';
import type { VisitFull, UserRole } from '@obrafacil/shared';

interface AgendaClientProps {
  visits: VisitFull[];
  actingAs: UserRole;
}

/** Parse scheduled_at to local YYYY-MM-DD, handling timezone offset */
function toLocalDateStr(scheduledAt: string): string {
  // Use local date from Date object to handle timezone correctly
  const d = new Date(scheduledAt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AgendaClient({ visits, actingAs }: AgendaClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build map of date -> list of statuses (for calendar coloring)
  const visitsByDate = new Map<string, string[]>();
  for (const v of visits) {
    if (!v.scheduled_at) continue;
    const dateStr = toLocalDateStr(v.scheduled_at);
    const existing = visitsByDate.get(dateStr) ?? [];
    existing.push(v.status);
    visitsByDate.set(dateStr, existing);
  }

  const pending = visits.filter((v) => v.status === 'pending');
  const filteredVisits = selectedDate
    ? visits.filter((v) => v.scheduled_at && toLocalDateStr(v.scheduled_at) === selectedDate)
    : visits.filter((v) => v.status !== 'cancelled' && v.status !== 'rejected');

  return (
    <div className="px-4 mt-4 space-y-4">
      <AgendaCalendar
        visitsByDate={visitsByDate}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      {/* Pending alert */}
      {!selectedDate && pending.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="material-symbols-outlined text-amber-500 text-base">pending_actions</span>
          <p className="text-xs text-amber-700 font-medium">
            {pending.length} solicitaç{pending.length > 1 ? 'ões' : 'ão'} aguardando aceite
          </p>
        </div>
      )}

      {/* Visit list */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {selectedDate
              ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long', day: '2-digit', month: 'long',
                })
              : 'Pr\u00f3ximas visitas'}
          </h2>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-[#ec5b13] font-medium"
            >
              Ver todas
            </button>
          )}
        </div>

        {filteredVisits.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">
              calendar_month
            </span>
            <p className="text-sm text-slate-500">
              {selectedDate ? 'Nenhuma visita neste dia' : 'Nenhuma visita agendada'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVisits.map((visit) => (
              <AgendaVisitCard key={visit.id} visit={visit} actingAs={actingAs} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
