'use client';
// StartConversationButton — creates a conversation and navigates to chat
// Used on INT-02 (Professional Profile) CTA per spec_ui.md
// Calls POST /api/v1/conversations, then redirects to /chat/:id

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from './StickyBottomCTA';

interface StartConversationButtonProps {
  professionalId: string;
}

export function StartConversationButton({ professionalId }: StartConversationButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/v1/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalProfileId: professionalId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Erro ao iniciar conversa:', err);
        return;
      }

      const envelope = await res.json() as { data: { id: string } };
      router.push(`/chat/${envelope.data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryButton variant="trust" onClick={handleStart} loading={loading}>
      <span className="material-symbols-outlined text-xl">chat</span>
      Conversar e Solicitar Visita
    </PrimaryButton>
  );
}
