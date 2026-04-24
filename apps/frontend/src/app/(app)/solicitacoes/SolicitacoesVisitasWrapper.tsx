'use client';

import { useState } from 'react';
import { SolicitacoesClient } from './SolicitacoesClient';
import { VisitasTab } from './VisitasTab';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SolicitacoesVisitasWrapper({ works, visits }: { works: any[]; visits: any[] }) {
  const [mainTab, setMainTab] = useState<'solicitacoes' | 'visitas'>('solicitacoes');

  return (
    <>
      {/* Top-level tabs: Solicitações / Visitas */}
      <div className="flex border-b border-slate-200 px-4 gap-4" role="tablist">
        <button
          role="tab"
          aria-selected={mainTab === 'solicitacoes'}
          onClick={() => setMainTab('solicitacoes')}
          className={`py-3 text-sm transition-colors ${
            mainTab === 'solicitacoes'
              ? 'font-semibold text-trust border-b-2 border-trust'
              : 'font-medium text-slate-400'
          }`}
        >
          Solicitações
        </button>
        <button
          role="tab"
          aria-selected={mainTab === 'visitas'}
          onClick={() => setMainTab('visitas')}
          className={`py-3 text-sm transition-colors relative ${
            mainTab === 'visitas'
              ? 'font-semibold text-trust border-b-2 border-trust'
              : 'font-medium text-slate-400'
          }`}
        >
          Visitas
          {visits.filter((v) => v.status === 'confirmed').length > 0 && (
            <span className="absolute -top-0.5 -right-2 w-2 h-2 bg-savings rounded-full" />
          )}
        </button>
      </div>

      {mainTab === 'solicitacoes' ? (
        <SolicitacoesClient works={works} />
      ) : (
        <VisitasTab visits={visits} />
      )}
    </>
  );
}
