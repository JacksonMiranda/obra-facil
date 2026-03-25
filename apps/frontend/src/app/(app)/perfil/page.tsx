// Perfil do Usuário — dados do Clerk + logout
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';

export default async function PerfilPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const name = user?.fullName ?? 'Usuário';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="pb-24 bg-[#f8f6f6] min-h-screen">
      <div className="px-4 pt-10 pb-6 bg-white">
        <h1 className="text-lg font-bold text-slate-900 mb-6">Meu Perfil</h1>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#ec5b13] flex items-center justify-center text-white text-2xl font-bold">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <p className="text-lg font-bold text-slate-900 mt-3">{name}</p>
          <p className="text-sm text-slate-400">{email}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 mt-4 flex flex-col gap-2">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
            <span className="material-symbols-outlined text-xl text-slate-400">settings</span>
            <span className="text-sm font-medium text-slate-700">Configurações</span>
            <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
          </button>
          <div className="border-t border-slate-50" />
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
            <span className="material-symbols-outlined text-xl text-slate-400">help</span>
            <span className="text-sm font-medium text-slate-700">Ajuda e Suporte</span>
            <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
          </button>
          <div className="border-t border-slate-50" />
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
            <span className="material-symbols-outlined text-xl text-slate-400">description</span>
            <span className="text-sm font-medium text-slate-700">Termos de Uso</span>
            <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
          </button>
        </div>

        {/* Logout */}
        <SignOutButton>
          <button className="w-full bg-white rounded-xl border border-red-100 shadow-sm px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <span className="material-symbols-outlined text-xl text-red-500">logout</span>
            <span className="text-sm font-semibold text-red-500">Sair da Conta</span>
          </button>
        </SignOutButton>
      </div>

      {/* Version */}
      <p className="text-center text-[10px] text-slate-300 mt-8">Obra Fácil v1.0.0</p>
    </div>
  );
}
