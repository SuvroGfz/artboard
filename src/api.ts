/** Artboard REST API client for the frontend. */

import type { ArtboardDrawing, DrawingMeta } from '../shared/types';

const BASE = '/api/drawings';

export async function fetchDrawings(): Promise<DrawingMeta[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch drawings');
  return res.json();
}

export async function fetchDrawing(id: string): Promise<ArtboardDrawing> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Drawing not found');
  return res.json();
}

export async function createDrawing(title: string): Promise<ArtboardDrawing> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create drawing');
  return res.json();
}

export async function saveDrawing(
  id: string,
  data: Partial<Pick<ArtboardDrawing, 'title' | 'elements' | 'appState' | 'files'>>
): Promise<ArtboardDrawing> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save drawing');
  return res.json();
}

export async function deleteDrawing(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete drawing');
}
