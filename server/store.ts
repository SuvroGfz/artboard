/**
 * JSON-file-backed drawing store.
 * Each drawing is saved as a separate file: data/drawings/<id>.json
 */

import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ArtboardDrawing, DrawingMeta } from './types.js';

const DATA_DIR = path.resolve(import.meta.dirname ?? '.', '../data/drawings');

// Ensure data directory exists on startup
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(id: string): string {
  // Sanitize: only allow alphanumeric, hyphens, underscores
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, `${safe}.json`);
}

/** Read a single drawing by ID. */
export async function getDrawing(id: string): Promise<ArtboardDrawing | null> {
  const fp = filePath(id);
  try {
    const raw = await readFile(fp, 'utf-8');
    return JSON.parse(raw) as ArtboardDrawing;
  } catch {
    return null;
  }
}

/** List all drawing metadata (without heavy element arrays). */
export async function listDrawings(): Promise<DrawingMeta[]> {
  const files = await readdir(DATA_DIR);
  const metas: DrawingMeta[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await readFile(path.join(DATA_DIR, file), 'utf-8');
      const d = JSON.parse(raw) as ArtboardDrawing;
      metas.push({
        id: d.id,
        title: d.title,
        elementCount: d.elements?.length ?? 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      });
    } catch {
      // skip corrupt files
    }
  }

  return metas.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Create a new drawing. Returns the saved drawing. */
export async function createDrawing(
  title: string,
  elements: unknown[] = [],
  appState?: Record<string, unknown>,
  files?: Record<string, unknown>
): Promise<ArtboardDrawing> {
  const now = new Date().toISOString();
  const drawing: ArtboardDrawing = {
    id: randomUUID(),
    title,
    elements,
    appState: appState ?? { viewBackgroundColor: '#ffffff' },
    files: files ?? {},
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(filePath(drawing.id), JSON.stringify(drawing, null, 2), 'utf-8');
  return drawing;
}

/** Update an existing drawing. Returns updated drawing or null. */
export async function updateDrawing(
  id: string,
  patch: Partial<Omit<ArtboardDrawing, 'id' | 'createdAt'>>
): Promise<ArtboardDrawing | null> {
  const existing = await getDrawing(id);
  if (!existing) return null;

  const updated: ArtboardDrawing = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(filePath(id), JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

/** Add elements to an existing drawing (append). Returns updated drawing or null. */
export async function addElements(
  id: string,
  newElements: unknown[]
): Promise<ArtboardDrawing | null> {
  const existing = await getDrawing(id);
  if (!existing) return null;

  existing.elements = [...existing.elements, ...newElements];
  existing.updatedAt = new Date().toISOString();

  await writeFile(filePath(id), JSON.stringify(existing, null, 2), 'utf-8');
  return existing;
}

/** Delete a drawing. Returns true if it existed. */
export async function deleteDrawing(id: string): Promise<boolean> {
  const fp = filePath(id);
  try {
    await unlink(fp);
    return true;
  } catch {
    return false;
  }
}
