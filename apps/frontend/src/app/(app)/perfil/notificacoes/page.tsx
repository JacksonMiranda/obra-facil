import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Notification } from '@obrafacil/shared';
import { NotificationsListClient } from './NotificationsListClient';
import { isAuthBypassEnabled, BYPASS_USER_CLERK_ID } from '@/lib/auth-bypass-config';
import { DEV_USER_ID_HEADER } from '@obrafacil/shared';

const API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default async function NotificacoesPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');

  let notifications: Notification[] = [];
  try {
    const token = await getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (isAuthBypassEnabled) headers[DEV_USER_ID_HEADER] = BYPASS_USER_CLERK_ID;
    const res = await fetch(`${API_URL}/v1/notifications`, { headers, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json() as { data: Notification[] };
      notifications = json.data;
    }
  } catch {
    // render empty state
  }

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Notificações" />
      <NotificationsListClient initialNotifications={notifications} />
    </div>
  );
}

