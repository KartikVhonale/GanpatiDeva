import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, QrCode, Copy, Check, Tv, ShieldCheck } from 'lucide-react';
import TotalCounter from '../components/TotalCounter';
import RecentDonorsList from '../components/RecentDonorsList';
import ScrollingTicker from '../components/ScrollingTicker';
import useDonations from '../hooks/useDonations';
import { useLanguage } from '../context/LanguageContext';

export default function DakshinaBoard() {
  const { t, lang } = useLanguage();
  const {
    totalAmount,
    targetAmount,
    donorCount,
    prasadCount,
    aartiSponsors,
    donors,
    latestDonation,
  } = useDonations();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const upiId = 'mandal.ganpati@upi';

  // Keep live time updated for TV display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error enabling fullscreen:', err.message);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error exiting fullscreen:', err.message);
      });
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Live Continuous Scrolling Ticker */}
      <ScrollingTicker latestDonation={latestDonation} />

      {/* Screen Control Header for Pandal TV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-orange-950/70 via-red-950/50 to-black/80 px-5 py-3 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 border border-red-400/40 text-rose-300">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">
                {t('dakshinaTitle')}
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.2 text-[10px] font-bold text-red-300 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                LIVE TV
              </span>
            </div>
            <p className="text-[11px] text-orange-200/70">
              {t('dakshinaSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Real-time Clock */}
          <div className="font-mono text-xs font-bold text-amber-300 bg-black/40 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            {currentTime}
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 text-xs font-bold text-amber-200 hover:text-white transition-all shadow cursor-pointer"
            title="Toggle Fullscreen for Pandal TV"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>{t('exitFullscreen')}</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>{t('enterFullscreen')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Total Counter (Main) + Dedicated UPI QR Code Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Total Collection Display (Takes 2 Columns on LG) */}
        <div className="lg:col-span-2">
          <TotalCounter
            totalAmount={totalAmount}
            targetAmount={targetAmount}
            donorCount={donorCount}
            prasadCount={prasadCount}
            aartiSponsors={aartiSponsors}
          />
        </div>

        {/* Dedicated UPI QR Code Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-br from-orange-950/50 via-red-950/40 to-black/75 p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(234,88,12,0.22)] text-center flex flex-col items-center justify-between">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/15 blur-2xl" />

          {/* Header */}
          <div className="space-y-1 mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-0.5 text-[11px] font-bold text-amber-300">
              <QrCode className="h-3 w-3" />
              <span>{lang === 'mr' ? 'डिजिटल सेवा अर्पण' : 'Digital Seva'}</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              {t('scanPayTitle')}
            </h3>
            <p className="text-xs text-orange-200/75">
              {t('scanPaySubtitle')}
            </p>
          </div>

          {/* High-Contrast Crisp QR Code Container */}
          <div className="relative my-2 p-3 bg-white rounded-2xl shadow-xl ring-2 ring-amber-400/50">
            {/* SVG Crisp QR Code with Auspicious Center Emblem */}
            <svg
              className="w-44 h-44 sm:w-48 sm:h-48"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="160" height="160" fill="white" />
              {/* Corner Position Detection Patterns */}
              {/* Top Left */}
              <rect x="10" y="10" width="40" height="40" fill="#0f0705" rx="4" />
              <rect x="16" y="16" width="28" height="28" fill="white" rx="2" />
              <rect x="22" y="22" width="16" height="16" fill="#c2410c" rx="2" />

              {/* Top Right */}
              <rect x="110" y="10" width="40" height="40" fill="#0f0705" rx="4" />
              <rect x="116" y="16" width="28" height="28" fill="white" rx="2" />
              <rect x="122" y="22" width="16" height="16" fill="#c2410c" rx="2" />

              {/* Bottom Left */}
              <rect x="10" y="110" width="40" height="40" fill="#0f0705" rx="4" />
              <rect x="16" y="116" width="28" height="28" fill="white" rx="2" />
              <rect x="22" y="122" width="16" height="16" fill="#c2410c" rx="2" />

              {/* Data Modules (Decorative authentic QR structure) */}
              <rect x="60" y="15" width="8" height="8" fill="#1c1917" />
              <rect x="75" y="15" width="12" height="8" fill="#1c1917" />
              <rect x="92" y="15" width="8" height="8" fill="#1c1917" />

              <rect x="60" y="30" width="10" height="10" fill="#1c1917" />
              <rect x="80" y="30" width="8" height="12" fill="#1c1917" />
              <rect x="95" y="28" width="6" height="8" fill="#1c1917" />

              <rect x="15" y="60" width="12" height="8" fill="#1c1917" />
              <rect x="35" y="62" width="8" height="12" fill="#1c1917" />
              <rect x="110" y="60" width="10" height="8" fill="#1c1917" />
              <rect x="130" y="62" width="8" height="14" fill="#1c1917" />

              <rect x="15" y="80" width="8" height="10" fill="#1c1917" />
              <rect x="30" y="85" width="12" height="6" fill="#1c1917" />
              <rect x="115" y="80" width="12" height="8" fill="#1c1917" />
              <rect x="135" y="85" width="8" height="10" fill="#1c1917" />

              <rect x="60" y="115" width="12" height="8" fill="#1c1917" />
              <rect x="80" y="110" width="8" height="12" fill="#1c1917" />
              <rect x="95" y="118" width="10" height="8" fill="#1c1917" />

              <rect x="60" y="135" width="10" height="10" fill="#1c1917" />
              <rect x="78" y="132" width="14" height="8" fill="#1c1917" />
              <rect x="115" y="135" width="8" height="8" fill="#1c1917" />
              <rect x="130" y="130" width="12" height="14" fill="#1c1917" />

              {/* Center Holy Kalash / Ganesha Badge */}
              <rect x="60" y="60" width="40" height="40" fill="white" rx="6" stroke="#ea580c" strokeWidth="2" />
              <text x="80" y="85" textAnchor="middle" fontSize="20" fill="#ea580c">🪔</text>
            </svg>
          </div>

          {/* UPI ID Copy Box & Direct Mobile App Pay */}
          <div className="w-full mt-2 space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-black/60 px-3.5 py-2 text-xs">
              <span className="font-mono font-bold text-amber-300 truncate">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="flex items-center gap-1 text-[11px] text-orange-200 hover:text-white cursor-pointer shrink-0"
                title="Copy UPI ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t('copiedUpi') : t('copyUpi')}</span>
              </button>
            </div>

            {/* Direct 1-Tap Mobile Payment Button (for Phone users) */}
            <a
              href="upi://pay?pa=mandal.ganpati@upi&pn=Shree%20Ganesh%20Utsav%20Mandal&cu=INR"
              className="sm:hidden w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-3 text-xs font-black text-black shadow-md active:scale-95 transition-all"
            >
              <span>{t('openMobileUpi')}</span>
            </a>

            <p className="text-[11px] text-orange-200/60 mt-1.5 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>{t('safeAccountNotice')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Recent Donors List (Live Socket.io Feed) */}
      <RecentDonorsList donors={donors} />
    </div>
  );
}
