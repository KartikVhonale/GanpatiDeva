import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage, DIVINE_SYMBOLS } from '../context/LanguageContext';

export default function SymbolismSection() {
  const { t, pick } = useLanguage();

  return (
    <section className="relative w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <span>🕉️</span>
          <span>{t('symbolismBadge')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('symbolismTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-orange-200/75 max-w-2xl mx-auto">
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
            className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/60 p-5 backdrop-blur-xl shadow-lg hover:border-amber-400/50 hover:shadow-orange-600/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 group-hover:scale-110 transition-transform shrink-0">
                {item.icon}
              </span>
              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
                  {pick(item.title)}
                </h3>
                <div className="inline-block rounded-md bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                  {pick(item.meaning)}
                </div>
                <p className="text-xs text-orange-200/75 pt-1 leading-relaxed">
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
