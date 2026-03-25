// INT-01 — Home / Dashboard (Visão Cliente)
// spec_ui.md: "Flat Design, extremamente limpa, carrossel de Profissionais super bem avaliados"
// prd.md RFN-01: profissionais ordenados por rating_avg desc
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { SearchBar } from '@/components/ui/SearchBar';
import { StarRating } from '@/components/ui/StarRating';
import { FAB } from '@/components/ui/FAB';
import Link from 'next/link';
import type { ProfessionalWithProfile } from '@obrafacil/shared';

const QUICK_SERVICES = [
  { icon: 'electrical_services', label: 'Elétrica', color: 'bg-amber-50 text-amber-600' },
  { icon: 'water_drop', label: 'Hidráulica', color: 'bg-blue-50 text-blue-600' },
  { icon: 'format_paint', label: 'Pintura', color: 'bg-green-50 text-green-600' },
  { icon: 'cleaning_services', label: 'Diarista', color: 'bg-purple-50 text-purple-600' },
  { icon: 'handyman', label: 'Maridos', color: 'bg-orange-50 text-orange-600' },
  { icon: 'roofing', label: 'Telhado', color: 'bg-red-50 text-red-600' },
  { icon: 'flooring', label: 'Piso', color: 'bg-teal-50 text-teal-600' },
  { icon: 'more_horiz', label: 'Ver todos', color: 'bg-slate-100 text-slate-600' },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [user, professionals] = await Promise.all([
    currentUser(),
    api.get<ProfessionalWithProfile[]>('/v1/professionals?limit=10').catch(() => []),
  ]);

  const firstName = user?.firstName ?? 'você';

  return (
    <div className="pb-4">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-4 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-slate-400 font-medium">Bom dia,</p>
            <h1 className="text-xl font-bold text-slate-900">{firstName} 👋</h1>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined text-slate-500 text-2xl">notifications</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand rounded-full" />
          </div>
        </div>

        {/* Search bar — spec_ui.md INT-01 */}
        <div className="mt-3">
          <SearchBar />
        </div>
      </div>

      {/* ── Quick service grid ──────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Serviços</h2>
          <Link href="/busca" className="text-xs font-medium text-trust">
            Ver todos os serviços
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_SERVICES.map(({ icon, label, color }) => (
            <Link
              key={label}
              href={`/busca?service=${encodeURIComponent(label)}`}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Professional cards carousel ─────────────────────────────── */}
      {/* prd.md: "profissionais super bem avaliados perto de você" — social proof */}
      <div className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Bem avaliados perto de você
          </h2>
          <Link href="/busca" className="text-xs font-medium text-trust">
            Ver todos
          </Link>
        </div>

        {/* Horizontal scroll carousel — spec_ui.md: "carrossel de Cards" */}
        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
          {professionals.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Nenhum profissional encontrado.</p>
          )}
          {professionals.map((pro: ProfessionalWithProfile) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = pro as any;
            return (
              <Link
                key={p.id}
                href={`/profissional/${p.id}`}
                className="flex-shrink-0 w-44 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform"
              >
                {/* Photo */}
                <div className="h-28 bg-slate-100 relative">
                  {p.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.profiles.avatar_url}
                      alt={p.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                  )}
                  {p.is_verified && (
                    <span className="absolute top-2 right-2 bg-trust text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      ✓ Verificado
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {p.profiles?.full_name ?? 'Profissional'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={p.rating_avg ?? 0} size="sm" />
                    <span className="text-[10px] text-slate-400">({p.total_reviews ?? 0})</span>
                  </div>
                  <p className="mt-1.5 text-[10px] font-semibold text-trust bg-blue-50 rounded-full px-2 py-0.5 inline-block">
                    A partir de R${p.hourly_rate ?? '80'}/h
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Recent works section (social proof) ───────────────────── */}
      <div className="mt-6 px-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Obras recentes concluídas</h2>
        <div className="bg-gradient-to-r from-trust to-blue-700 rounded-2xl p-5 text-white">
          <p className="text-xs font-medium opacity-80">Esta semana na plataforma</p>
          <p className="text-3xl font-bold mt-1">1.247</p>
          <p className="text-xs opacity-80 mt-0.5">serviços concluídos com ⭐ 4.8+</p>
          <Link
            href="/busca"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold bg-white/20 rounded-full px-3 py-1.5"
          >
            Encontrar profissional
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* ── FAB — support / emergency (spec_ui.md) ────────────────── */}
      <FAB
        icon="support_agent"
        variant="brand"
        ariaLabel="Suporte ou emergência"
        className="fixed bottom-24 right-4 shadow-lg"
      />
    </div>
  );
}
