import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage, DIVINE_SYMBOLS } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SymbolismSection() {
  const { t, pick } = useLanguage();
  const { isLight, isRoyal, isGold } = useTheme();

  return (
    <section className="relative w-full space-y-6">
      <div className="text-center space-y-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
            isLight
              ? 'border-[#CC5500]/40 bg-[#CC5500]/10 text-[#CC5500]'
              : isRoyal
              ? 'border-rose-400/40 bg-rose-500/15 text-rose-300'
              : isGold
              ? 'border-yellow-400/40 bg-yellow-500/15 text-yellow-300'
              : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
          }`}
        >
          <span>🕉️</span>
          <span>{t('symbolismBadge')}</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isLight
              ? 'text-stone-900'
              : isRoyal
              ? 'text-rose-50'
              : isGold
              ? 'text-yellow-100'
              : 'text-white'
          }`}
        >
          {t('symbolismTitle')}
        </h2>
        <p
          className={`text-xs sm:text-sm max-w-2xl mx-auto ${
            isLight
              ? 'text-stone-600'
              : isRoyal
              ? 'text-rose-200/75'
              : isGold
              ? 'text-yellow-200/75'
              : 'text-orange-200/75'
          }`}
        >
          {t('symbolismSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DIVINE_SYMBOLS.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl shadow-lg transition-all ${
              isLight
                ? 'border-[#CC5500]/25 bg-[#FFFDD0]/85 hover:border-[#CC5500]/50 hover:bg-[#FFFDD0] shadow-[0_4px_20px_rgba(204,85,0,0.08)]'
                : isRoyal
                ? 'border-rose-500/30 bg-gradient-to-br from-[#2a0710]/70 via-[#180408]/80 to-black/90 hover:border-rose-400/60 shadow-[0_4px_20px_rgba(225,29,72,0.15)]'
                : isGold
                ? 'border-yellow-500/30 bg-gradient-to-br from-[#241804]/70 via-[#140c02]/80 to-black/90 hover:border-yellow-400/60 shadow-[0_4px_20px_rgba(234,179,8,0.15)]'
                : 'border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/60 hover:border-amber-400/50 hover:shadow-orange-600/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`text-3xl p-2.5 rounded-xl border group-hover:scale-110 transition-transform shrink-0 ${
                  isLight
                    ? 'bg-[#CC5500]/10 border-[#CC5500]/25 text-[#CC5500]'
                    : isRoyal
                    ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                    : isGold
                    ? 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300'
                    : 'bg-amber-500/10 border-amber-400/20'
                }`}
              >
                {item.icon}
              </span>
              <div className="space-y-1 min-w-0">
                <h3
                  className={`font-bold text-sm sm:text-base transition-colors truncate ${
                    isLight
                      ? 'text-stone-900 group-hover:text-[#CC5500]'
                      : isRoyal
                      ? 'text-rose-100 group-hover:text-rose-300'
                      : isGold
                      ? 'text-yellow-100 group-hover:text-yellow-300'
                      : 'text-white group-hover:text-amber-300'
                  }`}
                >
                  {pick(item.title)}
                </h3>
                <div
                  className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                    isLight
                      ? 'bg-[#CC5500]/15 border-[#CC5500]/30 text-[#CC5500]'
                      : isRoyal
                      ? 'bg-rose-950/70 border-rose-400/35 text-rose-200'
                      : isGold
                      ? 'bg-yellow-950/70 border-yellow-400/35 text-yellow-300'
                      : 'bg-amber-500/15 border-amber-400/30 text-amber-200'
                  }`}
                >
                  {pick(item.meaning)}
                </div>
                <p
                  className={`text-xs pt-1 leading-relaxed ${
                    isLight
                      ? 'text-stone-700'
                      : isRoyal
                      ? 'text-rose-200/80'
                      : isGold
                      ? 'text-yellow-200/80'
                      : 'text-orange-200/75'
                  }`}
                >
                  {pick(item.desc)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
