import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { AgendaClient } from './AgendaClient';
import type { VisitFull, UserRole } from '@obrafacil/shared';
import { ACTING_AS_COOKIE } from '@/lib/acting-as';

export default async function AgendaPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const cookieStore = await cookies();
  const actingAs = (cookieStore.get(ACTING_AS_COOKIE)?.value ?? 'client') as UserRole;

  if (actingAs !== 'professional') {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-slate-500">
          Agenda disponível apenas para profissionais
        </p>
      </div>
    );
  }

  const visits = await api.get<VisitFull[]>('/v1/visits').catch(() => []);

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Agenda" />
      <AgendaClient visits={visits} actingAs={actingAs} />
    </div>
  );
}
