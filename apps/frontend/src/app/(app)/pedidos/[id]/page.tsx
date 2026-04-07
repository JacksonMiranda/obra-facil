import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth-bypass';
import { api } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';

const STATUS_MAP: Record<string, { label: string; variant: 'a-caminho' | 'entregue' | 'ativo' | 'agendado' | 'pendente' | 'cancelado' }> = {
  pending: { label: 'Pendente', variant: 'pendente' },
  confirmed: { label: 'Confirmado', variant: 'ativo' },
  shipped: { label: 'A Caminho', variant: 'a-caminho' },
  delivered: { label: 'Entregue', variant: 'entregue' },
  cancelled: { label: 'Cancelado', variant: 'cancelado' },
};

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order: any = await api.get(`/v1/orders/${id}`).catch(() => null);
  if (!order) notFound();

  const status = STATUS_MAP[order.status] ?? { label: order.status, variant: 'pendente' as const };
  const isShipped = order.status === 'shipped';

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title={`Pedido #${order.order_number ?? id.slice(0, 6)}`} />

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Status card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</p>
            <StatusBadge variant={status.variant} label={status.label} />
          </div>
          {isShipped && (
            <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-xl p-3">
              <span className="material-symbols-outlined text-trust text-lg">local_shipping</span>
              <p className="text-xs text-slate-700">Seu pedido esta a caminho! Previsao de entrega em breve.</p>
            </div>
          )}
        </div>

        {/* Store info */}
        {order.stores && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Loja</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-lg text-slate-400">store</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{order.stores.name}</p>
                {order.stores.delivery_time && (
                  <p className="text-[10px] text-slate-400">Entrega em {order.stores.delivery_time}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        {order.items_description && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Itens do Pedido</p>
            <p className="text-sm text-slate-600 leading-relaxed">{order.items_description}</p>
          </div>
        )}

        {/* Total and dates */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Resumo</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">
                R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Data do pedido</p>
              <p className="text-xs font-semibold text-slate-900">
                {new Date(order.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/pedidos"
            className="block w-full text-center text-sm font-bold text-white bg-trust py-3 rounded-xl active:scale-[0.98] transition-transform"
          >
            Voltar aos Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
