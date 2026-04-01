import { SignInClient } from '@/components/auth/SignInClient';
import { isClerkConfigured } from '@/lib/env';

export default function SignInPage() {
  const clerkConfigured = isClerkConfigured();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Brand header */}
      <div className="mb-8 text-center">
        <p className="text-sm text-slate-500 font-medium">Bem-vindo ao</p>
        <h1 className="text-3xl font-bold text-brand">Obra Fácil</h1>
        <p className="mt-2 text-sm text-slate-500">
          Profissionais de confiança perto de você
        </p>
      </div>

      {clerkConfigured ? (
        <SignInClient />
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm">
          <p className="text-sm font-semibold text-amber-900">Autenticação não configurada</p>
          <p className="mt-2 text-sm text-amber-800">
            Preencha <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> e <code className="font-mono">CLERK_SECRET_KEY</code> em <code className="font-mono">apps/frontend/.env.local</code> para habilitar login real.
          </p>
          <p className="mt-3 text-xs text-amber-700">
            O frontend foi mantido acessível em modo local sem quebrar a inicialização.
          </p>
        </div>
      )}
    </div>
  );
}
