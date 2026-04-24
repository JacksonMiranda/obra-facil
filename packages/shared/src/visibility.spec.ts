import { describe, it, expect } from 'vitest';
import {
  computeCompleteness,
  deriveVisibilityStatus,
  isProfessionalPubliclyVisible,
  MIN_BIO_LENGTH,
} from './visibility';

describe('computeCompleteness', () => {
  it('returns complete=true when all required fields are present', () => {
    const result = computeCompleteness({
      specialty: 'Eletricista',
      bio: 'Profissional com 10 anos de experiência em instalações residenciais.',
      full_name: 'João Silva',
    });
    expect(result.complete).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('returns missing=["specialty"] when specialty is empty', () => {
    const result = computeCompleteness({
      specialty: '',
      bio: 'Profissional experiente',
      full_name: 'João Silva',
    });
    expect(result.complete).toBe(false);
    expect(result.missing).toContain('specialty');
  });

  it('returns missing=["specialty"] when specialty is null', () => {
    const result = computeCompleteness({
      specialty: null,
      bio: 'Profissional experiente',
      full_name: 'João Silva',
    });
    expect(result.missing).toContain('specialty');
  });

  it('returns missing=["bio"] when bio is shorter than MIN_BIO_LENGTH', () => {
    const shortBio = 'a'.repeat(MIN_BIO_LENGTH - 1);
    const result = computeCompleteness({
      specialty: 'Eletricista',
      bio: shortBio,
      full_name: 'João Silva',
    });
    expect(result.complete).toBe(false);
    expect(result.missing).toContain('bio');
  });

  it('returns missing=["bio"] when bio is null', () => {
    const result = computeCompleteness({
      specialty: 'Eletricista',
      bio: null,
      full_name: 'João Silva',
    });
    expect(result.missing).toContain('bio');
  });

  it('accepts bio exactly at MIN_BIO_LENGTH', () => {
    const bio = 'a'.repeat(MIN_BIO_LENGTH);
    const result = computeCompleteness({
      specialty: 'Eletricista',
      bio,
      full_name: 'João Silva',
    });
    expect(result.complete).toBe(true);
    expect(result.missing).not.toContain('bio');
  });

  it('returns missing=["full_name"] when full_name is empty', () => {
    const result = computeCompleteness({
      specialty: 'Eletricista',
      bio: 'Profissional experiente',
      full_name: '',
    });
    expect(result.missing).toContain('full_name');
  });

  it('returns multiple missing fields when several are invalid', () => {
    const result = computeCompleteness({
      specialty: null,
      bio: null,
      full_name: null,
    });
    expect(result.complete).toBe(false);
    expect(result.missing).toContain('specialty');
    expect(result.missing).toContain('bio');
    expect(result.missing).toContain('full_name');
  });
});

describe('deriveVisibilityStatus', () => {
  it('returns "active" when complete and not deactivating', () => {
    const status = deriveVisibilityStatus({ complete: true, missing: [] });
    expect(status).toBe('active');
  });

  it('returns "draft" when incomplete and not deactivating', () => {
    const status = deriveVisibilityStatus({ complete: false, missing: ['bio'] });
    expect(status).toBe('draft');
  });

  it('returns "inactive" when deactivating regardless of completeness', () => {
    expect(deriveVisibilityStatus({ complete: true, missing: [] }, { deactivating: true })).toBe('inactive');
    expect(deriveVisibilityStatus({ complete: false, missing: ['bio'] }, { deactivating: true })).toBe('inactive');
  });
});

describe('isProfessionalPubliclyVisible', () => {
  const completeActive = {
    visibility_status: 'active' as const,
    specialty: 'Eletricista',
    bio: 'Profissional com 10 anos de experiência',
    full_name: 'João Silva',
    roleIsActive: true,
  };

  it('returns true when all conditions are met', () => {
    expect(isProfessionalPubliclyVisible(completeActive)).toBe(true);
  });

  it('returns false when roleIsActive is false', () => {
    expect(isProfessionalPubliclyVisible({ ...completeActive, roleIsActive: false })).toBe(false);
  });

  it('returns false when visibility_status is draft', () => {
    expect(isProfessionalPubliclyVisible({ ...completeActive, visibility_status: 'draft' })).toBe(false);
  });

  it('returns false when visibility_status is inactive', () => {
    expect(isProfessionalPubliclyVisible({ ...completeActive, visibility_status: 'inactive' })).toBe(false);
  });

  it('returns false when bio is too short', () => {
    expect(isProfessionalPubliclyVisible({ ...completeActive, bio: 'curta' })).toBe(false);
  });

  it('returns false when specialty is empty', () => {
    expect(isProfessionalPubliclyVisible({ ...completeActive, specialty: '' })).toBe(false);
  });

  it('returns false when full_name is empty', () => {
    expect(isProfessionalPubliclyVisible({ ...completeActive, full_name: '' })).toBe(false);
  });
});
