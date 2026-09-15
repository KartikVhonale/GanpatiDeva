import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useDonations from '../hooks/useDonations';

export default function RecentDonorsList({ donors = [] }) {
  const { t, lang } = useLanguage();
  const { isLight } = useTheme();
  const { isAdmin, token } = useAuth();
  const { deleteDonation } = useDonations();
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(30);

  const categories = [
    { id: "all", label: t('allDonorsTab') },
    { id: "prasad", label: t('prasadSevaTab') },
    { id: "aarti", label: t('aartiDeepTab') },
    { id: "vip", label: t('vipSevaTab') },
  ];

  const sortedDonors = useMemo(() => {
    return [...donors].sort(
      (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0) || new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );
  }, [donors]);

  const filteredDonors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedDonors.filter((donor) => {
      // Search filter
      if (query) {
        const matchesSearch =
          (donor.name || '').toLowerCase().includes(query) ||
          (donor.city || '').toLowerCase().includes(query) ||
          (donor.category || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tab filter
      if (activeTab === "all") return true;
      if (activeTab === "prasad")
        return (
          donor.category?.includes("महाप्रसाद") ||
          donor.category?.includes("मोदक") ||
          donor.category?.toLowerCase().includes("prasad")
        );
      if (activeTab === "aarti")
        return (
          donor.category?.includes("आरती") ||
          donor.category?.includes("दीप") ||
          donor.category?.includes("छत्र") ||
          donor.category?.toLowerCase().includes("aarti")
        );
      if (activeTab === "vip") return (Number(donor.amount) || 0) >= 10000;
      return true;
    });
  }, [sortedDonors, searchQuery, activeTab]);

  const visibleDonors = useMemo(() => {
    return filteredDonors.slice(0, displayLimit);
  }, [filteredDonors, displayLimit]);

  return (
    <section id="recent-donors" className="relative w-full space-y-5">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              {t('recentDonorsTitle')}
            </h2>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
              isLight
                ? 'bg-[#CC5500]/10 border-[#CC5500]/30 text-[#CC5500]'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
            }`}>
              {donors.length} {t('devoteesCountSuffix')}
            </span>
          </div>
          <p className={`text-xs md:text-sm mt-1 ${
            isLight ? 'text-stone-600' : 'text-orange-200/70'
          }`}>
            {t('recentDonorsSub')}
          </p>
        </div>

        {/* Search input with glass styling */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder={t('searchDonorsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-full border px-4 py-2 text-xs md:text-sm backdrop-blur-md outline-none transition-all ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500] focus:ring-2 focus:ring-[#CC5500]/20'
                : 'border-amber-500/30 bg-orange-950/40 text-white placeholder-orange-300/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30'
            }`}
          />
          <span className="absolute right-3.5 top-2.5 text-xs text-orange-300/60">
            🔍
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-3 ${
        isLight ? 'border-[#CC5500]/20' : 'border-orange-500/20'
      }`}>
        {categories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? isLight
                  ? "bg-[#CC5500] text-white shadow-md shadow-[#CC5500]/30 ring-1 ring-[#B7410E]"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/30 ring-1 ring-amber-300/50"
                : isLight
                  ? "border border-[#CC5500]/20 bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0] hover:text-[#CC5500]"
                  : "border border-amber-500/20 bg-orange-950/20 text-orange-200/70 hover:bg-orange-900/30 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Donor List Cards with Framer Motion Layout, Entrance & Exit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleDonors.length > 0 ? (
            visibleDonors.map((donor) => {
              const isJustNow = donor.time && (donor.time.includes("Just now") || donor.time.includes("आत्ताच"));
              return (
                <motion.div
                  key={donor.id}
                  layout
                  initial={{ opacity: 0, y: -35, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 35, scale: 0.9, transition: { duration: 0.35 } }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 28 },
                    y: { type: "spring", stiffness: 350, damping: 28 },
                    opacity: { duration: 0.35 }
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`group relative overflow-hidden rounded-2xl border ${
                    isLight
                      ? isJustNow 
                        ? "border-[#CC5500] bg-[#FFFDD0] ring-1 ring-[#CC5500]/50 shadow-md" 
                        : "border-[#CC5500]/20 bg-[#F5F5DC] shadow-sm hover:border-[#CC5500]/40 hover:bg-[#FFFDD0]"
                      : isJustNow 
                        ? "border-amber-400 bg-gradient-to-br from-amber-950/50 via-orange-950/40 to-black/70 ring-1 ring-amber-400/50" 
                        : "border-amber-500/25 bg-gradient-to-br from-orange-950/35 via-red-950/25 to-black/60"
                  } p-4 md:p-5 backdrop-blur-xl shadow-lg transition-all`}
                >
                  {/* Subtle sheen highlight on hover */}
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-transparent via-amber-400/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    {/* Avatar & Devotee Info */}
                    <div className="flex items-start gap-3">
                      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl shadow-inner ${
                        isLight
                          ? 'border-[#CC5500]/25 bg-[#CC5500]/10'
                          : 'border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-orange-600/20 to-red-600/30'
                      }`}>
                        <span>{donor.icon || "🌺"}</span>
                        {isJustNow && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm md:text-base transition-colors ${
                            isLight
                              ? 'text-stone-900 group-hover:text-[#CC5500]'
                              : 'text-white group-hover:text-amber-200'
                          }`}>
                            {donor.name}
                          </h3>
                          {isJustNow && (
                            <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 animate-pulse">
                              {t('newBadge')}
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${
                          isLight ? 'text-stone-600' : 'text-orange-200/70'
                        }`}>
                          <span>📍 {donor.city}</span>
                          <span>•</span>
                          <span className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-orange-300/60'}`}>{donor.time}</span>
                        </div>
                        {donor.blessing && (
                          <p className={`text-[11px] italic mt-1.5 flex items-center gap-1 ${
                            isLight ? 'text-[#CC5500]' : 'text-amber-300/80'
                          }`}>
                            <span>✨</span>
                            <span>{donor.blessing}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Badge */}
                    <div className="flex flex-col items-end gap-1.5 text-right">
                      <div className={`text-base md:text-lg font-black drop-shadow-sm ${
                        isLight ? 'text-[#CC5500]' : 'text-amber-300'
                      }`}>
                        ₹{donor.amount.toLocaleString()}
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-md ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#CC5500]/10 text-[#CC5500]'
                          : (donor.badgeColor || "border-amber-400/40 bg-amber-500/20 text-amber-200")
                      }`}>
                        {donor.category}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          disabled={deletingId === donor.id}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const confirmMsg = lang === 'mr'
                              ? `⚠️ प्रशासक क्रिया: खरोखर ${donor.name} यांची ₹${donor.amount.toLocaleString()} ची देणगी कायमस्वरूपी हटवायची आहे का?\n\nही क्रिया पूर्ववत करता येणार नाही.`
                              : `⚠️ Admin Action: Are you sure you want to permanently delete ${donor.name}'s donation of ₹${donor.amount.toLocaleString()}?\n\nThis cannot be undone.`;
                            if (window.confirm(confirmMsg)) {
                              try {
                                setDeletingId(donor.id);
                                await deleteDonation(donor.id, token);
                              } catch (err) {
                                alert(err.message || t('error'));
                              } finally {
                                setDeletingId(null);
                              }
                            }
                          }}
                          className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 bg-red-950/60 hover:bg-red-700/80 text-red-300 hover:text-white border border-red-500/40 text-[10px] font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
                          title={t('deleteDonationTitle')}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>{deletingId === donor.id ? t('deleting') : t('delete')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className={`col-span-full py-12 text-center rounded-2xl border border-dashed ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-600'
                : 'border-orange-500/30 bg-orange-950/20 text-orange-200/60'
            }`}>
              <p className="text-sm">{t('noDonorsFound')}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Progressive Load More Pagination */}
      {filteredDonors.length > displayLimit && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 30)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition shadow-md cursor-pointer ${
              isLight
                ? 'bg-[#CC5500] hover:bg-[#B7410E] text-[#FFFDD0]'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black'
            }`}
          >
            <span>{lang === 'mr' ? 'आणखी देणगीदार पहा' : 'Load More Devotees'}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
