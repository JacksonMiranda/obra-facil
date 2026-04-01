// Meus Pedidos — order history screen
// seed.sql data: #88421 (a-caminho), #88390 (entregue)
import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

const STATUS_MAP: Record<string, { label: string; variant: 'a-caminho' | 'entregue' | 'ativo' | 'agendado' | 'pendente' | 'cancelado' }> = {
  pending: { label: 'Pendente', variant: 'pendente' },
  confirmed: { label: 'Confirmado', variant: 'ativo' },
  shipped: { label: 'A CAMINHO', variant: 'a-caminho' },
  delivered: { label: 'ENTREGUE', variant: 'entregue' },
  cancelled: { label: 'Cancelado', variant: 'cancelado' },
};

export default async function PedidosPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const orders: any[] = await api.get<any[]>('/v1/orders').catch(() => []);

  return (
    <div className="pb-24 bg-[#f8f6f6] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-10 pb-3">
          <Link href="/" className="mr-3">
            <span className="material-symbols-outlined text-slate-700 text-xl">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Meus Pedidos</h1>
        </div>

        {/* ── Tabs: Materiais / Serviços ──────────────────────── */}
        <div className="flex border-b border-slate-200">
          <div className="flex-1 text-center py-3 text-sm font-semibold text-[#1E40AF] border-b-2 border-[#1E40AF]">
            Materiais
          </div>
          <div className="flex-1 text-center py-3 text-sm font-medium text-slate-400">
            Serviços
          </div>
        </div>
      </div>

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
            className="mt-6 text-xs font-semibold text-[#1E40AF] bg-blue-50 px-4 py-2 rounded-full"
          >
            Encontrar profissional
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Pedidos Recentes</p>
          <div className="flex flex-col gap-3">
            {orders.map((order: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const o = order as any;
              const status = STATUS_MAP[o.status] ?? { label: o.status, variant: 'pendente' };
              const isShipped = o.status === 'shipped';
              const isDelivered = o.status === 'delivered';

              return (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
                >
                  {/* Order header with store and status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-lg text-slate-400">store</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {o.stores?.name ?? 'Loja'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Pedido #{o.order_number}
                        </p>
                      </div>
                    </div>
                    <StatusBadge variant={status.variant} label={status.label} />
                  </div>

                  {/* Items description */}
                  {o.items_description && (
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">
                      {o.items_description}
                    </p>
                  )}

                  {/* Price and date */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <p className="text-base font-bold text-slate-900">
                      R$ {Number(o.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    {isShipped && (
                      <button className="flex-1 text-center text-sm font-bold text-white bg-[#1E40AF] py-2.5 rounded-xl active:scale-[0.98] transition-transform">
                        Rastrear Entrega
                      </button>
                    )}
                    {isDelivered && (
                      <>
                        <button className="flex-1 text-center text-xs font-semibold text-slate-600 bg-white border border-slate-200 py-2.5 rounded-xl">
                          Ver Detalhes
                        </button>
                        <button className="flex-1 text-center text-xs font-bold text-[#1E40AF] bg-blue-50 border border-[#1E40AF]/20 py-2.5 rounded-xl">
                          Comprar Novamente
                        </button>
                      </>
                    )}
                    {!isShipped && !isDelivered && (
                      <button className="flex-1 text-center text-xs font-semibold text-slate-600 bg-white border border-slate-200 py-2.5 rounded-xl">
                        Ver Detalhes
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Service orders section placeholder */}
          <div className="mt-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Serviços Pendentes</p>
            {/* Service orders would appear here when Serviços tab is active */}
          </div>
        </div>
      )}
    </div>
  );
}
