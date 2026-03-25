// StickyBottomCTA — per spec_ui.md: "CTAs colados à margem inferior visando ergonomia Mobile"
// All primary CTAs in the app use this component

interface StickyBottomCTAProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyBottomCTA({ children, className = '' }: StickyBottomCTAProps) {
  return (
    <div className={`sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'trust' | 'brand' | 'savings';
  icon?: string;
  className?: string;
}

const variantClasses = {
  trust:   'bg-trust hover:bg-blue-800 text-white',
  brand:   'bg-brand hover:bg-orange-600 text-white',
  savings: 'bg-savings hover:bg-emerald-600 text-white',
};

export function PrimaryButton({
  children, onClick, type = 'button', disabled, loading, variant = 'trust', icon, className = ''
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full h-14 rounded-xl flex items-center justify-center gap-2
        font-semibold text-base transition-all
        active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="material-symbols-outlined filled text-xl">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
