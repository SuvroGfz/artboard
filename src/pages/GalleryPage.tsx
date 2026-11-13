import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, PenTool } from 'lucide-react';
import { fetchDrawings, createDrawing, deleteDrawing } from '../api';
import type { DrawingMeta } from '../../shared/types';

export const GalleryPage: React.FC = () => {
  const [drawings, setDrawings] = useState<DrawingMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await fetchDrawings();
      setDrawings(data);
    } catch (e) {
      console.error('Failed to load drawings', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const d = await createDrawing(`Drawing ${drawings.length + 1}`);
    navigate(`/draw/${d.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this drawing?')) return;
    await deleteDrawing(id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <PenTool className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Artboard</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Create and manage drawings. Link them to QBank questions via the MCP.
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-white shadow-sm"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="h-4 w-4" />
          New Drawing
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-[var(--muted-foreground)] text-sm">Loading…</p>
      ) : drawings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PenTool className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
          <h2 className="text-lg font-semibold mb-1">No drawings yet</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Create your first drawing to get started.
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="h-4 w-4" />
            Create Drawing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {drawings.map((d) => (
            <div
              key={d.id}
              className="group relative overflow-hidden rounded-lg border cursor-pointer transition-colors hover:border-[var(--primary)]"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              onClick={() => navigate(`/draw/${d.id}`)}
            >
              <div className="flex items-center justify-center aspect-[4/3] bg-[var(--muted)]">
                <PenTool className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{d.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {d.elementCount} element{d.elementCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
