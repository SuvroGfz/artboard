import React, { useCallback, useRef, useState } from 'react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import '@excalidraw/excalidraw/index.css';
import type { ArtboardDrawing } from '../../shared/types';

export interface ArtboardCanvasProps {
  drawing?: ArtboardDrawing;
  onSave?: (data: Pick<ArtboardDrawing, 'elements' | 'appState' | 'files'>) => void;
}

export const ArtboardCanvas: React.FC<ArtboardCanvasProps> = ({ drawing, onSave }) => {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = useCallback(() => {
    const api = apiRef.current;
    if (!api || !onSave) return;

    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles();

    onSave({
      elements: elements as unknown as unknown[],
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        zoom: appState.zoom,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
      } as Record<string, unknown>,
      files: files as unknown as Record<string, unknown>,
    });
    setIsDirty(false);
  }, [onSave]);

  const initialData = drawing
    ? {
        elements: drawing.elements as any,
        appState: drawing.appState as any,
        files: drawing.files as any,
        scrollToContent: true,
      }
    : undefined;

  return (
    <div className="relative flex flex-col h-full w-full">
      {onSave && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-medium rounded-md text-white shadow-sm transition-colors"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Save
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Excalidraw
          excalidrawAPI={(api) => { apiRef.current = api; }}
          initialData={initialData}
          onChange={() => setIsDirty(true)}
          UIOptions={{
            canvasActions: {
              export: { saveFileToDisk: true },
            },
          }}
        />
      </div>
    </div>
  );
};
