import { Hono } from 'hono';
import {
  listDrawings,
  getDrawing,
  createDrawing,
  updateDrawing,
  addElements,
  deleteDrawing,
} from '../store.js';

const drawings = new Hono();

// ── List all drawings (metadata only) ─────────────────────────
drawings.get('/', async (c) => {
  const metas = await listDrawings();
  return c.json(metas);
});

// ── Get a single drawing (full data) ──────────────────────────
drawings.get('/:id', async (c) => {
  const drawing = await getDrawing(c.req.param('id'));
  if (!drawing) return c.json({ error: 'Drawing not found' }, 404);
  return c.json(drawing);
});

// ── Create a new drawing ──────────────────────────────────────
drawings.post('/', async (c) => {
  const body = await c.req.json();
  const { title, elements, appState, files } = body;

  if (!title || typeof title !== 'string') {
    return c.json({ error: 'title is required' }, 400);
  }

  const drawing = await createDrawing(title, elements, appState, files);
  return c.json(drawing, 201);
});

// ── Update a drawing ──────────────────────────────────────────
drawings.put('/:id', async (c) => {
  const body = await c.req.json();
  const updated = await updateDrawing(c.req.param('id'), body);
  if (!updated) return c.json({ error: 'Drawing not found' }, 404);
  return c.json(updated);
});

// ── Add elements to a drawing ─────────────────────────────────
drawings.post('/:id/elements', async (c) => {
  const body = await c.req.json();
  const { elements } = body;

  if (!Array.isArray(elements)) {
    return c.json({ error: 'elements must be an array' }, 400);
  }

  const updated = await addElements(c.req.param('id'), elements);
  if (!updated) return c.json({ error: 'Drawing not found' }, 404);
  return c.json(updated);
});

// ── Delete a drawing ──────────────────────────────────────────
drawings.delete('/:id', async (c) => {
  const deleted = await deleteDrawing(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Drawing not found' }, 404);
  return c.json({ ok: true });
});

// ── Export a drawing as JSON ──────────────────────────────────
drawings.get('/:id/export', async (c) => {
  const drawing = await getDrawing(c.req.param('id'));
  if (!drawing) return c.json({ error: 'Drawing not found' }, 404);

  const format = c.req.query('format') ?? 'json';

  if (format === 'json') {
    return c.json({
      type: 'excalidraw',
      version: 2,
      source: 'qbank-artboard',
      elements: drawing.elements,
      appState: drawing.appState ?? {},
      files: drawing.files ?? {},
    });
  }

  // SVG/PNG export can be added later with headless rendering
  return c.json({ error: `Export format "${format}" not yet supported` }, 501);
});

export default drawings;
