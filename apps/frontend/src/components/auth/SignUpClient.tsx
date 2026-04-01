'use client';

import { SignUp } from '@clerk/nextjs';

export function SignUpClient() {
  return (
    <SignUp
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