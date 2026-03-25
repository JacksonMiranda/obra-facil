// Mock auth helpers for local dev when Clerk keys are not configured

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

export function isClerkConfigured() {
  return CLERK_CONFIGURED;
}

export const MOCK_USER_ID = 'mock-user-001';
export const MOCK_USER = {
  id: MOCK_USER_ID,
  firstName: 'Carlos',
  lastName: 'Alberto',
  fullName: 'Carlos Alberto',
  imageUrl: '',
  emailAddresses: [{ emailAddress: 'carlos@obrafacil.dev' }],
};
