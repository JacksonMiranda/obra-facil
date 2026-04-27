/**
 * Centralised status helpers shared between frontend and backend.
 *
 * Rule: a review is only valid when the work was actually completed AND
 * the originating visit was NOT cancelled / rejected.
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

/** Returns true for statuses that indicate the service was cancelled. */
export function isCancelledStatus(status?: string | null): boolean {
  return [
    'cancelled',
    'canceled',
    'cancelada',
    'cancelado',
  ].includes(normalizeStatus(status));
}

/** Returns true for statuses that indicate the visit was rejected. */
export function isRejectedStatus(status?: string | null): boolean {
  return ['rejected', 'recusada', 'recusado'].includes(normalizeStatus(status));
}

/** Returns true for statuses that indicate the service was cancelled or rejected. */
export function isCancelledOrRejectedStatus(status?: string | null): boolean {
  return isCancelledStatus(status) || isRejectedStatus(status);
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
