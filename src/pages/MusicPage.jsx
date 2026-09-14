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
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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
  const iframeRef = useRef(null);
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
      <header className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/80 via-red-950/70 to-black/90 p-5 sm:p-8 backdrop-blur-2xl shadow-[0_10px_35px_rgba(234,88,12,0.25)] overflow-hidden">
        {/* Festive background accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/20 to-red-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-orange-600/15 to-amber-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>{t('sacredMantra')}</span>
              <span className="text-orange-400">•</span>
              <span>{t('mandalName')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400">
                {t('musicTitle')}
              </span>
              <span className="text-2xl sm:text-3xl">🪔</span>
            </h1>

            <p className="text-xs sm:text-sm text-orange-200/80 max-w-2xl">
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
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all border border-amber-300/40 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('suggestSongBtn')}</span>
            </button>

            <Link
              to="/dakshina"
              className="flex items-center gap-2 rounded-2xl border border-amber-500/35 bg-orange-950/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-orange-900/60 transition-all"
            >
              <Tv className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">{t('liveBoard')}</span>
              <span className="sm:hidden">{t('liveBoardShort')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* THEATER MODE / NOW PLAYING YOUTUBE VIDEO PLAYER           */}
      {/* ========================================================= */}
      <section ref={playerRef} className="space-y-4">
        <ErrorBoundary onReset={fetchSongs}>
          {isLoading ? (
          <div className="rounded-3xl border border-amber-500/35 bg-black/80 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_15px_45px_rgba(234,88,12,0.3)] text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm sm:text-base">
              <Sparkles className="h-5 w-5 animate-spin text-amber-400" />
              <span>{isMarathi ? 'MongoDB मधून भक्ती संगीत थेट लोड होत आहे...' : 'Loading music directly from MongoDB Atlas...'}</span>
            </div>
            <div className="aspect-video max-w-2xl mx-auto rounded-2xl bg-orange-950/20 border border-amber-500/20 flex items-center justify-center animate-pulse">
              <Music className="h-14 w-14 text-amber-500/40 animate-bounce" />
            </div>
          </div>
        ) : activeSong ? (
          <div className="rounded-3xl border border-amber-500/35 bg-black/80 p-3 sm:p-5 backdrop-blur-2xl shadow-[0_15px_45px_rgba(234,88,12,0.3)]">
            {/* Top Status Bar of Player */}
            <div className="flex items-center justify-between gap-2 pb-3 px-1 border-b border-amber-500/20 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                  {t('nowPlaying')}
                </span>
                {activeSong.isSuggestion && (
                  <span className="rounded-full bg-rose-500/20 border border-rose-400/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    {t('catMusicSuggestions')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  title="Shuffle / Random"
                  className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-orange-950/40 px-2.5 py-1 text-[11px] font-bold text-orange-200 hover:text-white transition-all cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
                <button
                  onClick={handleShare}
                  title="Share Song"
                  className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-orange-950/40 px-2.5 py-1 text-[11px] font-bold text-orange-200 hover:text-white transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-amber-400" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied' : t('shareSong')}</span>
                </button>
              </div>
            </div>

            {/* YouTube Responsive Video Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-2xl">
              {activeSong.youtubeId ? (
                <iframe
                  ref={iframeRef}
                  id="ganpati-youtube-iframe"
                  key={activeSong.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${activeSong.youtubeId}?autoplay=1&rel=0&enablejsapi=1&playsinline=1`}
                  title={activeSong.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                  onLoad={handleIframeLoad}
                  onError={(err) => console.warn('YouTube iframe load error:', err)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black/90 text-amber-300 p-6 text-center">
                  <AlertCircle className="h-10 w-10 text-amber-400" />
                  <p className="font-bold text-sm">व्हिडिओ उपलब्ध नाही किंवा लिंक बदलली आहे</p>
                  <button
                    type="button"
                    onClick={handleNextSong}
                    className="flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-400/40 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    <SkipForward className="h-4 w-4" />
                    <span>पुढील गाणे लावा (Next Song)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Player Metadata & Control Row */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                    {activeSong.title}
                  </h2>
                  <span className="rounded-md bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black text-amber-300 shrink-0 uppercase">
                    {activeSong.category}
                  </span>
                  {activeSong.movieOrAlbum && (
                    <span className="rounded-md bg-orange-950/80 border border-orange-500/35 px-2 py-0.5 text-[10px] font-bold text-amber-200 shrink-0">
                      🎬 {activeSong.movieOrAlbum}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-xs text-orange-200/80 flex-wrap">
                  <span className="font-semibold text-amber-300">
                    {activeSong.artist || activeSong.singer || 'श्री गणेश भक्ती'}
                  </span>
                  <span>•</span>
                  <span className="text-orange-300/80">{activeSong.duration || 'Special Track'}</span>
                  {activeSong.suggestedBy && (
                    <>
                      <span>•</span>
                      <span className="text-rose-300 font-bold flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {t('suggestedByDevotee')} {activeSong.suggestedBy}
                      </span>
                    </>
                  )}
                </div>

                {activeSong.vibe && (
                  <p className="text-xs text-amber-200/90 font-medium pt-0.5 flex items-start gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="italic"><strong className="text-amber-400 not-italic">Vibe:</strong> {activeSong.vibe}</span>
                  </p>
                )}

                {activeSong.message && (
                  <p className="text-xs italic text-orange-200/70 pt-0.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3 text-amber-400 shrink-0" />
                    "{activeSong.message}"
                  </p>
                )}
              </div>

              {/* Controls Row with Autoplay Toggle */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Autoplay Next Song Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAutoPlayNext((prev) => {
                      const next = !prev;
                      showToast(
                        next
                          ? (isMarathi ? 'ऑटो-प्ले चालू (गाणे संपल्यावर पुढील गाणे आपोआप सुरू होईल 🎶)' : 'Autoplay ON - Next song will play automatically')
                          : (isMarathi ? 'ऑटो-प्ले बंद' : 'Autoplay OFF')
                      );
                      return next;
                    });
                  }}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    autoPlayNext
                      ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300 shadow-sm shadow-emerald-900/40 ring-1 ring-emerald-400/40'
                      : 'border-amber-500/25 bg-orange-950/40 text-orange-200/60 hover:text-white'
                  }`}
                  title={autoPlayNext ? 'ऑटो-प्ले चालू (गाणे संपल्यावर पुढील गाणे आपोआप सुरू होईल)' : 'ऑटो-प्ले बंद करा'}
                >
                  <Radio className={`h-3.5 w-3.5 ${autoPlayNext ? 'text-emerald-400 animate-pulse' : ''}`} />
                  <span className="hidden xs:inline">
                    {autoPlayNext
                      ? (isMarathi ? 'अखंड संगीत (Auto Next)' : 'Auto Next ON')
                      : (isMarathi ? 'ऑटो-प्ले बंद' : 'Auto Next OFF')}
                  </span>
                </button>

                <button
                  onClick={handlePrevSong}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-orange-950/50 text-amber-300 hover:bg-orange-900/60 transition-all cursor-pointer"
                  title="मागील गाणे (Previous)"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  onClick={handleShuffle}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-orange-950/50 text-amber-300 hover:bg-orange-900/60 transition-all cursor-pointer"
                  title="यादृच्छिक गाणे (Shuffle)"
                >
                  <Shuffle className="h-4 w-4" />
                </button>

                <button
                  onClick={handleNextSong}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-orange-950/50 text-amber-300 hover:bg-orange-900/60 transition-all cursor-pointer"
                  title="पुढील गाणे (Next)"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => handleLike(e, activeSong)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    likedSongIds.includes(activeSong.id || activeSong._id)
                      ? 'border-red-500/50 bg-red-600/25 text-red-300 shadow-md shadow-red-600/30'
                      : 'border-amber-500/30 bg-orange-950/50 text-orange-200 hover:text-white'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      likedSongIds.includes(activeSong.id || activeSong._id) ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  <span>{activeSong.likes || 0}</span>
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${activeSong.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/50 px-3 py-2 text-xs font-bold text-red-200 transition-all cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('openInYoutube')}</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-amber-500/35 bg-black/80 p-8 text-center text-orange-200 backdrop-blur-2xl">
            <Music className="mx-auto h-12 w-12 text-amber-400/50 mb-2" />
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
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-orange-600/35 border border-amber-300 scale-105'
                    : 'border border-amber-500/25 bg-orange-950/40 text-orange-200/80 hover:bg-orange-900/40 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive ? 'bg-black/40 text-amber-200' : 'bg-amber-500/20 text-amber-300'
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-300/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchSongsPlaceholder')}
            className="w-full rounded-2xl border border-amber-500/30 bg-orange-950/40 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-orange-300/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-300/70 hover:text-white"
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
        <div className="flex items-center justify-between text-xs text-orange-200/70 px-1 font-bold">
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
                className="rounded-2xl border border-amber-500/20 bg-orange-950/30 p-3.5 space-y-3 animate-pulse"
              >
                <div className="aspect-video w-full rounded-xl bg-orange-950/60" />
                <div className="h-4 w-3/4 bg-amber-500/20 rounded" />
                <div className="h-3 w-1/2 bg-amber-500/10 rounded" />
                <div className="h-3 w-1/4 bg-amber-500/10 rounded" />
              </div>
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="rounded-3xl border border-amber-500/20 bg-orange-950/20 p-12 text-center backdrop-blur-xl">
            <Music className="mx-auto h-12 w-12 text-orange-400/40 mb-3" />
            <p className="font-bold text-orange-200">{t('noSongsFound')}</p>
            <p className="text-xs text-orange-200/60 mt-1">
              आपले आवडते गाणे मंडळाला सुचवण्यासाठी खालील बटणावर क्लिक करा:
            </p>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
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
                      ? 'border-amber-400 bg-gradient-to-b from-orange-950/90 via-red-950/80 to-black/95 shadow-[0_8px_30px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/50'
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
                            : 'bg-black/60 text-white group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black'
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
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {song.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-orange-200/80 font-medium mt-1 line-clamp-1 flex-wrap">
                        <span className="text-amber-400 font-semibold">{song.artist || song.singer || 'श्री गणेश भक्ती'}</span>
                        {song.movieOrAlbum && (
                          <>
                            <span className="text-orange-500/50">•</span>
                            <span className="text-orange-200/70 text-[11px]">🎬 {song.movieOrAlbum}</span>
                          </>
                        )}
                      </div>

                      {song.vibe && (
                        <p className="text-[11px] text-amber-200/80 line-clamp-2 mt-1.5 italic bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/15">
                          "{song.vibe}"
                        </p>
                      )}

                      {song.message && (
                        <p className="text-[11px] text-rose-300/90 italic line-clamp-1 mt-1">
                          "{song.message}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Like Button */}
                    <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/20">
                        {song.category}
                      </span>

                      <button
                        onClick={(e) => handleLike(e, song)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-all cursor-pointer ${
                          isLiked
                            ? 'text-red-400 font-bold bg-red-500/15'
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
              className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-gradient-to-b from-orange-950 via-stone-950 to-black p-5 sm:p-7 shadow-[0_20px_60px_rgba(234,88,12,0.4)] space-y-4 my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSuggestModalOpen(false)}
                className="absolute top-4 right-4 rounded-full border border-amber-500/30 bg-orange-950/60 p-1.5 text-orange-200 hover:text-white hover:bg-orange-900/60 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Music className="h-4 w-4" />
                  <span>{t('mandalName')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t('suggestSongTitle')}
                </h3>
                <p className="text-xs text-orange-200/70">
                  {t('suggestSongSubtitle')}
                </p>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSuggestSubmit} className="space-y-3.5">
                {/* Song Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-200">
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
                    className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Singer & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('singerLabel')}
                    </label>
                    <input
                      type="text"
                      value={suggestForm.singer}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, singer: e.target.value }))
                      }
                      placeholder={t('singerPlaceholder')}
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('songCategoryLabel')}
                    </label>
                    <select
                      value={suggestForm.category}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="aagman">आगमन, ढोल-ताशा व जल्लोष (Aagman & Dhol Tasha)</option>
                      <option value="bhajan">अमर मराठी क्लासिक्स व लोकगीते (Classics & Folk)</option>
                      <option value="aarti">आरती, स्तुती व नित्य प्रार्थना (Aartis & Stutis)</option>
                    </select>
                  </div>
                </div>

                {/* YouTube Link / ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-200">
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
                    className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-orange-200/60">
                    उदा. https://youtu.be/o-0ygW-B_gI किंवा https://www.youtube.com/watch?v=o-0ygW-B_gI
                  </p>
                </div>

                {/* Live YouTube Preview Box */}
                {previewModalYoutubeId && (
                  <div className="rounded-2xl border border-amber-500/30 bg-black/60 p-2.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
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
                    <label className="text-xs font-bold text-amber-200">
                      {t('suggestedByLabel')}
                    </label>
                    <input
                      type="text"
                      value={suggestForm.suggestedBy}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, suggestedBy: e.target.value }))
                      }
                      placeholder={t('suggestedByPlaceholder')}
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('phone')} (ऐच्छिक / Optional)
                    </label>
                    <input
                      type="tel"
                      value={suggestForm.phone}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="उदा. 9822******"
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-200">
                    {t('messageLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={suggestForm.message}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder={t('messagePlaceholder')}
                    className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Approval Notice Banner */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200/90 flex items-start gap-2">
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
                    className="rounded-xl border border-amber-500/30 bg-orange-950/40 px-4 py-2 text-xs font-bold text-orange-200 hover:text-white transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-orange-600/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
