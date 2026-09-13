import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage, BASE_TICKER_ITEMS } from '../context/LanguageContext';

export default function ScrollingTicker({ 
  items, 
  latestDonation, 
  speed = 30 
}) {
  const { t, lang } = useLanguage();

  const activeItems = useMemo(() => {
    if (items && items.length > 0) return items;

    const baseList = BASE_TICKER_ITEMS[lang] || BASE_TICKER_ITEMS.mr;

    if (latestDonation) {
      const livePrefix = lang === 'mr' ? 'लाईव्ह देणगी:' : 'Live Dakshina:';
      return [
        {
          id: `live-${latestDonation.id}`,
          icon: "✨",
          text: `${livePrefix} ${latestDonation.name} (${latestDonation.city}) - ₹${latestDonation.amount.toLocaleString()} (${latestDonation.category})!`,
          isHighlight: true,
        },
        ...baseList,
      ];
    }

    return baseList;
  }, [items, latestDonation, lang]);

  // Triplicate array for smooth continuous loop
  const duplicatedItems = useMemo(() => {
    return [...activeItems, ...activeItems, ...activeItems];
  }, [activeItems]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-orange-950/60 via-amber-950/50 to-red-950/60 py-2.5 px-3 backdrop-blur-xl shadow-[0_4px_24px_rgba(245,158,11,0.15)]">
      {/* Left indicator badge */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-3 py-1 text-[11px] font-bold text-white shadow-md shadow-red-600/30 ring-1 ring-amber-300/40">
        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        <span>{t('tickerLiveBadge')}</span>
      </div>

      {/* Edge Fade Gradients for smooth glass aesthetic */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-orange-950/90 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-red-950/90 to-transparent z-10" />

      {/* Marquee Ticker Track */}
      <div className="flex select-none overflow-hidden pl-0 sm:pl-32">
        <motion.div
          key={`${activeItems.length}-${lang}`}
          className="flex shrink-0 items-center gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: speed,
            repeat: Infinity,
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`inline-flex items-center gap-2 text-xs md:text-sm font-medium ${
                item.isHighlight 
                  ? "text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/30" 
                  : "text-amber-100/90"
              }`}
            >
              <span className="text-base filter drop-shadow">{item.icon}</span>
              <span>{item.text}</span>
              <span className="text-orange-500/50 font-bold ml-4">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
