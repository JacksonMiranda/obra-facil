import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { toDateStr } from '../useBookingFlow';
import 'react-day-picker/style.css';

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  availableDates: Set<string>;
  selectedDateLabel: string;
  onSelectDate: (date: Date | undefined) => void;
}

export function ScheduleCalendar({
  selectedDate,
  availableDates,
  selectedDateLabel,
  onSelectDate,
}: ScheduleCalendarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Escolha uma data</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {availableDates.size}{' '}
            {availableDates.size === 1 ? 'dia disponível' : 'dias disponíveis'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-trust inline-block" /> Disponível
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> Indisponível
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          weekStartsOn={1}
          locale={ptBR}
          disabled={(date) => !availableDates.has(toDateStr(date))}
          fromDate={new Date()}
          toDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          classNames={{
            root: 'w-full [--rdp-accent-color:#1E40AF] [--rdp-accent-background-color:#1E40AF]',
            months: 'relative w-full',
            month_caption: 'flex items-center mb-4',
            caption_label: 'text-sm font-bold text-slate-900 capitalize',
            nav: 'absolute -top-1 right-0 flex gap-1',
            button_previous: 'p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500',
            button_next: 'p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500',
            weekdays: 'grid grid-cols-7 mb-1.5 w-full',
            weekday: 'text-slate-400 font-semibold text-[10px] uppercase tracking-wider text-center py-1',
            weeks: 'grid gap-y-0.5 w-full',
            week: 'grid grid-cols-7 w-full',
            day: 'flex items-center justify-center',
            day_button: [
              'w-full aspect-square max-w-[44px] min-w-[30px] rounded-full mx-auto',
              'flex items-center justify-center transition-all text-xs font-semibold',
              'hover:bg-blue-50 cursor-pointer',
            ].join(' '),
            selected: '[&>button]:!bg-trust [&>button]:!text-white [&>button]:shadow-md [&>button]:scale-110 [&>button]:hover:!bg-trust/90',
            today: '[&>button]:ring-2 [&>button]:ring-trust/40 [&>button]:text-trust',
            disabled: 'opacity-25 [&>button]:cursor-default [&>button]:hover:bg-transparent',
            outside: 'opacity-20',
          }}
        />
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 min-h-[28px]">
        {selectedDate ? (
          <>
            <span className="material-symbols-outlined text-trust text-base">arrow_forward</span>
            <span className="text-[11px] text-slate-600">
              <strong className="capitalize">{selectedDateLabel}</strong>
              {' '}— escolha um horário
            </span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-slate-300 text-base">touch_app</span>
            <span className="text-[11px] text-slate-400">Toque em um dia disponível</span>
          </>
        )}
      </div>
    </div>
  );
}
