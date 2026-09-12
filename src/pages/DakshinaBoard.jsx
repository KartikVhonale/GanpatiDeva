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
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import TotalCounter from '../components/TotalCounter';
import RecentDonorsList from '../components/RecentDonorsList';
import ScrollingTicker from '../components/ScrollingTicker';
import useDonations from '../hooks/useDonations';
import { useLanguage } from '../context/LanguageContext';

const QUICK_AMOUNTS = [101, 251, 501, 1100, 2100, 5100];
const SEVA_CATEGORIES = [
  'महाप्रसाद सेवा',
  'दैनिक महाआरती',
  'मोदक नैवेद्य अर्पण',
  'अखंड दीप & धूप सेवा',
  'पुष्पवृष्टी व सजावट',
];

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
    settings,
    submitPaymentRequest,
  } = useDonations();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Verification Request Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    name: '',
    amount: '',
    phone: '',
    city: '',
    category: 'महाप्रसाद सेवा',
    utrNumber: '',
  });
  const [submittingVerify, setSubmittingVerify] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Dynamic Settings from Admin (fallback to defaults)
  const upiId = settings?.upiId || 'mandal.ganpati@upi';
  const upiName = settings?.upiName || 'सार्वजनिक श्री गणेश उत्सव मंडळ';
  const qrCodeUrl = settings?.qrCodeUrl || '';
  const qrCodeNote = settings?.qrCodeNote || 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा';

  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&cu=INR`;
  const autoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUrl)}`;
  const displayQrImage = qrCodeUrl || autoQrUrl;

  // Keep live time updated for TV display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
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

  // Submit payment verification request
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifySuccess('');

    const numericAmount = Number(verifyForm.amount);
    if (!verifyForm.name.trim()) {
      setVerifyError('कृपया आपले नाव प्रविष्ट करा.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setVerifyError('कृपया वैध देणगी रक्कम प्रविष्ट करा.');
      return;
    }
    if (!verifyForm.utrNumber.trim()) {
      setVerifyError('कृपया UPI Transaction ID / 12 अंकी UTR नंबर प्रविष्ट करा.');
      return;
    }

    setSubmittingVerify(true);
    try {
      const res = await submitPaymentRequest({
        name: verifyForm.name.trim(),
        amount: numericAmount,
        phone: verifyForm.phone.trim(),
        city: verifyForm.city.trim() || 'ऑनलाइन भाविक',
        category: verifyForm.category,
        utrNumber: verifyForm.utrNumber.trim(),
      });

      setVerifySuccess(res.message || 'पडताळणी विनंती यशस्वीपणे पाठवली!');
      setVerifyForm({
        name: '',
        amount: '',
        phone: '',
        city: '',
        category: 'महाप्रसाद सेवा',
        utrNumber: '',
      });
    } catch (err) {
      setVerifyError(err.message || 'विनंती पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setSubmittingVerify(false);
    }
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

        {/* Dedicated UPI QR Code Card (Configured by Admin) */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-br from-orange-950/50 via-red-950/40 to-black/75 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(234,88,12,0.22)] text-center flex flex-col items-center justify-between">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/15 blur-2xl" />

          {/* Header */}
          <div className="space-y-1 mb-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-0.5 text-[11px] font-bold text-amber-300">
              <QrCode className="h-3 w-3" />
              <span>{lang === 'mr' ? 'डिजिटल सेवा अर्पण' : 'Digital Seva'}</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              {t('scanPayTitle')}
            </h3>
            <p className="text-[11px] text-orange-200/75 max-w-xs">
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
                // Fallback to auto-generated QR code if custom link fails
                if (e.target.src !== autoQrUrl) {
                  e.target.src = autoQrUrl;
                }
              }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
              {upiName}
            </div>
          </div>

          {/* UPI ID Copy Box & Direct Mobile App Pay */}
          <div className="w-full mt-3 space-y-2.5">
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
              href={upiPayUrl}
              className="sm:hidden w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-3 text-xs font-black text-black shadow-md active:scale-95 transition-all"
            >
              <span>{t('openMobileUpi')}</span>
            </a>

            {/* Button to Raise Verification Request */}
            <button
              type="button"
              onClick={() => {
                setVerifySuccess('');
                setVerifyError('');
                setIsVerifyModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-2.5 px-3 text-xs font-black text-white shadow-lg shadow-orange-600/30 ring-1 ring-amber-300/50 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>🔔 मी ऑनलाइन पैसे भरले आहेत (पावती विनंती करा)</span>
            </button>

            <p className="text-[11px] text-orange-200/60 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
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
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-gradient-to-b from-orange-950/90 via-red-950/80 to-black/95 p-6 shadow-2xl text-white">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-orange-200 flex items-center justify-center text-sm cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 mb-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300">
                <span>🪔</span>
                <span>ऑनलाइन देणगी पडताळणी</span>
              </div>
              <h3 className="text-xl font-black text-white">
                पेमेंट पडताळणी विनंती (Verify Payment)
              </h3>
              <p className="text-xs text-orange-200/75">
                आपण केलेल्या UPI पेमेंटचा तपशील पाठवा. व्यवस्थापकांच्या पडताळणीनंतर पावती तयार होईल.
              </p>
            </div>

            {/* Success Alert */}
            {verifySuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-3xl">
                  ✓
                </div>
                <div className="text-emerald-300 font-bold text-sm">
                  {verifySuccess}
                </div>
                <p className="text-xs text-orange-200/70">
                  आपली सेवा बाप्पाच्या चरणी लवकरच डॅशबोर्ड व स्क्रीनवर जोडली जाईल!
                </p>
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow cursor-pointer"
                >
                  पूर्ण झाले (Close)
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitVerification} className="space-y-3.5">
                {/* Error Banner */}
                {verifyError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/60 p-2.5 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                {/* Donor Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/80 mb-1">
                    भाविकांचे नाव (Donor Name) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री. सचिन रमेश पाटील"
                    value={verifyForm.name}
                    onChange={(e) => setVerifyForm({ ...verifyForm, name: e.target.value })}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/40 outline-none focus:border-amber-400"
                  />
                </div>

                {/* Amount & Quick Chips */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/80 mb-1">
                    दिलेली रक्कम (Amount Paid in ₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="उदा. 1100"
                    value={verifyForm.amount}
                    onChange={(e) => setVerifyForm({ ...verifyForm, amount: e.target.value })}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/50 px-3.5 py-2 text-sm font-bold text-amber-300 placeholder-orange-300/40 outline-none focus:border-amber-400 mb-1.5"
                  />
                  <div className="grid grid-cols-6 gap-1">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setVerifyForm({ ...verifyForm, amount: amt.toString() })}
                        className={`text-[10px] py-1 rounded-lg border font-bold transition cursor-pointer ${
                          verifyForm.amount === amt.toString()
                            ? 'bg-amber-400 text-black border-amber-300'
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/80 mb-1">
                    UPI ट्रॅन्झॅक्शन / UTR नंबर <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 12 अंकी UTR किंवा Bank Ref. No."
                    value={verifyForm.utrNumber}
                    onChange={(e) => setVerifyForm({ ...verifyForm, utrNumber: e.target.value })}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/50 px-3.5 py-2 text-xs font-mono text-white placeholder-orange-300/40 outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-orange-200/60 mt-0.5 block">
                    आपल्या GPay / PhonePe / Paytm वरील पेमेंट पावतीतील UTR नंबर टाका.
                  </span>
                </div>

                {/* Phone & City */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/80 mb-1">
                      मोबाईल नंबर
                    </label>
                    <input
                      type="tel"
                      placeholder="१० अंकी नंबर"
                      value={verifyForm.phone}
                      onChange={(e) => setVerifyForm({ ...verifyForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-amber-500/30 bg-black/50 px-3 py-2 text-xs text-white placeholder-orange-300/40 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/80 mb-1">
                      गाव / शहर
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. मुंबई, पुणे"
                      value={verifyForm.city}
                      onChange={(e) => setVerifyForm({ ...verifyForm, city: e.target.value })}
                      className="w-full rounded-xl border border-amber-500/30 bg-black/50 px-3 py-2 text-xs text-white placeholder-orange-300/40 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Seva Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/80 mb-1">
                    सेवा प्रकार
                  </label>
                  <select
                    value={verifyForm.category}
                    onChange={(e) => setVerifyForm({ ...verifyForm, category: e.target.value })}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/70 px-3 py-2 text-xs text-orange-100 outline-none focus:border-amber-400"
                  >
                    {SEVA_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-orange-950 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {submittingVerify ? (
                    <span>पडताळणी विनंती पाठवत आहे...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>पडताळणीसाठी पाठवा (Submit Verification)</span>
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
