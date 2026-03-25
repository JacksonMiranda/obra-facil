// Server-side auth helpers — wraps Clerk or returns mock data for local dev
import { MOCK_USER_ID, MOCK_USER, isClerkConfigured } from './mock';

export async function getAuth(): Promise<{ userId: string | null }> {
  if (!isClerkConfigured()) {
    return { userId: MOCK_USER_ID };
  }
  const { auth } = await import('@clerk/nextjs/server');
  return auth();
}

export async function getUser() {
  if (!isClerkConfigured()) {
    return MOCK_USER;
  }
  const { currentUser } = await import('@clerk/nextjs/server');
  return currentUser();
}
