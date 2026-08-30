import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PlayerBar from './PlayerBar';
import NowPlayingPanel from './NowPlayingPanel';
import LyricsDrawer from './LyricsDrawer';
import QueueDrawer from './QueueDrawer';
import FullScreenPlayer from './FullScreenPlayer';
import FullScreenLyrics from './FullScreenLyrics';
import CreatePlaylistModal from './CreatePlaylistModal';
import UploadModal from './UploadModal';
import AuthModal from './AuthModal';
import { useAudioStore } from '../store/useAudioStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePlaylistStore } from '../store/usePlaylistStore';

export default function AppLayout() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { initAudio, isFullScreenLyricsOpen, toggleFullScreenLyrics } = useAudioStore();
  const { checkAuth } = useAuthStore();
  const { activeToast } = usePlaylistStore();

  useEffect(() => {
    initAudio();
    checkAuth();
  }, [initAudio, checkAuth]);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-[#050506] text-[#EDEDEF]">
      {/* Hidden YouTube IFrame Audio Engine (Full-Length Open Streams) */}
      <div 
        id="vanhsound-yt-player" 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: -9999, 
          width: 200, 
          height: 200, 
          opacity: 0, 
          pointerEvents: 'none',
          zIndex: -1 
        }} 
      />

      {/* Global Toast Notification */}
      {activeToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5E6AD2] animate-ping" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Ambient Multi-Layer Lighting Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0e0e17_0%,#050506_55%,#020203_100%)] pointer-events-none z-0" />
      <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full bg-[#5E6AD2]/15 filter blur-[150px] pointer-events-none animate-blob-1 z-0" />
      <div className="absolute bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/10 filter blur-[130px] pointer-events-none animate-blob-2 z-0" />
      <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full bg-[#EC4899]/08 filter blur-[120px] pointer-events-none animate-blob-pulse z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

      {/* Main Workspace (Spotify 3-Column Layout: Left Sidebar + Center Content + Right Now Playing) */}
      <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          onCreatePlaylistOpen={() => setIsCreateModalOpen(true)}
          onUploadOpen={() => setIsUploadModalOpen(true)}
        />

        {/* Center Main Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Topbar onUploadOpen={() => setIsUploadModalOpen(true)} />

          {/* Scrollable Viewport Canvas */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-10">
            <Outlet />
          </main>
        </div>

        {/* Right Now Playing Panel (Matches Screenshot 1 & 2) */}
        <NowPlayingPanel />

        {/* Floating Drawers */}
        <LyricsDrawer />
        <QueueDrawer />
      </div>

      {/* Bottom Floating Player */}
      <PlayerBar />

      {/* Modals & Overlays */}
      <FullScreenPlayer />
      <FullScreenLyrics
        isOpen={isFullScreenLyricsOpen}
        onClose={() => toggleFullScreenLyrics(false)}
      />
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <AuthModal />
    </div>
  );
}
