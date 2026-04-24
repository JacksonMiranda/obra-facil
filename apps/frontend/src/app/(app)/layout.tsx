import { AppShell } from '@/components/layout/AppShell';
import { currentUser } from '@/lib/auth-bypass';

// All authenticated app routes share this layout with BottomNav (mobile) + SideNav/TopBar (desktop).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser().catch(() => null);
  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : undefined;
  const avatarUrl = user?.imageUrl ?? undefined;

  return (
    <AppShell userName={userName} avatarUrl={avatarUrl}>
      {children}
    </AppShell>
  );
}
