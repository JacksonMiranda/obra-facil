'use client';

// TopBar — Desktop-only sticky header (md+)
// Shows SearchBar + notifications + user avatar.
// Design: Stitch home_obra_direta_web — ml-64, h-14, bg-white, shadow subtle.
// Hidden on mobile (mobile header inside each page takes over).

import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface TopBarProps {
  /** Display name of the authenticated user (passed from server component) */
  userName?: string;
  /** Avatar URL (optional) */
  avatarUrl?: string;
}

export function TopBar({ userName, avatarUrl }: TopBarProps) {
  const initials = userName
    ? userName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="hidden md:flex fixed top-0 left-64 right-0 z-20 h-14 items-center gap-4 bg-surface-container-lowest border-b border-outline-variant/15 px-6 shadow-[0_2px_16px_rgba(0,40,142,0.04)]">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <SearchBar placeholder="Encontre um encanador, pedreiro..." />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notifications */}
        <NotificationBell />

        {/* User avatar */}
        <Link
          href="/perfil"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-container-low transition-colors"
          aria-label="Meu perfil"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName ?? 'Avatar'}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">{initials}</span>
            </div>
          )}
          {userName && (
            <span className="text-sm font-medium text-on-surface hidden lg:inline">
              {userName}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
