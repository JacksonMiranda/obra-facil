'use client';
// INT-03 — Criar Lista de Materiais (Visão Profissional)
// Acessado via FAB no chat: /cotacao/nova?conversation=<id>
// Cria uma nova lista de materiais para a conversa e redireciona para cotação.

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function NovaCotacaoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('conversation');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!conversationId) return;
    // Auto-create on mount
    setStatus('loading');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    fetch(`${apiUrl}/v1/material-lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `Erro ${res.status}`);
        }
        return res.json();
      })
      .then((list: { data?: { id: string }; id?: string }) => {
        const id = list?.data?.id ?? list?.id;
        if (id) {
          router.replace(`/cotacao/${id}`);
        } else {
          setErrorMsg('Resposta inválida do servidor');
          setStatus('error');
        }
      })
      .catch((err: Error) => {
        setErrorMsg(err.message ?? 'Erro ao criar lista');
        setStatus('error');
      });
  }, [conversationId, router]);

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-[#f8f6f6]">
        <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">
          format_list_bulleted
        </span>
        <p className="text-sm font-semibold text-slate-500">Parâmetro de conversa ausente</p>
        <button
          onClick={() => router.back()}
          className="mt-6 text-xs font-semibold text-trust bg-blue-50 px-4 py-2 rounded-full"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-[#f8f6f6]">
        <span className="material-symbols-outlined text-5xl text-error mb-3">
          error_outline
        </span>
        <p className="text-sm font-semibold text-slate-700">Não foi possível criar a lista</p>
        <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 text-xs font-semibold text-trust bg-blue-50 px-4 py-2 rounded-full"
        >
          Voltar ao chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-[#f8f6f6]">
      <div className="w-12 h-12 border-4 border-trust border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-700">Criando lista de materiais...</p>
    </div>
  );
}

export default function NovaCotacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f8f6f6]">
          <div className="w-12 h-12 border-4 border-trust border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NovaCotacaoContent />
    </Suspense>
  );
}
