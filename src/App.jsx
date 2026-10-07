import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainMapPage } from './pages/MainMapPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAppStore } from './stores/useAppStore';

export const App = () => {
  const { settings, checkAuth } = useAppStore();

  // Check authentication and restore user session on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Apply dark mode on load or change
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMapPage />} />
        <Route path="/search" element={<MainMapPage />} />
        <Route path="/place/:id" element={<MainMapPage />} />
        <Route path="/directions" element={<MainMapPage />} />
        <Route path="/saved" element={<MainMapPage />} />
        <Route path="/recent" element={<MainMapPage />} />
        <Route path="/settings" element={<MainMapPage />} />
        <Route path="/about" element={<MainMapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
