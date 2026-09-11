import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecentDonorsList({ donors = [] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "सर्व देणगीदार (All)" },
    { id: "prasad", label: "महाप्रसाद सेवा" },
    { id: "aarti", label: "आरती / दीप सेवा" },
    { id: "vip", label: "विशेष सेवा (>₹१०,०००)" }
  ];

  const filteredDonors = donors.filter(donor => {
    // Search filter
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          donor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          donor.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "all") return true;
    if (activeTab === "prasad") return donor.category.includes("महाप्रसाद");
    if (activeTab === "aarti") return donor.category.includes("आरती") || donor.category.includes("दीप");
    if (activeTab === "vip") return donor.amount >= 10000;
    return true;
  });

  return (
    <section id="recent-donors" className="relative w-full space-y-5">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              थेट देणगीदार व सेवा यादी (Live Recent Donors)
            </h2>
          </div>
          <p className="text-xs md:text-sm text-orange-200/70 mt-1">
            गणपती बाप्पाच्या चरणी अर्पण केलेल्या सेवांचे थेट अद्यतन (Real-time Live Updates)
          </p>
        </div>

        {/* Search input with glass styling */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="नाव किंवा शहर शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-amber-500/30 bg-orange-950/40 px-4 py-2 text-xs md:text-sm text-white placeholder-orange-300/40 backdrop-blur-md outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
          />
          <span className="absolute right-3.5 top-2.5 text-xs text-orange-300/60">
            🔍
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-orange-500/20 pb-3">
        {categories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/30 ring-1 ring-amber-300/50"
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
          {filteredDonors.length > 0 ? (
            filteredDonors.map((donor) => {
              const isJustNow = donor.time && donor.time.includes("Just now");
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
                    isJustNow 
                      ? "border-amber-400 bg-gradient-to-br from-amber-950/50 via-orange-950/40 to-black/70 ring-1 ring-amber-400/50" 
                      : "border-amber-500/25 bg-gradient-to-br from-orange-950/35 via-red-950/25 to-black/60"
                  } p-4 md:p-5 backdrop-blur-xl shadow-lg transition-all hover:border-amber-400/50 hover:shadow-orange-600/20`}
                >
                  {/* Subtle sheen highlight on hover */}
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-transparent via-amber-400/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    {/* Avatar & Devotee Info */}
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 via-orange-600/20 to-red-600/30 border border-amber-400/30 text-xl shadow-inner">
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
                          <h3 className="font-bold text-sm md:text-base text-white group-hover:text-amber-200 transition-colors">
                            {donor.name}
                          </h3>
                          {isJustNow && (
                            <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 animate-pulse">
                              नवीन!
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-orange-200/70 mt-0.5">
                          <span>📍 {donor.city}</span>
                          <span>•</span>
                          <span className="text-[11px] text-orange-300/60">{donor.time}</span>
                        </div>
                        <p className="text-[11px] text-amber-300/80 italic mt-1.5 flex items-center gap-1">
                          <span>✨</span>
                          <span>{donor.blessing}</span>
                        </p>
                      </div>
                    </div>

                    {/* Amount & Badge */}
                    <div className="flex flex-col items-end gap-1.5 text-right">
                      <div className="text-base md:text-lg font-black text-amber-300 drop-shadow-sm">
                        ₹{donor.amount.toLocaleString()}
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-md ${donor.badgeColor || "border-amber-400/40 bg-amber-500/20 text-amber-200"}`}>
                        {donor.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-orange-500/30 bg-orange-950/20">
              <p className="text-orange-200/60 text-sm">कोणतेही देणगीदार आढळले नाहीत (No donors matched your search)</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
