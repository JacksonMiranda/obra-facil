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
    `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] ${
      fieldErrors[field] ? 'border-red-300' : 'border-slate-200'
    }`;

  // Which step the user is currently on
  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : 3;

  return (
    <div className="pb-32 md:pb-12">
      {/* Step progress */}
      <div className="px-4 md:px-8 pt-6 pb-4">
        <div className="flex items-center gap-2 max-w-md">
          {(['Data', 'Horário', 'Detalhes'] as const).map((label, i) => {
            const step = i + 1;
            const done = step < currentStep;
            const active = step === currentStep;
            return (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : active
                        ? 'bg-[#1E40AF] text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done ? (
                      <span className="material-symbols-outlined text-sm leading-none">check</span>
                    ) : (
                      step
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold hidden sm:block ${
                      active ? 'text-[#1E40AF]' : done ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop 2-col / Mobile stacked */}
      <div className="px-4 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:items-start">

        {/* LEFT: Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Escolha uma data</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {availableDates.size} {availableDates.size === 1 ? 'dia disponível' : 'dias disponíveis'} nos próximos 30 dias
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1E40AF] inline-block" /> Disponível
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Indisponível
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
              months: 'relative',
              month_caption: 'flex items-center mb-5',
              caption_label: 'text-base font-bold text-slate-900 capitalize',
              nav: 'absolute -top-1 right-0 flex gap-1',
              button_previous: 'p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500',
              button_next: 'p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500',
              weekdays: 'grid grid-cols-7 mb-3',
              weekday: 'text-slate-400 font-semibold text-xs uppercase tracking-wider text-center',
              weeks: 'grid gap-y-2',
              week: 'grid grid-cols-7',
              day: 'text-center',
              day_button: [
                'w-11 h-11 rounded-full mx-auto flex items-center justify-center transition-all text-sm font-semibold',
                'hover:bg-blue-50 cursor-pointer',
              ].join(' '),
              selected: '[&>button]:!bg-[#1E40AF] [&>button]:!text-white [&>button]:shadow-lg [&>button]:scale-110 [&>button]:hover:!bg-[#1e3a8a]',
              today: '[&>button]:ring-2 [&>button]:ring-[#1E40AF]/40 [&>button]:text-[#1E40AF]',
              disabled: 'opacity-30 [&>button]:cursor-default [&>button]:hover:bg-transparent',
              outside: 'opacity-20',
            }}
          />

          {/* Legend / hint */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-[#1E40AF] text-xl">event_available</span>
              <span>
                <strong className="capitalize">{selectedDateLabel}</strong> selecionado — escolha um horário ao lado
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Time slots + form */}
        <div className="mt-6 lg:mt-0 flex flex-col gap-5">

          {/* Placeholder when no date is selected */}
          {!selectedDate && (
            <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">calendar_month</span>
              <p className="text-sm font-semibold text-slate-500">Selecione uma data no calendário</p>
              <p className="text-xs text-slate-400 mt-1">Os horários disponíveis aparecerão aqui</p>
            </div>
          )}

          {/* Time slots */}
          {selectedDate && timesForDay.length > 0 && (
            <section ref={timeSlotsRef} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Horários disponíveis</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{timesForDay.length} horário{timesForDay.length !== 1 ? 's' : ''} livre{timesForDay.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-xs font-semibold text-[#1E40AF] px-3 py-1.5 bg-blue-50 rounded-full capitalize">
                  {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {timesForDay.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setTimeout(() => streetRef.current?.focus(), 200);
                    }}
                    className={`
                      py-3 px-2 rounded-xl text-center transition-all active:scale-95 border-2
                      ${selectedTime === time
                        ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-md scale-105'
                        : 'bg-white border-slate-200 hover:border-[#1E40AF]/40 hover:bg-blue-50/50'
                      }
                    `}
                  >
                    <span className="block text-base font-bold leading-tight">{time}</span>
                    <span className={`text-[10px] font-medium mt-0.5 block ${selectedTime === time ? 'text-blue-200' : 'text-emerald-600'}`}>
                      {selectedTime === time ? '✓ Selecionado' : 'Livre'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Selected date has no times (shouldn't happen but defensive) */}
          {selectedDate && timesForDay.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">schedule</span>
              <p className="text-sm text-slate-500">Nenhum horário disponível para este dia</p>
              <p className="text-xs text-slate-400 mt-1">Selecione outra data no calendário</p>
            </div>
          )}

          {/* Structured booking form */}
          {selectedTime && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
              {/* Summary bar */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="material-symbols-outlined text-[#1E40AF] text-xl">event_available</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Agendando para</p>
                  <p className="text-sm font-bold text-slate-900 capitalize truncate">
                    {selectedDateLabel} às {selectedTime}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTime(null)}
                  className="text-xs text-[#1E40AF] font-semibold shrink-0 hover:underline"
                >
                  Alterar
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900">Detalhes da visita</h3>

              {/* Address section */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">📍 Endereço</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
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
                    {fieldErrors.street && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.street}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
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
                      {fieldErrors.streetNumber && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.streetNumber}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Complemento</label>
                      <input
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Ap. 12"
                        maxLength={100}
                        className={inputClass('complement')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
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
                    {fieldErrors.neighborhood && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.neighborhood}</p>}
                  </div>

                  <div className="grid grid-cols-[1fr_80px] gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
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
                      {fieldErrors.cityName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.cityName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
                        UF <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        className={`w-full px-2 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] ${
                          fieldErrors.stateCode ? 'border-red-300' : 'border-slate-200'
                        }`}
                      >
                        <option value="">--</option>
                        {BR_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {fieldErrors.stateCode && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.stateCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking details section */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">🔧 Sobre o Serviço</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
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
                    {fieldErrors.requesterName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.requesterName}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
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
                    {fieldErrors.serviceType && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.serviceType}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                      Descrição do problema <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva detalhadamente o que precisa ser feito..."
                      rows={3}
                      maxLength={1000}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] resize-none ${
                        fieldErrors.description ? 'border-red-300' : 'border-slate-200'
                      }`}
                    />
                    <div className="flex justify-between mt-0.5">
                      {fieldErrors.description
                        ? <p className="text-xs text-red-500">{fieldErrors.description}</p>
                        : <span />
                      }
                      <span className="text-xs text-slate-300">{description.length}/1000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info card */}
          {selectedTime && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">info</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Aviso:</strong> a visita tem duração estimada de 60 min. Esteja no local 5 min antes.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <span className="material-symbols-outlined text-red-500 text-lg">error</span>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* CTA */}
          {selectedTime && (
            <>
              {/* Desktop inline */}
              <button
                onClick={handleBook}
                disabled={booking}
                className="hidden lg:flex w-full items-center justify-center gap-2 py-4 px-8 bg-[#1E40AF] text-white font-bold text-base rounded-xl shadow-lg hover:bg-[#1e3a8a] active:scale-95 transition-all disabled:opacity-60"
              >
                {booking ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    Confirmar Agendamento
                  </>
                )}
              </button>
              {/* Mobile fixed */}
              <div className="lg:hidden fixed bottom-16 left-0 w-full px-4 pb-3 pt-2 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-40">
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="w-full py-4 px-8 bg-[#1E40AF] text-white font-bold text-base rounded-full shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      Confirmar Agendamento
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
