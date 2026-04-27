/**
 * Centralised status helpers shared between frontend and backend.
 *
 * Rule: a review is only valid when the work was actually completed AND
 * the originating visit was NOT cancelled / rejected.
 */
/** Normalise a status string so comparisons are accent- and case-insensitive. */
export declare function normalizeStatus(status?: string | null): string;
/**
 * Returns true only for statuses that represent a successfully completed service.
 */
export declare function isCompletedStatus(status?: string | null): boolean;
/** Returns true for statuses that indicate the service was cancelled. */
export declare function isCancelledStatus(status?: string | null): boolean;
/** Returns true for statuses that indicate the visit was rejected. */
export declare function isRejectedStatus(status?: string | null): boolean;
/** Returns true for statuses that indicate the service was cancelled or rejected. */
export declare function isCancelledOrRejectedStatus(status?: string | null): boolean;
/**
 * Returns true when "Avaliação pendente" badge / form should be displayed.
 *
 * Conditions (ALL must be true):
 * - The viewer is the client who owns the service
 * - The WORK status is completed
 * - The originating VISIT status is NOT cancelled / rejected
 * - No review has been submitted yet
 */
export declare function canShowPendingReview(params: {
    workStatus?: string | null;
    visitStatus?: string | null;
    existingReview?: unknown | null;
    isClientOwner: boolean;
}): boolean;
/** Returns true when the already-submitted review should be shown. */
export declare function canShowSubmittedReview(params: {
    existingReview?: unknown | null;
    isClientOwner: boolean;
}): boolean;
