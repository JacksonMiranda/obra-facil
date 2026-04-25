'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientApi } from '@/lib/api/client-api';

interface Props {
  currentAvatarUrl: string | null | undefined;
  name: string;
}

export function AvatarUpload({ currentAvatarUrl, name }: Props) {
  const router = useRouter();
  const api = useClientApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Use uma imagem JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Imagem deve ter no máximo 2 MB.');
      return;
    }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.postForm('/v1/account/profile/avatar', formData);
      router.refresh();
    } catch (err) {
      setPreview(currentAvatarUrl ?? null);
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem');
    } finally {
      setLoading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleRemove() {
    setLoading(true);
    setError(null);
    try {
      await api.delete('/v1/account/profile/avatar');
      setPreview(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover avatar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar circle */}
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full bg-[#ec5b13] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs">...</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-trust disabled:opacity-50"
        >
          Alterar foto
        </button>
        {preview && (
          <>
            <span className="text-slate-200 text-xs">|</span>
            <button
              type="button"
              disabled={loading}
              onClick={handleRemove}
              className="text-xs font-medium text-red-400 disabled:opacity-50"
            >
              Remover
            </button>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
