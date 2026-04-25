// INT-01 — Home / Dashboard (Visão Cliente)
// spec_ui.md: "Flat Design, extremamente limpa, carrossel de Profissionais super bem avaliados"
// prd.md RFN-01: profissionais ordenados por rating_avg desc
// Web: Desktop expands to bento 3-col grid; mobile preserves original layout.
import { auth, currentUser } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { SearchBar } from '@/components/ui/SearchBar';
import { StarRating } from '@/components/ui/StarRating';
import { FAB } from '@/components/ui/FAB';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

const QUICK_SERVICES = [
  { icon: 'electrical_services', label: 'Reparos elétricos',       color: 'bg-amber-50 text-amber-600',  desktopColor: 'from-amber-50 to-amber-100/60' },
  { icon: 'water_drop',          label: 'Instalações Hidráulicas',  color: 'bg-blue-50 text-blue-600',    desktopColor: 'from-blue-50 to-blue-100/60'   },
  { icon: 'format_paint',        label: 'Pinturas',                 color: 'bg-green-50 text-green-600',  desktopColor: 'from-green-50 to-green-100/60' },
  { icon: 'cleaning_services',   label: 'Diaristas',               color: 'bg-purple-50 text-purple-600', desktopColor: 'from-purple-50 to-purple-100/60'},
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
    <div className="pb-24 md:pb-8 bg-[#f8f6f6] min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          MOBILE header (hidden on desktop — TopBar takes over)
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden px-4 pb-4 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-slate-400 font-medium">Bem-vindo,</p>
            <h1 className="text-xl font-bold text-slate-800">{firstName}</h1>
          </div>
        </div>
        <div className="mt-3">
          <SearchBar />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP welcome banner (hidden on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block px-8 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-on-surface">
          Bom dia, {firstName} 👋
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          O que você precisa hoje?
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SERVICES SECTION
          Mobile:   2-col grid (existing layout)
          Desktop:  4-col bento cards with gradient bg
          ═══════════════════════════════════════════════════════════ */}
      <div className="px-4 md:px-8 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Serviços</h2>
          <Link href="/busca" className="text-xs font-semibold text-[#ec5b13]">
            Ver todos →
          </Link>
        </div>

        {/* Mobile: 2-col */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {QUICK_SERVICES.map(({ icon, label, color }) => (
            <Link
              key={label}
              href={`/busca?service=${encodeURIComponent(label)}`}
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </div>
              <span className="text-sm font-medium text-slate-800 leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* Desktop: 4-col bento */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {QUICK_SERVICES.map(({ icon, label, color, desktopColor }) => (
            <Link
              key={label}
              href={`/busca?service=${encodeURIComponent(label)}`}
              className={`relative flex flex-col gap-4 bg-gradient-to-br ${desktopColor} rounded-2xl p-5 border border-white/80 shadow-[0px_4px_16px_rgba(0,40,142,0.06)] hover:scale-[0.98] hover:shadow-md transition-all duration-200 group`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">Ver profissionais →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PROFESSIONALS SECTION
          Mobile:   vertical list (existing)
          Desktop:  3-col grid with richer cards
          ═══════════════════════════════════════════════════════════ */}
      <div className="mt-6 px-4 md:px-8">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Profissionais de elite</h2>
          <p className="text-xs text-slate-400 mt-0.5">Super bem avaliados perto de você</p>
        </div>

        {(!professionals || professionals.length === 0) && (
          <p className="text-sm text-slate-400 py-4">Nenhum profissional encontrado.</p>
        )}

        {/* Mobile: vertical list */}
        <div className="flex flex-col gap-3 md:hidden">
          {(professionals ?? []).map((pro) => {
            const p = pro as any;
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    avatarId={p.profiles?.avatar_id}
                    src={p.profiles?.avatar_url}
                    name={p.profiles?.full_name ?? 'Profissional'}
                    size="lg"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.profiles?.full_name ?? 'Profissional'}</p>
                    <p className="text-xs text-slate-400 truncate">{p.specialty ?? 'Especialista'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating rating={p.rating_avg ?? 0} size="sm" count={p.total_reviews ?? 0} />
                    </div>
                  </div>
                </div>
                <Link href={`/profissional/${p.id}`} className="mt-3 block text-center text-sm font-semibold text-[#ec5b13] py-2 rounded-xl border border-[#ec5b13]/20 bg-orange-50 active:scale-[0.98] transition-transform">
                  Ver Perfil
                </Link>
              </div>
            );
          })}
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 xl:grid-cols-4 gap-4">
          {(professionals ?? []).map((pro) => {
            const p = pro as any;
            return (
              <Link
                key={p.id}
                href={`/profissional/${p.id}`}
                className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0px_4px_16px_rgba(0,40,142,0.04)] hover:shadow-[0px_8px_24px_rgba(0,40,142,0.1)] hover:scale-[0.99] transition-all duration-200 overflow-hidden"
              >
                {/* Avatar hero */}
                <div className="h-40 bg-gradient-to-br from-primary/5 to-primary-container/10 flex items-center justify-center">
                  <Avatar
                    avatarId={p.profiles?.avatar_id}
                    src={p.profiles?.avatar_url}
                    name={p.profiles?.full_name ?? 'Profissional'}
                    size="xl"
                    className="ring-4 ring-white shadow-lg"
                  />
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="font-bold text-on-surface truncate">{p.profiles?.full_name ?? 'Profissional'}</p>
                  <p className="text-sm text-on-surface-variant truncate mt-0.5">{p.specialty ?? 'Especialista'}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <StarRating rating={p.rating_avg ?? 0} size="sm" count={p.total_reviews ?? 0} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">{p.jobs_completed ?? 0} trabalhos</span>
                    {p.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-xs filled">verified</span>
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          EMERGENCY BANNER
          ═══════════════════════════════════════════════════════════ */}
      <div className="px-4 md:px-8 mt-6">
        <Link
          href="/perfil/ajuda"
          className="bg-brand rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] hover:scale-[0.99] transition-transform"
          aria-label="Atendimento de Emergencia"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-white">emergency</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Atendimento de Emergência</p>
            <p className="text-xs text-white/80 mt-0.5 leading-tight">
              Canal direto para urgências elétricas e hidráulicas.
            </p>
          </div>
          <span className="material-symbols-outlined text-white text-xl flex-shrink-0">chevron_right</span>
        </Link>
      </div>

      {/* FAB — mobile only (desktop has TopBar actions) */}
      <div className="md:hidden">
        <FAB
          icon="support_agent"
          variant="brand"
          ariaLabel="Suporte ou emergencia"
          href="/perfil/ajuda"
          className="fixed bottom-24 right-4 shadow-lg"
        />
      </div>
    </div>
  );
}


