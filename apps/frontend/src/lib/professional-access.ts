/**
 * Centralised authorisation helpers for the professional area.
 *
 * These helpers are the single source of truth for deciding whether a user
 * can access professional-only pages. They map the existing AccountContext
 * fields to the business rules:
 *
 *   - hasProfessionalRole(account)  → account has an active professional role
 *                                     (account_roles WHERE role='professional' AND is_active=true)
 *   - isProfessionalMode(account)   → has role AND is currently acting as professional
 *                                     (equivalent to: professionalProfile.isActive AND activeProfileType === 'PROFESSIONAL')
 *
 * Usage in Server Components:
 *
 *   import { getAccount }          from '@/lib/get-account';
 *   import { isProfessionalMode }  from '@/lib/professional-access';
 *
 *   const account = await getAccount();
 *   if (!isProfessionalMode(account)) {
 *     return <ProfessionalOnlyMessage />;
 *   }
 *
 * Never check the acting-as cookie or Clerk metadata for access decisions.
 * The source of truth is always /v1/account/me via getAccount().
 */

import type { AccountContext } from '@obrafacil/shared';

/**
 * Returns true when the user has an active professional role in account_roles.
 * This does NOT depend on which role the user is currently acting as.
 */
export function hasProfessionalRole(account: AccountContext | null | undefined): boolean {
  return account?.roles?.includes('professional') ?? false;
}

/**
 * Returns true when the user has an active professional role AND is currently
 * operating in professional mode (actingAs === 'professional').
 *
 * Use this to gate access to professional-only pages (Agenda, Meus Serviços).
 */
export function isProfessionalMode(account: AccountContext | null | undefined): boolean {
  return hasProfessionalRole(account) && account?.actingAs === 'professional';
}
