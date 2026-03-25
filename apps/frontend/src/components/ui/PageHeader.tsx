'use client';

// PageHeader — per Stitch prototypes: back button + title + optional actions

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  /** Alias to hide the back button completely (for root screens) */
  hideBack?: boolean;
  showBack?: boolean;
  /** Transparent background with absolute positioning (for hero screens) */
  transparent?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  hideBack = false,
  showBack = true,
  transparent = false,
  actions,
  className = '',
}: PageHeaderProps) {
  const router = useRouter();
  const shouldShowBack = !hideBack && showBack;

  return (
    <header
      className={`sticky top-0 z-10 border-b ${
        transparent
          ? 'bg-transparent border-transparent absolute w-full'
          : 'bg-white/80 backdrop-blur-sm border-slate-100'
      } ${className}`}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {shouldShowBack && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
            aria-label="Voltar"
          >
            <span className="material-symbols-outlined text-slate-700 text-2xl">arrow_back</span>
          </button>
        )}
        <h1 className="flex-1 text-lg font-semibold text-slate-900 truncate">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
