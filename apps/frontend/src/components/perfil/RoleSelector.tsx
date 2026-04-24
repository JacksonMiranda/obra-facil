'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { isAuthBypassEnabled, BYPASS_USER_CLERK_ID } from '@/lib/auth-bypass-config';
import { DEV_USER_ID_HEADER, ACTING_AS_HEADER } from '@obrafacil/shared';
import { setActingAs as persistActingAs } from '@/lib/acting-as';
import type { UserRole } from '@obrafacil/shared';

const ROLE_META: Record<UserRole, { label: string; icon: string; description: string }> = {
  client: {
    label: 'Cliente',
    icon: 'home_repair_service',
    description: 'Contratar profissionais e acompanhar serviços',
  },
  professional: {
    label: 'Profissional',
    icon: 'construction',
    description: 'Receber solicitações e gerenciar sua agenda',
  },
  store: {
    label: 'Loja',
    icon: 'storefront',
    description: 'Gerenciar catálogo e pedidos de materiais',
  },
};

interface RoleSelectorProps {
  currentRole: UserRole;
  availableRoles: UserRole[];
}

export function RoleSelector({ currentRole, availableRoles }: RoleSelectorProps) {
  const router = useRouter();
  const { setRole } = useRole();
  const [loading, setLoading] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (availableRoles.length <= 1) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

  const handleSelect = async (role: UserRole) => {
    if (role === currentRole || loading) return;
    setLoading(role);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAuthBypassEnabled) headers[DEV_USER_ID_HEADER] = BYPASS_USER_CLERK_ID;
      headers[ACTING_AS_HEADER] = currentRole;

      const res = await fetch(`${apiUrl}/v1/account/acting-as`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? 'Erro ao alterar perfil');
        return;
      }

      persistActingAs(role);
      setRole(role);
      router.refresh();
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
        Tipo de Perfil
      </h2>

      <div className="space-y-2">
        {availableRoles.map((role) => {
          const meta = ROLE_META[role];
          const isActive = role === currentRole;
          const isLoading = loading === role;

          return (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              disabled={!!loading}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-orange-50 border-[#ec5b13] text-[#ec5b13]'
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300'
              } disabled:opacity-60`}
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  isActive ? 'text-[#ec5b13] filled' : 'text-slate-400'
                }`}
              >
                {isLoading ? 'sync' : meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isActive ? 'text-[#ec5b13]' : 'text-slate-800'}`}>
                  {meta.label}
                </p>
                <p className="text-xs text-slate-400 truncate">{meta.description}</p>
              </div>
              {isActive && (
                <span className="material-symbols-outlined text-base text-[#ec5b13]">check_circle</span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
