'use client';

// SideNav — Desktop-only fixed sidebar (md+)
// Tabs condicionais por papel (actingAs).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';

const CLIENT_TABS = [
  { href: '/',             label: 'Início',       icon: 'home'       },
  { href: '/solicitacoes', label: 'Solicitações', icon: 'assignment' },
  { href: '/perfil',       label: 'Perfil',       icon: 'person'     },
];

const PROFESSIONAL_TABS = [
  { href: '/',              label: 'Início',       icon: 'home'           },
  { href: '/agenda',        label: 'Agenda',        icon: 'calendar_month' },
  { href: '/meus-servicos', label: 'Meus Serviços', icon: 'build'          },
  { href: '/perfil',        label: 'Perfil',        icon: 'person'         },
];

export function SideNav() {
  const { actingAs } = useRole();
  const pathname = usePathname();
  const tabs = actingAs === 'professional' ? PROFESSIONAL_TABS : CLIENT_TABS;

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-surface-container-lowest border-r border-outline-variant/20 shadow-[2px_0_16px_rgba(0,40,142,0.04)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/15">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-xl filled">construction</span>
        </div>
        <div>
          <p className="text-base font-bold text-on-surface leading-none">Obra Fácil</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            {actingAs === 'professional' ? 'Modo Profissional' : 'Profissionais de confiança'}
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl leading-none flex-shrink-0 ${
                  isActive ? 'filled text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                }`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              <span className="text-sm">{tab.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="px-4 pb-6">
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <p className="text-xs font-semibold text-primary mb-1">Precisa de ajuda?</p>
          <p className="text-[11px] text-on-surface-variant leading-snug">
            Acesse nosso suporte ou consulte a central de ajuda.
          </p>
          <Link
            href="/perfil/ajuda"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-base">help_outline</span>
            Central de Ajuda
          </Link>
        </div>
      </div>
    </aside>
  );
}
