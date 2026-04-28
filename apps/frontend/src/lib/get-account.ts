/**
 * Request-scoped cached account fetcher.
 *
 * React.cache() deduplicates calls within the same server render pass, so
 * layout.tsx and any page component that calls getAccount() share a single
 * HTTP request to /v1/account/me — even though api.get uses `cache: 'no-store'`
 * (which disables Next.js's built-in fetch deduplication).
 *
 * This is the canonical way to fetch the current user's AccountContext in
 * Server Components. Never read the acting-as cookie directly to make
 * authorisation decisions — use isProfessionalMode() from professional-access.ts.
 */

import { cache } from 'react';
import { api } from '@/lib/api/client';
import type { AccountContext } from '@obrafacil/shared';

export const getAccount = cache(
  async (): Promise<AccountContext | null> =>
    api.get<AccountContext>('/v1/account/me').catch(() => null),
);
