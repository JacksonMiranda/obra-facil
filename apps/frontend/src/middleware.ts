// Clerk middleware — per spec_tech.md: "Isolamento contextual total das rotas"
// Protects all (app) routes; allows public access to sign-in/up and API webhooks

import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { isClerkConfigured } from '@/lib/env';

const publicRoutePatterns = [
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
];

const clerkConfigured = isClerkConfigured();

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (process.env.NEXT_PUBLIC_DISABLE_CLERK_AUTH === 'true') {
    return NextResponse.next();
  }

  if (!clerkConfigured) {
      const nextUrl = new URL(request.url);

      const isPublicRoute = publicRoutePatterns.some((pattern) => {
        const routePattern = new RegExp(`^${pattern.replace('(.*)', '.*')}$`);
        return routePattern.test(nextUrl.pathname);
      });

      if (!isPublicRoute && nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      if (!isPublicRoute && nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
  const isPublicRoute = createRouteMatcher(publicRoutePatterns);

  return clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
