/**
 * Centralised helpers for determining review eligibility.
 *
 * Rule: a review is only valid when the service/work was actually completed.
 * Cancelled, rejected, pending, confirmed and in-progress statuses must
 * NEVER trigger the review UI.
 */

/** Normalise a status string so comparisons are accent- and case-insensitive. */
export function normalizeStatus(status?: string | null): string {
  return (
    status
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') ?? ''
  );
}

/**
 * Returns true only for statuses that represent a successfully completed service.
 * Both the work status AND the visit status must pass this check before review
 * UI is displayed or a review is accepted.
 */
export function isCompletedStatus(status?: string | null): boolean {
  return [
    'completed',
    'complete',
    'concluida',
    'concluido',
    'concluída',
    'concluído',
    'finished',
    'done',
    'finalizada',
    'finalizado',
  ].includes(normalizeStatus(status));
}

/** Returns true for statuses that indicate the service was cancelled or rejected. */
export function isCancelledOrRejectedStatus(status?: string | null): boolean {
  return [
    'cancelled',
    'canceled',
    'cancelada',
    'cancelado',
    'rejected',
    'recusada',
    'recusado',
  ].includes(normalizeStatus(status));
}

/**
 * Returns true when "Avaliação pendente" badge / form should be displayed.
 *
 * Conditions (ALL must be true):
 * - The viewer is the client who owns the service
 * - The WORK status is completed
 * - The originating VISIT status is NOT cancelled / rejected
 * - No review has been submitted yet
 */
export function canShowPendingReview(params: {
  workStatus?: string | null;
  visitStatus?: string | null;
  existingReview?: unknown | null;
  isClientOwner: boolean;
}): boolean {
  const { workStatus, visitStatus, existingReview, isClientOwner } = params;

  return (
    isClientOwner &&
    isCompletedStatus(workStatus) &&
    !isCancelledOrRejectedStatus(visitStatus) &&
    !existingReview
  );
}

/** Returns true when the already-submitted review should be shown. */
export function canShowSubmittedReview(params: {
  existingReview?: unknown | null;
  isClientOwner: boolean;
}): boolean {
  return params.isClientOwner && Boolean(params.existingReview);
}
