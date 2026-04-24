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

// ── Mock global fetch ─────────────────────────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Mock acting-as cookie helpers ─────────────────────────────────────────────
vi.mock('@/lib/acting-as', () => ({
  getActingAs: () => 'professional',
  setActingAs: vi.fn(),
  ACTING_AS_COOKIE: 'obrafacil_acting_as',
}));

vi.mock('@/lib/auth-bypass-config', () => ({
  isAuthBypassEnabled: false,
  BYPASS_USER_CLERK_ID: 'bypass-user',
}));

import { ProfessionalActivation } from './ProfessionalActivation';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeJsonResponse<T>(data: T, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 400,
    json: () => Promise.resolve(ok ? { data } : { error: 'Erro' }),
  } as Response);
}

const SERVICES = [
  { id: 'svc-1', name: 'Marceneiro', icon_name: 'handyman', description: null },
  { id: 'svc-2', name: 'Pedreiro', icon_name: 'construction', description: null },
];

const PROFESSIONAL_PROFILE = {
  specialty: 'Marceneiro',
  bio: 'Marceneiro com 10 anos de experiência.',
  visibility_status: 'active',
  is_complete: true,
  missing_fields: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProfessionalActivation', () => {
  describe('when user does NOT have professional role', () => {
    it('renders the "Tornar-se Profissional" call-to-action', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        return makeJsonResponse({});
      });

      render(<ProfessionalActivation roles={['client']} />);

      // Should show the activate button, not the active status
      await waitFor(() => {
        expect(screen.queryByText('Perfil Profissional Ativo')).not.toBeInTheDocument();
      });
    });
  });

  describe('when user HAS professional role', () => {
    it('shows "Perfil Profissional Ativo" with specialty and bio loaded from API', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        if (url.includes('/v1/professionals/me')) return makeJsonResponse(PROFESSIONAL_PROFILE);
        return makeJsonResponse({});
      });

      render(<ProfessionalActivation roles={['client', 'professional']} />);

      await waitFor(() => {
        expect(screen.getByText('Perfil Profissional Ativo')).toBeInTheDocument();
      });

      await waitFor(() => {
        // bio is unique text; check it is displayed
        expect(screen.getByText(PROFESSIONAL_PROFILE.bio)).toBeInTheDocument();
        // specialty appears at least once (may appear in dropdown too)
        expect(screen.getAllByText('Marceneiro').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows "Ativo" badge when visibility_status is active', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        if (url.includes('/v1/professionals/me')) return makeJsonResponse(PROFESSIONAL_PROFILE);
        return makeJsonResponse({});
      });

      render(<ProfessionalActivation roles={['client', 'professional']} />);

      await waitFor(() => {
        expect(screen.getByText('Ativo')).toBeInTheDocument();
      });
    });

    it('shows "Rascunho" badge when visibility_status is draft', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        if (url.includes('/v1/professionals/me'))
          return makeJsonResponse({ ...PROFESSIONAL_PROFILE, visibility_status: 'draft' });
        return makeJsonResponse({});
      });

      render(<ProfessionalActivation roles={['client', 'professional']} />);

      await waitFor(() => {
        expect(screen.getByText('Rascunho')).toBeInTheDocument();
      });
    });

    it('includes Authorization Bearer token in GET /professionals/me request', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        if (url.includes('/v1/professionals/me')) return makeJsonResponse(PROFESSIONAL_PROFILE);
        return makeJsonResponse({});
      });

      render(<ProfessionalActivation roles={['client', 'professional']} />);

      await waitFor(() => {
        expect(screen.getByText('Perfil Profissional Ativo')).toBeInTheDocument();
      });

      const meCall = mockFetch.mock.calls.find(([url]: [string]) =>
        url.includes('/v1/professionals/me'),
      );
      expect(meCall).toBeDefined();
      const [, options] = meCall as [string, RequestInit];
      const authHeader = (options.headers as Record<string, string>)['Authorization'];
      expect(authHeader).toBe('Bearer mock-token');
    });

    it('data persists after component re-renders (simulates mode switch back)', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        if (url.includes('/v1/professionals/me')) return makeJsonResponse(PROFESSIONAL_PROFILE);
        return makeJsonResponse({});
      });

      const { rerender } = render(
        <ProfessionalActivation roles={['client', 'professional']} />,
      );

      await waitFor(() => {
        expect(screen.getAllByText('Marceneiro').length).toBeGreaterThanOrEqual(1);
      });

      // Simulate parent re-rendering (e.g., after mode switch and back)
      rerender(<ProfessionalActivation roles={['client', 'professional']} />);

      await waitFor(() => {
        expect(screen.getAllByText('Marceneiro').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(PROFESSIONAL_PROFILE.bio)).toBeInTheDocument();
      });
    });
  });

  describe('deactivate flow', () => {
    it('calls deactivate endpoint and refreshes on click', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v1/services')) return makeJsonResponse(SERVICES);
        if (url.includes('/v1/professionals/me')) return makeJsonResponse(PROFESSIONAL_PROFILE);
        if (url.includes('/v1/account/roles/deactivate')) return makeJsonResponse({});
        return makeJsonResponse({});
      });

      render(<ProfessionalActivation roles={['client', 'professional']} />);

      await waitFor(() => {
        expect(screen.getByText('Desativar perfil profissional')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Desativar perfil profissional'));

      await waitFor(() => {
        const deactivateCall = mockFetch.mock.calls.find(([url]: [string]) =>
          url.includes('/v1/account/roles/deactivate'),
        );
        expect(deactivateCall).toBeDefined();
        expect(mockRefresh).toHaveBeenCalled();
      });

      // Deactivate call must include Authorization header
      const deactivateCall = mockFetch.mock.calls.find(([url]: [string]) =>
        url.includes('/v1/account/roles/deactivate'),
      );
      const [, opts] = deactivateCall as [string, RequestInit];
      const authHeader = (opts.headers as Record<string, string>)['Authorization'];
      expect(authHeader).toBe('Bearer mock-token');
    });
  });
});
