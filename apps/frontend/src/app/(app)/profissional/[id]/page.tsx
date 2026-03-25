// INT-02 — Perfil Completo do Profissional
// spec_ui.md: "Foco na credibilidade. Topo: Foto+Nome; Meio: Nota+Especialidades; Rodapé: CTA fixado"
// seed.sql: Ricardo Silva 4.9/128, José da Silva 4.9/142, Ana Rodrigues 4.7/89
import { notFound, redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth/server';
import { api } from '@/lib/api/client';
import { StarRating } from '@/components/ui/StarRating';
import { StickyBottomCTA, PrimaryButton } from '@/components/ui/StickyBottomCTA';
import { PageHeader } from '@/components/ui/PageHeader';
import type { ProfessionalWithProfile } from '@obrafacil/shared';

export default async function ProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await getAuth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const pro = await api.get<ProfessionalWithProfile | null>(`/v1/professionals/${id}`).catch(() => null);

  if (!pro) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pro as any;
  const profile = p.profiles;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services: any[] = p.services ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: any[] = (p.reviews ?? []).slice(0, 3);
  const totalReviews = p.total_reviews ?? reviews.length;

  return (
    <div className="pb-32">
      {/* ── Back header ──────────────────────────────────────────── */}
      <PageHeader
        title=""
        transparent
        actions={
          <button
            aria-label="Compartilhar Perfil"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur"
          >
            <span className="material-symbols-outlined text-xl text-slate-700">share</span>
          </button>
        }
      />

      {/* ── Hero photo ───────────────────────────────────────────── */}
      <div className="relative h-72 bg-slate-200">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-slate-300">person</span>
          </div>
        )}
        {p.is_verified && (
          <div className="absolute bottom-3 left-4 flex items-center gap-1 bg-trust text-white text-xs font-bold px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm filled">verified</span>
            Perfil Verificado
          </div>
        )}
      </div>

      {/* ── Name + Profession ────────────────────────────────────── */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h1>
        {services.length > 0 && (
          <p className="text-sm text-slate-500 mt-0.5">
            {services.map((s) => s.name).join(' · ')}
          </p>
        )}
        {profile?.location && (
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
            <p className="text-xs text-slate-400">{profile.location}</p>
          </div>
        )}
      </div>

      {/* ── Rating block — "Nota Média Gigante" (spec_ui.md INT-02) ─ */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            {/* Big rating number */}
            <div className="text-center">
              <p className="text-5xl font-black text-slate-900">{p.rating_avg ?? '—'}</p>
              <p className="text-xs text-slate-400">/5.0</p>
            </div>
            <div className="flex-1">
              <StarRating rating={p.rating_avg ?? 0} size="lg" />
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {totalReviews} avaliações
              </p>
              <p className="text-[10px] text-slate-400">
                {p.total_jobs ?? 0} trabalhos realizados
              </p>
            </div>
          </div>
          {p.hourly_rate && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xs text-slate-400">Valor hora estimado</p>
              <p className="text-lg font-bold text-trust">
                R$ {Number(p.hourly_rate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Specialties chips ────────────────────────────────────── */}
      {services.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s.id}
                className="text-xs font-medium text-trust bg-blue-50 px-3 py-1.5 rounded-full"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Bio ──────────────────────────────────────────────────── */}
      {p.bio && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Sobre</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{p.bio}</p>
        </div>
      )}

      {/* ── Reviews section ──────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Avaliações em destaque</h2>
            <button className="text-xs font-medium text-trust">
              Ler todos os {totalReviews} comentários
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-trust flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {r.profiles?.full_name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {r.profiles?.full_name ?? 'Cliente'}
                    </p>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                </div>
                {r.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA fixado no rodapé (spec_ui.md: "CTAs colados à margem inferior") ── */}
      <StickyBottomCTA>
        <a href={`/chat?professional=${id}`} className="block">
          <PrimaryButton variant="trust" className="w-full">
            <span className="material-symbols-outlined text-xl">chat</span>
            Conversar e Solicitar Visita/Orçamento
          </PrimaryButton>
        </a>
      </StickyBottomCTA>
    </div>
  );
}
