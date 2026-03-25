// AppShell — main layout wrapper: content area + sticky BottomNav
// per spec_ui.md Mobile First: max-width container, proper bottom padding

import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Centered mobile container */}
      <div className="mobile-container mx-auto bg-surface">
        {/* Content area — pb-16 for BottomNav height */}
        <main className="pb-16">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
