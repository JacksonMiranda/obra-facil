// Meus Pedidos — order history screen
// seed.sql data: #88421 (a-caminho), #88390 (entregue)
import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { PedidosTabs } from './PedidosTabs';

export default async function PedidosPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: any[] = await api.get<any[]>('/v1/orders').catch(() => []);

  return (
    <div className="pb-24 bg-surface min-h-screen">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-10 pb-3">
          <Link href="/" className="mr-3">
            <span className="material-symbols-outlined text-slate-700 text-xl">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Meus Pedidos</h1>
        </div>

        <PedidosTabs orders={orders} />
      </div>
    </div>
  );
}
