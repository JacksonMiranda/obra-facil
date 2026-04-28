'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClientApi } from '@/lib/api/client-api';
import { useRole } from '@/contexts/RoleContext';
import { setActingAs as persistActingAs } from '@/lib/acting-as';
import type { UserRole } from '@obrafacil/shared';

interface ServiceCategory {
  id: string;
  name: string;
  icon_name: string;
  description: string | null;
}

interface ActiveService {
  service_id: string;
  service_name: string;
  service_icon: string;
  visibility_status: 'active' | 'inactive';
}

interface ProfessionalProfile {
  specialty: string;
  bio: string | null;
  visibility_status?: 'draft' | 'active' | 'inactive';
  is_complete?: boolean;
  missing_fields?: string[];
  services?: ActiveService[];
}

interface Props {
  roles: UserRole[];
}

export function ProfessionalActivation({ roles }: Props) {
  const router = useRouter();
  const api = useClientApi();
  const { setRole } = useRole();
  const isProfessional = roles.includes('professional');

  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  // Multi-select: Set of service IDs
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<ProfessionalProfile | null>(null);
  const [editBio, setEditBio] = useState('');
  const [editServiceIds, setEditServiceIds] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState<string | null>(null);
  const [draftWarning, setDraftWarning] = useState<{ missing: string[] } | null>(null);

  // Availability status
  const [hasAvailability, setHasAvailability] = useState<boolean | null>(null);
  const [showAvailabilityPrompt, setShowAvailabilityPrompt] = useState(false);

  useEffect(() => {
    api.get<ServiceCategory[]>('/v1/services')
      .then(setServices)
      .catch(() => setServices([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isProfessional) return;
    api.get<ProfessionalProfile>('/v1/professionals/me')
      .then((pro) => {
        setCurrentProfile(pro);
        setEditBio(pro.bio ?? '');
        // Pre-select currently active services
        const activeIds = new Set(
          (pro.services ?? [])
            .filter((s) => s.visibility_status === 'active')
            .map((s) => s.service_id),
        );
        setEditServiceIds(activeIds);
      })
      .catch(() => setCurrentProfile(null));

    api.get<unknown[]>('/v1/availability')
      .then((slots) => setHasAvailability(Array.isArray(slots) && slots.length > 0))
      .catch(() => setHasAvailability(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfessional]);

  function toggleService(id: string, current: Set<string>, setter: (s: Set<string>) => void) {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedServiceIds.size === 0) {
      setError('Selecione ao menos uma especialidade');
      return;
    }
    if (bio.trim().length > 0 && bio.trim().length < 10) {
      setError('A bio deve ter no mínimo 10 caracteres');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.post<{
        visibility_status: string;
        is_complete: boolean;
        missing_fields: string[];
      }>('/v1/account/roles/professional/activate', {
        serviceIds: Array.from(selectedServiceIds),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
      }, true);

      await api.patch('/v1/account/acting-as', { role: 'professional' }).catch(() => null);
      persistActingAs('professional');
      setRole('professional');

      if (!result.is_complete) {
        setDraftWarning({ missing: result.missing_fields });
      }

      setShowAvailabilityPrompt(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate() {
    setLoading(true);
    setError(null);
    try {
      await api.post('/v1/account/roles/deactivate', { role: 'professional' });
      persistActingAs('client');
      setRole('client');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (editBio.trim().length > 0 && editBio.trim().length < 10) {
      setError('A bio deve ter no mínimo 10 caracteres');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await api.put<ProfessionalProfile>('/v1/professionals/me', {
        serviceIds: Array.from(editServiceIds),
        bio: editBio.trim() || undefined,
      });
      setCurrentProfile(updated);
      setEditing(false);
      if (updated.is_complete === false && updated.missing_fields?.length) {
        setDraftWarning({ missing: updated.missing_fields });
        setSuccess(null);
      } else {
        setDraftWarning(null);
        setSuccess('Perfil atualizado com sucesso');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  }

  const activeServices = (currentProfile?.services ?? []).filter(
    (s) => s.visibility_status === 'active',
  );

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
        Perfil Profissional
      </h2>

      {/* Availability prompt after activation */}
      {showAvailabilityPrompt && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-blue-800 mb-1">Configure sua disponibilidade</p>
          <p className="text-xs text-blue-600 mb-2">
            Para aparecer nas buscas dos clientes, configure os dias e horários em que você atende.
          </p>
          <button
            onClick={() => { setShowAvailabilityPrompt(false); router.push('/perfil/disponibilidade'); }}
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Configurar Disponibilidade →
          </button>
          <button
            onClick={() => setShowAvailabilityPrompt(false)}
            className="ml-2 text-xs text-blue-400 hover:text-blue-600"
          >
            Depois
          </button>
        </div>
      )}

      {/* No-availability warning */}
      {isProfessional && hasAvailability === false && !showAvailabilityPrompt && (
        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">warning</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700">Sem disponibilidade configurada</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Você não aparece nas buscas enquanto não configurar sua disponibilidade.
            </p>
            <button
              onClick={() => router.push('/perfil/disponibilidade')}
              className="mt-1.5 text-xs font-semibold text-amber-700 underline"
            >
              Configurar agora
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {isProfessional ? (
          <div className="px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-xl text-green-500 mt-0.5">
                verified
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-700">
                    Perfil Profissional Ativo
                  </p>
                  {currentProfile?.visibility_status === 'draft' ? (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Rascunho
                    </span>
                  ) : currentProfile?.visibility_status === 'inactive' ? (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Inativo
                    </span>
                  ) : currentProfile ? (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  ) : null}
                </div>
                {currentProfile && !editing && (
                  <div className="mt-1 space-y-0.5">
                    {activeServices.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeServices.map((s) => (
                          <span
                            key={s.service_id}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-trust bg-trust/5 border border-trust/20 px-2 py-0.5 rounded-full"
                          >
                            <span className="material-symbols-outlined text-[12px]">{s.service_icon}</span>
                            {s.service_name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Nenhuma especialidade ativa</p>
                    )}
                    {currentProfile.bio && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {currentProfile.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-shrink-0 text-xs font-medium text-trust border border-trust/30 rounded-lg px-3 py-1.5 hover:bg-trust/5 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {draftWarning && draftWarning.missing.length > 0 && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  ⚠️ Seu perfil está salvo como rascunho
                </p>
                <p className="text-xs text-amber-600">
                  Para aparecer na listagem, preencha:{' '}
                  <span className="font-medium">
                    {draftWarning.missing.map((f) => {
                      if (f === 'bio') return 'Descrição (mín. 10 caracteres)';
                      if (f === 'services') return 'Especialidade';
                      if (f === 'full_name') return 'Nome completo';
                      return f;
                    }).join(', ')}
                  </span>
                </p>
              </div>
            )}

            {success && (
              <p className="mt-3 text-xs text-green-600">{success}</p>
            )}
            {error && (
              <p className="mt-3 text-xs text-red-600">{error}</p>
            )}

            {editing && (
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3 border-t border-slate-50 pt-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium">
                    Especialidades <span className="text-slate-300">(selecione uma ou mais)</span>
                  </label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {services.map((svc) => {
                      const checked = editServiceIds.has(svc.id);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => toggleService(svc.id, editServiceIds, setEditServiceIds)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center relative ${
                            checked
                              ? 'border-trust bg-trust/5 ring-1 ring-trust/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {checked && (
                            <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[14px] text-trust">
                              check_circle
                            </span>
                          )}
                          <span className="material-symbols-outlined text-xl text-trust">
                            {svc.icon_name}
                          </span>
                          <span className="text-xs font-medium text-slate-700 leading-tight">
                            {svc.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {editServiceIds.size === 0 && (
                    <p className="mt-1.5 text-xs text-amber-600">
                      Sem especialidades selecionadas — seu perfil ficará oculto das buscas.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium">
                    Bio <span className="text-slate-300">(opcional)</span>
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Descreva sua experiência..."
                    rows={3}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-trust/30 focus:border-trust resize-none"
                    maxLength={500}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                      if (currentProfile) {
                        setEditBio(currentProfile.bio ?? '');
                        const activeIds = new Set(
                          (currentProfile.services ?? [])
                            .filter((s) => s.visibility_status === 'active')
                            .map((s) => s.service_id),
                        );
                        setEditServiceIds(activeIds);
                      }
                    }}
                    className="flex-1 text-sm text-slate-500 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-trust text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 transition-opacity"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}

            {!editing && (
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="mt-4 w-full text-xs text-slate-400 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processando...' : 'Desativar perfil profissional'}
              </button>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left"
            >
              <span className="material-symbols-outlined text-xl text-trust">
                construction
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">
                  Tornar-se Profissional
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ofereça seus serviços na plataforma
                </p>
              </div>
              <span
                className={`material-symbols-outlined text-base text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
              >
                expand_more
              </span>
            </button>

            {open && (
              <form onSubmit={handleActivate} className="px-4 pb-4 border-t border-slate-50">
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 font-medium">
                      Especialidades <span className="text-red-400">*</span>{' '}
                      <span className="text-slate-300">(selecione uma ou mais)</span>
                    </label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {services.map((svc) => {
                        const checked = selectedServiceIds.has(svc.id);
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => toggleService(svc.id, selectedServiceIds, setSelectedServiceIds)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center relative ${
                              checked
                                ? 'border-trust bg-trust/5 ring-1 ring-trust/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            {checked && (
                              <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[14px] text-trust">
                                check_circle
                              </span>
                            )}
                            <span className="material-symbols-outlined text-xl text-trust">
                              {svc.icon_name}
                            </span>
                            <span className="text-xs font-medium text-slate-700 leading-tight">
                              {svc.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {services.length === 0 && (
                      <p className="mt-2 text-xs text-slate-400">Carregando especialidades...</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium">
                      Bio <span className="text-slate-300">(opcional)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Descreva sua experiência..."
                      rows={3}
                      className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-trust/30 focus:border-trust resize-none"
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium">
                      Cidade <span className="text-slate-300">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                      className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-trust/30 focus:border-trust"
                      maxLength={100}
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-trust text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity"
                  >
                    {loading ? 'Ativando...' : 'Ativar Perfil Profissional'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

