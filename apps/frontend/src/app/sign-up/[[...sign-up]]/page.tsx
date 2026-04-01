import { SignUpClient } from '@/components/auth/SignUpClient';
import { isClerkConfigured } from '@/lib/env';

export default function SignUpPage() {
  const clerkConfigured = isClerkConfigured();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Brand header */}
      <div className="mb-8 text-center">
        <p className="text-sm text-slate-500 font-medium">Crie sua conta</p>
        <h1 className="text-3xl font-bold text-brand">Obra Fácil</h1>
        <p className="mt-2 text-sm text-slate-500">
          Conectamos você a profissionais qualificados
        </p>
      </div>

      {clerkConfigured ? (
        <SignUpClient />
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm">
          <p className="text-sm font-semibold text-amber-900">Cadastro indisponível em modo local</p>
          <p className="mt-2 text-sm text-amber-800">
            Configure as chaves do Clerk em <code className="font-mono">apps/frontend/.env.local</code> para habilitar criação de conta.
          </p>
        </div>
      )}
    </div>
  );
}
