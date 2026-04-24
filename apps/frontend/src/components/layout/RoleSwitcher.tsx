'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ACTING_AS_HEADER, DEV_USER_ID_HEADER } from '@obrafacil/shared';
import { getActingAs } from '@/lib/acting-as';
import { isAuthBypassEnabled, BYPASS_USER_CLERK_ID } from '@/lib/auth-bypass-config';
import type { AccountContext, UserRole } from '@obrafacil/shared';
import { useRole } from '@/contexts/RoleContext';

const API_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api')
    : '';

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Cliente',
  professional: 'Profissional',
  store: 'Loja',
};

const ROLE_ICONS: Record<UserRole, string> = {
  client: 'person',
  professional: 'construction',
  store: 'storefront',
};

async function fetchAccountMe(): Promise<AccountContext | null> {
  try {
    const actingAs = getActingAs();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (actingAs) headers[ACTING_AS_HEADER] = actingAs;
    if (isAuthBypassEnabled) headers[DEV_USER_ID_HEADER] = BYPASS_USER_CLERK_ID;
    const res = await fetch(`${API_URL}/v1/account/me`, {
      headers,
      cache: 'no-store',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const envelope = (await res.json()) as { data: AccountContext };
    return envelope.data;
  } catch {
    return null;
  }
}

export function RoleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const { actingAs, setRole } = useRole();

  useEffect(() => {
    fetchAccountMe().then((account) => {
      if (!account) return;
      setRoles(account.roles);
    });
  }, []);

  if (roles.length <= 1) return null;

  function switchRole(role: UserRole) {
    if (role === actingAs) return;
    setRole(role);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      className="flex items-center gap-1 bg-surface-container-low rounded-xl px-1 py-1"
      aria-label="Alternar papel"
    >
      {roles.map((role) => {
        const isActive = role === actingAs;
        return (
          <button
            key={role}
            onClick={() => switchRole(role)}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-brand text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
            aria-pressed={isActive}
            title={`Atuar como ${ROLE_LABELS[role]}`}
          >
            <span className="material-symbols-outlined text-sm leading-none">
              {ROLE_ICONS[role]}
            </span>
            {ROLE_LABELS[role]}
          </button>
        );
      })}
    </div>
  );
}
