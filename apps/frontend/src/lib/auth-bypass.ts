import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server';

const isBypassEnabled = process.env.NEXT_PUBLIC_DISABLE_CLERK_AUTH === 'true';

// Usamos um ID fixo ou pegamos o do primeiro mock 
// Atenção: este mock funcionará para bypasser as falhas visuais do frontend.
export const auth = async () => {
  if (isBypassEnabled) {
    return {
      userId: 'bypass-local-dev-id',
      getToken: async () => 'bypass-token',
      sessionId: 'bypass-session',
      orgId: null,
      protect: () => {},
    } as any;
  }
  return clerkAuth();
};

export const currentUser = async () => {
  if (isBypassEnabled) {
    return {
      id: 'bypass-local-dev-id',
      firstName: 'Desenvolvedor',
      lastName: 'Local',
      emailAddresses: [{ emailAddress: 'dev@localhost' }],
      primaryEmailAddressId: '1',
      imageUrl: 'https://ui-avatars.com/api/?name=Dev+Local',
    } as any;
  }
  return clerkCurrentUser();
};
