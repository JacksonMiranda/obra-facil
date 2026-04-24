/**
 * Professional eligibility — single source of truth.
 *
 * These functions mirror the SQL predicate in the `professionals_public` view
 * (docker/05-professional-visibility.sql). Any change here must also be
 * reflected in that view and vice-versa.
 *
 * Rule:
 *  1. account_roles(role='professional', is_active=true) must exist  →
 *     caller must pass `roleIsActive: true`
 *  2. professionals.visibility_status === 'active'
 *  3. specialty is non-empty
 *  4. bio is non-empty (≥ MIN_BIO_LENGTH chars after trim)
 *  5. full_name (from profiles) is non-empty
 */

import type { ProfessionalCompletenessResult, ProfessionalVisibilityStatus } from './types';

/** Minimum bio length required for a professional to be publicly listed. */
export const MIN_BIO_LENGTH = 10;

export interface CompletenessInput {
  specialty?: string | null;
  bio?: string | null;
  full_name?: string | null;
}

/**
 * Checks which fields are missing for the professional profile to be
 * eligible for public listing.  Does NOT check account_roles (that is an
 * infrastructure concern handled by the guard/service layer).
 */
export function computeCompleteness(p: CompletenessInput): ProfessionalCompletenessResult {
  const missing: string[] = [];

  if (!p.specialty || p.specialty.trim() === '') {
    missing.push('specialty');
  }
  if (!p.bio || p.bio.trim().length < MIN_BIO_LENGTH) {
    missing.push('bio');
  }
  if (!p.full_name || p.full_name.trim() === '') {
    missing.push('full_name');
  }

  return { complete: missing.length === 0, missing };
}

/**
 * Derives the visibility_status that should be persisted based on completeness
 * and the requested target status.
 *
 * - If the user is deactivating → always 'inactive'
 * - If the profile is complete   → 'active'
 * - Otherwise                    → 'draft'
 */
export function deriveVisibilityStatus(
  completeness: ProfessionalCompletenessResult,
  options: { deactivating?: boolean } = {},
): ProfessionalVisibilityStatus {
  if (options.deactivating) return 'inactive';
  return completeness.complete ? 'active' : 'draft';
}

/**
 * Returns true if a professional profile should appear in public listings.
 * Use this for in-process validation (e.g. before a DB write or in tests).
 *
 * For DB reads, the `professionals_public` view already applies these filters.
 */
export function isProfessionalPubliclyVisible(p: {
  visibility_status: ProfessionalVisibilityStatus;
  specialty?: string | null;
  bio?: string | null;
  full_name?: string | null;
  roleIsActive?: boolean;
}): boolean {
  if (p.roleIsActive === false) return false;
  if (p.visibility_status !== 'active') return false;
  const { complete } = computeCompleteness(p);
  return complete;
}
