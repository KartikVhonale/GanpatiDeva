import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import websiteIcon from '../assets/svg.png';

export default function Header({ 
  mandalName, 
  location = "Dhanora bk", 
  tagline,
  isConnected = false,
}) {
  const { t, isMarathi } = useLanguage();

  const displayMandalName = mandalName || t('mandalName');
  const displayTagline = tagline || (isMarathi
    ? "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा"
    : "May Lord Ganesha remove all obstacles and shower divine blessings upon you");

  return (
    <header className="relative w-full overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-orange-950/40 via-red-950/30 to-black/50 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(234,88,12,0.2)]">
      {/* Decorative festive ambient glows */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-orange-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-rose-600/25 blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Mandir / Idol Emblem & Title */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 text-center md:text-left"
        >
          {/* Emblem with sacred Ganesha Icon */}
          <div className="relative flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-0.5 shadow-lg shadow-orange-600/40 ring-2 ring-amber-400/40 overflow-hidden">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-orange-950/90 to-red-950/90 backdrop-blur-sm overflow-hidden">
              <img
                src={websiteIcon}
                alt="Shree Ganesh Emblem"
                className="h-full w-full object-cover rounded-[14px]"
              />
            </div>
            {/* Pulsing ring */}
            <span className="absolute -inset-1 animate-ping rounded-2xl bg-orange-500/20 -z-10" />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {isMarathi ? 'उत्सव सेवा २०२६' : 'Utsav Seva 2026'}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-md ${
                isConnected ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-rose-300"
              }`}>
                <span className={`inline-block h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 animate-ping" : "bg-red-500 animate-ping"}`} />
                {isConnected ? "Socket.io Live" : "Live Seva Tracker"}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                {displayMandalName}
              </span>
            </h1>

            <p className="text-xs md:text-sm text-orange-200/80 mt-0.5 font-medium flex items-center justify-center md:justify-start gap-1">
              <span>📍 {location}</span>
            </p>
            <p className="text-[11px] text-amber-200/70 italic mt-1 max-w-md">
              {displayTagline}
            </p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
