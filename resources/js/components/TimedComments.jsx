import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, Sparkles } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';

export default function TimedComments({ track }) {
  const { currentTime, seek } = useAudioStore();
  const { user, isAuthenticated, openLoginModal } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (track?.id) {
      axios.get(`/api/tracks/${track.id}/comments`)
        .then((res) => setComments(res.data || []))
        .catch(() => {});
    }
  }, [track?.id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const currentSec = Math.floor(currentTime);
    setIsSubmitting(true);

    try {
      const res = await axios.post(`/api/tracks/${track.id}/comments`, {
        timestamp_seconds: currentSec,
        content: commentText.trim(),
      });

      setComments((prev) => [...prev, res.data].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      setCommentText('');
    } catch (err) {
      console.error('Failed to post timed comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSecs = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
          <MessageSquare className="w-4 h-4 text-[#5E6AD2]" />
          <span>Timed Comments ({comments.length})</span>
        </div>
        <span className="text-xs font-mono text-[#8A8F98]">SoundCloud Mode</span>
      </div>

      {/* Comment Input at Current Timestamp */}
      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3.5 px-2 py-0.5 rounded bg-[#5E6AD2]/20 border border-[#5E6AD2]/40 text-[10px] font-mono text-[#5E6AD2] font-semibold">
            {formatSecs(Math.floor(currentTime))}
          </span>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment at this exact timestamp..."
            className="w-full h-10 pl-18 pr-4 rounded-xl bg-[#0a0a0c] border border-white/[0.08] focus:border-[#5E6AD2] text-xs text-white placeholder-[#8A8F98] outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !commentText.trim()}
          className="h-10 px-4 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-accent-glow active:scale-95 disabled:opacity-50 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </form>

      {/* List of Timed Comments */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-[#8A8F98] italic py-2">
            No comments yet. Be the first to share your thoughts at any second!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              onClick={() => seek(c.timestamp_seconds)}
              className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <img
                src={c.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={c.user?.name}
                className="w-7 h-7 rounded-full object-cover mt-0.5 border border-white/[0.08]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                    {c.user?.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.08] text-[10px] font-mono text-[#5E6AD2]">
                    {c.timestamp_formatted}
                  </span>
                </div>
                <p className="text-xs text-[#EDEDEF] mt-0.5 leading-snug">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
