import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GalleryPage } from './pages/GalleryPage';
import { EditorPage } from './pages/EditorPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GalleryPage />} />
      <Route path="/draw/:id" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
