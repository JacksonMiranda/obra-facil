'use client';

import { NotificationBell } from '@/components/ui/NotificationBell';

export function MobileTopBar() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-10 flex items-center justify-between px-4 bg-white border-b border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <span className="text-sm font-bold text-[#ec5b13]">Obra Fácil</span>
      <NotificationBell />
    </div>
  );
}
