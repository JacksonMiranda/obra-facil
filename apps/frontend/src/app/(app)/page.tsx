// INT-01 — Home / Dashboard (Visão Cliente)
// spec_ui.md: "Flat Design, extremamente limpa, carrossel de Profissionais super bem avaliados"
// prd.md RFN-01: profissionais ordenados por rating_avg desc
import { auth, currentUser } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { SearchBar } from '@/components/ui/SearchBar';
import { StarRating } from '@/components/ui/StarRating';
import { FAB } from '@/components/ui/FAB';
import Link from 'next/link';

const QUICK_SERVICES = [
  { icon: 'electrical_services', label: 'Reparos elétricos', color: 'bg-amber-50 text-amber-600' },
  { icon: 'water_drop', label: 'Instalações Hidráulicas', color: 'bg-blue-50 text-blue-600' },
  { icon: 'format_paint', label: 'Pinturas', color: 'bg-green-50 text-green-600' },
  { icon: 'cleaning_services', label: 'Diaristas', color: 'bg-purple-50 text-purple-600' },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [user, profResult] = await Promise.all([
    currentUser(),
    api.get<{ professionals: any[]; total: number }>('/v1/professionals').catch(() => ({ professionals: [] as any[], total: 0 })),
  ]);
  const professionals = profResult.professionals;

  const firstName = user?.firstName ?? 'você';

  return (
    <div className="pb-24 bg-[#f8f6f6] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-4 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-slate-400 font-medium">Bem-vindo, {firstName}</p>
            <h1 className="text-2xl font-bold text-[#ec5b13]">Obra Fácil</h1>
          </div>
          <Link href="/perfil/notificacoes" className="relative" aria-label="Notificacoes">
            <span className="material-symbols-outlined text-slate-500 text-2xl">notifications</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand rounded-full" />
          </Link>
        </div>

        {/* Search bar — spec_ui.md INT-01 */}
        <div className="mt-3">
          <SearchBar />
        </div>
      </div>

      {/* ── Quick service grid (2x2 cards) ───────────────────────── */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Serviços</h2>
          <Link href="/busca" className="text-xs font-semibold text-[#ec5b13]">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_SERVICES.map(({ icon, label, color }) => (
            <Link
              key={label}
              href={`/busca?service=${encodeURIComponent(label)}`}
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </div>
              <span className="text-sm font-medium text-slate-800 leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Professional cards — "Profissionais de elite" ──────────── */}
      {/* prd.md: "profissionais super bem avaliados perto de você" — social proof */}
      <div className="mt-6">
        <div className="px-4 mb-1">
          <h2 className="text-base font-bold text-slate-900">
            Profissionais de elite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Super bem avaliados perto de você
          </p>
        </div>

        <div className="px-4 mt-3 flex flex-col gap-3">
          {(!professionals || professionals.length === 0) && (
            <p className="text-sm text-slate-400 py-4">Nenhum profissional encontrado.</p>
          )}
          {(professionals ?? []).map((pro) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = pro as any;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                    {p.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profiles.avatar_url}
                        alt={p.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-slate-300">person</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {p.profiles?.full_name ?? 'Profissional'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {p.specialty ?? 'Especialista'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating rating={p.rating_avg ?? 0} size="sm" />
                      <span className="text-xs font-bold text-slate-700">{p.rating_avg ?? 0}</span>
                      <span className="text-[10px] text-slate-400">({p.total_reviews ?? 0})</span>
                    </div>
                  </div>
                </div>
                {/* Ver Perfil button */}
                <Link
                  href={`/profissional/${p.id}`}
                  className="mt-3 block text-center text-sm font-semibold text-[#ec5b13] py-2 rounded-xl border border-[#ec5b13]/20 bg-orange-50 active:scale-[0.98] transition-transform"
                >
                  Ver Perfil
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Emergency banner (orange) ─────────────────────────────── */}
      <div className="px-4 mt-6">
        <Link
          href="/perfil/ajuda"
          className="bg-brand rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
          aria-label="Atendimento de Emergencia"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-white">emergency</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Atendimento de Emergencia</p>
            <p className="text-xs text-white/80 mt-0.5 leading-tight">
              Canal direto para urgencias eletricas e hidraulicas.
            </p>
          </div>
          <span className="material-symbols-outlined text-white text-xl flex-shrink-0">chevron_right</span>
        </Link>
      </div>

      {/* ── FAB — support / emergency (spec_ui.md) ────────────────── */}
      <FAB
        icon="support_agent"
        variant="brand"
        ariaLabel="Suporte ou emergencia"
        href="/perfil/ajuda"
        className="fixed bottom-24 right-4 shadow-lg"
      />
    </div>
  );
}
