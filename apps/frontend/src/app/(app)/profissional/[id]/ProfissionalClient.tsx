'use client';

import { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';

export function ShareButton({ name, url }: { name: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = { title: `${name} - Obra Facil`, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Compartilhar Perfil"
      className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-5 py-2 shadow-sm active:scale-[0.98] transition-transform"
    >
      <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'share'}</span>
      {copied ? 'Link copiado!' : 'Compartilhar Perfil'}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReviewsSection({ reviews, totalReviews }: { reviews: any[]; totalReviews: number }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) return null;

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-900">Reviews Recentes</h2>
        {totalReviews > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-trust"
          >
            {showAll ? 'Ver menos' : `Ler todos os ${totalReviews}`}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {displayed.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-trust flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {r.profiles?.full_name?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{r.profiles?.full_name ?? 'Cliente'}</p>
                <p className="text-[10px] text-slate-400">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
              <StarRating rating={r.rating} size="sm" />
            </div>
            {r.comment && (
              <p className="text-xs text-slate-600 leading-relaxed mt-1">&ldquo;{r.comment}&rdquo;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
