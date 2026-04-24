export const VISIT_STATUS_MAP: Record<
  string,
  { label: string; variant: 'agendado' | 'entregue' | 'cancelado' | 'pendente' }
> = {
  pending:   { label: 'Pendente',    variant: 'pendente' },
  confirmed: { label: 'Confirmada',  variant: 'agendado' },
  completed: { label: 'Concluída',   variant: 'entregue' },
  cancelled: { label: 'Cancelada',   variant: 'cancelado' },
  rejected:  { label: 'Recusada',    variant: 'cancelado' },
};
