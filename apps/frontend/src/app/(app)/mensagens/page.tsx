// Mensagens — lista de conversas do usuário
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default async function MensagensPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Try to find user profile to list conversations
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  let conversations: any[] = [];
  if (profile) {
    const { data } = await supabase
      .from('conversations')
      .select('*, profiles!conversations_professional_id_fkey(full_name, avatar_url)')
      .or(`client_id.eq.${profile.id},professional_id.eq.${profile.id}`)
      .order('last_message_at', { ascending: false });
    conversations = data ?? [];
  }

  return (
    <div className="pb-24 bg-[#f8f6f6] min-h-screen">
      <div className="px-4 pt-10 pb-4 bg-white">
        <h1 className="text-lg font-bold text-slate-900">Mensagens</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">chat_bubble</span>
          <p className="text-sm font-semibold text-slate-500">Nenhuma conversa ainda</p>
          <p className="text-xs text-slate-400 mt-1">
            Quando você entrar em contato com um profissional, a conversa aparecerá aqui.
          </p>
          <Link href="/" className="mt-6 text-xs font-semibold text-[#ec5b13] bg-orange-50 px-4 py-2 rounded-full">
            Encontrar profissional
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-4 flex flex-col gap-2">
          {conversations.map((conv: any) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl text-slate-300">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {conv.profiles?.full_name ?? 'Conversa'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(conv.last_message_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
