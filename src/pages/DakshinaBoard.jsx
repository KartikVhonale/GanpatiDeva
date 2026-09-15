import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  QrCode,
  Copy,
  Check,
  Tv,
  ShieldCheck,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';
import TotalCounter from '../components/TotalCounter';
import RecentDonorsList from '../components/RecentDonorsList';
import ScrollingTicker from '../components/ScrollingTicker';
import useDonations from '../hooks/useDonations';
import { useLanguage, SEVA_CATEGORIES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { buildOfficialUpiUrl, generateUpiQrDataUrl } from '../utils/upiHelper';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const QUICK_AMOUNTS = [101, 251, 501, 1100, 2100, 5100];

export default function DakshinaBoard() {
  const { t, pick, lang } = useLanguage();
  const { isLight } = useTheme();
  const {
    totalAmount,
    targetAmount,
    donorCount,
    prasadCount,
    aartiSponsors,
    donors,
    latestDonation,
    settings,
    submitPaymentRequest,
  } = useDonations();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Verification Request Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    name: '',
    amount: '',
    phone: '',
    city: '',
    category: lang === 'mr' ? 'महाप्रसाद सेवा' : 'Maha-Prasad Seva',
    utrNumber: '',
  });
  const [submittingVerify, setSubmittingVerify] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [localQrDataUrl, setLocalQrDataUrl] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(101);
  const [liveNotices, setLiveNotices] = useState([]);

  // Dynamic Settings from Admin (fallback to 8484844728@slc)
  const upiId = (settings?.upiId && settings.upiId !== 'mandal.ganpati@upi') ? settings.upiId : '8484844728@slc';
  const upiName = settings?.upiName || (lang === 'mr' ? 'श्री बाल गणेश मंडळ धानोरा बु.' : 'Shri Baal Ganesh Mandal Dhanora Bk.');
  const qrCodeUrl = settings?.qrCodeUrl || '';
  const qrCodeNote = settings?.qrCodeNote || (lang === 'mr' ? 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा' : 'Scan & offer your humble devotion at Lord Ganesha\'s feet');

  // Strict NPCI-compliant deep link: upi://pay?cu=INR&pa=8484844728@slc&pn=kartik&tn=ganesh%20seva&am=501.00
  const officialUpiPayUrl = buildOfficialUpiUrl(upiId, {
    payeeName: 'kartik',
    amount: selectedAmount,
    note: 'ganesh seva',
  });

  // Generate offline local QR code compliant with NPCI specification
  useEffect(() => {
    let isCurrent = true;
    generateUpiQrDataUrl(officialUpiPayUrl).then((url) => {
      if (isCurrent && url) {
        setLocalQrDataUrl(url);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [officialUpiPayUrl]);

  // Fallback if local generation is rendering
  const fallbackExternalQr = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(officialUpiPayUrl)}`;
  // Priority: Main QR code from database (qrCodeUrl) if present, otherwise offline generated official QR
  const displayQrImage = qrCodeUrl || localQrDataUrl || fallbackExternalQr;

  // Keep live time updated for TV display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fetch real-time live notices for TV Screen Ticker
  useEffect(() => {
    const fetchBoardNotices = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/notices`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.notices)) {
          setLiveNotices(data.notices);
        }
      } catch (e) {}
    };
    fetchBoardNotices();

    let socket;
    try {
      socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
      socket.on('notices_updated', (data) => {
        if (data && Array.isArray(data.notices)) {
          setLiveNotices(data.notices);
        } else {
          fetchBoardNotices();
        }
      });
    } catch (e) {}
    return () => {
      if (socket) socket.disconnect();
    };
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

  // Submit payment verification request
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifySuccess('');

    const numericAmount = Number(verifyForm.amount);
    if (!verifyForm.name.trim()) {
      setVerifyError(t('enterValidName'));
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setVerifyError(t('enterValidAmount'));
      return;
    }
    if (!verifyForm.utrNumber.trim()) {
      setVerifyError(t('enterValidUtr'));
      return;
    }

    setSubmittingVerify(true);
    try {
      const res = await submitPaymentRequest({
        name: verifyForm.name.trim(),
        amount: numericAmount,
        phone: verifyForm.phone.trim(),
        city: verifyForm.city.trim() || (lang === 'mr' ? 'ऑनलाइन भाविक' : 'Online Devotee'),
        category: verifyForm.category,
        utrNumber: verifyForm.utrNumber.trim(),
      });

      setVerifySuccess(res.message || t('verifySuccessMsg'));
      setVerifyForm({
        name: '',
        amount: '',
        phone: '',
        city: '',
        category: lang === 'mr' ? 'महाप्रसाद सेवा' : 'Maha-Prasad Seva',
        utrNumber: '',
      });
    } catch (err) {
      setVerifyError(err.message || t('error'));
    } finally {
      setSubmittingVerify(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Live Continuous Scrolling Ticker */}
      <ScrollingTicker latestDonation={latestDonation} />

      {/* Screen Control Header for Pandal TV */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border px-5 py-3 backdrop-blur-xl shadow-lg ${
        isLight
          ? 'border-[#CC5500]/25 bg-[#FFFDD0] text-stone-900'
          : 'border-amber-500/30 bg-gradient-to-r from-orange-950/70 via-red-950/50 to-black/80 text-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            isLight
              ? 'bg-[#CC5500]/10 border-[#CC5500]/30 text-[#CC5500]'
              : 'bg-red-500/20 border-red-400/40 text-rose-300'
          }`}>
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm sm:text-base font-black ${isLight ? 'text-stone-900' : 'text-white'}`}>
                {t('dakshinaTitle')}
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.2 text-[10px] font-bold text-red-500 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                LIVE TV
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              {t('dakshinaSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Real-time Clock */}
          <div className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl border ${
            isLight
              ? 'text-[#CC5500] bg-[#F5F5DC] border-[#CC5500]/30'
              : 'text-amber-300 bg-black/40 border-amber-500/20'
          }`}>
            {currentTime}
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow cursor-pointer ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-[#CC5500] hover:bg-[#FFFDD0]'
                : 'border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 hover:text-white'
            }`}
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

      {/* Real-time Notice Board Ticker for Live Pandal TV Display */}
      {liveNotices.length > 0 && (
        <div className={`relative overflow-hidden rounded-2xl border py-2.5 px-3.5 backdrop-blur-xl shadow-md flex items-center gap-3 ${
          isLight
            ? 'border-[#CC5500]/25 bg-[#FFFDD0] text-stone-800'
            : 'border-amber-500/35 bg-gradient-to-r from-orange-950/80 via-red-950/60 to-black/80 text-white'
        }`}>
          <div className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl text-xs font-black shadow-inner ${
            isLight
              ? 'bg-[#CC5500]/10 border border-[#CC5500]/30 text-[#CC5500]'
              : 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
          }`}>
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span>📢 {lang === 'mr' ? 'मंडळ सूचना' : 'Mandal Notice'}:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className={`inline-flex animate-marquee gap-8 text-xs sm:text-sm font-bold ${
              isLight ? 'text-stone-700' : 'text-amber-200'
            }`}>
              {liveNotices.map((n, i) => (
                <span key={n._id || i} className="inline-flex items-center gap-2">
                  <span className={`font-black ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`}>[{n.title}]</span>
                  <span>{n.content}</span>
                  <span className={isLight ? 'text-stone-400' : 'text-amber-500/60'}>✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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

        {/* Dedicated UPI QR Code Card (Configured by Admin) */}
        <div className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 backdrop-blur-2xl text-center flex flex-col items-center justify-between ${
          isLight
            ? 'border-[#CC5500]/25 bg-[#FFFDD0] shadow-[0_12px_40px_rgba(204,85,0,0.15)] text-stone-900'
            : 'border-amber-500/35 bg-gradient-to-br from-orange-950/50 via-red-950/40 to-black/75 shadow-[0_12px_40px_rgba(234,88,12,0.22)] text-white'
        }`}>
          <div className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl ${
            isLight ? 'bg-[#CC5500]/10' : 'bg-amber-500/15'
          }`} />

          {/* Header */}
          <div className="space-y-1 mb-2.5">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#CC5500]/10 text-[#CC5500]'
                : 'border-amber-400/40 bg-amber-500/15 text-amber-300'
            }`}>
              <QrCode className="h-3 w-3" />
              <span>{t('digitalSevaBadge')}</span>
            </div>
            <h3 className={`text-lg font-extrabold ${isLight ? 'text-stone-900' : 'text-white'}`}>
              {t('scanPayTitle')}
            </h3>
            <p className={`text-[11px] max-w-xs ${isLight ? 'text-stone-600' : 'text-orange-200/75'}`}>
              {qrCodeNote}
            </p>
          </div>

          {/* High-Contrast Dynamic QR Code Container */}
          <div className="relative my-2 p-2.5 bg-white rounded-2xl shadow-xl ring-2 ring-amber-400/50 transition-all hover:scale-105">
            <img
              src={displayQrImage}
              alt="Mandal Official QR Code"
              className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
              onError={(e) => {
                if (e.target.src !== fallbackExternalQr) {
                  e.target.src = fallbackExternalQr;
                }
              }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
              {upiName}
            </div>
          </div>

          {/* Quick Amount Selector (Defaults to ₹501 matching user verified UPI link) */}
          <div className="w-full mt-2">
            <div className={`flex items-center justify-between text-[11px] mb-1 px-1 ${
              isLight ? 'text-stone-600' : 'text-orange-200/80'
            }`}>
              <span>{lang === 'mr' ? 'रक्कम निवडा (Select Amount):' : 'Select Amount:'}</span>
              <span className={`font-mono font-bold ${isLight ? 'text-[#CC5500]' : 'text-amber-300'}`}>
                {selectedAmount ? `₹${selectedAmount}` : (lang === 'mr' ? 'कोणतीही रक्कम' : 'Any Amount')}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 w-full">
              {[101, 251, 501, 1100, 2100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-1.5 px-0.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                    selectedAmount === amt
                      ? isLight
                        ? 'bg-[#CC5500] text-white shadow-md shadow-[#CC5500]/30 scale-105 ring-1 ring-[#B7410E]'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md shadow-orange-500/30 scale-105 ring-1 ring-amber-300'
                      : isLight
                        ? 'bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0] border border-[#CC5500]/25'
                        : 'bg-black/50 text-orange-200 hover:bg-black/70 border border-amber-500/25'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedAmount(null)}
                className={`py-1.5 px-0.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  !selectedAmount
                    ? isLight
                      ? 'bg-[#CC5500] text-white shadow-md scale-105 ring-1 ring-[#B7410E]'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md scale-105 ring-1 ring-amber-300'
                    : isLight
                      ? 'bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0] border border-[#CC5500]/25'
                      : 'bg-black/50 text-orange-200/70 hover:bg-black/70 border border-amber-500/25'
                }`}
              >
                {lang === 'mr' ? 'इतर' : 'Any'}
              </button>
            </div>
          </div>

          {/* UPI ID Copy Box & Direct Mobile App Pay */}
          <div className="w-full mt-3 space-y-2.5">
            <div className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-xs ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#F5F5DC]'
                : 'border-amber-500/30 bg-black/60'
            }`}>
              <span className={`font-mono font-bold truncate ${isLight ? 'text-[#CC5500]' : 'text-amber-300'}`}>
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className={`flex items-center gap-1 text-[11px] cursor-pointer shrink-0 ${
                  isLight ? 'text-stone-600 hover:text-[#CC5500]' : 'text-orange-200 hover:text-white'
                }`}
                title="Copy UPI ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t('copiedUpi') : t('copyUpi')}</span>
              </button>
            </div>

            {/* Direct 1-Tap Mobile Payment Button (for Mobile users) */}
            <a
              href={officialUpiPayUrl}
              className="sm:hidden w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-3 text-xs font-black text-black shadow-md active:scale-95 transition-all"
            >
              <span>{t('openMobileUpi')}</span>
            </a>

            {/* Tip regarding Bank Limit issues */}
            <div className={`rounded-xl border px-2.5 py-1.5 text-[10px] leading-relaxed text-center ${
              isLight
                ? 'border-[#CC5500]/25 bg-[#CC5500]/10 text-stone-700'
                : 'border-amber-500/25 bg-amber-500/10 text-orange-200/90'
            }`}>
              {t('upiLimitNote')}
            </div>

            {/* Button to Raise Verification Request */}
            <button
              type="button"
              onClick={() => {
                setVerifySuccess('');
                setVerifyError('');
                setIsVerifyModalOpen(true);
              }}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer ${
                isLight
                  ? 'bg-[#CC5500] hover:bg-[#B7410E] text-white shadow-[#CC5500]/30 ring-1 ring-[#CC5500]/40'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-orange-600/30 ring-1 ring-amber-300/50'
              }`}
            >
              <span>{t('verifyPaymentBtn')}</span>
            </button>

            <p className={`text-[11px] flex items-center justify-center gap-1 ${
              isLight ? 'text-stone-500' : 'text-orange-200/60'
            }`}>
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>{t('safeAccountNotice')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Recent Donors List (Live Socket.io Feed) */}
      <RecentDonorsList donors={donors} />

      {/* Devotee Payment Verification Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`relative w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${
            isLight
              ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-stone-900 shadow-2xl'
              : 'border-amber-500/40 bg-gradient-to-b from-orange-950/90 via-red-950/80 to-black/95 text-white'
          }`}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(false)}
              className={`absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${
                isLight
                  ? 'bg-stone-200/80 hover:bg-stone-300 text-stone-700'
                  : 'bg-white/10 hover:bg-white/20 text-orange-200'
              }`}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 mb-4">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${
                isLight
                  ? 'border-[#CC5500]/30 bg-[#CC5500]/10 text-[#CC5500]'
                  : 'border-amber-400/40 bg-amber-500/20 text-amber-300'
              }`}>
                <span>🪔</span>
                <span>{t('verifyModalBadge')}</span>
              </div>
              <h3 className={`text-xl font-black ${isLight ? 'text-stone-900' : 'text-white'}`}>
                {t('verifyModalTitle')}
              </h3>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-orange-200/75'}`}>
                {t('verifyModalSub')}
              </p>
            </div>

            {/* Success Alert */}
            {verifySuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-400/40 text-3xl">
                  ✓
                </div>
                <div className="text-emerald-600 font-bold text-sm">
                  {verifySuccess}
                </div>
                <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
                  {t('verifySuccessSub')}
                </p>
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow cursor-pointer ${
                    isLight ? 'bg-[#CC5500] hover:bg-[#B7410E]' : 'bg-gradient-to-r from-amber-500 to-orange-600'
                  }`}
                >
                  {t('verifyDoneBtn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitVerification} className="space-y-3.5">
                {/* Error Banner */}
                {verifyError && (
                  <div className={`rounded-xl border p-2.5 text-xs flex items-center gap-2 ${
                    isLight ? 'border-red-400/50 bg-red-50 text-red-800' : 'border-red-500/40 bg-red-950/60 text-red-200'
                  }`}>
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                {/* Donor Name */}
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-stone-700' : 'text-orange-200/80'
                  }`}>
                    {t('verifyNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('verifyNamePlaceholder')}
                    value={verifyForm.name}
                    onChange={(e) => setVerifyForm({ ...verifyForm, name: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm outline-none ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500]'
                        : 'border-amber-500/30 bg-black/50 text-white placeholder-orange-300/40 focus:border-amber-400'
                    }`}
                  />
                </div>

                {/* Amount & Quick Chips */}
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-stone-700' : 'text-orange-200/80'
                  }`}>
                    {t('verifyAmountLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={t('verifyAmountPlaceholder')}
                    value={verifyForm.amount}
                    onChange={(e) => setVerifyForm({ ...verifyForm, amount: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm font-bold outline-none mb-1.5 ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-[#CC5500] placeholder-stone-400 focus:border-[#CC5500]'
                        : 'border-amber-500/30 bg-black/50 text-amber-300 placeholder-orange-300/40 focus:border-amber-400'
                    }`}
                  />
                  <div className="grid grid-cols-6 gap-1">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setVerifyForm({ ...verifyForm, amount: amt.toString() })}
                        className={`text-[10px] py-1 rounded-lg border font-bold transition cursor-pointer ${
                          verifyForm.amount === amt.toString()
                            ? isLight
                              ? 'bg-[#CC5500] text-white border-[#B7410E]'
                              : 'bg-amber-400 text-black border-amber-300'
                            : isLight
                              ? 'border-[#CC5500]/20 bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0]'
                              : 'border-amber-500/20 bg-orange-950/40 text-orange-200 hover:bg-orange-900/40'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UTR / Transaction ID */}
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-stone-700' : 'text-orange-200/80'
                  }`}>
                    {t('verifyUtrLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('verifyUtrPlaceholder')}
                    value={verifyForm.utrNumber}
                    onChange={(e) => setVerifyForm({ ...verifyForm, utrNumber: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs font-mono outline-none ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500]'
                        : 'border-amber-500/30 bg-black/50 text-white placeholder-orange-300/40 focus:border-amber-400'
                    }`}
                  />
                  <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-stone-500' : 'text-orange-200/60'}`}>
                    {t('verifyUtrHint')}
                  </span>
                </div>

                {/* Phone & City */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      isLight ? 'text-stone-700' : 'text-orange-200/80'
                    }`}>
                      {t('verifyPhoneLabel')}
                    </label>
                    <input
                      type="tel"
                      placeholder={t('verifyPhonePlaceholder')}
                      value={verifyForm.phone}
                      onChange={(e) => setVerifyForm({ ...verifyForm, phone: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500]'
                          : 'border-amber-500/30 bg-black/50 text-white placeholder-orange-300/40 focus:border-amber-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      isLight ? 'text-stone-700' : 'text-orange-200/80'
                    }`}>
                      {t('verifyCityLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('verifyCityPlaceholder')}
                      value={verifyForm.city}
                      onChange={(e) => setVerifyForm({ ...verifyForm, city: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                        isLight
                          ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 placeholder-stone-400 focus:border-[#CC5500]'
                          : 'border-amber-500/30 bg-black/50 text-white placeholder-orange-300/40 focus:border-amber-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Seva Category */}
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-stone-700' : 'text-orange-200/80'
                  }`}>
                    {t('verifyCategoryLabel')}
                  </label>
                  <select
                    value={verifyForm.category}
                    onChange={(e) => setVerifyForm({ ...verifyForm, category: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#F5F5DC] text-stone-900 focus:border-[#CC5500]'
                        : 'border-amber-500/30 bg-black/70 text-orange-100 focus:border-amber-400'
                    }`}
                  >
                    {SEVA_CATEGORIES.map((cat) => {
                      const label = pick(cat);
                      return (
                        <option key={cat.id} value={label} className={isLight ? 'bg-white text-stone-900' : 'bg-orange-950 text-white'}>
                          {cat.icon} {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className={`w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-black text-white shadow-lg active:scale-95 disabled:opacity-60 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-[#CC5500] hover:bg-[#B7410E] shadow-[#CC5500]/30'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-orange-600/40 hover:brightness-110'
                  }`}
                >
                  {submittingVerify ? (
                    <span>{t('verifySubmittingBtn')}</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>{t('verifySubmitBtn')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
