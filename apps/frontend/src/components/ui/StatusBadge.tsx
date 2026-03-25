// StatusBadge — per Stitch prototypes color semantics
// Colors: blue=A Caminho, green=Entregue/Ativo, orange=brand, gray=Agendado

type BadgeVariant =
  | 'a-caminho'
  | 'entregue'
  | 'ativo'
  | 'agendado'
  | 'pendente'
  | 'cancelado';

const variantClasses: Record<BadgeVariant, string> = {
  'a-caminho':  'bg-trust/10 text-trust border border-trust/20',
  'entregue':   'bg-savings/10 text-savings border border-savings/20',
  'ativo':      'bg-trust/10 text-trust border border-trust/20',
  'agendado':   'bg-slate-100 text-slate-500 border border-slate-200',
  'pendente':   'bg-amber-50 text-amber-700 border border-amber-200',
  'cancelado':  'bg-error/10 text-error border border-error/20',
};

const variantLabels: Record<BadgeVariant, string> = {
  'a-caminho':  'A CAMINHO',
  'entregue':   'ENTREGUE',
  'ativo':      'Ativo',
  'agendado':   'Agendado',
  'pendente':   'Pendente',
  'cancelado':  'Cancelado',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
}
