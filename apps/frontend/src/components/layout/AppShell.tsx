// AppShell — main layout wrapper.
// Mobile:  BottomNav (tabs, fixed bottom) + single-column content capped at 430px.
// Desktop: SideNav (fixed left 256px) + TopBar (sticky top, ml-64) + fluid content.

import { cookies } from 'next/headers';
import { BottomNav } from './BottomNav';
import { MobileTopBar } from './MobileTopBar';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';
import type { UserRole } from '@obrafacil/shared';
import { ACTING_AS_COOKIE } from '@/lib/acting-as';
import { RoleProvider } from '@/contexts/RoleContext';

const VALID_ROLES: UserRole[] = ['client', 'professional', 'store'];

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  avatarId?: string;
  avatarUrl?: string;
  actingAs?: UserRole;
}

export async function AppShell({ children, userName, avatarId, avatarUrl, actingAs: accountActingAs }: AppShellProps) {
  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get(ACTING_AS_COOKIE)?.value as UserRole | undefined;
  // Source of truth priority:
  // 1. accountActingAs — backend value already normalised against active roles in layout.tsx
  //    (only undefined when the /account/me call failed entirely)
  // 2. cookieRaw       — last known good value; used only as a fallback when backend is down
  // 3. 'client'        — safe default; any user without a known role is treated as client
  const raw = accountActingAs ?? cookieRaw;
  const actingAs: UserRole = raw && VALID_ROLES.includes(raw) ? raw : 'client';

  return (
    <RoleProvider initialRole={actingAs}>
      <div className="min-h-screen bg-surface">
        {/* ── Desktop layout (md+) ──────────────────────────────────── */}
        <SideNav />
        <TopBar userName={userName} avatarId={avatarId} avatarUrl={avatarUrl} />

        {/* ── Mobile top bar (hidden md+) ───────────────────────── */}
        <MobileTopBar />

        {/* ── Main content area ─────────────────────────────────────
            Mobile:  centered mobile-container (max-w 430px), pb-16 for BottomNav
            Desktop: ml-64 pt-14 for SideNav + TopBar, full-width, no pb-16    */}
        <div className="pt-10 md:ml-64 md:pt-14">
          <div className="mobile-container mx-auto bg-surface min-h-screen">
            <main className="pb-16 md:pb-0">
              {children}
            </main>
          </div>
        </div>

        {/* ── Mobile navigation (hidden md+) ────────────────────── */}
        <BottomNav />
      </div>
    </RoleProvider>
  );
}
