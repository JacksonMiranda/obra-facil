'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthBypassEnabled, BYPASS_USER_CLERK_ID } from '@/lib/auth-bypass-config';
import { DEV_USER_ID_HEADER, ACTING_AS_HEADER } from '@obrafacil/shared';
import { getActingAs } from '@/lib/acting-as';

interface OportunidadeActionsProps {
  visitId: string;
}

export function OportunidadeActions({ visitId }: OportunidadeActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

  const handleAction = async (action: 'accept' | 'reject') => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAuthBypassEnabled) headers[DEV_USER_ID_HEADER] = BYPASS_USER_CLERK_ID;
      const actingAs = getActingAs();
      if (actingAs) headers[ACTING_AS_HEADER] = actingAs;

      const res = await fetch(`${apiUrl}/v1/visits/${visitId}/${action}`, {
        method: 'PATCH',
        headers,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? 'Erro ao atualizar solicitação');
        return;
      }
      router.refresh();
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {error && <p className="text-[10px] text-error font-medium text-center">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => handleAction('accept')}
          disabled={loading}
          className="flex-1 h-9 rounded-lg bg-trust text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Aceitar
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="flex-1 h-9 rounded-lg border border-error text-error text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">cancel</span>
          Recusar
        </button>
      </div>
    </div>
  );
}
