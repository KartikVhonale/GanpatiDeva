import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, ASHTAVINAYAK_TEMPLES } from '../context/LanguageContext';

export default function AshtavinayakSection() {
  const { t, pick } = useLanguage();
  const [selectedTemple, setSelectedTemple] = useState(null);

  return (
    <section className="relative w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <span>🚩</span>
          <span>{t('ashtavinayakBadge')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('ashtavinayakTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-orange-200/75 max-w-2xl mx-auto">
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
            className="cursor-pointer group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/70 p-4 sm:p-5 backdrop-blur-xl shadow-lg hover:border-amber-400/60 hover:shadow-orange-600/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🪔</span>
                <span className="rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {t('shrineBadge')}
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                {pick(temple.name)}
              </h3>
              <p className="text-xs text-orange-300/70 mt-1">
                📍 {pick(temple.district)}
              </p>
              <p className="text-xs text-orange-200/80 mt-2.5 line-clamp-3 leading-relaxed">
                {pick(temple.desc)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-300 font-semibold">
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
              className="relative w-full max-w-lg rounded-3xl border border-amber-400/50 bg-gradient-to-b from-orange-950 via-red-950 to-black p-6 md:p-8 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {t('ashtavinayakModalTitle')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {pick(selectedTemple.name)}
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-200/75 mt-0.5">
                    📍 {pick(selectedTemple.district)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemple(null)}
                  className="rounded-full bg-white/10 hover:bg-white/20 h-8 w-8 flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-4 space-y-2.5 text-xs sm:text-sm text-orange-100/90 leading-relaxed">
                <p>
                  <strong>{t('templeGlory')}</strong> {pick(selectedTemple.desc)}
                </p>
                <p className="border-t border-amber-500/20 pt-2 text-amber-200">
                  <strong>{t('templeSpecial')}</strong> {pick(selectedTemple.special)}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemple(null)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow cursor-pointer"
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
