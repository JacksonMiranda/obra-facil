'use client';
// INT-03 — Chat UI (Client Component)
// Uses polling every 3s for live messages (replaces Supabase Realtime)
// spec_ui.md: "similar ao WhatsApp, Zero Curva de Aprendizado"

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type?: string;
  metadata?: unknown;
  created_at: string;
  profiles?: Profile;
};

interface ChatViewProps {
  conversationId: string;
  myProfileId: string;
  myRole: string;
  otherProfile: Profile;
  initialMessages: Message[];
}

export function ChatView({
  conversationId,
  myProfileId,
  myRole,
  otherProfile,
  initialMessages,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Polling for new messages every 3 seconds
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const poll = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/v1/conversations/${conversationId}/messages`,
          { cache: 'no-store' },
        );
        if (!res.ok) return;
        const envelope = (await res.json()) as { data: Message[] };
        const fetched = envelope.data ?? [];
        setMessages((prev) => {
          // Merge: keep optimistic messages, add new server messages
          const serverIds = new Set(fetched.map((m) => m.id));
          const optimistics = prev.filter(
            (m) => m.id.startsWith('optimistic-') && !serverIds.has(m.id),
          );
          return [...fetched, ...optimistics];
        });
      } catch {
        // ignore poll errors silently
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setInputValue('');

    // Optimistic update
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: myProfileId,
      content,
      type: 'text',
      metadata: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const res = await fetch(`${apiUrl}/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        // Rollback optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInputValue(content);
      }
    } finally {
      setSending(false);
    }
  }, [inputValue, sending, conversationId, myProfileId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0ece8]">
      {/* ── Chat Header ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-safe pb-3 pt-10 bg-trust text-white sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center -ml-1"
          aria-label="Voltar"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold">
          {otherProfile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherProfile.avatar_url} alt={otherProfile.full_name} className="w-full h-full object-cover" />
          ) : (
            otherProfile.full_name?.[0] ?? '?'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{otherProfile.full_name}</p>
          <p className="text-[10px] opacity-70">
            {otherProfile.role === 'professional' ? 'Profissional' : 'Cliente'}
          </p>
        </div>
        <button aria-label="Ver perfil" className="w-8 h-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">info</span>
        </button>
      </div>

      {/* ── Message list ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">chat_bubble</span>
            <p className="text-xs text-slate-400">Inicie a conversa!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === myProfileId;
          const isOptimistic = msg.id.startsWith('optimistic-');
          return (
            <div
              key={msg.id}
              className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isMine
                    ? 'bg-trust text-white rounded-tr-sm'
                    : 'bg-white text-slate-900 rounded-tl-sm'
                } ${isOptimistic ? 'opacity-70' : ''}`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isMine && (
                    <span className="ml-1 material-symbols-outlined text-[10px]">
                      {isOptimistic ? 'schedule' : 'done_all'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Professional FAB: Criar Lista de Materiais ────────────── */}
      {/* spec_ui.md INT-03: "Botão de Ação Flutuante (Visão Profissional)" */}
      {myRole === 'professional' && (
        <button
          onClick={() => router.push(`/cotacao/nova?conversation=${conversationId}`)}
          className="absolute right-4 bottom-24 w-12 h-12 bg-savings rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Criar e Enviar Lista de Materiais"
        >
          <span className="material-symbols-outlined text-white text-xl">format_list_bulleted_add</span>
        </button>
      )}

      {/* ── Input bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-3 py-3 pb-safe flex items-end gap-2">
        {/* Foto */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 flex-shrink-0"
          aria-label="Enviar Foto"
        >
          <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
        </button>

        {/* Text area — dynamic height */}
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Mensagem"
          className="flex-1 resize-none rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-trust/30 max-h-28 leading-5"
          style={{ height: 'auto', overflowY: inputValue.split('\n').length > 4 ? 'scroll' : 'hidden' }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = 'auto';
            t.style.height = `${t.scrollHeight}px`;
          }}
        />

        {/* Áudio / Send toggle */}
        {inputValue.trim() ? (
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-trust text-white flex-shrink-0 disabled:opacity-60 active:scale-95 transition-transform"
            aria-label="Enviar"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        ) : (
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 flex-shrink-0"
            aria-label="Enviar Áudio"
          >
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
        )}
      </div>
    </div>
  );
}
