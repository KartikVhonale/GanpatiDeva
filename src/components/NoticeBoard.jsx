import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Bell, 
  AlertCircle, 
  Calendar, 
  Utensils, 
  Sparkles, 
  Megaphone, 
  PlusCircle, 
  Clock, 
  Pin,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CATEGORY_CONFIG = {
  urgent: {
    labelMr: 'अत्यंत महत्त्वाची सूचना',
    labelEn: 'Urgent Notice',
    badgeClass: 'border-red-500/50 bg-red-950/60 text-red-200 ring-1 ring-red-500/40',
    icon: AlertCircle,
    iconColor: 'text-red-400 animate-pulse',
    accentBg: 'from-red-950/40 to-black/60',
  },
  event: {
    labelMr: 'कार्यक्रम व उत्सव',
    labelEn: 'Event & Celebration',
    badgeClass: 'border-amber-400/50 bg-amber-950/50 text-amber-200 ring-1 ring-amber-400/30',
    icon: Sparkles,
    iconColor: 'text-amber-300',
    accentBg: 'from-amber-950/30 to-black/60',
  },
  prasad: {
    labelMr: 'महाप्रसाद व अन्नदान',
    labelEn: 'Maha Prasad',
    badgeClass: 'border-emerald-400/50 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-400/30',
    icon: Utensils,
    iconColor: 'text-emerald-300',
    accentBg: 'from-emerald-950/30 to-black/60',
  },
  aarti: {
    labelMr: 'आरती व दर्शन',
    labelEn: 'Aarti & Darshan',
    badgeClass: 'border-purple-400/50 bg-purple-950/50 text-purple-200 ring-1 ring-purple-400/30',
    icon: Bell,
    iconColor: 'text-purple-300',
    accentBg: 'from-purple-950/30 to-black/60',
  },
  general: {
    labelMr: 'सर्वसाधारण सूचना',
    labelEn: 'General Announcement',
    badgeClass: 'border-orange-500/40 bg-orange-950/40 text-orange-200 ring-1 ring-orange-500/20',
    icon: Megaphone,
    iconColor: 'text-orange-400',
    accentBg: 'from-orange-950/20 to-black/60',
  },
};

export default function NoticeBoard() {
  const { t, isMarathi } = useLanguage();
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch public notices from backend
  const fetchNotices = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notices`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.notices)) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.warn('Could not fetch notices:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and real-time Socket.io listener
  useEffect(() => {
    fetchNotices();

    let socket;
    try {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      socket.on('notices_updated', (data) => {
        if (data && Array.isArray(data.notices)) {
          setNotices(data.notices);
        } else {
          fetchNotices();
        }
      });
    } catch (err) {
      console.warn('Socket connection error in NoticeBoard:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [fetchNotices]);

  // Filtered list
  const filteredNotices = notices.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'urgent') return n.priority === 'high' || n.category === 'urgent';
    if (activeFilter === 'event') return n.category === 'event';
    if (activeFilter === 'prasad') return n.category === 'prasad' || n.category === 'aarti';
    if (activeFilter === 'general') return n.category === 'general';
    return true;
  });

  return (
    <section 
      id="notice-board"
      className="relative overflow-hidden rounded-3xl border-2 border-amber-500/35 bg-gradient-to-br from-orange-950/80 via-amber-950/40 to-black/90 p-5 sm:p-8 backdrop-blur-2xl shadow-[0_16px_50px_0_rgba(234,88,12,0.22)] space-y-6"
    >
      {/* Festive ambient background glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-red-600/20 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-0.5 text-xs font-black text-amber-300 shadow-inner">
              <Megaphone className="h-3.5 w-3.5 animate-bounce text-amber-400" />
              <span>{t('noticeBoardBadge')}</span>
            </span>

            {notices.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-black px-2 py-0.5 text-[11px] font-black shadow">
                <span>{notices.length}</span>
                <span className="hidden sm:inline">{t('activeNotice')}</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🪔</span>
            <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
              {t('noticeBoardTitle')}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-orange-200/80">
            {t('noticeBoardSubtitle')}
          </p>
        </div>

        {/* Action Link for Admin */}
        {isAdmin && (
          <Link
            to="/admin?tab=notices"
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            title="नवीन सूचना तयार करा किंवा संपादित करा"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t('addNewNotice')}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-amber-400 text-black shadow-md'
              : 'border border-amber-500/25 bg-black/40 text-orange-200/80 hover:bg-orange-950/40 hover:text-white'
          }`}
        >
          {t('allNotices')} ({notices.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('urgent')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'urgent'
              ? 'bg-red-600 text-white shadow-md'
              : 'border border-red-500/30 bg-red-950/30 text-red-200/80 hover:bg-red-950/60'
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          <span>{t('urgentNotices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('event')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'event'
              ? 'bg-amber-500 text-black shadow-md'
              : 'border border-amber-500/25 bg-black/40 text-orange-200/80 hover:bg-orange-950/40'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>{t('eventNotices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('prasad')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'prasad'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-emerald-500/25 bg-black/40 text-emerald-200/80 hover:bg-emerald-950/40'
          }`}
        >
          <Utensils className="h-3.5 w-3.5 text-emerald-400" />
          <span>{t('prasadNotices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('general')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'general'
              ? 'bg-orange-500 text-black shadow-md'
              : 'border border-orange-500/25 bg-black/40 text-orange-200/80 hover:bg-orange-950/40'
          }`}
        >
          <Megaphone className="h-3.5 w-3.5 text-orange-400" />
          <span>{isMarathi ? 'सामान्य' : 'General'}</span>
        </button>
      </div>

      {/* Notices Feed */}
      <div className="relative z-10 space-y-3.5">
        {isLoading ? (
          <div className="py-12 text-center text-xs sm:text-sm text-orange-200/60 font-semibold animate-pulse">
            🪔 {t('loading')}
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredNotices.map((notice, idx) => {
                const conf = CATEGORY_CONFIG[notice.category] || CATEGORY_CONFIG.general;
                const IconComponent = conf.icon;
                const isUrgent = notice.priority === 'high' || notice.category === 'urgent';
                const createdDate = notice.createdAt ? new Date(notice.createdAt) : new Date();
                const formattedDate = createdDate.toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = createdDate.toLocaleTimeString(isMarathi ? 'mr-IN' : 'en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={notice._id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className={`relative overflow-hidden rounded-2xl border ${
                      isUrgent 
                        ? 'border-red-500/50 bg-gradient-to-br from-red-950/50 via-zinc-950/90 to-black p-5 shadow-lg shadow-red-950/40' 
                        : 'border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-zinc-950/80 to-black p-5 shadow-md hover:border-amber-400/50'
                    } backdrop-blur-xl space-y-3 transition-all flex flex-col justify-between`}
                  >
                    {/* Top Meta Line: Category Badge + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold ${conf.badgeClass}`}>
                          <IconComponent className={`h-3 w-3 ${conf.iconColor}`} />
                          <span>{isMarathi ? conf.labelMr : conf.labelEn}</span>
                        </span>

                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black bg-red-600 text-white uppercase animate-pulse">
                            <span>महत्त्वाची</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-orange-200/60 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{formattedDate}, {formattedTime}</span>
                      </div>
                    </div>

                    {/* Notice Title */}
                    <div className="space-y-1.5">
                      <h4 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
                        {notice.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-orange-200/85 leading-relaxed whitespace-pre-line font-medium">
                        {notice.content}
                      </p>
                    </div>

                    {/* Bottom Mandal Authority Signature */}
                    <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-amber-300/80">
                      <div className="flex items-center gap-1">
                        <Pin className="h-3 w-3 text-amber-400" />
                        <span>{notice.postedBy || (isMarathi ? 'श्री बाल गणेश मंडळ व्यवस्थापक' : 'Shri Baal Ganesh Mandal Admin')}</span>
                      </div>
                      <span className="text-orange-200/50 font-serif">॥ बाप्पा मोरया ॥</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-dashed border-amber-500/25 bg-black/40 space-y-2">
            <Bell className="h-8 w-8 text-amber-400/40 mx-auto" />
            <p className="text-xs sm:text-sm text-orange-200/70 font-semibold">
              {t('noNoticesYet')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
