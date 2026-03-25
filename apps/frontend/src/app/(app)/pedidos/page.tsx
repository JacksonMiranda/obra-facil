// Meus Pedidos — order history screen
// seed.sql data: #88421 (a-caminho), #88390 (entregue)
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import type { OrderWithStore } from '@obrafacil/shared';

const STATUS_MAP: Record<string, { label: string; variant: 'a-caminho' | 'entregue' | 'ativo' | 'agendado' | 'pendente' | 'cancelado' }> = {
  pending: { label: 'Pendente', variant: 'pendente' },
  confirmed: { label: 'Confirmado', variant: 'ativo' },
  shipped: { label: 'A caminho', variant: 'a-caminho' },
  delivered: { label: 'Entregue', variant: 'entregue' },
  cancelled: { label: 'Cancelado', variant: 'cancelado' },
};

export default async function PedidosPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const orders = await api.get<OrderWithStore[]>('/v1/orders').catch(() => []);

  return (
    <div className="pb-6">
      <PageHeader title="Meus Pedidos" hideBack />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">
            shopping_bag
          </span>
          <p className="text-sm font-semibold text-slate-500">Nenhum pedido ainda</p>
          <p className="text-xs text-slate-400 mt-1">
            Seus pedidos de materiais aparecerão aqui.
          </p>
          <Link
            href="/"
            className="mt-6 text-xs font-semibold text-trust bg-blue-50 px-4 py-2 rounded-full"
          >
            Encontrar profissional
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-2 flex flex-col gap-3">
          {orders.map((order: OrderWithStore) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const o = order as any;
            const status = STATUS_MAP[o.status] ?? { label: o.status, variant: 'pendente' };
            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                {/* Order header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                      Pedido
                    </p>
                    <p className="text-base font-bold text-slate-900">#{o.order_number}</p>
                  </div>
                  <StatusBadge variant={status.variant} label={status.label} />
                </div>

                {/* Store info */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-base text-slate-400">
                      store
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {o.stores?.name ?? 'Loja'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="ml-auto text-sm font-bold text-slate-900">
                    R$ {Number(o.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Delivery address */}
                {o.delivery_address && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <span className="material-symbols-outlined text-sm text-slate-300 mt-0.5">
                      location_on
                    </span>
                    <p className="text-[10px] text-slate-400 leading-tight">{o.delivery_address}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
