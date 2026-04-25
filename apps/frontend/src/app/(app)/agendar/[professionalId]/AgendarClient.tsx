'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { TIMEZONE_OFFSET } from '@obrafacil/shared';
import { useClientApi } from '@/lib/api/client-api';
import 'react-day-picker/style.css';

/** Locale-safe YYYY-MM-DD (avoids toISOString UTC shift in negative offsets) */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const BR_STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
];

interface AvailableDay {
  date: string;
  times: string[];
}

interface AgendarClientProps {
  professionalId: string;
  professionalName: string;
  /** The current user's professional profile ID, if they have one */
  currentUserProfessionalId?: string | null;
  /** Pre-fill for service type */
  professionalSpecialty?: string;
}

export function AgendarClient({
  professionalId,
  professionalName,
  currentUserProfessionalId,
  professionalSpecialty,
}: AgendarClientProps) {
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailableDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Structured form fields
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [serviceType, setServiceType] = useState(professionalSpecialty ?? '');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlotsRef = useRef<HTMLElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const api = useClientApi();

  // Check if this user is trying to book their own professional profile
  const isSelfBooking = !!currentUserProfessionalId && currentUserProfessionalId === professionalId;

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<AvailableDay[]>(`/v1/professionals/${professionalId}/availability`);
        setAvailability(data);
      } catch {
        setError('Não foi possível carregar a agenda.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [professionalId]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Dates that have available slots
  const availableDates = new Set(availability.map((d) => d.date));

  // Times for the selected date
  const selectedDateStr = selectedDate ? toDateStr(selectedDate) : undefined;
  const timesForDay = availability.find((d) => d.date === selectedDateStr)?.times ?? [];

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!street.trim()) errs.street = 'Rua obrigatória';
    if (!streetNumber.trim()) errs.streetNumber = 'Número obrigatório';
    if (!neighborhood.trim()) errs.neighborhood = 'Bairro obrigatório';
    if (!cityName.trim()) errs.cityName = 'Cidade obrigatória';
    if (!stateCode) errs.stateCode = 'Estado obrigatório';
    if (!requesterName.trim()) errs.requesterName = 'Nome do solicitante obrigatório';
    if (!serviceType.trim()) errs.serviceType = 'Tipo de serviço obrigatório';
    if (description.trim().length < 10) errs.description = 'Descreva o problema (mín. 10 caracteres)';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    if (!validateForm()) return;
    setBooking(true);
    setError(null);

    const scheduledAt = new Date(`${selectedDateStr}T${selectedTime}:00${TIMEZONE_OFFSET}`).toISOString();

    try {
      await api.post('/v1/visits', {
        professionalId,
        scheduledAt,
        street: street.trim(),
        streetNumber: streetNumber.trim(),
        complement: complement.trim() || undefined,
        neighborhood: neighborhood.trim(),
        cityName: cityName.trim(),
        stateCode: stateCode.toUpperCase(),
        requesterName: requesterName.trim(),
        serviceType: serviceType.trim(),
        description: description.trim(),
      }, true); // skipActingAs=true: booking is always a client action

      router.push(`/agendar/confirmacao?profissional=${encodeURIComponent(professionalName)}&data=${selectedDateStr}&hora=${selectedTime}`);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        setError('Este horário já foi reservado. Escolha outro.');
        setSelectedTime(null);
        // Reload availability to show updated slots
        const data = await api.get<AvailableDay[]>(`/v1/professionals/${professionalId}/availability`).catch(() => null);
        if (data) setAvailability(data);
      } else {
        setError('Erro ao agendar. Tente novamente.');
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-3 border-slate-200 border-t-trust rounded-full animate-spin" />
      </div>
    );
  }

  // Self-booking guard
  if (isSelfBooking) {
    return (
      <div className="px-4 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">block</span>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Não é possível agendar</h2>
        <p className="text-sm text-slate-500 mb-6">
          Você não pode contratar o seu próprio serviço.
        </p>
        <button onClick={() => router.back()} className="text-trust font-medium text-sm">
          Voltar
        </button>
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">event_busy</span>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Agenda indisponível</h2>
        <p className="text-sm text-slate-500 mb-6">
          Este profissional ainda não configurou sua agenda. Envie uma mensagem para combinar.
        </p>
        <button onClick={() => router.back()} className="text-trust font-medium text-sm">
          Voltar ao perfil
        </button>
      </div>
    );
  }

  // Format selected date for badge display
  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] transition-colors ${
      fieldErrors[field] ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
    }`;

  // Which step the user is currently on (used by stepper)
  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : 3;

  return (
    <div className="pb-32 lg:pb-12">

      {/* ── Step progress bar ── */}
      <div className="px-4 md:px-8 pt-6 pb-5">
        <div className="flex items-center gap-0 max-w-sm">
          {([
            { label: 'Data',     hint: 'Escolha o dia'     },
            { label: 'Horário',  hint: 'Escolha o horário' },
            { label: 'Detalhes', hint: 'Preencha os dados' },
          ] as const).map(({ label, hint }, i) => {
            const step = i + 1;
            const done   = step < currentStep;
            const active = step === currentStep;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      done   ? 'bg-emerald-500 text-white' :
                      active ? 'bg-[#1E40AF] text-white shadow-[#1E40AF]/30 shadow-md' :
                               'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done
                      ? <span className="material-symbols-outlined text-sm leading-none">check</span>
                      : step
                    }
                  </span>
                  <span className={`text-[10px] font-semibold leading-tight hidden sm:block ${
                    active ? 'text-[#1E40AF]' : done ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {label}
                  </span>
                  <span className={`text-[9px] leading-tight hidden md:block ${
                    active ? 'text-slate-500' : 'text-transparent'
                  }`}>
                    {hint}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main 2-column grid ── */}
      {/*
          LEFT  (flex-col): calendário + horários (etapas 1 e 2 juntos)
          RIGHT (sticky):   resumo da seleção + formulário do cliente (etapa 3)
      */}
      <div className="px-4 md:px-8 lg:grid lg:grid-cols-[1fr_400px] lg:gap-6 lg:items-start">

        {/* ══════════════════════════════════════════════
            LEFT COLUMN — Seleção da agenda (etapas 1 e 2)
            ══════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">

          {/* Calendário */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Escolha uma data</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {availableDates.size} {availableDates.size === 1 ? 'dia disponível' : 'dias disponíveis'} nos próximos 30 dias
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-[10px] text-slate-400 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] inline-block" /> Disponível
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Indisponível
                </span>
              </div>
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date ?? undefined);
                setSelectedTime(null);
                if (date) {
                  setTimeout(() => timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
                }
              }}
              weekStartsOn={1}
              locale={ptBR}
              disabled={(date) => !availableDates.has(toDateStr(date))}
              fromDate={new Date()}
              toDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              classNames={{
                root: 'w-full [--rdp-accent-color:#1E40AF] [--rdp-accent-background-color:#1E40AF]',
                months: 'relative w-full',
                month_caption: 'flex items-center mb-5',
                caption_label: 'text-base font-bold text-slate-900 capitalize',
                nav: 'absolute -top-1 right-0 flex gap-1',
                button_previous: 'p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500',
                button_next: 'p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500',
                weekdays: 'grid grid-cols-7 mb-2 w-full',
                weekday: 'text-slate-400 font-semibold text-xs uppercase tracking-wider text-center py-1',
                weeks: 'grid gap-y-1 w-full',
                week: 'grid grid-cols-7 w-full',
                day: 'flex items-center justify-center',
                day_button: [
                  'w-full aspect-square max-w-[52px] min-w-[36px] rounded-full mx-auto',
                  'flex items-center justify-center transition-all text-sm font-semibold',
                  'hover:bg-blue-50 cursor-pointer',
                ].join(' '),
                selected: '[&>button]:!bg-[#1E40AF] [&>button]:!text-white [&>button]:shadow-lg [&>button]:scale-105 [&>button]:hover:!bg-[#1e3a8a]',
                today: '[&>button]:ring-2 [&>button]:ring-[#1E40AF]/40 [&>button]:text-[#1E40AF]',
                disabled: 'opacity-25 [&>button]:cursor-default [&>button]:hover:bg-transparent',
                outside: 'opacity-20',
              }}
            />

            {/* Hint pós-seleção de data */}
            {selectedDate ? (
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1E40AF] text-lg">arrow_downward</span>
                <span className="text-xs text-slate-600">
                  <strong className="capitalize">{selectedDateLabel}</strong>
                  {' '}— agora escolha um horário abaixo
                </span>
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-300 text-lg">touch_app</span>
                <span className="text-xs text-slate-400">Toque em um dia disponível para ver os horários</span>
              </div>
            )}
          </div>

          {/* ── Horários disponíveis (etapa 2, acoplada ao calendário) ── */}
          {selectedDate && timesForDay.length > 0 && (
            <section
              ref={timeSlotsRef}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Horários disponíveis</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {timesForDay.length} horário{timesForDay.length !== 1 ? 's' : ''} livre{timesForDay.length !== 1 ? 's' : ''} —{' '}
                    <span className="capitalize font-medium text-[#1E40AF]">
                      {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </p>
                </div>
                {selectedTime && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-200">
                    ✓ {selectedTime} selecionado
                  </span>
                )}
              </div>

              {/* Grade de horários — 4 colunas no desktop, 3 no mobile */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timesForDay.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setTimeout(() => streetRef.current?.focus(), 220);
                    }}
                    className={`
                      py-4 px-2 rounded-xl text-center transition-all active:scale-95 border-2 group
                      ${selectedTime === time
                        ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-md shadow-[#1E40AF]/20 scale-105'
                        : 'bg-white border-slate-200 hover:border-[#1E40AF]/50 hover:bg-blue-50/60 hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="block text-lg font-bold leading-none">{time}</span>
                    <span className={`text-[10px] font-medium mt-1.5 block transition-colors ${
                      selectedTime === time
                        ? 'text-blue-100'
                        : 'text-emerald-600 group-hover:text-[#1E40AF]'
                    }`}>
                      {selectedTime === time ? '✓ Selecionado' : 'Livre'}
                    </span>
                  </button>
                ))}
              </div>

              {selectedTime && (
                <p className="mt-4 text-xs text-slate-400 text-center">
                  Preencha os dados da visita no painel ao lado →
                </p>
              )}
            </section>
          )}

          {/* Estado: data sem horários */}
          {selectedDate && timesForDay.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">event_busy</span>
              <p className="text-sm font-semibold text-slate-500">Nenhum horário disponível</p>
              <p className="text-xs text-slate-400 mt-1">Selecione outro dia no calendário acima</p>
            </div>
          )}
        </div>
        {/* ── fim LEFT COLUMN ── */}

        {/* ══════════════════════════════════════════════
            RIGHT COLUMN — Resumo + Formulário do cliente (etapa 3)
            sticky: acompanha o scroll sem precisar rolar até o form
            ══════════════════════════════════════════════ */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-6 flex flex-col gap-4">

          {/* Estado: nenhuma data selecionada */}
          {!selectedDate && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">calendar_month</span>
              <p className="text-sm font-semibold text-slate-500">Selecione uma data</p>
              <p className="text-xs text-slate-400 mt-1">Os próximos passos aparecerão aqui</p>
            </div>
          )}

          {/* Estado: data selecionada mas sem horário */}
          {selectedDate && !selectedTime && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">schedule</span>
              <p className="text-sm font-semibold text-slate-500">Escolha um horário</p>
              <p className="text-xs text-slate-400 mt-1 px-6">
                Selecione um dos horários disponíveis{' '}
                {timesForDay.length > 0 ? 'ao lado' : 'no calendário'}
              </p>
            </div>
          )}

          {/* ── Formulário — só aparece com horário selecionado ── */}
          {selectedTime && (
            <>
              {/* Card: Resumo da seleção */}
              <div className="bg-[#1E40AF] rounded-2xl p-4 flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-2xl opacity-80">event_available</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium opacity-70 uppercase tracking-wider">Visita agendada para</p>
                  <p className="text-sm font-bold capitalize leading-tight truncate mt-0.5">
                    {selectedDateLabel}
                  </p>
                  <p className="text-xl font-extrabold leading-none mt-0.5">{selectedTime}</p>
                </div>
                <button
                  onClick={() => setSelectedTime(null)}
                  className="shrink-0 flex flex-col items-center gap-0.5 opacity-70 hover:opacity-100 transition-opacity"
                  title="Alterar horário"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  <span className="text-[9px] font-bold">Alterar</span>
                </button>
              </div>

              {/* Card: Detalhes da visita */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Seção: Endereço */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#1E40AF] text-sm">location_on</span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">Endereço da visita</h3>
                  </div>
                  <div className="space-y-3">

                    {/* Rua */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Rua / Avenida <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={streetRef}
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Ex: Rua das Flores"
                        maxLength={200}
                        className={inputClass('street')}
                      />
                      {fieldErrors.street && <p className="text-xs text-red-500 mt-1">{fieldErrors.street}</p>}
                    </div>

                    {/* Número + Complemento */}
                    <div className="grid grid-cols-[1fr_1fr] gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                          Número <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={streetNumber}
                          onChange={(e) => setStreetNumber(e.target.value)}
                          placeholder="123"
                          maxLength={20}
                          className={inputClass('streetNumber')}
                        />
                        {fieldErrors.streetNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.streetNumber}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                          Complemento
                          <span className="ml-1 text-slate-300 font-normal">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          placeholder="Ap. 12, Casa B..."
                          maxLength={100}
                          className={inputClass('complement')}
                        />
                      </div>
                    </div>

                    {/* Bairro */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Bairro <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        maxLength={100}
                        className={inputClass('neighborhood')}
                      />
                      {fieldErrors.neighborhood && <p className="text-xs text-red-500 mt-1">{fieldErrors.neighborhood}</p>}
                    </div>

                    {/* Cidade + UF */}
                    <div className="grid grid-cols-[1fr_88px] gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                          Cidade <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                          placeholder="Ex: São Paulo"
                          maxLength={100}
                          className={inputClass('cityName')}
                        />
                        {fieldErrors.cityName && <p className="text-xs text-red-500 mt-1">{fieldErrors.cityName}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                          UF <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value)}
                          className={`w-full px-2 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] transition-colors ${
                            fieldErrors.stateCode ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <option value="">--</option>
                          {BR_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {fieldErrors.stateCode && <p className="text-xs text-red-500 mt-1">{fieldErrors.stateCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divisor */}
                <div className="h-px bg-slate-100 mx-5" />

                {/* Seção: Sobre o Serviço */}
                <div className="px-5 pt-4 pb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-orange-500 text-sm">build</span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">Sobre o serviço</h3>
                  </div>
                  <div className="space-y-3">

                    {/* Nome do solicitante */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Seu nome <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        placeholder="Nome completo"
                        maxLength={100}
                        className={inputClass('requesterName')}
                      />
                      {fieldErrors.requesterName && <p className="text-xs text-red-500 mt-1">{fieldErrors.requesterName}</p>}
                    </div>

                    {/* Tipo de serviço */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Tipo de serviço <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        placeholder="Ex: Instalação elétrica"
                        maxLength={100}
                        className={inputClass('serviceType')}
                      />
                      {fieldErrors.serviceType && <p className="text-xs text-red-500 mt-1">{fieldErrors.serviceType}</p>}
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">
                        Descrição do problema <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o que precisa ser feito, materiais envolvidos, urgência..."
                        rows={4}
                        maxLength={1000}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] resize-none transition-colors ${
                          fieldErrors.description ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {fieldErrors.description
                          ? <p className="text-xs text-red-500">{fieldErrors.description}</p>
                          : <p className="text-xs text-slate-400">Mínimo 10 caracteres</p>
                        }
                        <span className={`text-xs tabular-nums ${description.length > 900 ? 'text-amber-500' : 'text-slate-300'}`}>
                          {description.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso de duração */}
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5 shrink-0">info</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Duração estimada:</strong> 60 min. Esteja no local 5 min antes do horário marcado.
                </p>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                  <span className="material-symbols-outlined text-red-500 text-lg shrink-0">error</span>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* CTA desktop */}
              <button
                onClick={handleBook}
                disabled={booking}
                className="hidden lg:flex w-full items-center justify-center gap-2 py-4 px-8 bg-[#1E40AF] text-white font-bold text-base rounded-xl shadow-lg shadow-[#1E40AF]/20 hover:bg-[#1e3a8a] active:scale-95 transition-all disabled:opacity-60"
              >
                {booking
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      Confirmar Agendamento
                    </>
                }
              </button>
            </>
          )}
        </div>
        {/* ── fim RIGHT COLUMN ── */}

      </div>

      {/* CTA mobile fixo (abaixo da barra de navegação) */}
      {selectedTime && (
        <div className="lg:hidden fixed bottom-16 left-0 w-full px-4 pb-3 pt-2 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40">
          <button
            onClick={handleBook}
            disabled={booking}
            className="w-full py-4 bg-[#1E40AF] text-white font-bold text-base rounded-full shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {booking
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  Confirmar Agendamento
                </>
            }
          </button>
        </div>
      )}

    </div>
  );
}
