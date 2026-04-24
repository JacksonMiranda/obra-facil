'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/StickyBottomCTA';
import { isAuthBypassEnabled, BYPASS_USER_CLERK_ID } from '@/lib/auth-bypass-config';
import { DEV_USER_ID_HEADER, ACTING_AS_HEADER } from '@obrafacil/shared';
import { getActingAs } from '@/lib/acting-as';

interface VisitaActionsProps {
  visitId: string;
  status: string;
  userRole: string;
}

export function VisitaActions({ visitId, status, userRole }: VisitaActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

  const buildHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (isAuthBypassEnabled) headers[DEV_USER_ID_HEADER] = BYPASS_USER_CLERK_ID;
    const actingAs = getActingAs();
    if (actingAs) headers[ACTING_AS_HEADER] = actingAs;
    return headers;
  };

  const handleAction = async (action: 'cancel' | 'complete' | 'accept' | 'reject') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/v1/visits/${visitId}/${action}`, {
        method: 'PATCH',
        headers: buildHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? 'Erro ao atualizar visita');
        return;
      }
      router.refresh();
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'pending' && userRole === 'professional') {
    return (
      <div className="flex flex-col gap-2 mt-6">
        <div className="flex gap-3">
          <PrimaryButton
            variant="trust"
            onClick={() => handleAction('accept')}
            loading={loading}
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
            Aceitar Visita
          </PrimaryButton>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="flex-1 h-12 rounded-xl border-2 border-error text-error font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Recusar
          </button>
        </div>
        {error && <p className="text-xs text-error text-center font-medium">{error}</p>}
      </div>
    );
  }

  if (status === 'pending' && userRole === 'client') {
    return (
      <div className="flex flex-col gap-2 mt-6">
        <button
          onClick={() => handleAction('cancel')}
          disabled={loading}
          className="w-full h-12 rounded-xl border-2 border-error text-error font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">cancel</span>
          Cancelar Solicitação
        </button>
        {error && <p className="text-xs text-error text-center font-medium">{error}</p>}
      </div>
    );
  }

  if (status !== 'confirmed') return null;

  return (
    <div className="flex flex-col gap-2 mt-6">
      {userRole === 'professional' && (
        <PrimaryButton
          variant="savings"
          onClick={() => handleAction('complete')}
          loading={loading}
        >
          <span className="material-symbols-outlined text-xl">check_circle</span>
          Marcar como Concluída
        </PrimaryButton>
      )}

      <button
        onClick={() => handleAction('cancel')}
        disabled={loading}
        className="w-full h-12 rounded-xl border-2 border-error text-error font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">cancel</span>
        Cancelar Visita
      </button>

      {error && <p className="text-xs text-error text-center font-medium">{error}</p>}
    </div>
  );
}

