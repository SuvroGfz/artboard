import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ArtboardCanvas } from '../components/ArtboardCanvas';
import { fetchDrawing, saveDrawing } from '../api';
import type { ArtboardDrawing } from '../../shared/types';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawing, setDrawing] = useState<ArtboardDrawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDrawing(id)
      .then(setDrawing)
      .catch(() => setError('Drawing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = useCallback(
    async (data: Pick<ArtboardDrawing, 'elements' | 'appState' | 'files'>) => {
      if (!id) return;
      await saveDrawing(id, data);
    },
    [id]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--muted-foreground)]">
        Loading…
      </div>
    );
  }

  if (error || !drawing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-[var(--muted-foreground)]">{error ?? 'Drawing not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to gallery
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Thin header */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Gallery
        </button>
        <span className="text-sm font-medium truncate">{drawing.title}</span>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <ArtboardCanvas drawing={drawing} onSave={handleSave} />
      </div>
    </div>
  );
};
