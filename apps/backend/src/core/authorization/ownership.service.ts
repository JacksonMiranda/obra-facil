import { Injectable } from '@nestjs/common';

/**
 * Pure logic service — no DB access.
 * Validates whether a profile owns a given resource.
 * All methods return boolean; callers decide whether to throw.
 *
 * "Return 404 (not 403) for unauthorized access to avoid leaking existence."
 */
@Injectable()
export class OwnershipService {
  /** Visit is readable if the profile is the client OR the assigned professional. */
  canReadVisit(
    profileId: string,
    visit: {
      client_id: string;
      professionals?: { profile_id?: string } | null;
    },
  ): boolean {
    if (visit.client_id === profileId) return true;
    if (visit.professionals?.profile_id === profileId) return true;
    return false;
  }

  /**
   * Work is readable if the profile is the client owner OR the assigned professional.
   * professionals.profiles.id is the profile UUID of the professional.
   */
  canReadWork(
    profileId: string,
    work: {
      client_id: string;
      professionals?: { profiles?: { id?: string } | null } | null;
    },
  ): boolean {
    if (work.client_id === profileId) return true;
    if (work.professionals?.profiles?.id === profileId) return true;
    return false;
  }

  /**
   * Material list is readable only by the owning professional.
   * Clients access it indirectly via the conversation (handled by MessagesModule).
   */
  canReadMaterialList(
    profileId: string,
    list: { professional_id: string },
  ): boolean {
    return list.professional_id === profileId;
  }
}
