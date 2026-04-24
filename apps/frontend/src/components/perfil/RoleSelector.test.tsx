import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mock @clerk/nextjs ────────────────────────────────────────────────────────
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: async () => 'mock-token' }),
}));

// ── Mock next/navigation ──────────────────────────────────────────────────────
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// ── Mock RoleContext ──────────────────────────────────────────────────────────
const mockSetRole = vi.fn();
vi.mock('@/contexts/RoleContext', () => ({
  useRole: () => ({ actingAs: 'client', setRole: mockSetRole }),
}));

// ── Mock acting-as cookie helpers ─────────────────────────────────────────────
vi.mock('@/lib/acting-as', () => ({
  getActingAs: () => 'client',
  setActingAs: vi.fn(),
  ACTING_AS_COOKIE: 'obrafacil_acting_as',
}));

vi.mock('@/lib/auth-bypass-config', () => ({
  isAuthBypassEnabled: false,
  BYPASS_USER_CLERK_ID: 'bypass-user',
}));

// ── Mock fetch ────────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { setActingAs as mockPersistActingAs } from '@/lib/acting-as';
import { RoleSelector } from './RoleSelector';

function makeJsonResponse<T>(data: T, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 403,
    json: () => Promise.resolve(ok ? { data } : { error: 'Forbidden' }),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RoleSelector', () => {
  describe('rendering', () => {
    it('renders nothing when only one role is available', () => {
      const { container } = render(
        <RoleSelector currentRole="client" availableRoles={['client']} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders all available roles when multiple exist', () => {
      render(
        <RoleSelector currentRole="client" availableRoles={['client', 'professional']} />,
      );
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Profissional')).toBeInTheDocument();
    });

    it('marks the current role as active', () => {
      render(
        <RoleSelector currentRole="professional" availableRoles={['client', 'professional']} />,
      );
      // The "check_circle" icon appears only on the active role button
      // The active button has the orange text class
      const professionalButton = screen.getByText('Profissional').closest('button');
      expect(professionalButton?.className).toMatch(/text-\[#ec5b13\]/);
    });
  });

  describe('switching modes', () => {
    it('calls PATCH /acting-as with the new role on click', async () => {
      mockFetch.mockImplementation(() => makeJsonResponse({ actingAs: 'professional' }));

      render(
        <RoleSelector currentRole="client" availableRoles={['client', 'professional']} />,
      );

      await userEvent.click(screen.getByText('Profissional'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
        expect(url).toContain('/v1/account/acting-as');
        expect((options as RequestInit).method).toBe('PATCH');
        const body = JSON.parse(options.body as string) as { role: string };
        expect(body.role).toBe('professional');
      });
    });

    it('includes Authorization Bearer token in the PATCH request', async () => {
      mockFetch.mockImplementation(() => makeJsonResponse({ actingAs: 'professional' }));

      render(
        <RoleSelector currentRole="client" availableRoles={['client', 'professional']} />,
      );

      await userEvent.click(screen.getByText('Profissional'));

      await waitFor(() => {
        const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
        const authHeader = (options.headers as Record<string, string>)['Authorization'];
        expect(authHeader).toBe('Bearer mock-token');
      });
    });

    it('updates cookie and context on successful switch', async () => {
      mockFetch.mockImplementation(() => makeJsonResponse({ actingAs: 'professional' }));

      render(
        <RoleSelector currentRole="client" availableRoles={['client', 'professional']} />,
      );

      await userEvent.click(screen.getByText('Profissional'));

      await waitFor(() => {
        expect(mockPersistActingAs).toHaveBeenCalledWith('professional');
        expect(mockSetRole).toHaveBeenCalledWith('professional');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('does NOT call deactivate endpoint when switching modes', async () => {
      mockFetch.mockImplementation(() => makeJsonResponse({ actingAs: 'client' }));

      render(
        <RoleSelector
          currentRole="professional"
          availableRoles={['client', 'professional']}
        />,
      );

      await userEvent.click(screen.getByText('Cliente'));

      await waitFor(() => {
        const deactivateCalls = mockFetch.mock.calls.filter(([url]: [string]) =>
          url.includes('/deactivate'),
        );
        expect(deactivateCalls).toHaveLength(0);
      });
    });

    it('shows error message when PATCH request fails', async () => {
      mockFetch.mockImplementation(() => makeJsonResponse({}, false));

      render(
        <RoleSelector currentRole="client" availableRoles={['client', 'professional']} />,
      );

      await userEvent.click(screen.getByText('Profissional'));

      await waitFor(() => {
        expect(screen.getByText('Erro ao alterar perfil')).toBeInTheDocument();
      });
    });

    it('does not trigger a switch when clicking the already-active role', async () => {
      render(
        <RoleSelector currentRole="client" availableRoles={['client', 'professional']} />,
      );

      await userEvent.click(screen.getByText('Cliente'));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
