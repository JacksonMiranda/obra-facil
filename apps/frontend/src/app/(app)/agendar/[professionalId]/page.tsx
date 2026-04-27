import { notFound, redirect } from 'next/navigation';
import { auth, currentUser } from '@/lib/auth-bypass';
import { api } from '@/lib/api/client';

interface AccountMe {
  profile: { full_name: string };
}
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { AgendarClient } from './AgendarClient';

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ professionalId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { professionalId } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pro = await api.get<any>(`/v1/professionals/${professionalId}`).catch(() => null);
  if (!pro) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pro as any;
  const name = p.profiles?.full_name ?? 'Profissional';

  // Fetch the current user's professional profile to prevent self-booking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myPro = await api.get<any>('/v1/professionals/me').catch(() => null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserProfessionalId: string | null = (myPro as any)?.id ?? null;

  // Fetch client name for auto-fill in booking form
  const [account, clerkUser] = await Promise.all([
    api.get<AccountMe>('/v1/account/me').catch(() => null),
    currentUser(),
  ]);
  const clientName = account?.profile.full_name ?? clerkUser?.firstName ?? 'Cliente';

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Agendar Visita" />

      {/* Professional info summary */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
          <Avatar
            avatarId={p.profiles?.avatar_id}
            src={p.profiles?.avatar_url}
            name={name}
            size="sm"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{p.specialty}</p>
        </div>
      </div>

      <AgendarClient
        professionalId={professionalId}
        professionalName={name}
        clientName={clientName}
        currentUserProfessionalId={currentUserProfessionalId}
        professionalSpecialty={p.specialty}
      />
    </div>
  );
}
