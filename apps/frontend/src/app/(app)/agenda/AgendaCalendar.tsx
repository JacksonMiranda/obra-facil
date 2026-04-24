'use client';

import { useState } from 'react';

interface AgendaCalendarProps {
  /** Map of ISO date (YYYY-MM-DD) -> list of visit statuses on that day */
  visitsByDate: Map<string, string[]>;
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function dotColor(statuses: string[], isSelected: boolean): string {
  if (isSelected) return 'bg-white';
  if (statuses.includes('pending')) return 'bg-amber-400';
  if (statuses.includes('confirmed')) return 'bg-green-500';
  return 'bg-slate-400';
}

export function AgendaCalendar({ visitsByDate, onSelectDate, selectedDate }: AgendaCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDay = (day: number) => {
    const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
    onSelectDate(iso === selectedDate ? null : iso);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Mes anterior">
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <p className="text-sm font-semibold text-slate-800">{MONTHS[month]} {year}</p>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Proximo mes">
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }
          const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
          const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          const statuses = visitsByDate.get(iso) ?? [];
          const hasVisit = statuses.length > 0;
          return (
            <div key={iso} className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => handleDay(day)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${isSelected ? 'bg-[#ec5b13] text-white' : isToday ? 'bg-orange-100 text-[#ec5b13] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                {day}
              </button>
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${hasVisit ? dotColor(statuses, isSelected) : 'bg-transparent'}`} />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-[10px] text-slate-400">Pendente</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] text-slate-400">Confirmado</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-[10px] text-slate-400">Outros</span></div>
      </div>
    </div>
  );
}
