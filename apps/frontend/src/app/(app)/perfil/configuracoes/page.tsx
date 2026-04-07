import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

const SETTINGS = [
  { icon: 'notifications_active', label: 'Notificacoes Push', enabled: true },
  { icon: 'dark_mode', label: 'Modo Escuro', enabled: false },
  { icon: 'language', label: 'Idioma', value: 'Portugues (BR)' },
];

export default async function ConfiguracoesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Configuracoes" />

      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {SETTINGS.map((s, idx) => (
            <div key={s.label}>
              <div className="flex items-center gap-3 px-4 py-4">
                <span className="material-symbols-outlined text-xl text-slate-400">{s.icon}</span>
                <span className="text-sm font-medium text-slate-700 flex-1">{s.label}</span>
                {s.value ? (
                  <span className="text-xs text-slate-400">{s.value}</span>
                ) : (
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${s.enabled ? 'bg-trust' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                )}
              </div>
              {idx < SETTINGS.length - 1 && <div className="border-t border-slate-50 ml-12" />}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-300 text-center mt-8">Obra Facil v1.0.0</p>
      </div>
    </div>
  );
}
