/**
 * Client-side helpers for the "acting as" role cookie.
 * The cookie value is read by lib/api/client.ts and injected as X-Acting-As header.
 */

import type { UserRole } from '@obrafacil/shared';

export const ACTING_AS_COOKIE = 'obrafacil_acting_as';

const VALID_ROLES: UserRole[] = ['client', 'professional', 'store'];

/** Returns the currently selected role from the cookie, or null. */
export function getActingAs(): UserRole | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ACTING_AS_COOKIE}=`));
  if (!match) return null;
  const value = match.split('=')[1] as UserRole;
  return VALID_ROLES.includes(value) ? value : null;
}

/** Persists the selected role in a session cookie (no expiry = session only). */
export function setActingAs(role: UserRole): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACTING_AS_COOKIE}=${role}; path=/; SameSite=Lax`;
}

/** Clears the acting-as cookie (reverts to primary role on next request). */
export function clearActingAs(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACTING_AS_COOKIE}=; path=/; max-age=0`;
}
