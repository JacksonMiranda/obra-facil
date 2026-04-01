'use client';

import { SignIn } from '@clerk/nextjs';

export function SignInClient() {
  return (
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
  );
}