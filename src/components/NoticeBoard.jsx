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
import { useTheme } from '../context/ThemeContext';
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
  const { isLight, isRoyal, isGold, isMidnight } = useTheme();
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
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-8 backdrop-blur-2xl space-y-6 transition-colors ${
        isLight
          ? 'border border-[#CC5500]/30 bg-[#FFFDD0]/80 shadow-[0_16px_50px_0_rgba(204,85,0,0.12)] text-[#2B2B2B]'
          : isRoyal
          ? 'border-2 border-rose-500/35 bg-gradient-to-br from-[#24070e]/85 via-[#180408]/85 to-black/90 shadow-[0_16px_50px_0_rgba(225,29,72,0.25)] text-rose-50'
          : isGold
          ? 'border-2 border-yellow-500/35 bg-gradient-to-br from-[#1c1304]/85 via-[#120b02]/85 to-black/90 shadow-[0_16px_50px_0_rgba(234,179,8,0.25)] text-amber-50'
          : 'border-2 border-amber-500/35 bg-gradient-to-br from-orange-950/80 via-amber-950/40 to-black/90 shadow-[0_16px_50px_0_rgba(234,88,12,0.22)] text-amber-50'
      }`}
    >
      {/* Festive ambient background glow */}
      <div
        className={`pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl ${
          isLight
            ? 'bg-[#CC5500]/10'
            : isRoyal
            ? 'bg-rose-500/20'
            : isGold
            ? 'bg-yellow-500/20'
            : 'bg-amber-500/20'
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl ${
          isLight
            ? 'bg-[#B7410E]/10'
            : isRoyal
            ? 'bg-amber-500/15'
            : isGold
            ? 'bg-amber-600/15'
            : 'bg-red-600/20'
        }`}
      />

      {/* Header Bar */}
      <div
        className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b ${
          isLight
            ? 'border-[#CC5500]/20'
            : isRoyal
            ? 'border-rose-500/20'
            : isGold
            ? 'border-yellow-500/20'
            : 'border-amber-500/20'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-black shadow-inner ${
                isLight
                  ? 'border-[#CC5500]/40 bg-[#CC5500]/10 text-[#CC5500]'
                  : isRoyal
                  ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                  : isGold
                  ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
                  : 'border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300'
              }`}
            >
              <Megaphone className={`h-3.5 w-3.5 animate-bounce ${isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-300' : isGold ? 'text-yellow-300' : 'text-amber-400'}`} />
              <span>{t('noticeBoardBadge')}</span>
            </span>

            {notices.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black shadow ${
                  isLight
                    ? 'bg-[#CC5500] text-[#FFFDD0]'
                    : isRoyal
                    ? 'bg-rose-600 text-amber-100'
                    : isGold
                    ? 'bg-yellow-400 text-stone-950'
                    : 'bg-amber-400 text-black'
                }`}
              >
                <span>{notices.length}</span>
                <span className="hidden sm:inline">{t('activeNotice')}</span>
              </span>
            )}
          </div>

          <h3
            className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 ${
              isLight
                ? 'text-stone-900'
                : isRoyal
                ? 'text-rose-100'
                : isGold
                ? 'text-yellow-100'
                : 'text-white'
            }`}
          >
            <span>🪔</span>
            <span
              className={
                isLight
                  ? 'text-[#CC5500]'
                  : isRoyal
                  ? 'bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 bg-clip-text text-transparent'
                  : isGold
                  ? 'bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent'
              }
            >
              {t('noticeBoardTitle')}
            </span>
          </h3>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-stone-600' : isRoyal ? 'text-rose-200/80' : isGold ? 'text-yellow-200/80' : 'text-orange-200/80'}`}>
            {t('noticeBoardSubtitle')}
          </p>
        </div>

        {/* Action Link for Admin */}
        {isAdmin && (
          <Link
            to="/admin?tab=notices"
            className={`self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-[#CC5500] text-[#FFFDD0] hover:bg-[#B7410E]'
                : isRoyal
                ? 'bg-gradient-to-r from-rose-700 to-red-600 text-amber-100 hover:brightness-110'
                : isGold
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black hover:brightness-110'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:brightness-110'
            }`}
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
              ? isLight
                ? 'bg-[#CC5500] text-[#FFFDD0] shadow-md'
                : isRoyal
                ? 'bg-rose-600 text-amber-100 shadow-md'
                : isGold
                ? 'bg-yellow-400 text-stone-950 font-black shadow-md'
                : 'bg-amber-400 text-black shadow-md'
              : isLight
              ? 'border border-[#CC5500]/25 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500]'
              : isRoyal
              ? 'border border-rose-500/30 bg-[#25070e]/60 text-rose-200/80 hover:bg-rose-950/70 hover:text-white'
              : isGold
              ? 'border border-yellow-500/30 bg-[#1e1405]/60 text-yellow-200/80 hover:bg-yellow-950/70 hover:text-yellow-100'
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
              : isLight
              ? 'border border-red-500/30 bg-red-100 text-red-800 hover:bg-red-200'
              : 'border border-red-500/30 bg-red-950/30 text-red-200/80 hover:bg-red-950/60'
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          <span>{t('urgentNotices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('event')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'event'
              ? isLight
                ? 'bg-[#B7410E] text-[#FFFDD0] shadow-md'
                : isRoyal
                ? 'bg-rose-600 text-amber-100 shadow-md'
                : isGold
                ? 'bg-yellow-500 text-stone-950 font-black shadow-md'
                : 'bg-amber-500 text-black shadow-md'
              : isLight
              ? 'border border-[#CC5500]/25 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500]'
              : isRoyal
              ? 'border border-rose-500/25 bg-[#25070e]/50 text-rose-200/80 hover:bg-rose-950/60'
              : isGold
              ? 'border border-yellow-500/25 bg-[#1e1405]/50 text-yellow-200/80 hover:bg-yellow-950/60'
              : 'border border-amber-500/25 bg-black/40 text-orange-200/80 hover:bg-orange-950/40'
          }`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-300' : isGold ? 'text-yellow-300' : 'text-amber-300'}`} />
          <span>{t('eventNotices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('prasad')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'prasad'
              ? 'bg-emerald-600 text-white shadow-md'
              : isLight
              ? 'border border-emerald-500/30 bg-emerald-100 text-emerald-800'
              : isRoyal
              ? 'border border-emerald-500/30 bg-[#25070e]/40 text-emerald-200/80 hover:bg-emerald-950/30'
              : isGold
              ? 'border border-emerald-500/30 bg-[#1e1405]/40 text-emerald-200/80 hover:bg-emerald-950/30'
              : 'border border-emerald-500/25 bg-black/40 text-emerald-200/80 hover:bg-emerald-950/40'
          }`}
        >
          <Utensils className="h-3.5 w-3.5 text-emerald-500" />
          <span>{t('prasadNotices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('general')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'general'
              ? isLight
                ? 'bg-[#CC5500] text-[#FFFDD0] shadow-md'
                : isRoyal
                ? 'bg-rose-700 text-rose-100 shadow-md'
                : isGold
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-orange-500 text-black shadow-md'
              : isLight
              ? 'border border-[#CC5500]/25 bg-[#F5F5DC] text-stone-700 hover:text-[#CC5500]'
              : isRoyal
              ? 'border border-rose-500/25 bg-[#25070e]/50 text-rose-200/80 hover:bg-rose-950/60'
              : isGold
              ? 'border border-yellow-500/25 bg-[#1e1405]/50 text-yellow-200/80 hover:bg-yellow-950/60'
              : 'border border-orange-500/25 bg-black/40 text-orange-200/80 hover:bg-orange-950/40'
          }`}
        >
          <Megaphone className={`h-3.5 w-3.5 ${isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-400' : isGold ? 'text-yellow-400' : 'text-orange-400'}`} />
          <span>{isMarathi ? 'सामान्य' : 'General'}</span>
        </button>
      </div>

      {/* Notices Feed */}
      <div className="relative z-10 space-y-3.5">
        {isLoading ? (
          <div
            className={`py-12 text-center text-xs sm:text-sm font-semibold animate-pulse ${
              isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-300' : isGold ? 'text-yellow-400' : 'text-orange-200/60'
            }`}
          >
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
                    className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl space-y-3 transition-all flex flex-col justify-between ${
                      isLight
                        ? isUrgent
                          ? 'border-red-500/40 bg-red-50/90 text-[#2B2B2B] shadow-md shadow-red-500/10'
                          : 'border-[#CC5500]/25 bg-[#F5F5DC]/85 text-[#2B2B2B] shadow-[0_4px_20px_rgba(204,85,0,0.06)] hover:border-[#CC5500]/50 hover:bg-[#FFFDD0]'
                        : isRoyal
                        ? isUrgent
                          ? 'border-red-500/50 bg-gradient-to-br from-red-950/60 via-[#20060c] to-black shadow-lg shadow-red-950/40 text-rose-50'
                          : 'border-rose-500/30 bg-gradient-to-br from-[#2a0710]/70 via-[#190408]/80 to-black/90 shadow-md text-rose-50 hover:border-rose-400/60'
                        : isGold
                        ? isUrgent
                          ? 'border-red-500/50 bg-gradient-to-br from-red-950/60 via-[#1c1203] to-black shadow-lg shadow-red-950/40 text-amber-50'
                          : 'border-yellow-500/30 bg-gradient-to-br from-[#241804]/70 via-[#140c02]/80 to-black/90 shadow-md text-amber-50 hover:border-yellow-400/60'
                        : isUrgent
                        ? 'border-red-500/50 bg-gradient-to-br from-red-950/50 via-zinc-950/90 to-black shadow-lg shadow-red-950/40'
                        : 'border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-zinc-950/80 to-black shadow-md hover:border-amber-400/50'
                    }`}
                  >
                    {/* Top Meta Line: Category Badge + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold ${
                            isLight
                              ? 'bg-[#CC5500]/15 text-[#CC5500] border border-[#CC5500]/30'
                              : isRoyal
                              ? 'bg-rose-950/70 text-rose-200 border border-rose-500/40'
                              : isGold
                              ? 'bg-yellow-950/70 text-yellow-300 border border-yellow-500/40'
                              : conf.badgeClass
                          }`}
                        >
                          <IconComponent className={`h-3 w-3 ${isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-300' : isGold ? 'text-yellow-400' : conf.iconColor}`} />
                          <span>{isMarathi ? conf.labelMr : conf.labelEn}</span>
                        </span>

                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black bg-red-600 text-white uppercase animate-pulse">
                            <span>महत्त्वाची</span>
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-[11px] font-medium ${
                          isLight ? 'text-stone-500' : isRoyal ? 'text-rose-200/60' : isGold ? 'text-yellow-200/60' : 'text-orange-200/60'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formattedDate}, {formattedTime}</span>
                      </div>
                    </div>

                    {/* Notice Title */}
                    <div className="space-y-1.5">
                      <h4
                        className={`text-base sm:text-lg font-black leading-snug tracking-tight ${
                          isLight ? 'text-stone-900' : isRoyal ? 'text-rose-100' : isGold ? 'text-yellow-100' : 'text-white'
                        }`}
                      >
                        {notice.title}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
                          isLight ? 'text-stone-700' : isRoyal ? 'text-rose-200/85' : isGold ? 'text-amber-200/85' : 'text-orange-200/85'
                        }`}
                      >
                        {notice.content}
                      </p>
                    </div>

                    {/* Bottom Mandal Authority Signature */}
                    <div
                      className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                        isLight
                          ? 'border-[#CC5500]/20 text-[#CC5500]'
                          : isRoyal
                          ? 'border-rose-500/20 text-rose-300/80'
                          : isGold
                          ? 'border-yellow-500/20 text-yellow-400/80'
                          : 'border-amber-500/15 text-amber-300/80'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        <span>{notice.postedBy || (isMarathi ? 'श्री बाल गणेश मंडळ व्यवस्थापक' : 'Shri Baal Ganesh Mandal Admin')}</span>
                      </div>
                      <span className={isLight ? 'text-stone-500 font-serif' : isRoyal ? 'text-rose-300/60 font-serif' : isGold ? 'text-yellow-400/60 font-serif' : 'text-orange-200/50 font-serif'}>
                        ॥ बाप्पा मोरया ॥
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className={`py-12 text-center rounded-2xl border border-dashed space-y-2 ${
            isLight
              ? 'border-[#CC5500]/25 bg-[#F5F5DC]/50 text-stone-600'
              : isRoyal
              ? 'border-rose-500/25 bg-[#1f050c]/50 text-rose-200/70'
              : isGold
              ? 'border-yellow-500/25 bg-[#170e03]/50 text-yellow-200/70'
              : 'border-amber-500/25 bg-black/40 text-orange-200/70'
          }`}>
            <Bell className={`h-8 w-8 mx-auto ${
              isLight ? 'text-[#CC5500]/50' : isRoyal ? 'text-rose-400/50' : isGold ? 'text-yellow-400/50' : 'text-amber-400/40'
            }`} />
            <p className="text-xs sm:text-sm font-semibold">
              {t('noNoticesYet')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
