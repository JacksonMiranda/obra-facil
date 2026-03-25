// Clerk middleware — per spec_tech.md: "Isolamento contextual total das rotas"
// Protects all (app) routes; allows public access to sign-in/up and API webhooks
// When Clerk is not configured (no valid key), middleware is a no-op for local dev

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

export default async function middleware(request: NextRequest) {
  if (!clerkConfigured) {
    return NextResponse.next();
  }

  // Dynamic import to avoid errors when Clerk keys are absent
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

  const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
  ]);

  const handler = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });

  return handler(request, {} as never);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
