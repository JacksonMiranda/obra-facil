import { AppShell } from '@/components/layout/AppShell';
import { currentUser } from '@/lib/auth-bypass';
import { api } from '@/lib/api/client';
import type { AccountContext } from '@obrafacil/shared';

// All authenticated app routes share this layout with BottomNav (mobile) + SideNav/TopBar (desktop).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, account] = await Promise.all([
    currentUser().catch(() => null),
    api.get<AccountContext>('/v1/account/me').catch(() => null),
  ]);

  // Prefer DB profile data (profiles.full_name / profiles.avatar_url) over Clerk values.
  // Clerk imageUrl is only used as fallback when the DB has no avatar at all (no avatar_id AND no avatar_url).
  const clerkName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : undefined;
  const userName = account?.profile.full_name || clerkName || undefined;
  const avatarId = account?.profile.avatar_id ?? undefined;
  // If the user has a preset avatar (avatar_id), never fall back to Clerk's imageUrl —
  // the Avatar component resolves avatar_id to the correct preset image.
  // Only use Clerk imageUrl when neither avatar_id nor avatar_url is set in the DB.
  const dbAvatarUrl = account?.profile.avatar_url ?? undefined;
  const avatarUrl = dbAvatarUrl ?? (avatarId ? undefined : user?.imageUrl ?? undefined);

  return (
    <AppShell userName={userName} avatarId={avatarId} avatarUrl={avatarUrl}>
      {children}
    </AppShell>
  );
}
