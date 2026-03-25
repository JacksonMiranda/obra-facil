import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
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
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#1E40AF',
            colorBackground: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  );
}
