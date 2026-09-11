import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  UserCheck, 
  Sparkles, 
  Clock, 
  HeartHandshake, 
  Droplet, 
  Utensils, 
  GraduationCap, 
  Award,
  Flame,
  Flower2
} from 'lucide-react';
import heroImg from '../assets/hero.png';
import { playFlowerChime } from '../utils/audio';

const AARTI_TIMINGS = [
  {
    title: 'काकड आरती (Kakad Aarti)',
    time: 'सकाळी ०८:०० AM',
    desc: 'प्रभात समयी बाप्पाची प्रथम पूजा, भूपाळी व मंगल काकड आरती.',
    icon: Flame,
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
  },
  {
    title: 'महाभोग व पूजा (Maha Bhog & Pooja)',
    time: 'दुपारी १२:३० PM',
    desc: '२१ मोदकांचा महानैवेद्य, अभिषेक व मध्यान्ह महाआरती.',
    icon: Utensils,
    gradient: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/30',
  },
  {
    title: 'धूप व संध्या आरती (Dhoop Aarti)',
    time: 'सायंकाळी ०७:३० PM',
    desc: 'सुवासिक धूप, दीप व टाळ-मृदुंगाच्या गजरात भव्य संध्या महाआरती.',
    icon: Sparkles,
    gradient: 'from-rose-500/20 to-amber-500/10',
    border: 'border-rose-500/30',
  },
  {
    title: 'शेज आरती (Shej Aarti)',
    time: 'रात्री १०:०० PM',
    desc: 'दिवसभराच्या सांगतेची शांत, भावपूर्ण व तृप्ती देणारी शेजारती.',
    icon: Clock,
    gradient: 'from-purple-500/20 to-rose-500/10',
    border: 'border-purple-500/30',
  },
];

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
  const [floatingFlowers, setFloatingFlowers] = useState([]);
  const [ritualFeedback, setRitualFeedback] = useState('');

  const triggerFlowerShower = () => {
    playFlowerChime();
    setRitualFeedback('पुष्पवृष्टी समर्पित झाली! बाप्पा मोरया! 🌸');

    const newItems = Array.from({ length: 12 }).map((_, i) => ({
      id: `fl-${Date.now()}-${i}`,
      emoji: i % 2 === 0 ? '🌺' : '🌼',
      x: Math.random() * 85 + 5,
      delay: i * 0.08,
      duration: 2.2 + Math.random() * 0.8,
    }));

    setFloatingFlowers(prev => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingFlowers(prev => prev.filter(f => !newItems.some(n => n.id === f.id)));
      setRitualFeedback('');
    }, 3500);
  };

  return (
    <div className="w-full space-y-10 md:space-y-14">
      {/* Floating Flowers Particle Container */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
        <AnimatePresence>
          {floatingFlowers.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: -20, x: `${f.x}%`, scale: 0.8, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: '100vh', 
                rotate: 360,
                scale: [0.8, 1.2, 1] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: f.duration, delay: f.delay, ease: "easeIn" }}
              className="absolute text-2xl md:text-3xl filter drop-shadow-lg"
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/70 via-red-950/50 to-black/85 p-6 sm:p-10 md:p-14 backdrop-blur-2xl shadow-[0_16px_60px_0_rgba(234,88,12,0.25)] text-center">
        {/* Soft Background Radial Glowing Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-amber-400/25 via-orange-500/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-6">
          {/* Sacred Mantra Title */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-1.5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1 text-xs sm:text-sm font-black text-amber-300 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>विघ्नहर्ता • सुखकर्ता • सर्वमंगलकारक</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-[0_4px_16px_rgba(251,191,36,0.5)]">
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                ॥ श्री गणेशाय नमः ॥
              </span>
            </h1>
          </motion.div>

          {/* Hero Image in Ornate Circular Glowing Frame with Floating Animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative my-2"
          >
            {/* Glowing Pulsing Outer Aura */}
            <motion.div
              animate={{ 
                scale: [1, 1.08, 1],
                opacity: [0.6, 0.9, 0.6] 
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-500/40 via-orange-500/35 to-red-600/30 blur-2xl -z-10"
            />

            {/* Subtle Floating Movement */}
            <motion.div
              animate={{ y: [-5, 6, -5] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative flex h-52 w-52 sm:h-64 sm:w-64 md:h-72 md:w-72 items-center justify-center rounded-full p-1.5 bg-gradient-to-br from-amber-300 via-orange-500 to-red-700 shadow-2xl shadow-orange-600/50 ring-4 ring-amber-400/40"
            >
              <div className="h-full w-full overflow-hidden rounded-full border-4 border-amber-400/70 bg-gradient-to-b from-orange-950/90 to-black/95 flex items-center justify-center p-3">
                <img
                  src={heroImg}
                  alt="भगवान श्री गणेश"
                  className="h-full w-full object-contain filter drop-shadow-[0_4px_15px_rgba(245,158,11,0.6)]"
                />
              </div>

              {/* Decorative Corner Icons */}
              <span className="absolute -top-1 -right-1 text-2xl filter drop-shadow">🪔</span>
              <span className="absolute -bottom-1 -left-1 text-2xl filter drop-shadow">🌺</span>
            </motion.div>
          </motion.div>

          {/* Mandal Subtitle & Sanskrit Verse */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              सार्वजनिक गणेशोत्सव २०२६
            </h2>
            <p className="text-xs sm:text-sm font-bold text-amber-300/90 tracking-wide uppercase">
              🚩 १० वा वर्धापन दिन महोत्सव • सिद्धिविनायक नगर, मुंबई 🚩
            </p>

            <div className="rounded-2xl border border-amber-500/25 bg-black/40 px-5 py-3 max-w-xl mx-auto backdrop-blur-md">
              <p className="font-serif text-xs sm:text-sm text-amber-200/90 italic tracking-wide">
                वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
              </p>
            </div>
          </div>

          {/* Interactive Flower Offering Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={triggerFlowerShower}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/50 bg-rose-950/40 hover:bg-rose-900/60 px-4 py-1.5 text-xs font-bold text-rose-200 hover:text-white transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Flower2 className="h-4 w-4 text-rose-400" />
              <span>बाप्पाच्या चरणी पुष्पवृष्टी करा (Offer Flowers)</span>
            </button>
            {ritualFeedback && (
              <p className="text-xs font-bold text-amber-300 mt-2 animate-bounce">
                {ritualFeedback}
              </p>
            )}
          </div>

          {/* Two Prominent CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              to="/dakshina"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3.5 text-sm sm:text-base font-black text-white shadow-xl shadow-orange-600/40 ring-2 ring-amber-300/50 hover:scale-105 hover:shadow-orange-500/60 active:scale-95 transition-all cursor-pointer"
            >
              <Tv className="h-5 w-5" />
              <span>पहा थेट देणगी फलक (Live Dakshina Board)</span>
              <span>↗</span>
            </Link>

            <Link
              to="/admin"
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
      {/* 2. DAILY AARTI & POOJA TIMINGS CARD */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-6 md:p-10 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-300 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>नित्य पूजा वेळापत्रक</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              दैनिक आरत्या व महाभोग वेळा (Daily Aarti & Pooja Timings)
            </h3>
          </div>
          <span className="text-xs text-orange-200/70">
            * भाविकांनी वेळेवर उपस्थित राहून दर्शनाचा लाभ घ्यावा.
          </span>
        </div>

        {/* Responsive Grid of 4 Daily Aartis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AARTI_TIMINGS.map((aarti, idx) => {
            const Icon = aarti.icon;
            return (
              <motion.div
                key={aarti.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className={`relative overflow-hidden rounded-2xl border ${aarti.border} bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/60 p-5 backdrop-blur-xl shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-xs font-black text-amber-300">
                      {aarti.time}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-white">
                    {aarti.title}
                  </h4>
                  <p className="text-xs text-orange-200/75 mt-1.5 leading-relaxed">
                    {aarti.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300/80">
                  <span>पंडाल मुख्य व्यासपीठ</span>
                  <span>🔔 जय गणेश</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MANDAL ANNOUNCEMENTS & SOCIAL WORK */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-6 md:p-10 backdrop-blur-2xl shadow-xl space-y-6">
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

        {/* Responsive Grid of Social Initiatives */}
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

      {/* Footer Quote */}
      <div className="text-center py-4">
        <p className="font-serif text-amber-200/80 text-sm italic">
          ॥ मंगलमूर्ती मोरया, पुढच्या वर्षी लवकर या ॥
        </p>
      </div>
    </div>
  );
}
