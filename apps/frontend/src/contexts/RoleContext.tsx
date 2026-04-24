'use client';

import { createContext, useContext, useState } from 'react';
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
