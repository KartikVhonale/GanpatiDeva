import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, ASHTAVINAYAK_TEMPLES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function AshtavinayakSection() {
  const { t, pick } = useLanguage();
  const { isLight, isRoyal, isGold, isMidnight } = useTheme();
  const [selectedTemple, setSelectedTemple] = useState(null);

  return (
    <section className="relative w-full space-y-6">
      <div className="text-center space-y-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
            isLight
              ? 'border-[#CC5500]/40 bg-[#CC5500]/10 text-[#CC5500]'
              : isRoyal
              ? 'border-rose-400/50 bg-rose-500/20 text-rose-200 shadow-sm'
              : isGold
              ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-300 shadow-sm'
              : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
          }`}
        >
          <span>🚩</span>
          <span>{t('ashtavinayakBadge')}</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isLight
              ? 'text-stone-900'
              : isRoyal
              ? 'text-rose-100'
              : isGold
              ? 'text-yellow-100'
              : 'text-white'
          }`}
        >
          {t('ashtavinayakTitle')}
        </h2>
        <p
          className={`text-xs sm:text-sm max-w-2xl mx-auto ${
            isLight
              ? 'text-stone-600'
              : isRoyal
              ? 'text-rose-200/80'
              : isGold
              ? 'text-yellow-200/80'
              : 'text-orange-200/75'
          }`}
        >
          {t('ashtavinayakSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASHTAVINAYAK_TEMPLES.map((temple, idx) => (
          <motion.div
            key={temple.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => setSelectedTemple(temple)}
            className={`cursor-pointer group relative overflow-hidden rounded-2xl border p-4 sm:p-5 backdrop-blur-xl shadow-lg transition-all flex flex-col justify-between ${
              isLight
                ? 'border-[#CC5500]/25 bg-[#FFFDD0]/85 hover:border-[#CC5500]/60 hover:bg-[#FFFDD0] shadow-[0_4px_20px_rgba(204,85,0,0.08)]'
                : isRoyal
                ? 'border-rose-500/25 bg-gradient-to-br from-[#24070e]/80 via-[#180408]/80 to-black/85 hover:border-amber-400/50 hover:shadow-[0_4px_25px_rgba(225,29,72,0.25)]'
                : isGold
                ? 'border-yellow-500/25 bg-gradient-to-br from-[#1c1304]/80 via-[#120b02]/80 to-black/85 hover:border-yellow-300/60 hover:shadow-[0_4px_25px_rgba(234,179,8,0.25)]'
                : 'border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/70 hover:border-amber-400/60 hover:shadow-orange-600/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🪔</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    isLight
                      ? 'bg-[#CC5500]/15 border-[#CC5500]/30 text-[#CC5500]'
                      : isRoyal
                      ? 'bg-rose-500/20 border-rose-400/35 text-rose-200'
                      : isGold
                      ? 'bg-yellow-500/20 border-yellow-400/35 text-yellow-300'
                      : 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                  }`}
                >
                  {t('shrineBadge')}
                </span>
              </div>
              <h3
                className={`font-bold text-sm sm:text-base transition-colors ${
                  isLight
                    ? 'text-stone-900 group-hover:text-[#CC5500]'
                    : isRoyal
                    ? 'text-rose-100 group-hover:text-amber-300'
                    : isGold
                    ? 'text-yellow-100 group-hover:text-yellow-300'
                    : 'text-white group-hover:text-amber-300'
                }`}
              >
                {pick(temple.name)}
              </h3>
              <p
                className={`text-xs mt-1 ${
                  isLight
                    ? 'text-stone-600'
                    : isRoyal
                    ? 'text-rose-300/80'
                    : isGold
                    ? 'text-yellow-300/80'
                    : 'text-orange-300/70'
                }`}
              >
                📍 {pick(temple.district)}
              </p>
              <p
                className={`text-xs mt-2.5 line-clamp-3 leading-relaxed ${
                  isLight
                    ? 'text-stone-700'
                    : isRoyal
                    ? 'text-rose-200/80'
                    : isGold
                    ? 'text-yellow-200/80'
                    : 'text-orange-200/80'
                }`}
              >
                {pick(temple.desc)}
              </p>
            </div>

            <div
              className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                isLight
                  ? 'border-[#CC5500]/20 text-[#CC5500]'
                  : isRoyal
                  ? 'border-rose-500/20 text-rose-300'
                  : isGold
                  ? 'border-yellow-500/20 text-yellow-300'
                  : 'border-amber-500/20 text-amber-300'
              }`}
            >
              <span>{t('readDetails')}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Temple Detail Modal */}
      <AnimatePresence>
        {selectedTemple && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedTemple(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-3xl border p-6 md:p-8 shadow-2xl space-y-4 ${
                isLight
                  ? 'bg-[#FFFDD0] border-[#CC5500]/40 text-[#2B2B2B]'
                  : isRoyal
                  ? 'bg-gradient-to-b from-[#26070e] via-[#1a0408] to-black border-rose-500/50 text-rose-50 shadow-[0_20px_60px_rgba(225,29,72,0.4)]'
                  : isGold
                  ? 'bg-gradient-to-b from-[#1c1304] via-[#120b02] to-black border-yellow-500/50 text-amber-50 shadow-[0_20px_60px_rgba(234,179,8,0.4)]'
                  : 'bg-gradient-to-b from-orange-950 via-red-950 to-black border-amber-400/50 text-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isLight
                        ? 'text-[#CC5500]'
                        : isRoyal
                        ? 'text-rose-300'
                        : isGold
                        ? 'text-yellow-300'
                        : 'text-amber-400'
                    }`}
                  >
                    {t('ashtavinayakModalTitle')}
                  </span>
                  <h3
                    className={`text-xl sm:text-2xl font-black mt-1 ${
                      isLight
                        ? 'text-stone-900'
                        : isRoyal
                        ? 'text-rose-100'
                        : isGold
                        ? 'text-yellow-100'
                        : 'text-white'
                    }`}
                  >
                    {pick(selectedTemple.name)}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mt-0.5 ${
                      isLight
                        ? 'text-stone-600'
                        : isRoyal
                        ? 'text-rose-200/80'
                        : isGold
                        ? 'text-yellow-200/80'
                        : 'text-orange-200/75'
                    }`}
                  >
                    📍 {pick(selectedTemple.district)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemple(null)}
                  className={`rounded-full h-8 w-8 flex items-center justify-center text-sm cursor-pointer transition ${
                    isLight
                      ? 'bg-black/5 hover:bg-black/10 text-stone-800'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div
                className={`rounded-2xl border p-4 space-y-2.5 text-xs sm:text-sm leading-relaxed ${
                  isLight
                    ? 'border-[#CC5500]/25 bg-[#F5F5DC] text-stone-800'
                    : isRoyal
                    ? 'border-rose-500/30 bg-[#170408]/70 text-rose-100'
                    : isGold
                    ? 'border-yellow-500/30 bg-[#0f0a02]/70 text-amber-100'
                    : 'border-amber-500/30 bg-black/40 text-orange-100/90'
                }`}
              >
                <p>
                  <strong>{t('templeGlory')}</strong> {pick(selectedTemple.desc)}
                </p>
                <p
                  className={`border-t pt-2 ${
                    isLight
                      ? 'border-[#CC5500]/20 text-[#CC5500]'
                      : isRoyal
                      ? 'border-rose-500/25 text-rose-300'
                      : isGold
                      ? 'border-yellow-500/25 text-yellow-300'
                      : 'border-amber-500/20 text-amber-200'
                  }`}
                >
                  <strong>{t('templeSpecial')}</strong> {pick(selectedTemple.special)}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemple(null)}
                  className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-bold shadow cursor-pointer transition ${
                    isLight
                      ? 'bg-[#CC5500] hover:bg-[#B7410E] text-[#FFFDD0]'
                      : isRoyal
                      ? 'bg-gradient-to-r from-rose-700 to-red-600 text-amber-100 font-bold hover:brightness-110 shadow-rose-900/50'
                      : isGold
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black hover:brightness-110 shadow-yellow-600/50'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  }`}
                >
                  {t('bappaMoryaClose')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
