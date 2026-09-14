import React, { useState, useEffect } from 'react';
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
  Flower2,
  Edit3,
  Plus,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { playFlowerChime, playTempleBell } from '../utils/audio';
import { useLanguage, DEFAULT_SOCIAL_INITIATIVES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useDonations from '../hooks/useDonations';
import AshtavinayakSection from '../components/AshtavinayakSection';
import SymbolismSection from '../components/SymbolismSection';
import UtsavSchedule from '../components/UtsavSchedule';
import NoticeBoard from '../components/NoticeBoard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ICON_MAP = {
  Droplet,
  Utensils,
  GraduationCap,
  Award,
  HeartHandshake,
  Flame,
};

const COLOR_OPTIONS = [
  { label: 'गुलाबी / Rose', value: 'border-rose-500/40 bg-rose-950/30 text-rose-300' },
  { label: 'सोनेरी / Amber', value: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
  { label: 'केशरी / Orange', value: 'border-orange-500/40 bg-orange-950/30 text-orange-300' },
  { label: 'लाल / Red', value: 'border-red-500/40 bg-red-950/30 text-red-300' },
  { label: 'हिरवा / Emerald', value: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
  { label: 'निळा / Blue', value: 'border-blue-500/40 bg-blue-950/30 text-blue-300' },
];

const DEFAULT_GANESHA_IMAGES = [
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/Gemini_Generated_Image_g93ok4g93ok4g93o',
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/v1789231045/Gemini_Generated_Image_3bfuu3bfuu3bfuu3.png',
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/v1789231044/Gemini_Generated_Image_aknpsbaknpsbaknp.png',
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/v1789231040/Gemini_Generated_Image_xl6eqaxl6eqaxl6e.png',
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/v1789231039/Gemini_Generated_Image_b2b8lyb2b8lyb2b8.png',
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/v1789231037/Gemini_Generated_Image_yrtxveyrtxveyrtx.png',
  'https://res.cloudinary.com/d0tgvag4/image/upload/f_auto,q_auto/v1789231032/Gemini_Generated_Image_a0g10oa0g10oa0g1_1.png',
];

export default function Home() {
  const { t, pick, lang } = useLanguage();
  const { settings } = useDonations();
  const { isAdmin, token } = useAuth();

  // Active Social Initiatives
  const activeInitiatives = settings?.socialInitiatives && settings.socialInitiatives.length > 0
    ? settings.socialInitiatives
    : DEFAULT_SOCIAL_INITIATIVES;

  // State for Admin Initiatives Editing Modal
  const [isEditingInitiatives, setIsEditingInitiatives] = useState(false);
  const [editingInitiativesList, setEditingInitiativesList] = useState([]);
  const [savingInitiatives, setSavingInitiatives] = useState(false);
  const [initiativeFeedback, setInitiativeFeedback] = useState('');

  const handleOpenEditInitiatives = () => {
    setEditingInitiativesList(JSON.parse(JSON.stringify(activeInitiatives)));
    setIsEditingInitiatives(true);
    setInitiativeFeedback('');
  };

  const handleAddInitiative = () => {
    const newItem = {
      id: `init-${Date.now()}`,
      title: 'नवीन सामाजिक उपक्रम',
      stats: '१००+ लाभार्थी',
      desc: 'या उपक्रमाचे संक्षिप्त वर्णन येथे लिहा.',
      iconName: 'HeartHandshake',
      tag: 'सेवा उपक्रम',
      color: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
    };
    setEditingInitiativesList((prev) => [...prev, newItem]);
  };

  const handleUpdateInitiativeItem = (index, field, value) => {
    setEditingInitiativesList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteInitiativeItem = (index) => {
    setEditingInitiativesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveInitiatives = async () => {
    setSavingInitiatives(true);
    setInitiativeFeedback('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialInitiatives: editingInitiativesList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'उपक्रम सेव्ह करताना त्रुटी आली');

      setInitiativeFeedback('✅ सामाजिक उपक्रम यशस्वीरित्या सेव्ह झाले!');
      setTimeout(() => {
        setIsEditingInitiatives(false);
        setInitiativeFeedback('');
      }, 1000);
    } catch (err) {
      setInitiativeFeedback('❌ त्रुटी: ' + err.message);
    } finally {
      setSavingInitiatives(false);
    }
  };

  // Active Ganesha images from Cloudinary (or fallback high-quality sacred defaults)
  const activeImages = settings?.ganeshaImages && settings.ganeshaImages.length > 0
    ? settings.ganeshaImages
    : DEFAULT_GANESHA_IMAGES;

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-change image every 5 seconds (5000ms) with smooth transitions
  useEffect(() => {
    if (activeImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % activeImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeImages.length, isPaused]);

  const [floatingParticles, setFloatingParticles] = useState([]);
  const [diyaLit, setDiyaLit] = useState(false);
  const [ritualFeedback, setRitualFeedback] = useState('');

  // Trigger virtual flower shower
  const triggerFlowerShower = () => {
    playFlowerChime();
    setRitualFeedback(t('flowerChimeMsg'));

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
    setRitualFeedback(t('diyaLitMsg'));
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
              <span>{t('heroBadge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-[0_4px_20px_rgba(251,191,36,0.6)]">
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
            </h1>
          </motion.div>

          {/* Hero Image in Ornate Circular Golden Frame with Radiant Divine Aura */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative my-4 flex items-center justify-center"
          >
            {/* Glowing Pulsing Divine Aura */}
            <motion.div
              animate={{ 
                scale: [1, 1.12, 1],
                opacity: [0.65, 0.95, 0.65] 
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -inset-6 sm:-inset-8 rounded-full bg-gradient-to-tr from-amber-400/50 via-orange-500/40 to-red-600/35 blur-3xl -z-10"
            />

            {/* Concentric Decorative Sacred Temple Halo Rings (Prabhavali / प्रभावळ) */}
            {/* 1. Outermost Glowing Circular Ring */}
            <div className="pointer-events-none absolute -inset-7 sm:-inset-9 rounded-full border border-amber-400/30 blur-[0.5px]" />
            
            {/* 2. Rotating Ornate Dashed Sacred Halo Ring */}
            <div className="pointer-events-none absolute -inset-3.5 sm:-inset-4.5 rounded-full border-2 border-dashed border-amber-400/60 animate-spin-slow" />
            
            {/* 3. Reverse Counter-rotating Dotted Inner Halo Ring */}
            <div className="pointer-events-none absolute -inset-1.5 sm:-inset-2 rounded-full border border-dotted border-orange-400/70 animate-spin-slow-reverse" />

            {/* 5-Second Auto-Rotating Ganesha Frame - Perfect Circular Divine Frame */}
            <motion.div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              animate={{ y: [-4, 5, -4] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative flex h-64 w-64 sm:h-80 sm:w-80 md:h-88 md:w-88 aspect-square items-center justify-center rounded-full p-2.5 sm:p-3 bg-gradient-to-tr from-amber-300 via-amber-500 via-orange-500 to-yellow-300 shadow-[0_0_50px_rgba(245,158,11,0.55)] ring-4 ring-amber-400/80 ring-offset-2 ring-offset-orange-950"
            >
              {/* Inner Circular Frame holding the Images */}
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-amber-300/90 bg-gradient-to-b from-orange-950/95 to-black/95 flex items-center justify-center shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImgIndex}
                    src={activeImages[currentImgIndex]}
                    alt={`भगवान श्री गणेश रूप ${currentImgIndex + 1}`}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-full w-full object-cover object-center rounded-full filter drop-shadow-[0_4px_25px_rgba(245,158,11,0.6)] select-none"
                  />
                </AnimatePresence>

                {/* Left & Right quick browse arrows */}
                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImgIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/70 hover:bg-black/90 text-amber-300 flex items-center justify-center text-sm font-black backdrop-blur-md cursor-pointer transition opacity-80 hover:opacity-100 z-20 border border-amber-400/40 shadow-md"
                      title={t('prevDarshan')}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImgIndex((prev) => (prev + 1) % activeImages.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/70 hover:bg-black/90 text-amber-300 flex items-center justify-center text-sm font-black backdrop-blur-md cursor-pointer transition opacity-80 hover:opacity-100 z-20 border border-amber-400/40 shadow-md"
                      title={t('nextDarshan')}
                    >
                      ›
                    </button>
                  </>
                )}

                {/* 5-second Progress Dots Indicator */}
                {activeImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-amber-500/40 z-20 shadow-lg">
                    {activeImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImgIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentImgIndex === idx
                            ? 'w-5 bg-amber-400'
                            : 'w-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                        title={`${t('darshanProgress')} ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Decorative Perimeter Holy Diya & Flower */}
              <span className="absolute -top-1 -right-1 text-2xl sm:text-3xl filter drop-shadow z-20">🪔</span>
              <span className="absolute -bottom-1 -left-1 text-2xl sm:text-3xl filter drop-shadow z-20">🌺</span>
            </motion.div>
          </motion.div>

          {/* Devotional Description */}
          <p className="max-w-2xl text-xs sm:text-sm md:text-base text-orange-200/85 leading-relaxed font-medium">
            {t('heroSubtitle')}
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
              <span>{t('showerFlowers')}</span>
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
              <span>{diyaLit ? t('diyaLit') : t('lightDiya')}</span>
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
              <span>{t('btnLiveBoard')}</span>
            </Link>

            <Link
              to="/volunteer"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl border-2 border-amber-500/40 bg-orange-950/50 hover:bg-orange-900/60 px-6 py-3.5 text-sm sm:text-base font-black text-amber-200 hover:text-white shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <UserCheck className="h-5 w-5 text-amber-400" />
              <span>{t('btnVolunteerDesk')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 MANDAL OFFICIAL NOTICE BOARD (अधिकृत सूचना फलक)                         */}
      {/* ========================================================================= */}
      <NoticeBoard />

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
      <section id="initiatives" className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-5 sm:p-8 md:p-10 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-300 mb-1">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>{t('initiativesBadge')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {t('initiativesTitle')}
            </h3>
            <span className="text-xs text-orange-200/70 block mt-0.5">
              {t('initiativesSubtitle')}
            </span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenEditInitiatives}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer self-start md:self-auto"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t('editInitiativesBtn')}</span>
            </button>
          )}
        </div>

        {/* Grid of Social Initiatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeInitiatives.map((item, idx) => {
            const Icon = ICON_MAP[item.iconName] || item.icon || HeartHandshake;
            return (
              <motion.div
                key={item.id || (typeof item.title === 'string' ? item.title : item.title?.mr || idx)}
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
                      {pick(item.title)}
                    </h4>
                    <span className={`inline-block rounded-full border px-2 py-0.2 text-[10px] font-bold ${item.color || 'border-amber-500/40 bg-amber-950/30 text-amber-300'}`}>
                      {pick(item.tag)}
                    </span>
                  </div>

                  <p className="text-xs text-orange-200/80 leading-relaxed">
                    {pick(item.desc)}
                  </p>

                  <div className="pt-1 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>✦</span>
                    <span>{pick(item.stats)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ADMIN INITIATIVES EDIT MODAL                                               */}
      {/* ========================================================================= */}
      {isAdmin && isEditingInitiatives && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl w-full rounded-3xl border border-amber-500/40 bg-gradient-to-b from-orange-950/95 via-zinc-950 to-black p-5 sm:p-7 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5"
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✏️</span>
                  <span>{t('adminInitiativesModalTitle')}</span>
                </h3>
                <p className="text-xs text-orange-200/70">
                  {t('adminInitiativesModalSub')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingInitiatives(false)}
                className="rounded-full p-1.5 text-orange-200/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {initiativeFeedback && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs sm:text-sm font-semibold text-amber-200">
                {initiativeFeedback}
              </div>
            )}

            {/* List of items to edit */}
            <div className="space-y-4">
              {editingInitiativesList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-2xl border border-amber-500/25 bg-black/50 p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                    <span className="text-xs font-bold text-amber-300">
                      {lang === 'mr' ? `उपक्रम #${idx + 1}` : `Initiative #${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteInitiativeItem(idx)}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 transition cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'उपक्रमाचे नाव / शीर्षक' : 'Initiative Title'}
                      </label>
                      <input
                        type="text"
                        value={typeof item.title === 'string' ? item.title : pick(item.title)}
                        onChange={(e) => handleUpdateInitiativeItem(idx, 'title', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                        placeholder={lang === 'mr' ? 'उदा. भव्य रक्तदान शिबिर' : 'e.g. Blood Donation Drive'}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'आकडेवारी / प्रभाव (Stats)' : 'Stats / Impact Metric'}
                      </label>
                      <input
                        type="text"
                        value={typeof item.stats === 'string' ? item.stats : pick(item.stats)}
                        onChange={(e) => handleUpdateInitiativeItem(idx, 'stats', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                        placeholder={lang === 'mr' ? 'उदा. २५०+ बाटल्या रक्त संकलन' : 'e.g. 250+ units collected'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'टॅग (Tag / Category)' : 'Tag / Category'}
                      </label>
                      <input
                        type="text"
                        value={typeof item.tag === 'string' ? item.tag : pick(item.tag)}
                        onChange={(e) => handleUpdateInitiativeItem(idx, 'tag', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                        placeholder={lang === 'mr' ? 'उदा. आरोग्य सेवा' : 'e.g. Health Seva'}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'चिन्ह (Icon)' : 'Icon'}
                      </label>
                      <select
                        value={item.iconName || 'HeartHandshake'}
                        onChange={(e) => handleUpdateInitiativeItem(idx, 'iconName', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/80 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="Droplet">🩸 Droplet {lang === 'mr' ? '(रक्तदान / आरोग्य)' : '(Blood / Health)'}</option>
                        <option value="Utensils">🍲 Utensils {lang === 'mr' ? '(महाप्रसाद / अन्नदान)' : '(Prasad / Food)'}</option>
                        <option value="GraduationCap">🎓 GraduationCap {lang === 'mr' ? '(शिक्षण)' : '(Education)'}</option>
                        <option value="Award">🏆 Award {lang === 'mr' ? '(संस्कृती / स्पर्धा)' : '(Culture / Trophy)'}</option>
                        <option value="HeartHandshake">🤝 HeartHandshake {lang === 'mr' ? '(सेवा)' : '(Community Seva)'}</option>
                        <option value="Flame">🔥 Flame {lang === 'mr' ? '(आरती / यज्ञ)' : '(Aarti / Flame)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'रंग शैली (Color Theme)' : 'Color Theme'}
                      </label>
                      <select
                        value={item.color || COLOR_OPTIONS[0].value}
                        onChange={(e) => handleUpdateInitiativeItem(idx, 'color', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/80 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.label} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                      {lang === 'mr' ? 'सविस्तर माहिती (Description)' : 'Detailed Description'}
                    </label>
                    <textarea
                      rows={2}
                      value={typeof item.desc === 'string' ? item.desc : pick(item.desc)}
                      onChange={(e) => handleUpdateInitiativeItem(idx, 'desc', e.target.value)}
                      className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                      placeholder={lang === 'mr' ? 'उपक्रमाबद्दल थोडक्यात माहिती...' : 'Brief summary about this initiative...'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
              <button
                type="button"
                onClick={handleAddInitiative}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-amber-400/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t('addInitiativeBtn')}</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingInitiatives(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  disabled={savingInitiatives}
                  onClick={handleSaveInitiatives}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-600/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingInitiatives ? t('saving') : t('saveInitiativesBtn')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer Auspicious Blessing Quote */}
      <div className="text-center py-4">
        <p className="font-serif text-amber-200/90 text-sm sm:text-base italic">
          {t('footerQuote')}
        </p>
      </div>
    </div>
  );
}
