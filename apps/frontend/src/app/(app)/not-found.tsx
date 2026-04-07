import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-surface">
      <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
      <h1 className="text-lg font-bold text-slate-900">Pagina nao encontrada</h1>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
        O conteudo que voce procura nao existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm font-semibold text-white bg-trust px-6 py-3 rounded-xl active:scale-[0.98] transition-transform"
      >
        Voltar ao Inicio
      </Link>
    </div>
  );
}
