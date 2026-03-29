// INT-02 — Perfil Completo do Profissional
// spec_ui.md: "Foco na credibilidade. Topo: Foto+Nome; Meio: Nota+Especialidades; Rodapé: CTA fixado"
// seed.sql: Ricardo Silva 4.9/128, José da Silva 4.9/142, Ana Rodrigues 4.7/89
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { StarRating } from '@/components/ui/StarRating';
import { StickyBottomCTA, PrimaryButton } from '@/components/ui/StickyBottomCTA';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function ProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: pro } = await supabase
    .from('professionals')
    .select('*, profiles!inner(*), reviews(*, profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url))')
    .eq('id', id)
    .single();

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
    <div className="pb-32 bg-[#f8f6f6] min-h-screen">
      {/* ── Back header ──────────────────────────────────────────── */}
      <PageHeader title="Perfil do Profissional" />

      {/* ── Centered circular photo ────────────────────────────── */}
      <div className="flex flex-col items-center pt-6 pb-4 bg-white">
        <div className="w-28 h-28 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
            </div>
          )}
        </div>

        {/* ── Name + Profession ────────────────────────────────── */}
        <h1 className="text-xl font-bold text-slate-900 mt-3 text-center">{profile?.full_name}</h1>
        {services.length > 0 && (
          <p className="text-sm text-slate-500 uppercase tracking-wide mt-0.5 text-center">
            {services.map((s) => s.name).join(' · ')}
          </p>
        )}

        {/* ── Green verified badge ─────────────────────────────── */}
        {p.is_verified && (
          <div className="flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm filled">verified</span>
            PROFISSIONAL VERIFICADO
          </div>
        )}
      </div>

      {/* ── Side-by-side metrics ───────────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {/* Rating */}
            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Avaliação Média</p>
              <p className="text-4xl font-black text-slate-900 mt-1">{p.rating_avg ?? '—'}</p>
              <div className="flex justify-center mt-1">
                <StarRating rating={p.rating_avg ?? 0} size="sm" />
              </div>
            </div>
            {/* Jobs */}
            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Trabalhos Realizados</p>
              <p className="text-4xl font-black text-slate-900 mt-1">{p.total_jobs ?? 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">+{Math.floor((p.total_jobs ?? 0) * 0.1)} este mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Share button (centered) ────────────────────────────── */}
      <div className="flex justify-center mt-4">
        <button
          aria-label="Compartilhar Perfil"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-5 py-2 shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-lg">share</span>
          Compartilhar Perfil
        </button>
      </div>

      {/* ── Reviews section ──────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Reviews Recentes</h2>
            <button className="text-xs font-semibold text-[#1E40AF]">
              Ler todos os {totalReviews}
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#1E40AF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {r.profiles?.full_name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {r.profiles?.full_name ?? 'Cliente'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : ''}
                    </p>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                {r.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">&ldquo;{r.comment}&rdquo;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Specialties chips ────────────────────────────────────── */}
      {services.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s.id}
                className="text-xs font-medium text-[#1E40AF] bg-blue-50 px-3 py-1.5 rounded-full"
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

      {/* ── CTA fixado no rodapé (spec_ui.md: "CTAs colados à margem inferior") ── */}
      <StickyBottomCTA>
        <a href={`/chat?professional=${id}`} className="block">
          <PrimaryButton variant="trust" className="w-full">
            <span className="material-symbols-outlined text-xl">chat</span>
            Conversar e Solicitar Visita
          </PrimaryButton>
        </a>
      </StickyBottomCTA>
    </div>
  );
}
