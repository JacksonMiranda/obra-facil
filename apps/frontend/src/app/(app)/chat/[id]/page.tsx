// INT-03 — Chat de Serviço (server wrapper + Realtime client component)
// spec_ui.md: "comportamento similar ao WhatsApp, Zero Curva de Aprendizado"
// prd.md RFN-02: histórico, fotos, áudio, aprovação de agendamento no mesmo chat
import { notFound, redirect } from 'next/navigation';
import { getAuth, getUser } from '@/lib/auth/server';
import { api } from '@/lib/api/client';
import { ChatView } from './ChatView';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await getAuth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const user = await getUser();

  const [conversation, messagesData] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get<any>(`/v1/conversations/${id}`).catch(() => null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get<any[]>(`/v1/conversations/${id}/messages?limit=50`).catch(() => []),
  ]);

  if (!conversation) notFound();

  // The API returns participant profiles joined on the conversation
  const myProfile = conversation.my_profile ?? conversation.client ?? conversation.professional;
  const otherProfile =
    conversation.client?.clerk_id === userId
      ? conversation.professional
      : conversation.client;

  // Fallback: build our own profile from Clerk if API doesn't embed it
  const resolvedMyProfile = myProfile ?? {
    id: userId,
    full_name: user?.fullName ?? 'Você',
    avatar_url: user?.imageUrl ?? null,
    role: 'client',
  };

  return (
    <ChatView
      conversationId={id}
      myProfileId={resolvedMyProfile.id}
      myRole={resolvedMyProfile.role}
      otherProfile={otherProfile ?? { id: '', full_name: 'Desconhecido', avatar_url: null, role: 'professional' }}
      initialMessages={messagesData}
    />
  );
}

