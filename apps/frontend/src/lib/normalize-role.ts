/**
 * Normalises the `actingAs` value from the backend against the user's active
 * roles list, providing a single, safe source of truth for the current menu
 * mode.
 *
 * Rules (in priority order):
 *  1. If `actingAs` is present AND is in `roles`, trust it.
 *  2. Otherwise, prefer 'client' if available in `roles`.
 *  3. Otherwise, fall back to the first active role.
 *  4. Hard default: 'client'.
 *
 * This function is intentionally pure so it can be used in both Server
 * Components (layout.tsx) and unit tests.
 */

import type { UserRole } from '@obrafacil/shared';

export function normalizeActingAs(
  actingAs: UserRole | undefined,
  roles: UserRole[] | undefined,
): UserRole {
  const effectiveRoles = roles?.length ? roles : (['client'] as UserRole[]);

  // 1. Backend value is valid — use it directly.
  if (actingAs && effectiveRoles.includes(actingAs)) {
    return actingAs;
  }

  // 2. Prefer 'client' as safe default when the value is missing or invalid.
  if (effectiveRoles.includes('client')) {
    return 'client';
  }

  // 3. Fall back to whatever role the user actually has active.
  return effectiveRoles[0] ?? 'client';
}
