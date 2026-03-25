// INT-04 — Cotação de Materiais Automática
// spec_ui.md INT-04: "forte apelo de economia, Top 3 Melhores Ofertas, radio selection"
// prd.md RFN-03: "3 melhores opções de lojas com menor valor global da cesta"
// seed.sql: R$218.30 (melhor), R$243.50, R$263.30
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import type { MaterialItem, StoreOfferWithStore } from '@obrafacil/shared';
import { CotacaoClient } from './CotacaoClient';

export default async function CotacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const [list, offers] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get<any>(`/v1/material-lists/${id}`).catch(() => null),
    api.get<StoreOfferWithStore[]>(`/v1/material-lists/${id}/offers`).catch(() => []),
  ]);

  if (!list) notFound();

  // Savings calculation — difference between most expensive and cheapest
  const cheapest = offers[0]?.total_price ?? 0;
  const mostExpensive = offers[offers.length - 1]?.total_price ?? 0;
  const savings = mostExpensive > 0 ? mostExpensive - cheapest : 0;
  const bestOffer = offers.find((o) => o.is_best_price) ?? offers[0];

  return (
    <div className="pb-32">
      <PageHeader title="Cotação de Materiais" />

      {/* ── Savings hero — spec_ui.md: "forte apelo de economia" ─── */}
      {savings > 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-savings to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-xs font-medium opacity-80">Melhor negócio encontrado</p>
          <p className="text-3xl font-black mt-1">
            R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-80 mt-0.5">
            de economia na{' '}
            <span className="font-bold">{bestOffer?.stores?.name ?? 'melhor loja'}</span>
          </p>
        </div>
      )}

      {/* ── Material items list ──────────────────────────────────── */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            {list.title}
          </h2>
          <button className="text-xs text-trust font-medium">
            Revisar / Editar itens
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {(list.material_items ?? []).map((item: MaterialItem, idx: number) => (
            <div
              key={String(item.id)}
              className={`flex items-center gap-3 px-4 py-3 ${
                idx < (list.material_items?.length ?? 0) - 1
                  ? 'border-b border-slate-50'
                  : ''
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-sm text-slate-400">inventory_2</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Store offers (interactive client component) ──────────── */}
      <CotacaoClient
        listId={list.id}
        offers={offers}
        defaultSelectedId={bestOffer?.id ?? null}
      />
    </div>
  );
}
