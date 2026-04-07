'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmacaoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-surface">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-savings/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-savings filled">check_circle</span>
      </div>

      <h1 className="text-xl font-bold text-slate-900">Pedido Confirmado!</h1>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        Seu pedido foi realizado com sucesso. Voce pode acompanhar o status na area de pedidos.
      </p>

      {orderId && (
        <div className="mt-4 bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Numero do pedido</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{orderId.slice(0, 8).toUpperCase()}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
        <Link
          href="/pedidos"
          className="block text-center text-sm font-bold text-white bg-trust py-3 rounded-xl active:scale-[0.98] transition-transform"
        >
          Ver Meus Pedidos
        </Link>
        <Link
          href="/"
          className="block text-center text-sm font-semibold text-trust bg-blue-50 border border-trust/20 py-3 rounded-xl active:scale-[0.98] transition-transform"
        >
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-surface">
          <div className="w-10 h-10 border-4 border-trust border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmacaoContent />
    </Suspense>
  );
}
