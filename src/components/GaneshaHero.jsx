import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTempleBell, playFlowerChime } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

export default function GaneshaHero({ onNavigate }) {
  const { isMarathi } = useLanguage();
  const [poojaCount, setPoojaCount] = useState(() => {
    return parseInt(localStorage.getItem('ganesha_pooja_count') || '108', 10);
  });
  const [floatingItems, setFloatingItems] = useState([]);
  const [activeRitual, setActiveRitual] = useState('');
  const [isAartiActive, setIsAartiActive] = useState(false);

  const incrementPooja = (ritualName) => {
    const next = poojaCount + 1;
    setPoojaCount(next);
    localStorage.setItem('ganesha_pooja_count', next.toString());
    setActiveRitual(ritualName);
    setTimeout(() => setActiveRitual(''), 3000);
  };

  // Virtual Flower Shower
  const handleOfferFlowers = () => {
    playFlowerChime();
    incrementPooja(isMarathi ? 'पुष्पवृष्टी समर्पित केली 🌸' : 'Flowers Offered 🌸');

    const newItems = Array.from({ length: 12 }).map((_, i) => ({
      id: `flower-${Date.now()}-${i}`,
      emoji: i % 2 === 0 ? '🌺' : '🌼',
      x: Math.random() * 80 + 10,
      delay: i * 0.08,
      duration: 2.2 + Math.random() * 0.8,
    }));

    setFloatingItems(prev => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingItems(prev => prev.filter(f => !newItems.some(n => n.id === f.id)));
    }, 3500);
  };

  // Virtual Aarti
  const handleOfferAarti = () => {
    playTempleBell();
    setIsAartiActive(true);
    incrementPooja(isMarathi ? 'आरती ओवाळली 🪔 बाप्पा मोरया!' : 'Aarti Offered 🪔 Bappa Morya!');
    setTimeout(() => setIsAartiActive(false), 4500);
  };

  // Virtual Modak
  const handleOfferModak = () => {
    playFlowerChime();
    incrementPooja(isMarathi ? '२१ मोदकांचा नैवेद्य अर्पण केला 🍬' : '21 Modaks Offered 🍬');

    const newItems = Array.from({ length: 8 }).map((_, i) => ({
      id: `modak-${Date.now()}-${i}`,
      emoji: '🍬',
      x: 30 + Math.random() * 40,
      delay: i * 0.1,
      duration: 2.0,
    }));

    setFloatingItems(prev => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingItems(prev => prev.filter(f => !newItems.some(n => n.id === f.id)));
    }, 3000);
  };

  // Virtual Durva
  const handleOfferDurva = () => {
    playFlowerChime();
    incrementPooja(isMarathi ? '२१ दुर्वांची जुडी अर्पण केली 🌿' : '21 Sacred Durva Offered 🌿');

    const newItems = Array.from({ length: 8 }).map((_, i) => ({
      id: `durva-${Date.now()}-${i}`,
      emoji: '🌿',
      x: 35 + Math.random() * 30,
      delay: i * 0.1,
      duration: 2.0,
    }));

    setFloatingItems(prev => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingItems(prev => prev.filter(f => !newItems.some(n => n.id === f.id)));
    }, 3000);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/60 via-red-950/40 to-black/80 p-6 md:p-12 backdrop-blur-2xl shadow-[0_16px_60px_0_rgba(234,88,12,0.3)]">
      {/* Floating Petals / Offering Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
        <AnimatePresence>
          {floatingItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, x: `${item.x}%`, scale: 0.8, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: 420, 
                rotate: 360,
                scale: [0.8, 1.2, 1] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: item.duration, delay: item.delay, ease: "easeIn" }}
              className="absolute text-2xl md:text-3xl filter drop-shadow-md"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative Aura Rays */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-b from-amber-400/25 via-orange-500/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />

      {/* Main Darshan Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Left: Divine Lord Ganesha Idol Display */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {/* Pulsing Sacred Halo behind Bappa */}
            <motion.div
              animate={{ 
                scale: isAartiActive ? [1, 1.15, 1] : [1, 1.05, 1],
                opacity: isAartiActive ? [0.7, 1, 0.7] : [0.5, 0.8, 0.5]
              }}
              transition={{ repeat: Infinity, duration: isAartiActive ? 1.5 : 3.5 }}
              className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-400/30 via-orange-500/30 to-red-600/30 blur-2xl -z-10"
            />

            {/* Rotating Aarti Thali Effect when Aarti is active */}
            {isAartiActive && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="pointer-events-none absolute -inset-8 rounded-full border-2 border-dashed border-amber-400/60 -z-10"
              />
            )}

            {/* Sacred Murti Vessel / Frame */}
            <div className="relative flex h-60 w-60 sm:h-72 sm:w-72 items-center justify-center rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-950/80 via-orange-950/70 to-red-950/90 p-4 shadow-2xl shadow-orange-600/40 ring-4 ring-amber-300/30 backdrop-blur-md">
              {/* Divine Ganesha Sacred Visual Presentation */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-7xl sm:text-8xl filter drop-shadow-[0_8px_20px_rgba(251,191,36,0.8)] select-none">
                  🐘
                </span>
                <div className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-xs font-bold text-amber-200">
                  {isMarathi ? '॥ श्री सिद्धिविनायक ॥' : '|| Shri Siddhivinayak ||'}
                </div>
                <div className="text-[11px] text-orange-200/80 font-serif italic">
                  सुमुखश्च एकदन्तश्च कपिलो गजकर्णकः
                </div>
              </div>

              {/* Auspicious Tilak & Diya Pins */}
              <div className="absolute top-2.5 left-3 text-lg">🪔</div>
              <div className="absolute top-2.5 right-3 text-lg">🪔</div>
              <div className="absolute bottom-2.5 left-3 text-lg">🌸</div>
              <div className="absolute bottom-2.5 right-3 text-lg">🌸</div>
            </div>
          </div>

          {/* Active Ritual Toast */}
          <div className="h-8 mt-4 flex items-center justify-center">
            <AnimatePresence>
              {activeRitual && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/30 to-red-600/30 px-4 py-1 text-xs font-bold text-amber-200 shadow-md backdrop-blur-md"
                >
                  ✨ {activeRitual}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Virtual Pooja Buttons */}
          <div className="mt-2 flex flex-wrap justify-center gap-2 max-w-sm">
            <button
              type="button"
              onClick={handleOfferFlowers}
              className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/40 px-3.5 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-900/60 hover:text-white transition-all hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              <span>🌸</span>
              <span>{isMarathi ? 'पुष्पवृष्टी' : 'Shower Flowers'}</span>
            </button>

            <button
              type="button"
              onClick={handleOfferAarti}
              className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-950/40 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-900/60 hover:text-white transition-all hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              <span>🪔</span>
              <span>{isMarathi ? 'आरती ओवाळा' : 'Offer Aarti'}</span>
            </button>

            <button
              type="button"
              onClick={handleOfferModak}
              className="flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-950/40 px-3.5 py-1.5 text-xs font-bold text-orange-200 hover:bg-orange-900/60 hover:text-white transition-all hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              <span>🍬</span>
              <span>{isMarathi ? 'मोदक नैवेद्य' : 'Modak Prasad'}</span>
            </button>

            <button
              type="button"
              onClick={handleOfferDurva}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 hover:text-white transition-all hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              <span>🌿</span>
              <span>{isMarathi ? '२१ दुर्वा' : '21 Durva'}</span>
            </button>
          </div>

          {/* Devotees Pooja Counter */}
          <div className="mt-3 text-[11px] text-amber-300/70 font-medium">
            {isMarathi ? '🚩 भाविकांनी आज अर्पण केलेली डिजिटल पूजा: ' : '🚩 Digital offerings made by devotees today: '}
            <span className="font-bold text-amber-300">{poojaCount.toLocaleString()}</span> {isMarathi ? 'वेळा' : 'times'}
          </div>
        </div>

        {/* Right: Divine Shlokas, Wisdom & Quick Navigation */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{isMarathi ? 'विघ्नहर्ता • सुखकर्ता • बुद्धिदाता' : 'Remover of Obstacles • Giver of Joy • Bestower of Wisdom'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                {isMarathi ? 'गणपती बाप्पा मोरया' : 'Ganpati Bappa Morya'}
              </span>
            </h1>

            <p className="mt-2 text-sm sm:text-base font-medium text-orange-200/90 leading-relaxed max-w-xl">
              {isMarathi
                ? 'सर्व विघ्नांचे निवारण करणारे, चौसष्ट कलांचे अधिपती आणि रिद्धी-सिद्धीचे स्वामी भगवान श्री गणेश यांच्या चरणी कोटी कोटी प्रणाम.'
                : 'Salutations to Lord Ganesha, the remover of all obstacles, master of sixty-four divine arts, and sovereign lord of spiritual success (Siddhi) and prosperity (Riddhi).'}
            </p>
          </div>

          {/* Grand Sanskrit Shloka Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-orange-950/50 via-amber-950/40 to-black/60 p-5 backdrop-blur-xl shadow-lg">
            <p className="font-serif text-sm sm:text-base text-amber-200 font-bold italic tracking-wide leading-relaxed">
              वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।<br />
              निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
            </p>
            <p className="mt-2 text-xs text-orange-300/70 border-t border-amber-500/20 pt-2">
              <strong>{isMarathi ? 'भावार्थ:' : 'Meaning:'}</strong>{' '}
              {isMarathi
                ? 'हे वाकडी सोंड असलेल्या, विशाल शरीर आणि कोटी सूर्यांचे तेज धारण करणाऱ्या विघ्नहर्त्या देवा, माझ्या सर्व कार्यातील विघ्न कायम दूर करा.'
                : 'O Lord with the curved trunk and immense radiant aura like ten million suns, please make all my endeavors free from obstacles at all times.'}
            </p>
          </div>

          {/* Gateway CTA Buttons to Other Sections */}
          {onNavigate && (
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('aarti')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-1 ring-amber-300/50"
              >
                <span>📖</span>
                <span>{isMarathi ? 'आरती संग्रह वाचा' : 'Read Aarti Collection'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ashtavinayak')}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-orange-950/40 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-200 hover:bg-orange-900/50 hover:text-white transition-all cursor-pointer"
              >
                <span>🚩</span>
                <span>{isMarathi ? 'अष्टविनायक दर्शन' : 'Ashtavinayak Shrines'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dakshina')}
                className="flex items-center gap-2 rounded-xl border border-orange-500/40 bg-red-950/30 px-5 py-2.5 text-xs sm:text-sm font-bold text-orange-200 hover:bg-red-900/40 hover:text-white transition-all cursor-pointer"
              >
                <span>🪙</span>
                <span>{isMarathi ? 'दक्षिणा व महाप्रसाद सेवा' : 'Dakshina & Seva Fund'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
