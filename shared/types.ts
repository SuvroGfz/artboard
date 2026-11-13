/** Shared types used by both server and client. */

export interface ArtboardDrawing {
  id: string;
  title: string;
  /** Excalidraw scene elements */
  elements: unknown[];
  /** Excalidraw app state subset (background, zoom, scroll) */
  appState?: Record<string, unknown>;
  /** Excalidraw embedded files (images / assets) */
  files?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight metadata returned by list endpoint (no heavy element data). */
export interface DrawingMeta {
  id: string;
  title: string;
  elementCount: number;
  createdAt: string;
  updatedAt: string;
}
