// Card — base card component per spec_ui.md Flat Design principle

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
};

export function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-slate-100 shadow-sm
        ${paddingClasses[padding]}
        ${isClickable ? 'cursor-pointer active:scale-[0.99] transition-transform hover:shadow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
