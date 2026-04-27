"use strict";
/**
 * Centralised status helpers shared between frontend and backend.
 *
 * Rule: a review is only valid when the work was actually completed AND
 * the originating visit was NOT cancelled / rejected.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeStatus = normalizeStatus;
exports.isCompletedStatus = isCompletedStatus;
exports.isCancelledStatus = isCancelledStatus;
exports.isRejectedStatus = isRejectedStatus;
exports.isCancelledOrRejectedStatus = isCancelledOrRejectedStatus;
exports.canShowPendingReview = canShowPendingReview;
exports.canShowSubmittedReview = canShowSubmittedReview;
/** Normalise a status string so comparisons are accent- and case-insensitive. */
function normalizeStatus(status) {
    return (status
        ?.toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') ?? '');
}
/**
 * Returns true only for statuses that represent a successfully completed service.
 */
function isCompletedStatus(status) {
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
function isCancelledStatus(status) {
    return [
        'cancelled',
        'canceled',
        'cancelada',
        'cancelado',
    ].includes(normalizeStatus(status));
}
/** Returns true for statuses that indicate the visit was rejected. */
function isRejectedStatus(status) {
    return ['rejected', 'recusada', 'recusado'].includes(normalizeStatus(status));
}
/** Returns true for statuses that indicate the service was cancelled or rejected. */
function isCancelledOrRejectedStatus(status) {
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
function canShowPendingReview(params) {
    const { workStatus, visitStatus, existingReview, isClientOwner } = params;
    return (isClientOwner &&
        isCompletedStatus(workStatus) &&
        !isCancelledOrRejectedStatus(visitStatus) &&
        !existingReview);
}
/** Returns true when the already-submitted review should be shown. */
function canShowSubmittedReview(params) {
    return params.isClientOwner && Boolean(params.existingReview);
}
