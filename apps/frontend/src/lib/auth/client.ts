'use client';

// Client-side auth hook — wraps Clerk's useAuth or returns mock for local dev
const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

export function useAuthSafe() {
  if (!clerkConfigured) {
    return {
      getToken: async () => 'mock-token',
      userId: 'mock-user-001',
      isSignedIn: true,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuth } = require('@clerk/nextjs');
  return useAuth();
}
