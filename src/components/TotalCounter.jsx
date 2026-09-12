import React from 'react';
import { motion } from 'framer-motion';
import CountUpRaw from 'react-countup';
import { useLanguage } from '../context/LanguageContext';

const CountUp = CountUpRaw?.default || CountUpRaw;

export default function TotalCounter({
  totalAmount = 0,
  targetAmount = 500000,
  donorCount = 0,
  prasadCount = 0,
  aartiSponsors = 0
}) {
  const { lang } = useLanguage();
  const percentage = Math.min(Math.round((totalAmount / targetAmount) * 100), 100);

  const stats = [
    {
      title: lang === 'mr' ? "एकूण भाविक (Total Donors)" : "Devotees & Donors",
      value: donorCount,
      prefix: "",
      suffix: "+",
      icon: "👥",
      badge: lang === 'mr' ? "सक्रिय सहभागी" : "Active Donors",
      border: "border-amber-500/30",
    },
    {
      title: lang === 'mr' ? "महाप्रसाद सेवा (Meals Served)" : "Maha-Prasad Served",
      value: prasadCount,
      prefix: "",
      suffix: lang === 'mr' ? " थाळ्या" : " Plates",
      icon: "🍲",
      badge: lang === 'mr' ? "अन्नदान सेवा" : "Annadaan Seva",
      border: "border-orange-500/30",
    },
    {
      title: lang === 'mr' ? "आरती प्रायोजक (Aarti Sevadars)" : "Aarti Sevadars",
      value: aartiSponsors,
      prefix: "",
      suffix: lang === 'mr' ? " यजमान" : " Hosts",
      icon: "🔔",
      badge: lang === 'mr' ? "दैनिक आरती" : "Daily Aarti",
      border: "border-rose-500/30",
    },
  ];

  return (
    <section className="relative w-full space-y-6">
      {/* Main Glassmorphic Total Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/60 p-6 md:p-10 backdrop-blur-2xl shadow-[0_12px_40px_0_rgba(234,88,12,0.22)]"
      >
        {/* Soft background glow orbs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Amount Display */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'mr' ? '🌺 एकूण जमा सेवा निधी (Live Seva Collection)' : '🌺 Total Live Dakshina Collection'}</span>
            </div>

            <div className="flex items-baseline justify-center md:justify-start gap-1 font-extrabold tracking-tight">
              <span className="text-3xl md:text-5xl text-amber-400">₹</span>
              <motion.span
                key={totalAmount}
                initial={{ scale: 1.04, color: "#fef08a" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-6xl text-white font-black drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] inline-block"
              >
                <CountUp
                  end={totalAmount}
                  duration={2.0}
                  separator=","
                  preserveValue
                />
              </motion.span>
            </div>

            <p className="text-xs md:text-sm text-orange-200/75">
              {lang === 'mr' ? (
                <>
                  लक्ष्य (Target): <span className="font-semibold text-amber-300">₹{targetAmount.toLocaleString()}</span> • महाप्रसाद, मंडप सजावट व विसर्जन सोहळ्यासाठी
                </>
              ) : (
                <>
                  Target Goal: <span className="font-semibold text-amber-300">₹{targetAmount.toLocaleString()}</span> • For Maha-Prasad, pandal decoration & grand visarjan
                </>
              )}
            </p>
          </div>

          {/* Target Progress Radial Metric */}
          <div className="flex flex-col items-center md:items-end justify-center w-full md:w-auto">
            <div className="flex items-center gap-4 bg-orange-950/40 rounded-2xl border border-orange-500/20 p-4 backdrop-blur-md shadow-inner">
              <div className="relative flex items-center justify-center">
                {/* SVG Radial Progress */}
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="rgba(245, 158, 11, 0.15)"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="url(#festiveGradient)"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - percentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="festiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-base font-bold text-amber-200">
                  {percentage}%
                </span>
              </div>

              <div className="space-y-1 text-left">
                <div className="text-xs font-semibold text-orange-300 uppercase tracking-wide">
                  {lang === 'mr' ? 'ध्येय प्रगती (Progress)' : 'Campaign Progress'}
                </div>
                <div className="text-sm text-white font-medium">
                  ₹{Math.max(0, targetAmount - totalAmount).toLocaleString()} {lang === 'mr' ? 'शिल्लक' : 'Remaining'}
                </div>
                <div className="text-[11px] text-orange-300/70">
                  {lang === 'mr' ? 'उद्दिष्ट पूर्ततेच्या जवळ!' : 'Nearing Festival Goal!'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="relative mt-8">
          <div className="flex justify-between text-xs font-medium text-orange-200/80 mb-2">
            <span>{lang === 'mr' ? `सद्यस्थिती: ${percentage}% पूर्ण` : `Status: ${percentage}% Achieved`}</span>
            <span>{lang === 'mr' ? `अंतिम उद्दिष्ट: ₹${targetAmount.toLocaleString()}` : `Goal: ₹${targetAmount.toLocaleString()}`}</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/50 border border-amber-500/20 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
            />
          </div>
        </div>
      </motion.div>

      {/* Sub Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 * (idx + 1) }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br from-orange-950/30 via-red-950/20 to-black/50 p-5 backdrop-blur-xl shadow-lg hover:shadow-orange-600/20 transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                {stat.icon}
              </span>
              <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                {stat.badge}
              </span>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              <CountUp
                end={stat.value}
                duration={1.5}
                separator=","
                prefix={stat.prefix}
                suffix={stat.suffix}
                preserveValue
              />
            </div>

            <p className="text-xs text-orange-200/80 mt-1 font-medium">
              {stat.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
