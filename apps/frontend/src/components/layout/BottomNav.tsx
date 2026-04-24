'use client';

// BottomNav — tabs condicionais por papel (actingAs)
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';

const CLIENT_TABS = [
  { href: '/',             label: 'Início',       icon: 'home'       },
  { href: '/solicitacoes', label: 'Solicitações', icon: 'assignment' },
  { href: '/perfil',       label: 'Perfil',       icon: 'person'     },
];

const PROFESSIONAL_TABS = [
  { href: '/',              label: 'Início',  icon: 'home'           },
  { href: '/agenda',        label: 'Agenda',  icon: 'calendar_month' },
  { href: '/meus-servicos', label: 'Serviços', icon: 'build'          },
  { href: '/perfil',        label: 'Perfil',  icon: 'person'         },
];

export function BottomNav() {
  const { actingAs } = useRole();
  const pathname = usePathname();
  const tabs = actingAs === 'professional' ? PROFESSIONAL_TABS : CLIENT_TABS;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="mobile-container mx-auto">
        <ul className="flex h-16">
          {tabs.map((tab) => {
            const isActive =
              tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
                    isActive
                      ? 'text-[#ec5b13]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`material-symbols-outlined text-2xl leading-none ${isActive ? 'filled' : ''}`}
                    aria-hidden="true"
                  >
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
