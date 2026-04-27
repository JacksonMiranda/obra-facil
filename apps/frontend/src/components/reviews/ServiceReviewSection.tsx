// Server component — renders the correct review UI based on work state and viewer role.
// Because ReviewForm is a Client Component, this wrapper must NOT be 'use client'.
import { ReviewForm } from './ReviewForm';
import type { ReviewWithReviewer } from '@obrafacil/shared';

interface Props {
  workId: string;
  professionalName: string;
  isClient: boolean;
  isCompleted: boolean;
  existingReview: ReviewWithReviewer | null;
}

export function ServiceReviewSection({
  workId,
  professionalName,
  isClient,
  isCompleted,
  existingReview,
}: Props) {
  if (!isCompleted) return null;

  // ── Client view ──────────────────────────────────────────────────────────
  if (isClient) {
    return (
      <>
        {/* Callout shown only before review is submitted */}
        {!existingReview && (
          <div className="bg-savings/5 border border-savings/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-savings text-xl mt-0.5">task_alt</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Obra concluída!</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  O profissional finalizou o serviço. Avalie o atendimento para encerrar sua experiência.
                </p>
              </div>
            </div>
          </div>
        )}

        <ReviewForm
          workId={workId}
          professionalName={professionalName}
          existingReview={existingReview}
        />
      </>
    );
  }

  // ── Professional view — awaiting review ──────────────────────────────────
  if (!existingReview) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-xl">schedule</span>
          <div>
            <p className="text-sm font-semibold text-slate-700">Aguardando avaliação</p>
            <p className="text-xs text-slate-400 mt-0.5">
              O cliente ainda não avaliou este serviço.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Professional view — review received ──────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-savings text-xl">star</span>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Avaliação recebida
        </p>
      </div>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className="text-2xl"
            style={{ color: star <= existingReview.rating ? '#f59e0b' : '#d1d5db' }}
          >
            {star <= existingReview.rating ? '★' : '☆'}
          </span>
        ))}
      </div>
      {existingReview.comment && (
        <p className="text-sm text-slate-600 italic leading-relaxed">
          &ldquo;{existingReview.comment}&rdquo;
        </p>
      )}
    </div>
  );
}
