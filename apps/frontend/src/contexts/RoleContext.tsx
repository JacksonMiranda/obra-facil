'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { UserRole } from '@obrafacil/shared';
import { setActingAs } from '@/lib/acting-as';

interface RoleContextValue {
  actingAs: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue>({
  actingAs: 'client',
  setRole: () => {},
});

interface RoleProviderProps {
  initialRole: UserRole;
  children: React.ReactNode;
}

export function RoleProvider({ initialRole, children }: RoleProviderProps) {
  const [actingAs, setActingAsState] = useState<UserRole>(initialRole);

  // Sync the cookie with the backend-resolved role on every page load.
  // This ensures that Server Components on subsequent navigations (which read
  // the cookie to send the X-Acting-As header) always see the current role,
  // even when the user never explicitly switched roles via RoleSelector.
  useEffect(() => {
    setActingAs(initialRole);
    setActingAsState(initialRole);
  }, [initialRole]);

  function setRole(role: UserRole) {
    setActingAs(role);
    setActingAsState(role);
  }

  return (
    <RoleContext.Provider value={{ actingAs, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
