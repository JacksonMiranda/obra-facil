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
    ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    : '';

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] ${
      fieldErrors[field] ? 'border-red-300' : 'border-slate-200'
    }`;

  return (
    <div className="px-4 md:px-8 pb-32 md:pb-8">
      {/* Hero */}
      <section className="mb-6 mt-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">Escolha uma data</h2>
        <p className="text-slate-500 font-medium text-sm">Selecione o melhor dia e horário para receber nossa equipe.</p>
      </section>

      {/* Desktop 2-col / Mobile stacked */}
      <div className="md:grid md:grid-cols-[1fr_400px] md:gap-8 md:items-start">

        {/* LEFT: Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date ?? undefined);
              setSelectedTime(null);
              if (date) {
                setTimeout(() => timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
              month_caption: 'flex items-center mb-6',
              caption_label: 'text-lg font-bold text-slate-900',
              nav: 'absolute -top-2 right-0 flex gap-1',
              button_previous: 'p-2 rounded-full hover:bg-slate-100 transition-colors',
              button_next: 'p-2 rounded-full hover:bg-slate-100 transition-colors',
              weekdays: 'grid grid-cols-7 mb-2',
              weekday: 'text-slate-400 font-semibold text-xs uppercase tracking-wider text-center',
              weeks: 'grid gap-y-1',
              week: 'grid grid-cols-7',
              day: 'text-center py-2.5 text-sm font-medium',
              day_button: 'w-9 h-9 rounded-full mx-auto flex items-center justify-center transition-colors hover:bg-slate-100 cursor-pointer',
              selected: '[&>button]:!bg-[#1E40AF] [&>button]:!text-white [&>button]:shadow-md [&>button]:hover:!bg-[#1E40AF]',
              today: '[&>button]:font-bold [&>button]:text-[#1E40AF]',
              disabled: 'text-slate-300 [&>button]:cursor-default [&>button]:hover:bg-transparent',
              outside: 'text-slate-300',
            }}
          />
        </div>

        {/* RIGHT: Time slots + form */}
        <div className="mt-6 md:mt-0 flex flex-col gap-4">
          {/* Time slots */}
          {selectedDate && timesForDay.length > 0 && (
            <section ref={timeSlotsRef}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Horários disponíveis</h3>
                <span className="text-sm font-semibold text-[#1E40AF] px-3 py-1 bg-blue-50 rounded-full capitalize">
                  {selectedDateLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {timesForDay.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setTimeout(() => streetRef.current?.focus(), 150);
                    }}
                    className={`
                      p-4 rounded-xl text-center transition-all active:scale-95
                      ${selectedTime === time
                        ? 'bg-[#1E40AF] text-white shadow-lg border-2 border-[#1E40AF]'
                        : 'bg-white border-2 border-transparent hover:border-blue-100'
                      }
                    `}
                  >
                    <span className="block text-lg font-bold">{time}</span>
                    <span className={`text-xs font-medium ${selectedTime === time ? 'opacity-80' : 'text-emerald-600'}`}>
                      {selectedTime === time ? 'Selecionado' : 'Disponível'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {!selectedDate && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">calendar_month</span>
              <p className="text-sm text-slate-400">Selecione uma data no calendário</p>
            </div>
          )}

          {/* Structured booking form */}
          {selectedTime && (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Detalhes da visita</h3>

              {/* Address section */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Endereço</p>
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
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
                        Complemento
                      </label>
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

                  <div className="grid grid-cols-[1fr_auto] gap-3">
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
                        className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] ${
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sobre o Serviço</p>
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
            <div className="bg-emerald-50/60 p-5 rounded-xl flex items-start gap-4">
              <span className="material-symbols-outlined text-emerald-600 text-2xl mt-0.5">info</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Aviso Importante</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Sua visita terá duração estimada de 60 minutos. Certifique-se de estar no local 5 minutos antes do horário agendado.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-xs text-error text-center font-medium">{error}</p>}

          {/* CTA — desktop inline, mobile fixed */}
          {selectedTime && (
            <>
              {/* Desktop */}
              <button
                onClick={handleBook}
                disabled={booking}
                className="hidden md:flex w-full items-center justify-center py-4 px-8 bg-[#1E40AF] text-white font-bold text-base rounded-xl shadow-lg hover:bg-[#1e3a8a] active:scale-95 transition-all disabled:opacity-60"
              >
                {booking ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  'Confirmar Agendamento'
                )}
              </button>
              {/* Mobile fixed */}
              <div className="md:hidden fixed bottom-20 left-0 w-full p-4 bg-white/80 backdrop-blur-xl z-40">
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="w-full py-4 px-8 bg-[#1E40AF] text-white font-bold text-lg rounded-full shadow-lg active:scale-95 transition-all disabled:opacity-60"
                >
                  {booking ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  ) : (
                    'Confirmar Agendamento'
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
