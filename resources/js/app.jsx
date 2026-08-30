import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import PlaylistPage from './pages/PlaylistPage';
import TrackPage from './pages/TrackPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="track/:id" element={<TrackPage />} />
          <Route path="album/:slug" element={<AlbumPage />} />
          <Route path="artist/:slug" element={<ArtistPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
          <Route path="liked" element={<LikedSongsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
