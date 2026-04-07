'use client';

// BottomNav — per spec_ui.md navigation flow
// 5 tabs: Início, Pedidos, Obras, Mensagens, Perfil
// Active tab: primary color (brand orange), inactive: slate

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/',           label: 'Início',    icon: 'home'              },
  { href: '/pedidos',    label: 'Pedidos',   icon: 'receipt_long'      },
  { href: '/obras',      label: 'Obras',     icon: 'construction'      },
  { href: '/mensagens',  label: 'Mensagens', icon: 'chat_bubble'       },
  { href: '/perfil',     label: 'Perfil',    icon: 'person'            },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on full-screen chat pages to avoid overlapping the input
  if (pathname.startsWith('/chat/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
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
