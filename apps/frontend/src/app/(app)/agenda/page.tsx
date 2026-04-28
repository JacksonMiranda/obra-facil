import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { AgendaClient } from './AgendaClient';
import type { VisitFull } from '@obrafacil/shared';
import { getAccount } from '@/lib/get-account';
import { isProfessionalMode } from '@/lib/professional-access';

export default async function AgendaPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // getAccount() is deduplicated via React.cache() — the same AccountContext
  // fetched by layout.tsx is reused here with no extra HTTP request.
  const account = await getAccount();

  if (!isProfessionalMode(account)) {
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
      <AgendaClient visits={visits} actingAs={account!.actingAs} />
    </div>
  );
}
