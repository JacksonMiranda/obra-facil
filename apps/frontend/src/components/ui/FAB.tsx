'use client';

// FAB — Floating Action Button per spec_ui.md INT-01
// "Floating Action Button para suporte ou emergência"

interface FABProps {
  icon?: string;
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
  color?: 'brand' | 'trust' | 'savings';
  /** Alias for color */
  variant?: 'brand' | 'trust' | 'savings';
  className?: string;
}

const colorClasses = {
  brand:   'bg-brand text-white shadow-brand/40',
  trust:   'bg-trust text-white shadow-trust/40',
  savings: 'bg-savings text-white shadow-savings/40',
};

export function FAB({ icon = 'priority_high', onClick, color, variant, ariaLabel = 'Ação flutuante', className = '' }: FABProps) {
  const resolvedColor = variant ?? color ?? 'trust';
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${colorClasses[resolvedColor]} ${className}`}
      aria-label={ariaLabel}
    >
      <span className="material-symbols-outlined filled text-2xl">
        {icon}
      </span>
    </button>
  );
}
