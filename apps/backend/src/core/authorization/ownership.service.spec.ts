import { OwnershipService } from './ownership.service';

describe('OwnershipService', () => {
  let svc: OwnershipService;

  beforeEach(() => {
    svc = new OwnershipService();
  });

  // ── canReadVisit ──────────────────────────────────────────────────────────

  describe('canReadVisit', () => {
    const visit = {
      client_id: 'client-1',
      professionals: { profile_id: 'pro-profile-1' },
    };

    it('returns true when profile is the client', () => {
      expect(svc.canReadVisit('client-1', visit)).toBe(true);
    });

    it('returns true when profile is the professional', () => {
      expect(svc.canReadVisit('pro-profile-1', visit)).toBe(true);
    });

    it('returns false for a stranger', () => {
      expect(svc.canReadVisit('stranger', visit)).toBe(false);
    });

    it('returns false when professionals is null', () => {
      expect(
        svc.canReadVisit('stranger', {
          client_id: 'client-1',
          professionals: null,
        }),
      ).toBe(false);
    });
  });

  // ── canReadWork ───────────────────────────────────────────────────────────

  describe('canReadWork', () => {
    const work = {
      client_id: 'client-1',
      professionals: { profiles: { id: 'pro-profile-1' } },
    };

    it('returns true when profile is the client', () => {
      expect(svc.canReadWork('client-1', work)).toBe(true);
    });

    it('returns true when profile is the professional', () => {
      expect(svc.canReadWork('pro-profile-1', work)).toBe(true);
    });

    it('returns false for a stranger', () => {
      expect(svc.canReadWork('stranger', work)).toBe(false);
    });

    it('returns false when professionals is null', () => {
      expect(
        svc.canReadWork('stranger', {
          client_id: 'client-1',
          professionals: null,
        }),
      ).toBe(false);
    });
  });

  // ── canReadMaterialList ───────────────────────────────────────────────────

  describe('canReadMaterialList', () => {
    it('returns true for the owning professional', () => {
      expect(
        svc.canReadMaterialList('pro-1', { professional_id: 'pro-1' }),
      ).toBe(true);
    });

    it('returns false for anyone else', () => {
      expect(
        svc.canReadMaterialList('other', { professional_id: 'pro-1' }),
      ).toBe(false);
    });
  });
});
