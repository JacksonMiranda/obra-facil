'use client';

import Link from 'next/link';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-surface">
      <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">error_outline</span>
      <h1 className="text-lg font-bold text-slate-900">Algo deu errado</h1>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
        Ocorreu um erro inesperado. Tente novamente ou volte ao inicio.
      </p>
      <div className="flex gap-3 mt-8">
        <button
          onClick={reset}
          className="text-sm font-semibold text-trust bg-blue-50 border border-trust/20 px-6 py-3 rounded-xl active:scale-[0.98] transition-transform"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="text-sm font-semibold text-white bg-trust px-6 py-3 rounded-xl active:scale-[0.98] transition-transform"
        >
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  );
}
