'use client';

import { ClerkProvider } from '@clerk/nextjs';

const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!clerkConfigured) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
