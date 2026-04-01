'use client';

import { ClerkProvider } from '@clerk/nextjs';

export function ClerkProviderClient({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}