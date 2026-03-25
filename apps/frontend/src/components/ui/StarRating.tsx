// StarRating — per spec_ui.md INT-02 "Nota Média Gigante (4.9/5)"
// Renders filled/half/empty stars with score number

interface StarRatingProps {
  rating: number;          // 0–5
  count?: number;          // number of reviews shown in parens
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
};

export function StarRating({
  rating,
  count,
  size = 'md',
  showNumber = true,
  className = '',
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half = !filled && i < rating;
    return filled ? 'filled' : half ? 'half' : 'empty';
  });

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`flex gap-0.5 ${sizeClasses[size]}`}>
        {stars.map((s, i) => (
          <span key={i} style={{ color: '#f59e0b' }}>
            {s === 'filled' ? '★' : s === 'half' ? '⯨' : '☆'}
          </span>
        ))}
      </span>
      {showNumber && (
        <span className={`font-semibold text-slate-800 ${sizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-slate-400 text-sm">({count})</span>
      )}
    </span>
  );
}
