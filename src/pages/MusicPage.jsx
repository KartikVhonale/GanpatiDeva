import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Music,
  Play,
  SkipForward,
  SkipBack,
  Shuffle,
  Heart,
  Share2,
  ExternalLink,
  PlusCircle,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Flame,
  User,
  MessageSquare,
  Check,
  Headphones,
  Bell,
  Tv,
  Maximize2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { playTempleBell } from '../utils/audio';
import ErrorBoundary from '../components/ErrorBoundary';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Helper to extract YouTube video ID from URL
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  const trimmed = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : '';
}

export default function MusicPage() {
  const { t, isMarathi } = useLanguage();
  const { isLight } = useTheme();

  // State: All music is strictly fetched from MongoDB
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ganpati_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Suggest Song Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    title: '',
    singer: '',
    category: 'aagman',
    youtubeUrl: '',
    suggestedBy: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const autoPlayNextRef = useRef(autoPlayNext);
  autoPlayNextRef.current = autoPlayNext;
  const lastEndedTimeRef = useRef(0);

  // Fetch all songs directly from MongoDB Atlas API
  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/music/songs`);
      if (res.ok) {
        const data = await res.json();
        if (data.all && Array.isArray(data.all)) {
          setSongs(data.all);
          setActiveSong((prev) => {
            if (prev && data.all.some((s) => s.id === prev.id || s._id === prev._id)) {
              return prev;
            }
            return data.all.length > 0 ? data.all[0] : null;
          });
        }
      }
    } catch (err) {
      console.error('Error fetching songs from MongoDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time synchronization via Socket.io & initial load
  useEffect(() => {
    fetchSongs();

    let socket;
    try {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
      });

      socket.on('songs_updated', () => {
        fetchSongs();
      });

      socket.on('new_music_suggestion', () => {
        fetchSongs();
      });

      socket.on('music_liked', (data) => {
        if (data && data.id) {
          setSongs((prev) =>
            prev.map((s) => (s.id === data.id || s._id === data.id ? { ...s, likes: data.likes } : s))
          );
          setActiveSong((prev) =>
            prev && (prev.id === data.id || prev._id === data.id)
              ? { ...prev, likes: data.likes }
              : prev
          );
        }
      });
    } catch (err) {
      console.warn('Socket connection error in MusicPage:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [fetchSongs]);

  // Save likes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ganpati_liked_songs', JSON.stringify(likedSongIds));
    } catch (_) {}
  }, [likedSongIds]);

  // Show auto-dismissing toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories configuration with icons and labels
  const categories = useMemo(() => [
    { id: 'all', label: t('catMusicAll'), icon: Music, color: 'from-amber-500 to-orange-600' },
    { id: 'aagman', label: t('catMusicAagman'), icon: Flame, color: 'from-orange-500 to-red-600' },
    { id: 'bhajan', label: t('catMusicBhajan'), icon: Headphones, color: 'from-emerald-500 to-teal-700' },
    { id: 'aarti', label: t('catMusicAarti'), icon: Bell, color: 'from-yellow-500 to-amber-600' },
    { id: 'suggestions', label: t('catMusicSuggestions'), icon: User, color: 'from-rose-500 to-red-700' },
  ], [t]);

  // Filtered songs based on category and search query
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'suggestions'
          ? song.isSuggestion === true
          : song.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        (song.titleEn && song.titleEn.toLowerCase().includes(q)) ||
        (song.singer && song.singer.toLowerCase().includes(q)) ||
        (song.artist && song.artist.toLowerCase().includes(q)) ||
        (song.movieOrAlbum && song.movieOrAlbum.toLowerCase().includes(q)) ||
        (song.vibe && song.vibe.toLowerCase().includes(q)) ||
        (song.suggestedBy && song.suggestedBy.toLowerCase().includes(q)) ||
        (song.description && song.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [songs, activeCategory, searchQuery]);

  // Play a specific song
  const handleSelectSong = (song) => {
    setActiveSong(song);
    playTempleBell();
    // Smoothly scroll to player on mobile
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Next / Previous song (memoized with useCallback)
  const handleNextSong = useCallback(() => {
    if (!songs || songs.length === 0) return;
    setActiveSong((prev) => {
      if (!prev) return songs[0];
      const currentIndex = songs.findIndex((s) => (s.id || s._id) === (prev.id || prev._id));
      const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % songs.length : 0;
      return songs[nextIndex];
    });
  }, [songs]);

  const handlePrevSong = useCallback(() => {
    if (!songs || songs.length === 0) return;
    setActiveSong((prev) => {
      if (!prev) return songs[0];
      const currentIndex = songs.findIndex((s) => (s.id || s._id) === (prev.id || prev._id));
      const prevIndex = currentIndex !== -1 ? (currentIndex - 1 + songs.length) % songs.length : 0;
      return songs[prevIndex];
    });
  }, [songs]);

  const handleShuffle = useCallback(() => {
    if (!songs || songs.length <= 1) return;
    setActiveSong((prev) => {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * songs.length);
      } while (prev && (songs[randomIndex].id || songs[randomIndex]._id) === (prev.id || prev._id));
      return songs[randomIndex];
    });
    showToast('🎲 यादृच्छिक गाणे सुरू झाले!');
  }, [songs]);

  // Mobile-optimized Fullscreen / Theater Mode toggle
  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (videoContainerRef.current.requestFullscreen) {
          videoContainerRef.current.requestFullscreen();
        } else if (videoContainerRef.current.webkitRequestFullscreen) {
          videoContainerRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Window postMessage listener for YouTube embed events (Auto-play Next & Error resilience)
  useEffect(() => {
    const handleWindowMessage = (e) => {
      // Validate origin to ensure it's from YouTube
      if (e.origin && !e.origin.includes('youtube.com') && !e.origin.includes('youtube-nocookie.com')) {
        return;
      }
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // Detect video ENDED (info === 0 or info.playerState === 0)
        const isEnded =
          (data.event === 'onStateChange' && (data.info === 0 || data.info === '0')) ||
          (data.event === 'infoDelivery' && data.info && (data.info.playerState === 0 || data.info.playerState === '0')) ||
          (data.data && (data.data.playerState === 0 || data.data.info === 0));

        if (isEnded) {
          const now = Date.now();
          if (now - lastEndedTimeRef.current > 2000) {
            lastEndedTimeRef.current = now;
            if (autoPlayNextRef.current) {
              console.log('🎵 YouTube track ended. Automatically playing next track...');
              handleNextSong();
            }
          }
        }

        // Handle YouTube video errors (error codes 100, 101, 150 = private or embed restricted)
        const isError =
          data.event === 'onError' ||
          (data.event === 'infoDelivery' && data.info && data.info.errorCode && data.info.errorCode > 0);

        if (isError) {
          const now = Date.now();
          if (now - lastEndedTimeRef.current > 3000) {
            lastEndedTimeRef.current = now;
            console.warn('YouTube embed encountered an issue with track:', activeSong?.title, data);
            if (autoPlayNextRef.current) {
              showToast('या व्हिडिओचे थेट प्लेबॅक मर्यादित आहे. पुढील गाणे सुरू होत आहे...');
              setTimeout(() => {
                handleNextSong();
              }, 1200);
            }
          }
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [handleNextSong, activeSong?.title]);

  // Handshake with YouTube iframe on load to register postMessage listeners
  const handleIframeLoad = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: 1 }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onError'] }),
          '*'
        );
      }
    } catch (_) {}
  };

  // Handle like song
  const handleLike = async (e, song) => {
    e.stopPropagation();
    const songId = song.id;
    const isAlreadyLiked = likedSongIds.includes(songId);

    // Optimistically update
    setLikedSongIds((prev) =>
      isAlreadyLiked ? prev.filter((id) => id !== songId) : [...prev, songId]
    );

    setSongs((prev) =>
      prev.map((s) =>
        s.id === songId
          ? { ...s, likes: (s.likes || 0) + (isAlreadyLiked ? -1 : 1) }
          : s
      )
    );

    if (activeSong && activeSong.id === songId) {
      setActiveSong((prev) => ({
        ...prev,
        likes: (prev.likes || 0) + (isAlreadyLiked ? -1 : 1),
      }));
    }

    if (!isAlreadyLiked) {
      try {
        await fetch(`${BACKEND_URL}/api/music/like/${songId}`, { method: 'POST' });
      } catch (_) {}
    }
  };

  // Share song
  const handleShare = () => {
    const text = `श्री बाल गणेश मंडळ धानोरा बु. वर हे बाप्पाचे गाणे ऐका: "${activeSong.title}"\nhttps://www.youtube.com/watch?v=${activeSong.youtubeId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      showToast(t('songShared'));
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Suggest Song submission
  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!suggestForm.title.trim()) {
      setSubmitError('कृपया गाण्याचे नाव प्रविष्ट करा (Song title required)');
      return;
    }

    const extractedId = extractYouTubeId(suggestForm.youtubeUrl);
    if (!extractedId) {
      setSubmitError('कृपया वैध YouTube व्हिडिओ लिंक किंवा 11-अक्षरी Video ID टाका');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: suggestForm.title.trim(),
        singer: suggestForm.singer.trim(),
        category: suggestForm.category,
        youtubeUrl: suggestForm.youtubeUrl.trim(),
        youtubeId: extractedId,
        suggestedBy: suggestForm.suggestedBy.trim() || 'भाविक',
        phone: suggestForm.phone.trim(),
        message: suggestForm.message.trim(),
      };

      const res = await fetch(`${BACKEND_URL}/api/music/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'गाणे सेव्ह करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      }

      const data = await res.json();
      await fetchSongs();

      setIsSuggestModalOpen(false);
      setSuggestForm({
        title: '',
        singer: '',
        category: 'aagman',
        youtubeUrl: '',
        suggestedBy: '',
        phone: '',
        message: '',
      });

      playTempleBell();
      showToast(
        data.message ||
          (isMarathi
            ? 'गाणे यशस्वीरित्या पाठवले आहे! मंडळाच्या प्रशासक मंजुरीनंतर (Admin Approval) हे गाणे थेट लाइव्ह प्लेअरमध्ये दिसेल.'
            : 'Song submitted successfully! It will appear live after Mandal Admin approval.')
      );
    } catch (err) {
      setSubmitError(err.message || 'गाणे सुचवताना त्रुटी आली');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview YouTube ID for modal
  const previewModalYoutubeId = useMemo(() => {
    return extractYouTubeId(suggestForm.youtubeUrl);
  }, [suggestForm.youtubeUrl]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl border border-amber-400/60 bg-gradient-to-r from-orange-950 via-amber-950 to-red-950 px-5 py-3 text-amber-200 shadow-2xl backdrop-blur-xl"
          >
            <Sparkles className="h-5 w-5 text-amber-400 animate-spin" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PAGE HEADER & HERO BANNER                                 */}
      {/* ========================================================= */}
      <header className={`relative rounded-3xl border p-5 sm:p-8 backdrop-blur-2xl overflow-hidden transition-colors ${
        isLight
          ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-[#2B2B2B] shadow-[0_10px_35px_rgba(204,85,0,0.1)]'
          : 'border-amber-500/30 bg-gradient-to-br from-orange-950/80 via-red-950/70 to-black/90 shadow-[0_10px_35px_rgba(234,88,12,0.25)] text-white'
      }`}>
        {/* Festive background accents */}
        <div className={`pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl ${
          isLight ? 'bg-[#CC5500]/10' : 'bg-gradient-to-br from-amber-500/20 to-red-600/10'
        }`} />
        <div className={`pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl ${
          isLight ? 'bg-[#B7410E]/10' : 'bg-gradient-to-tr from-orange-600/15 to-amber-400/10'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#CC5500]/10 text-[#CC5500]'
                : 'border-amber-400/40 bg-amber-500/15 text-amber-300'
            }`}>
              <Sparkles className={`h-3.5 w-3.5 animate-spin ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`} />
              <span>{t('sacredMantra')}</span>
              <span className={isLight ? 'text-[#CC5500]/40' : 'text-orange-400'}>•</span>
              <span>{t('mandalName')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              <span className={isLight ? 'text-[#CC5500]' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400'}>
                {t('musicTitle')}
              </span>
              <span className="text-2xl sm:text-3xl">🪔</span>
            </h1>

            <p className={`text-xs sm:text-sm max-w-2xl ${
              isLight ? 'text-stone-600' : 'text-orange-200/80'
            }`}>
              {t('musicSubtitle')}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                playTempleBell();
                setIsSuggestModalOpen(true);
              }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isLight
                  ? 'bg-[#CC5500] hover:bg-[#B7410E] text-[#FFFDD0] shadow-[#CC5500]/25'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-orange-600/30 border border-amber-300/40'
              }`}
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('suggestSongBtn')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* THEATER MODE / NOW PLAYING YOUTUBE VIDEO PLAYER           */}
      {/* ========================================================= */}
      <section ref={playerRef} className="scroll-mt-20 sm:scroll-mt-24 space-y-3 sm:space-y-4">
        <ErrorBoundary onReset={fetchSongs}>
          {isLoading ? (
          <div className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-10 backdrop-blur-2xl text-center space-y-4 ${
            isLight
              ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-[#2B2B2B]'
              : 'border-amber-500/35 bg-black/80 shadow-[0_15px_45px_rgba(234,88,12,0.3)]'
          }`}>
            <div className={`flex items-center justify-center gap-2 font-black text-xs sm:text-base ${
              isLight ? 'text-[#CC5500]' : 'text-amber-400'
            }`}>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>{isMarathi ? 'भक्ती संगीत थेट लोड होत आहे...' : 'Loading devotional music...'}</span>
            </div>
            <div className={`aspect-video max-w-2xl mx-auto rounded-xl sm:rounded-2xl border flex items-center justify-center animate-pulse ${
              isLight ? 'bg-[#F5F5DC] border-[#CC5500]/20' : 'bg-orange-950/20 border-amber-500/20'
            }`}>
              <Music className={`h-10 w-10 sm:h-14 sm:w-14 animate-bounce ${isLight ? 'text-[#CC5500]/40' : 'text-amber-500/40'}`} />
            </div>
          </div>
        ) : activeSong ? (
          <div className={`rounded-2xl sm:rounded-3xl border p-2 sm:p-4 md:p-5 backdrop-blur-2xl transition-colors ${
            isLight
              ? 'border-[#CC5500]/30 bg-[#FFFDD0] shadow-[0_15px_45px_rgba(204,85,0,0.12)] text-[#2B2B2B]'
              : 'border-amber-500/35 bg-black/85 shadow-[0_15px_45px_rgba(234,88,12,0.3)] text-white'
          }`}>
            {/* Top Status Bar of Player Window */}
            <div className={`flex items-center justify-between gap-1.5 pb-2 sm:pb-3 px-1 border-b mb-2 sm:mb-3 text-xs ${
              isLight ? 'border-[#CC5500]/20' : 'border-amber-500/20'
            }`}>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                </span>
                <span className={`font-bold uppercase tracking-wider text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 truncate ${
                  isLight ? 'text-[#CC5500]' : 'text-amber-300'
                }`}>
                  <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 animate-pulse shrink-0" />
                  <span>{t('nowPlaying')}</span>
                </span>
                {activeSong.isSuggestion && (
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold shrink-0 ${
                    isLight ? 'bg-rose-100 border-rose-400/50 text-rose-800' : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  }`}>
                    {t('catMusicSuggestions')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'सामान्य पडदा (Exit Fullscreen)' : 'मोठा पडदा (Theater/Fullscreen)'}
                  className={`flex items-center gap-1 rounded-xl border px-2 sm:px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500]'
                      : 'border-amber-500/30 bg-orange-950/40 text-orange-200 hover:text-white'
                  }`}
                >
                  <Maximize2 className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`} />
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Theater'}</span>
                </button>
                <button
                  onClick={handleShuffle}
                  title="Shuffle / Random"
                  className={`flex items-center gap-1 rounded-xl border px-2 sm:px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500]'
                      : 'border-amber-500/30 bg-orange-950/40 text-orange-200 hover:text-white'
                  }`}
                >
                  <Shuffle className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`} />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
                <button
                  onClick={handleShare}
                  title="Share Song"
                  className={`flex items-center gap-1 rounded-xl border px-2 sm:px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500]'
                      : 'border-amber-500/30 bg-orange-950/40 text-orange-200 hover:text-white'
                  }`}
                >
                  {copiedLink ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" /> : <Share2 className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`} />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied' : t('shareSong')}</span>
                </button>
              </div>
            </div>

            {/* YouTube Responsive Video Container Window */}
            <div
              ref={videoContainerRef}
              className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-amber-500/35 shadow-2xl ring-1 ring-amber-400/20"
            >
              {activeSong.youtubeId ? (
                <iframe
                  ref={iframeRef}
                  id="ganpati-youtube-iframe"
                  key={activeSong.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${activeSong.youtubeId}?autoplay=1&rel=0&enablejsapi=1&playsinline=1&modestbranding=1&iv_load_policy=3&fs=1`}
                  title={activeSong.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  loading="eager"
                  onLoad={handleIframeLoad}
                  onError={(err) => console.warn('YouTube iframe load error:', err)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-black/90 text-amber-300 p-4 sm:p-6 text-center">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
                  <p className="font-bold text-xs sm:text-sm">व्हिडिओ उपलब्ध नाही किंवा लिंक बदलली आहे</p>
                  <button
                    type="button"
                    onClick={handleNextSong}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    <span>पुढील गाणे लावा (Next Song)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Player Metadata & Controls - Highly Optimized for Phone Screens & Desktop */}
            <div className="mt-3 sm:mt-4 space-y-3 px-0.5 sm:px-1">
              {/* Song Title, Category & Artist */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-base sm:text-lg md:text-xl font-black tracking-tight leading-snug ${
                    isLight ? 'text-stone-900' : 'text-white'
                  }`}>
                    {activeSong.title}
                  </h2>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black shrink-0 uppercase tracking-wide ${
                    isLight
                      ? 'bg-[#CC5500]/10 border-[#CC5500]/30 text-[#CC5500]'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  }`}>
                    {activeSong.category}
                  </span>
                  {activeSong.movieOrAlbum && (
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                      isLight
                        ? 'bg-[#FFFDD0] border-[#CC5500]/30 text-stone-700'
                        : 'bg-orange-950/80 border-orange-500/35 text-amber-200'
                    }`}>
                      🎬 {activeSong.movieOrAlbum}
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-xs font-medium ${
                  isLight ? 'text-stone-600' : 'text-orange-200/80'
                }`}>
                  <span className={`font-semibold ${isLight ? 'text-[#CC5500]' : 'text-amber-300'}`}>
                    {activeSong.artist || activeSong.singer || 'श्री गणेश भक्ती'}
                  </span>
                  <span className={isLight ? 'text-stone-400' : 'text-orange-400/60'}>•</span>
                  <span className={`font-mono text-[11px] sm:text-xs ${isLight ? 'text-stone-500' : 'text-orange-300/80'}`}>
                    {activeSong.duration || 'Special Track'}
                  </span>
                </div>
              </div>

              {/* Mobile & Desktop Responsive Controls Bar */}
              <div className={`pt-2.5 sm:pt-3 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 ${
                isLight ? 'border-[#CC5500]/20' : 'border-amber-500/20'
              }`}>
                {/* Main Playback Cluster (Prev, Shuffle, Next) */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  <button
                    onClick={handlePrevSong}
                    className={`flex h-10 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-[#CC5500] hover:bg-[#FFFDD0]'
                        : 'border-amber-500/35 bg-orange-950/60 text-amber-300 hover:bg-orange-900/70'
                    }`}
                    title="मागील गाणे (Previous)"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleShuffle}
                    className={`flex h-10 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-[#CC5500] hover:bg-[#FFFDD0]'
                        : 'border-amber-500/35 bg-orange-950/60 text-amber-300 hover:bg-orange-900/70'
                    }`}
                    title="यादृच्छिक गाणे (Shuffle)"
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleNextSong}
                    className={`flex h-10 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 ${
                      isLight
                        ? 'border-[#CC5500] bg-[#CC5500] text-white hover:bg-[#B7410E] shadow-[#CC5500]/20'
                        : 'border-orange-500/50 bg-gradient-to-r from-amber-500/30 to-orange-600/30 text-amber-200 shadow-orange-900/30'
                    }`}
                    title="पुढील गाणे (Next)"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                {/* Secondary Actions: Autoplay toggle, Like counter, YouTube link */}
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {/* Autoplay Next Song Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPlayNext((prev) => {
                        const next = !prev;
                        showToast(
                          next
                            ? (isMarathi ? 'ऑटो-प्ले चालू 🎶' : 'Autoplay ON')
                            : (isMarathi ? 'ऑटो-प्ले बंद' : 'Autoplay OFF')
                        );
                        return next;
                      });
                    }}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                      autoPlayNext
                        ? isLight
                          ? 'border-emerald-600/50 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500/30'
                          : 'border-emerald-500/50 bg-emerald-950/70 text-emerald-300 shadow-sm shadow-emerald-900/40 ring-1 ring-emerald-400/40'
                        : isLight
                          ? 'border-[#CC5500]/25 bg-[#F5F5DC] text-stone-600 hover:text-[#CC5500]'
                          : 'border-amber-500/25 bg-orange-950/40 text-orange-200/60 hover:text-white'
                    }`}
                    title={autoPlayNext ? 'ऑटो-प्ले चालू (गाणे संपल्यावर पुढील गाणे आपोआप सुरू होईल)' : 'ऑटो-प्ले बंद करा'}
                  >
                    <Radio className={`h-3.5 w-3.5 shrink-0 ${autoPlayNext ? (isLight ? 'text-emerald-600 animate-pulse' : 'text-emerald-400 animate-pulse') : ''}`} />
                    <span className="whitespace-nowrap">
                      {autoPlayNext
                        ? (isMarathi ? 'अखंड संगीत' : 'Auto Next')
                        : (isMarathi ? 'ऑटो-प्ले बंद' : 'Auto Next OFF')}
                    </span>
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLike(e, activeSong)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                      likedSongIds.includes(activeSong.id || activeSong._id)
                        ? isLight
                          ? 'border-red-400/50 bg-red-50 text-red-700 shadow-sm'
                          : 'border-red-500/50 bg-red-600/25 text-red-300 shadow-md shadow-red-600/30'
                        : isLight
                          ? 'border-[#CC5500]/25 bg-[#F5F5DC] text-stone-600 hover:text-[#CC5500]'
                          : 'border-amber-500/30 bg-orange-950/50 text-orange-200 hover:text-white'
                    }`}
                    title="गाणे आवडले"
                  >
                    <Heart
                      className={`h-4 w-4 shrink-0 ${
                        likedSongIds.includes(activeSong.id || activeSong._id) ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    <span className="text-xs">{activeSong.likes || 0}</span>
                  </button>

                  {/* Open in YouTube */}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeSong.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-1 rounded-xl border px-2.5 sm:px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isLight
                        ? 'border-red-400/40 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-red-500/40 bg-red-950/40 hover:bg-red-900/50 text-red-200'
                    }`}
                    title={t('openInYoutube')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden xs:inline">{t('openInYoutube')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`rounded-3xl border p-8 text-center backdrop-blur-2xl ${
            isLight
              ? 'border-[#CC5500]/20 bg-[#FFFDD0]/90 text-stone-700'
              : 'border-amber-500/35 bg-black/80 text-orange-200'
          }`}>
            <Music className={`mx-auto h-12 w-12 mb-2 ${isLight ? 'text-[#CC5500]/60' : 'text-amber-400/50'}`} />
            <p className="font-bold">{t('noSongsFound')}</p>
          </div>
        )}
        </ErrorBoundary>
      </section>

      {/* ========================================================= */}
      {/* CATEGORIES FILTER BAR & SEARCH INPUT                      */}
      {/* ========================================================= */}
      <section className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'all'
                ? songs.length
                : cat.id === 'suggestions'
                ? songs.filter((s) => s.isSuggestion).length
                : songs.filter((s) => s.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playTempleBell();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-[#CC5500] text-white shadow-lg shadow-[#CC5500]/30 border border-[#B7410E] scale-105'
                      : 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-orange-600/35 border border-amber-300 scale-105'
                    : isLight
                      ? 'border border-[#CC5500]/25 bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0] hover:text-[#CC5500]'
                      : 'border border-amber-500/25 bg-orange-950/40 text-orange-200/80 hover:bg-orange-900/40 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive
                      ? isLight
                        ? 'bg-white/30 text-white'
                        : 'bg-black/40 text-amber-200'
                      : isLight
                        ? 'bg-[#CC5500]/15 text-[#CC5500]'
                        : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
            isLight ? 'text-[#CC5500]' : 'text-orange-300/70'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchSongsPlaceholder')}
            className={`w-full rounded-2xl border py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-[#CC5500]/20'
                : 'border-amber-500/30 bg-orange-950/40 text-white placeholder-orange-300/40 focus:border-amber-400 focus:ring-amber-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-stone-400 hover:text-[#CC5500]' : 'text-orange-300/70 hover:text-white'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SONGS GRID (PLAYABLE CARDS)                               */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className={`flex items-center justify-between text-xs px-1 font-bold ${
          isLight ? 'text-stone-600' : 'text-orange-200/70'
        }`}>
          <span>
            {filteredSongs.length} {t('music')}
          </span>
          <span>{t('mandalName')}</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`rounded-2xl border p-3.5 space-y-3 animate-pulse ${
                  isLight ? 'border-[#CC5500]/20 bg-[#F5F5DC]' : 'border-amber-500/20 bg-orange-950/30'
                }`}
              >
                <div className={`aspect-video w-full rounded-xl ${isLight ? 'bg-stone-300' : 'bg-orange-950/60'}`} />
                <div className={`h-4 w-3/4 rounded ${isLight ? 'bg-[#CC5500]/20' : 'bg-amber-500/20'}`} />
                <div className={`h-3 w-1/2 rounded ${isLight ? 'bg-[#CC5500]/10' : 'bg-amber-500/10'}`} />
                <div className={`h-3 w-1/4 rounded ${isLight ? 'bg-[#CC5500]/10' : 'bg-amber-500/10'}`} />
              </div>
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className={`rounded-3xl border p-12 text-center backdrop-blur-xl ${
            isLight
              ? 'border-[#CC5500]/20 bg-[#F5F5DC]/90 text-stone-700'
              : 'border-amber-500/20 bg-orange-950/20 text-orange-200'
          }`}>
            <Music className={`mx-auto h-12 w-12 mb-3 ${isLight ? 'text-[#CC5500]/40' : 'text-orange-400/40'}`} />
            <p className={`font-bold ${isLight ? 'text-stone-800' : 'text-orange-200'}`}>{t('noSongsFound')}</p>
            <p className={`text-xs mt-1 ${isLight ? 'text-stone-500' : 'text-orange-200/60'}`}>
              आपले आवडते गाणे मंडळाला सुचवण्यासाठी खालील बटणावर क्लिक करा:
            </p>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer ${
                isLight
                  ? 'bg-[#CC5500] hover:bg-[#B7410E]'
                  : 'bg-gradient-to-r from-amber-500 to-red-600'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('suggestSongBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song) => {
              const isSelected = activeSong && activeSong.id === song.id;
              const isLiked = likedSongIds.includes(song.id);

              return (
                <motion.div
                  key={song.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleSelectSong(song)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? isLight
                        ? 'border-[#CC5500] bg-[#FFFDD0] shadow-[0_8px_30px_rgba(204,85,0,0.25)] ring-2 ring-[#CC5500]/50'
                        : 'border-amber-400 bg-gradient-to-b from-orange-950/90 via-red-950/80 to-black/95 shadow-[0_8px_30px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/50'
                      : isLight
                        ? 'border-[#CC5500]/20 bg-[#F5F5DC] hover:border-[#CC5500]/50 hover:bg-[#FFFDD0] shadow-sm'
                        : 'border-amber-500/25 bg-orange-950/30 hover:border-amber-400/50 hover:bg-orange-950/50'
                  }`}
                >
                  {/* Thumbnail Banner with YouTube HQ preview image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    <img
                      src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                      alt={song.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

                    {/* Centered Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black scale-110'
                            : 'bg-black/60 text-white group-hover:scale-110 group-hover:bg-[#CC5500] group-hover:text-white'
                        }`}
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Playing indicator badge */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600/90 border border-red-400 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        <span>{t('nowPlaying')}</span>
                      </div>
                    )}

                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                      {song.duration || 'Audio'}
                    </span>

                    {/* Suggestion badge */}
                    {song.isSuggestion && (
                      <span className="absolute top-2 right-2 rounded-full bg-rose-600/90 border border-rose-400/50 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                        👤 {song.suggestedBy || 'भाविक'}
                      </span>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className={`text-sm font-bold transition-colors line-clamp-2 ${
                          isLight ? 'text-stone-900 group-hover:text-[#CC5500]' : 'text-white group-hover:text-amber-300'
                        }`}>
                          {song.title}
                        </h3>
                      </div>

                      <div className={`flex items-center gap-1.5 text-xs font-medium mt-1 line-clamp-1 flex-wrap ${
                        isLight ? 'text-stone-600' : 'text-orange-200/80'
                      }`}>
                        <span className={`font-semibold ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`}>
                          {song.artist || song.singer || 'श्री गणेश भक्ती'}
                        </span>
                        {song.movieOrAlbum && (
                          <>
                            <span className={isLight ? 'text-stone-400' : 'text-orange-500/50'}>•</span>
                            <span className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-orange-200/70'}`}>🎬 {song.movieOrAlbum}</span>
                          </>
                        )}
                      </div>

                      {song.vibe && (
                        <p className={`text-[11px] line-clamp-2 mt-1.5 italic p-1.5 rounded-lg border ${
                          isLight
                            ? 'text-stone-600 bg-stone-100/80 border-stone-200'
                            : 'text-amber-200/80 bg-amber-500/10 border-amber-500/15'
                        }`}>
                          "{song.vibe}"
                        </p>
                      )}

                      {song.message && (
                        <p className={`text-[11px] italic line-clamp-1 mt-1 ${isLight ? 'text-rose-700' : 'text-rose-300/90'}`}>
                          "{song.message}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Like Button */}
                    <div className={`pt-2 border-t flex items-center justify-between text-xs ${
                      isLight ? 'border-[#CC5500]/15' : 'border-amber-500/15'
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isLight
                          ? 'text-[#CC5500] bg-[#CC5500]/10 border-[#CC5500]/25'
                          : 'text-amber-400/90 bg-amber-500/15 border-amber-400/20'
                      }`}>
                        {song.category}
                      </span>

                      <button
                        onClick={(e) => handleLike(e, song)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-all cursor-pointer ${
                          isLiked
                            ? isLight
                              ? 'text-red-600 font-bold bg-red-100'
                              : 'text-red-400 font-bold bg-red-500/15'
                            : isLight
                              ? 'text-stone-500 hover:text-[#CC5500] hover:bg-[#F5F5DC]'
                              : 'text-orange-200/60 hover:text-white hover:bg-orange-950/40'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-[11px]">{song.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SUGGEST A SONG MODAL (भाविकांसाठी गाणे सुचवा फॉर्म)        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isSuggestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl border p-5 sm:p-7 space-y-4 my-8 shadow-2xl ${
                isLight
                  ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-stone-800 shadow-2xl'
                  : 'border-amber-500/40 bg-gradient-to-b from-orange-950 via-stone-950 to-black text-white shadow-[0_20px_60px_rgba(234,88,12,0.4)]'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSuggestModalOpen(false)}
                className={`absolute top-4 right-4 rounded-full border p-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500] hover:bg-[#FFFDD0]'
                    : 'border-amber-500/30 bg-orange-950/60 text-orange-200 hover:text-white hover:bg-orange-900/60'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-6">
                <div className={`flex items-center gap-2 text-xs font-bold ${
                  isLight ? 'text-[#CC5500]' : 'text-amber-400'
                }`}>
                  <Music className="h-4 w-4" />
                  <span>{t('mandalName')}</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-black ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}>
                  {t('suggestSongTitle')}
                </h3>
                <p className={`text-xs ${
                  isLight ? 'text-stone-600' : 'text-orange-200/70'
                }`}>
                  {t('suggestSongSubtitle')}
                </p>
              </div>

              {submitError && (
                <div className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                  isLight
                    ? 'border-red-400/50 bg-red-50 text-red-800'
                    : 'border-red-500/50 bg-red-950/40 text-red-200'
                }`}>
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSuggestSubmit} className="space-y-3.5">
                {/* Song Title */}
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${
                    isLight ? 'text-stone-800' : 'text-amber-200'
                  }`}>
                    {t('songTitleLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestForm.title}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={t('songTitlePlaceholder')}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-1 focus:ring-[#CC5500]'
                        : 'border-amber-500/30 bg-orange-950/50 text-white placeholder-orange-300/35 focus:border-amber-400'
                    }`}
                  />
                </div>

                {/* Singer & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${
                      isLight ? 'text-stone-800' : 'text-amber-200'
                    }`}>
                      {t('singerLabel')}
                    </label>
                    <input
                      type="text"
                      value={suggestForm.singer}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, singer: e.target.value }))
                      }
                      placeholder={t('singerPlaceholder')}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-1 focus:ring-[#CC5500]'
                          : 'border-amber-500/30 bg-orange-950/50 text-white placeholder-orange-300/35 focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${
                      isLight ? 'text-stone-800' : 'text-amber-200'
                    }`}>
                      {t('songCategoryLabel')}
                    </label>
                    <select
                      value={suggestForm.category}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 focus:border-[#CC5500]'
                          : 'border-amber-500/30 bg-orange-950 text-white focus:border-amber-400'
                      }`}
                    >
                      <option value="aagman">आगमन, ढोल-ताशा व जल्लोष (Aagman & Dhol Tasha)</option>
                      <option value="bhajan">अमर मराठी क्लासिक्स व लोकगीते (Classics & Folk)</option>
                      <option value="aarti">आरती, स्तुती व नित्य प्रार्थना (Aartis & Stutis)</option>
                    </select>
                  </div>
                </div>

                {/* YouTube Link / ID */}
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${
                    isLight ? 'text-stone-800' : 'text-amber-200'
                  }`}>
                    {t('youtubeUrlLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestForm.youtubeUrl}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                    }
                    placeholder={t('youtubeUrlPlaceholder')}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-1 focus:ring-[#CC5500]'
                        : 'border-amber-500/30 bg-orange-950/50 text-white placeholder-orange-300/35 focus:border-amber-400'
                    }`}
                  />
                  <p className={`text-[10px] ${
                    isLight ? 'text-stone-500' : 'text-orange-200/60'
                  }`}>
                    उदा. https://youtu.be/o-0ygW-B_gI किंवा https://www.youtube.com/watch?v=o-0ygW-B_gI
                  </p>
                </div>

                {/* Live YouTube Preview Box */}
                {previewModalYoutubeId && (
                  <div className={`rounded-2xl border p-2.5 space-y-2 ${
                    isLight
                      ? 'border-[#CC5500]/30 bg-[#F5F5DC]'
                      : 'border-amber-500/30 bg-black/60'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>YouTube व्हिडिओ सापडला (Live Preview):</span>
                    </div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-amber-500/20">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${previewModalYoutubeId}?rel=0`}
                        title="Preview"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                )}

                {/* Suggested By & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${
                      isLight ? 'text-stone-800' : 'text-amber-200'
                    }`}>
                      {t('suggestedByLabel')}
                    </label>
                    <input
                      type="text"
                      value={suggestForm.suggestedBy}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, suggestedBy: e.target.value }))
                      }
                      placeholder={t('suggestedByPlaceholder')}
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-1 focus:ring-[#CC5500]'
                          : 'border-amber-500/30 bg-orange-950/50 text-white placeholder-orange-300/35 focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${
                      isLight ? 'text-stone-800' : 'text-amber-200'
                    }`}>
                      {t('phone')} (ऐच्छिक / Optional)
                    </label>
                    <input
                      type="tel"
                      value={suggestForm.phone}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="उदा. 9822******"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-1 focus:ring-[#CC5500]'
                          : 'border-amber-500/30 bg-orange-950/50 text-white placeholder-orange-300/35 focus:border-amber-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${
                    isLight ? 'text-stone-800' : 'text-amber-200'
                  }`}>
                    {t('messageLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={suggestForm.message}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder={t('messagePlaceholder')}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm focus:outline-none ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-1 focus:ring-[#CC5500]'
                        : 'border-amber-500/30 bg-orange-950/50 text-white placeholder-orange-300/35 focus:border-amber-400'
                    }`}
                  />
                </div>

                {/* Approval Notice Banner */}
                <div className={`rounded-xl border p-2.5 text-xs flex items-start gap-2 ${
                  isLight
                    ? 'border-[#CC5500]/30 bg-[#CC5500]/10 text-stone-800'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-200/90'
                }`}>
                  <span className="text-sm">ℹ️</span>
                  <p>
                    {isMarathi
                      ? 'टीप: आपण सुचवलेले गाणे मंडळाच्या पडताळणी व प्रशासक मंजुरीनंतर (Admin Approval) थेट या लाइव्ह प्लेअरमध्ये जोडले जाईल.'
                      : 'Note: Suggested songs will go live in this player upon Mandal Admin verification and approval.'}
                  </p>
                </div>

                {/* Submit CTA */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsSuggestModalOpen(false)}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0] hover:text-[#CC5500]'
                        : 'border-amber-500/30 bg-orange-950/40 text-orange-200 hover:text-white'
                    }`}
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer ${
                      isLight
                        ? 'bg-[#CC5500] hover:bg-[#B7410E] shadow-[#CC5500]/30'
                        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-orange-600/40'
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{isSubmitting ? t('submittingSong') : t('submitSongBtn')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
