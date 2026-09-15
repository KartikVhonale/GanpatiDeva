import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ThemeSelectorModal() {
  const { theme, setTheme, themes, themeModalOpen, closeThemeModal, isLight, isRoyal, isGold } = useTheme();
  const { lang, pick } = useLanguage();

  if (!themeModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeThemeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className={`relative w-full max-w-lg rounded-3xl border p-5 sm:p-7 shadow-2xl z-10 overflow-hidden transition-all ${
            isLight
              ? 'bg-[#FFFDD0] border-[#CC5500]/40 text-[#2B2B2B] shadow-[0_20px_60px_rgba(204,85,0,0.25)]'
              : isRoyal
              ? 'bg-gradient-to-b from-[#25070f] via-[#180408] to-black border-rose-500/40 text-rose-50 shadow-[0_20px_60px_rgba(225,29,72,0.4)]'
              : isGold
              ? 'bg-gradient-to-b from-[#1e1304] via-[#120a02] to-black border-yellow-500/40 text-amber-50 shadow-[0_20px_60px_rgba(234,179,8,0.4)]'
              : 'bg-gradient-to-b from-[#1a0c07] via-[#120603] to-black border-amber-500/40 text-amber-50 shadow-[0_20px_60px_rgba(234,88,12,0.4)]'
          }`}
        >
          {/* Subtle Ambient Top Glow */}
          <div
            className={`pointer-events-none absolute -top-16 -left-10 h-40 w-40 rounded-full blur-3xl ${
              isLight
                ? 'bg-[#CC5500]/15'
                : isRoyal
                ? 'bg-rose-500/25'
                : isGold
                ? 'bg-yellow-500/25'
                : 'bg-amber-500/20'
            }`}
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-inner ${
                  isLight
                    ? 'bg-[#CC5500] text-[#FFFDD0]'
                    : isRoyal
                    ? 'bg-gradient-to-br from-rose-600 to-amber-500 text-rose-50'
                    : isGold
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-stone-950 font-black'
                    : 'bg-gradient-to-br from-amber-400 to-orange-600 text-black'
                }`}
              >
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>{lang === 'mr' ? 'थीम निवडा' : 'Select Theme'}</span>
                  <Sparkles className={`h-4 w-4 ${isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-400' : isGold ? 'text-yellow-400' : 'text-amber-400'}`} />
                </h2>
                <p className={`text-xs ${isLight ? 'text-stone-600' : isRoyal ? 'text-rose-200/70' : isGold ? 'text-yellow-200/70' : 'text-orange-200/70'}`}>
                  {lang === 'mr'
                    ? 'आपल्या आवडीनुसार थीम निवडा'
                    : 'Choose your preferred theme'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeThemeModal}
              className={`rounded-full p-2 transition cursor-pointer ${
                isLight
                  ? 'hover:bg-[#CC5500]/10 text-stone-700'
                  : isRoyal
                  ? 'hover:bg-rose-500/20 text-rose-200'
                  : isGold
                  ? 'hover:bg-yellow-500/20 text-yellow-200'
                  : 'hover:bg-white/10 text-stone-300'
              }`}
              title={lang === 'mr' ? 'बंद करा' : 'Close'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Themes Grid */}
          <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              
              // Dynamic border & bg per theme item
              let selectedStyle = '';
              let unselectedStyle = '';
              let checkStyle = '';

              if (t.id === 'terracotta') {
                selectedStyle = 'border-[#CC5500] bg-[#F5F5DC] shadow-[0_6px_20px_rgba(204,85,0,0.18)] ring-2 ring-[#CC5500]/30 text-stone-900';
                unselectedStyle = isLight 
                  ? 'border-stone-300/80 bg-[#F5F5DC]/70 hover:border-[#CC5500]/60 hover:bg-[#FFFDD0] text-stone-800' 
                  : 'border-white/10 bg-white/5 hover:border-amber-500/40 text-stone-200';
                checkStyle = 'border-[#CC5500] bg-[#CC5500] text-[#FFFDD0]';
              } else {
                selectedStyle = 'border-amber-400 bg-orange-950/60 shadow-[0_6px_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40 text-amber-100';
                unselectedStyle = isLight 
                  ? 'border-stone-300/80 bg-white/60 hover:border-amber-500/60 text-stone-800' 
                  : 'border-white/10 bg-white/5 hover:border-amber-500/40 text-stone-200';
                checkStyle = 'border-amber-400 bg-amber-400 text-black';
              }

              return (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setTheme(t.id)}
                  className={`group relative rounded-2xl border-2 p-3.5 sm:p-4 cursor-pointer transition-all ${
                    isSelected ? selectedStyle : unselectedStyle
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base sm:text-lg font-black tracking-wide">
                        {pick(t.name)}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          isSelected
                            ? t.id === 'terracotta'
                              ? 'bg-[#CC5500]/15 text-[#CC5500]'
                              : t.id === 'royal'
                              ? 'bg-rose-500/25 text-rose-300'
                              : t.id === 'gold'
                              ? 'bg-yellow-500/25 text-yellow-300'
                              : 'bg-amber-400/20 text-amber-300'
                            : isLight
                            ? 'bg-stone-200/80 text-stone-600'
                            : 'bg-white/10 text-stone-300'
                        }`}
                      >
                        {pick(t.description)}
                      </span>
                    </div>

                    {/* Radio / Check Circle */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected
                          ? checkStyle
                          : isLight
                          ? 'border-stone-400 bg-transparent'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Swatch Previews */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isLight ? 'text-stone-500' : 'text-stone-400'
                      }`}
                    >
                      {lang === 'mr' ? 'रंग पॅलेट:' : 'Palette:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {t.previewSwatches.map((color, i) => (
                        <span
                          key={i}
                          style={{ backgroundColor: color }}
                          className="h-4 w-6 rounded-md shadow-sm border border-black/15 inline-block"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="mt-5 pt-3 flex items-center justify-between border-t border-black/10 dark:border-white/10 text-xs">
            <span className={isLight ? 'text-stone-600' : isRoyal ? 'text-rose-200/70' : isGold ? 'text-yellow-200/70' : 'text-stone-400'}>
              {lang === 'mr'
                ? 'निवडलेली थीम स्वयंचलित सेव्ह होते'
                : 'Theme choice saved automatically'}
            </span>

            <button
              type="button"
              onClick={closeThemeModal}
              className={`font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                isLight
                  ? 'bg-[#CC5500] text-[#FFFDD0] hover:bg-[#B7410E] shadow-md shadow-[#CC5500]/25'
                  : isRoyal
                  ? 'bg-rose-600 text-rose-50 hover:bg-rose-500 shadow-md shadow-rose-600/30'
                  : isGold
                  ? 'bg-yellow-400 text-stone-950 font-black hover:bg-yellow-300 shadow-md shadow-yellow-500/30'
                  : 'bg-amber-400 text-black hover:bg-amber-300 shadow-md shadow-amber-500/25'
              }`}
            >
              {lang === 'mr' ? 'पूर्ण झाले' : 'Done'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
