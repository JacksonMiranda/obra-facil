export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
      <div className="w-10 h-10 border-4 border-trust border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-400">Carregando...</p>
    </div>
  );
}
