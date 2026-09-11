import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  UserCheck, 
  HeartHandshake, 
  Droplet, 
  Utensils, 
  GraduationCap, 
  Award,
  Flame,
  Flower2
} from 'lucide-react';
import heroImg from '../assets/hero.png';
import { playFlowerChime, playTempleBell } from '../utils/audio';
import AshtavinayakSection from '../components/AshtavinayakSection';
import SymbolismSection from '../components/SymbolismSection';
import UtsavSchedule from '../components/UtsavSchedule';

const SOCIAL_INITIATIVES = [
  {
    title: 'भव्य रक्तदान शिबिर (Blood Donation Camp)',
    stats: '२५०+ बाटल्या रक्त संकलन',
    desc: 'दरवर्षी गणेशोत्सवाच्या ५ व्या दिवशी स्थानिक शासकीय रुग्णालयांच्या सहकार्याने आयोजित.',
    icon: Droplet,
    tag: 'आरोग्य सेवा',
    color: 'border-rose-500/40 bg-rose-950/30 text-rose-300',
  },
  {
    title: 'दैनिक महाप्रसाद वाटप (Maha Prasad)',
    stats: '१,५००+ दररोज थाळ्या',
    desc: 'मंडळात येणाऱ्या प्रत्येक भाविकासाठी शुद्ध, सात्विक आणि तृप्त करणारा महाप्रसाद विनामूल्य.',
    icon: Utensils,
    tag: 'अन्नदान सेवा',
    color: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
  },
  {
    title: 'गुणवंत विद्यार्थी सत्कार व शैक्षणिक मदत',
    stats: '५० गरजू विद्यार्थ्यांना शिष्यवृत्ती',
    desc: 'परिसरातील होतकरू विद्यार्थ्यांना वह्या, पुस्तके व शालेय साहित्य वाटप उपक्रम.',
    icon: GraduationCap,
    tag: 'शैक्षणिक सेवा',
    color: 'border-orange-500/40 bg-orange-950/30 text-orange-300',
  },
  {
    title: 'बाल संस्कार व सांस्कृतिक स्पर्धा',
    stats: '४००+ बाल कलाकार सहभागी',
    desc: 'चित्रकला, वकृत्व, श्लोक पठण व पारंपरिक भजन स्पर्धांचे आयोजन करून कलागुणांना प्रोत्साहन.',
    icon: Award,
    tag: 'संस्कृती संवर्धन',
    color: 'border-red-500/40 bg-red-950/30 text-red-300',
  },
];

export default function Home() {
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [diyaLit, setDiyaLit] = useState(false);
  const [ritualFeedback, setRitualFeedback] = useState('');

  // Trigger virtual flower shower
  const triggerFlowerShower = () => {
    playFlowerChime();
    setRitualFeedback('पुष्पवृष्टी समर्पित झाली! बाप्पा मोरया! 🌸');

    const newItems = Array.from({ length: 16 }).map((_, i) => ({
      id: `fl-${Date.now()}-${i}`,
      emoji: ['🌸', '🌼', '🌺', '✨', '🪙', '🍬'][i % 6],
      x: Math.random() * 88 + 6,
      delay: i * 0.07,
      duration: 2.2 + Math.random() * 0.9,
    }));

    setFloatingParticles(prev => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(f => !newItems.some(n => n.id === f.id)));
      setRitualFeedback('');
    }, 3600);
  };

  // Trigger virtual diya lighting
  const triggerLightDiya = () => {
    playTempleBell();
    setDiyaLit(true);
    setRitualFeedback('॥ शुभं करोति कल्याणम् आरोग्यं धनसंपदा ॥ दीप प्रज्वलित झाला! 🪔');
    setTimeout(() => {
      setRitualFeedback('');
    }, 4500);
  };

  return (
    <div className="w-full space-y-10 sm:space-y-14">
      {/* Floating Particles Container */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
        <AnimatePresence>
          {floatingParticles.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: -20, x: `${f.x}%`, scale: 0.7, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: '100vh', 
                rotate: 360,
                scale: [0.7, 1.3, 1] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: f.duration, delay: f.delay, ease: "easeIn" }}
              className="absolute text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]"
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 1. SACRED SANSKRIT SHLOKA CONTINUOUS MARQUEE RIBBON                       */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-orange-950/70 via-red-950/60 to-black/80 py-2.5 px-3 backdrop-blur-xl shadow-md">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-6 text-xs sm:text-sm font-serif font-bold text-amber-300/90 tracking-wide">
          <span className="flex items-center gap-2">
            <span>🪔</span>
            <span>॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥</span>
          </span>
          <span className="text-amber-500/50">✦</span>
          <span className="flex items-center gap-2">
            <span>🌺</span>
            <span>॥ ॐ गं गणपतये नमः ॥</span>
          </span>
          <span className="text-amber-500/50">✦</span>
          <span className="flex items-center gap-2">
            <span>🪔</span>
            <span>॥ विघ्नेश्वराय वरदाय सुरप्रियाय लम्बोदराय सकलाय जगद्धिताय ॥</span>
          </span>
          <span className="text-amber-500/50">✦</span>
          <span className="flex items-center gap-2">
            <span>🚩</span>
            <span>॥ गणपती बाप्पा मोरया, मंगलमूर्ती मोरया ॥</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAJESTIC HERO DARSHAN SECTION                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-b from-orange-950/75 via-red-950/50 to-black/90 p-5 sm:p-10 md:p-14 backdrop-blur-2xl shadow-[0_16px_60px_0_rgba(234,88,12,0.28)] text-center">
        {/* Soft Background Divine Golden Glowing Aura */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-b from-amber-400/30 via-orange-500/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-6">
          {/* Sacred Mantra Title */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 px-4 py-1 text-xs sm:text-sm font-black text-amber-300 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>विघ्नहर्ता • सुखकर्ता • सर्वमंगलकारक</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-[0_4px_20px_rgba(251,191,36,0.6)]">
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                ॥ श्री गणेशाय नमः ॥
              </span>
            </h1>
          </motion.div>

          {/* Hero Image in Ornate Circular Golden Frame with Radiant Divine Aura */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative my-2"
          >
            {/* Glowing Pulsing Aura Rings */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.95, 0.6] 
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -inset-5 rounded-full bg-gradient-to-tr from-amber-400/50 via-orange-500/40 to-red-600/35 blur-2xl -z-10"
            />

            {/* Floating Lord Ganesha Frame */}
            <motion.div
              animate={{ y: [-5, 6, -5] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative flex h-56 w-56 sm:h-68 sm:w-68 md:h-76 md:w-76 items-center justify-center rounded-full p-1.5 bg-gradient-to-br from-amber-300 via-orange-500 to-red-700 shadow-2xl shadow-orange-600/60 ring-4 ring-amber-400/50"
            >
              <div className="h-full w-full overflow-hidden rounded-full border-4 border-amber-400/80 bg-gradient-to-b from-orange-950/90 to-black/95 flex items-center justify-center p-3">
                <img
                  src={heroImg}
                  alt="भगवान श्री गणेश"
                  className="h-full w-full object-contain filter drop-shadow-[0_4px_20px_rgba(245,158,11,0.7)] hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Decorative Corner Holy Diya & Flower */}
              <span className="absolute -top-1 -right-1 text-2xl filter drop-shadow">🪔</span>
              <span className="absolute -bottom-1 -left-1 text-2xl filter drop-shadow">🌺</span>
            </motion.div>
          </motion.div>

          {/* Devotional Description */}
          <p className="max-w-2xl text-xs sm:text-sm md:text-base text-orange-200/85 leading-relaxed font-medium">
            सार्वजनिक श्री गणेश उत्सव मंडळामध्ये आपले सहर्ष स्वागत! बाप्पाच्या चरणी नतमस्तक होऊन सुख, शांती आणि समृद्धीचे शुभाशीर्वाद प्राप्त करा.
          </p>

          {/* Dual Interactive Ritual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {/* 1. Flower Shower */}
            <motion.button
              type="button"
              onClick={triggerFlowerShower}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-2 border-amber-400/50 hover:bg-amber-500/35 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black text-amber-200 shadow-lg shadow-orange-600/20 backdrop-blur-md transition-all cursor-pointer"
            >
              <Flower2 className="h-4 w-4 text-rose-400 animate-spin-slow" />
              <span>🌸 पुष्पवृष्टी करा (Shower Flowers)</span>
            </motion.button>

            {/* 2. Virtual Diya Lighting */}
            <motion.button
              type="button"
              onClick={triggerLightDiya}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                diyaLit
                  ? 'border-amber-300 bg-amber-400 text-black shadow-amber-400/50 ring-2 ring-amber-300'
                  : 'border-amber-500/40 bg-orange-950/50 text-amber-200 hover:bg-orange-900/50'
              }`}
            >
              <Flame className={`h-4 w-4 ${diyaLit ? 'text-orange-900 animate-bounce' : 'text-amber-400'}`} />
              <span>{diyaLit ? '🪔 नंदादीप तेवत आहे' : '🪔 दीप प्रज्वलित करा'}</span>
            </motion.button>
          </div>

          {/* Ritual Feedback Message */}
          <AnimatePresence>
            {ritualFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs sm:text-sm font-bold text-amber-300 bg-black/60 px-4 py-2 rounded-xl border border-amber-400/40 shadow-inner"
              >
                {ritualFeedback}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Action Navigation Buttons (Live Board & Volunteer Desk) */}
          <div className="w-full pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dakshina"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3.5 text-sm sm:text-base font-black text-white shadow-xl shadow-orange-600/40 ring-2 ring-amber-300/50 hover:scale-105 hover:shadow-orange-500/60 active:scale-95 transition-all cursor-pointer"
            >
              <Tv className="h-5 w-5" />
              <span>पहा थेट देणगी फलक (Live Board)</span>
              <span>↗</span>
            </Link>

            <Link
              to="/volunteer"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl border-2 border-amber-500/40 bg-orange-950/50 hover:bg-orange-900/60 px-6 py-3.5 text-sm sm:text-base font-black text-amber-200 hover:text-white shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <UserCheck className="h-5 w-5 text-amber-400" />
              <span>स्वयंसेवक कक्ष (Volunteer Desk)</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ASHTAVINAYAK SACRED TEMPLES SHOWCASE                                   */}
      {/* ========================================================================= */}
      <AshtavinayakSection />

      {/* ========================================================================= */}
      {/* 4. DIVINE SYMBOLISM OF LORD GANESHA                                       */}
      {/* ========================================================================= */}
      <SymbolismSection />

      {/* ========================================================================= */}
      {/* 5. FESTIVAL SCHEDULE & 10-DAY EVENTS PROGRAMME                            */}
      {/* ========================================================================= */}
      <UtsavSchedule />

      {/* ========================================================================= */}
      {/* 6. MANDAL SOCIAL INITIATIVES & PUBLIC CHARITY                             */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-5 sm:p-8 md:p-10 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-300 mb-1">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>सामाजिक व धार्मिक उपक्रम</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              मंडळाचे सामाजिक उपक्रम (Initiatives Funded by Seva)
            </h3>
          </div>
          <span className="text-xs text-orange-200/70">
            आपल्या वर्गणी व देणगीतून साकारलेली लोकोपयोगी कार्ये
          </span>
        </div>

        {/* Grid of Social Initiatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_INITIATIVES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-2xl border border-amber-500/25 bg-black/40 p-5 backdrop-blur-xl flex items-start gap-4 hover:border-amber-400/50 transition-all shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      {item.title}
                    </h4>
                    <span className={`inline-block rounded-full border px-2 py-0.2 text-[10px] font-bold ${item.color}`}>
                      {item.tag}
                    </span>
                  </div>

                  <p className="text-xs text-orange-200/80 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="pt-1 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>✦</span>
                    <span>{item.stats}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer Auspicious Blessing Quote */}
      <div className="text-center py-4">
        <p className="font-serif text-amber-200/90 text-sm sm:text-base italic">
          ॥ मोरया रे बाप्पा मोरया रे, पुढच्या वर्षी लवकर या ॥
        </p>
      </div>
    </div>
  );
}
