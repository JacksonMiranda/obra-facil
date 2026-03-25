import { AppShell } from '@/components/layout/AppShell';

// All authenticated app routes share this layout with the bottom navigation
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
