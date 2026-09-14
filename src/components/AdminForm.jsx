import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Share2, Receipt, Printer } from 'lucide-react';
import { useLanguage, SEVA_CATEGORIES } from '../context/LanguageContext';
import ReceiptModal from './ReceiptModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const QUICK_AMOUNTS = [101, 251, 501, 1100, 2100, 5100, 11000];

export default function AdminForm({ onSubmitDonation }) {
  const { t, lang, isMarathi } = useLanguage();
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('prasad');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'online'
  const [recentReceipt, setRecentReceipt] = useState(null);
  const [showFullReceipt, setShowFullReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const activeCategory = SEVA_CATEGORIES.find((s) => s.id === selectedCategoryId) || SEVA_CATEGORIES[1];
  const activeCategoryName = lang === 'mr' ? activeCategory.mr : activeCategory.en;
  const activePaymentName = paymentMode === 'cash' ? t('cash') : t('onlineUpi');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessBanner('');

    const numericAmount = parseInt(amount, 10);

    if (!donorName.trim()) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया भाविकांचे नाव प्रविष्ट करा.'
          : 'Please enter donor / devotee name.'
      );
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage(
        lang === 'mr'
          ? 'रक्कम ० पेक्षा जास्त असणे आवश्यक आहे.'
          : 'Donation amount must be greater than 0.'
      );
      return;
    }

    setIsSubmitting(true);

    const defaultLocality = lang === 'mr' ? 'स्थानिक भाविक' : 'Local Devotee';
    const payload = {
      name: donorName.trim(),
      amount: numericAmount,
      category: activeCategoryName,
      city: city.trim() || defaultLocality,
      phone: phone.trim(),
      paymentMode: activePaymentName,
    };

    try {
      // If parent onSubmitDonation provided (e.g. from VolunteerDesk), delegate to it
      if (onSubmitDonation) {
        await onSubmitDonation(payload);
      } else {
        const response = await fetch(`${BACKEND_URL}/api/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
      }

      setSuccessBanner(
        lang === 'mr'
          ? `देणगी यशस्वीपणे नोंदवली! ₹${numericAmount.toLocaleString('mr-IN')} - ${donorName.trim()}`
          : `Donation recorded successfully! ₹${numericAmount.toLocaleString('en-IN')} - ${donorName.trim()}`
      );

      const receiptData = {
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        name: donorName.trim(),
        city: city.trim() || defaultLocality,
        phone: phone.trim(),
        amount: numericAmount,
        category: activeCategoryName,
        paymentMode: activePaymentName,
        time: t('justNow'),
        timestamp: new Date().toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setRecentReceipt(receiptData);

      // Clear input fields
      setDonorName('');
      setAmount('');
      setPhone('');
      setCity('');
    } catch (err) {
      console.warn('Backend API request error:', err.message);
      setErrorMessage(err.message || (lang === 'mr' ? 'नोंदणी करताना त्रुटी आली.' : 'Failed to record donation.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = (receipt) => {
    const isMr = lang === 'mr';
    const text = isMr
      ? `॥ श्री गणेशाय नमः ॥\n\n🚩 *श्री बाल गणेश मंडळ धानोरा बु. २०२६*\n\n📜 *अधिकृत देणगी पावती (Official Receipt)*\n━━━━━━━━━━━━━━━━━━━━\n• *पावती क्र:* ${receipt.receiptNo}\n• *नाव:* ${receipt.name}\n${receipt.phone ? `• *मोबाईल:* ${receipt.phone}\n` : ''}• *रक्कम:* ₹${receipt.amount.toLocaleString('mr-IN')}/-\n• *सेवा प्रकार:* ${receipt.category}\n• *पेमेंट माध्यम:* ${receipt.paymentMode}\n• *वेळ:* ${receipt.timestamp}\n━━━━━━━━━━━━━━━━━━━━\nबाप्पाच्या चरणी आपली सेवा रुजू झाली आहे! श्री गणेश कृपेने आपल्या सर्व मनोकामना पूर्ण होवोत.\n\n॥ गणपती बाप्पा मोरया, मंगलमूर्ती मोरया ॥`
      : `|| Shree Ganeshaya Namah ||\n\n🚩 *Shri Baal Ganesh Mandal Dhanora Bk. 2026*\n\n📜 *Official Donation Receipt*\n━━━━━━━━━━━━━━━━━━━━\n• *Receipt No:* ${receipt.receiptNo}\n• *Devotee:* ${receipt.name}\n${receipt.phone ? `• *Mobile:* ${receipt.phone}\n` : ''}• *Amount:* ₹${receipt.amount.toLocaleString('en-IN')}/-\n• *Seva Offering:* ${receipt.category}\n• *Payment Mode:* ${receipt.paymentMode}\n• *Time:* ${receipt.timestamp}\n━━━━━━━━━━━━━━━━━━━━\nYour devotional offering has been gratefully accepted at Lord Ganesha's sacred feet! May Lord Ganesha bless you with health, peace and prosperity.\n\n|| Ganpati Bappa Morya ||`;

    const cleanPhone = receipt.phone ? String(receipt.phone).replace(/\D/g, '') : '';
    let phoneParam = '';
    if (cleanPhone.length === 10) {
      phoneParam = `91${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      phoneParam = `91${cleanPhone.slice(1)}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      phoneParam = cleanPhone;
    } else if (cleanPhone.length >= 10) {
      phoneParam = cleanPhone;
    }

    return phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-4 px-1 sm:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/70 via-red-950/50 to-black/90 p-4 sm:p-7 backdrop-blur-2xl shadow-[0_16px_50px_0_rgba(234,88,12,0.25)]"
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />

        {/* Header Title */}
        <div className="relative z-10 mb-4 sm:mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 mb-2.5 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('mobileCounterBadge')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow">
            {t('formTitle')}
          </h2>
          <p className="text-[11px] sm:text-xs text-orange-200/75 mt-0.5">
            {t('formSub')}
          </p>
        </div>

        {/* Success Feedback Banner */}
        <AnimatePresence>
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 p-3 backdrop-blur-md text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessBanner('')}
                className="text-emerald-400 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Digital Receipt Card with 1-Tap WhatsApp Share */}
        <AnimatePresence>
          {recentReceipt && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-5 overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 via-emerald-900/40 to-black/80 p-4 backdrop-blur-xl text-emerald-100 shadow-xl ring-1 ring-emerald-400/30 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-300">
                  <span className="text-base">🪔</span>
                  <span>{t('receiptGenerated')}</span>
                </div>
                <span className="text-[11px] font-mono bg-emerald-900/80 border border-emerald-400/30 px-2 py-0.5 rounded-lg text-emerald-200 font-bold">
                  {recentReceipt.receiptNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-1">
                <div>
                  <span className="text-emerald-300/70 text-[11px]">{t('donor')}:</span>
                  <div className="font-bold text-white text-sm truncate">{recentReceipt.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-300/70 text-[11px]">{t('amount')}:</span>
                  <div className="font-black text-amber-300 text-base">
                    ₹{recentReceipt.amount.toLocaleString(lang === 'mr' ? 'mr-IN' : 'en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-300/70 text-[11px]">{t('category')}:</span>
                  <div className="text-emerald-100">{recentReceipt.category}</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-300/70 text-[11px]">{t('paymentMethod').split('(')[0].trim()}:</span>
                  <div className="text-emerald-100">{recentReceipt.paymentMode}</div>
                </div>
              </div>

              {/* Action Buttons: View Receipt, WhatsApp Share & Dismiss */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFullReceipt(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-black font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>{isMarathi ? 'पावती पहा व प्रिंट करा' : 'View / Print Receipt'}</span>
                  </button>

                  <a
                    href={getWhatsAppShareUrl(recentReceipt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-black font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{t('whatsappShareBtn')}</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setRecentReceipt(null)}
                  className="text-emerald-300/80 hover:text-white underline text-[11px] cursor-pointer"
                >
                  {t('newReceiptBtn')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-950/60 p-3 text-xs font-semibold text-red-200 backdrop-blur-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {/* Payment Mode Segment */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1.5">
              {t('paymentMethod')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cash', label: t('cash'), icon: '💵' },
                { id: 'online', label: t('onlineUpi'), icon: '📱' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 ${
                    paymentMode === mode.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md border border-amber-300/60 ring-1 ring-amber-400'
                      : 'border border-amber-500/20 bg-orange-950/40 text-orange-200/70 hover:bg-orange-900/30 hover:text-white'
                  }`}
                >
                  <span className="text-base">{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Donor Name Input */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1">
              {t('donorNameLabel')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoCapitalize="words"
                autoComplete="name"
                disabled={isSubmitting}
                placeholder={t('donorNamePlaceholder')}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-amber-500/30 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
              <span className="absolute right-3 top-3 text-sm text-orange-300/60">
                👤
              </span>
            </div>
          </div>

          {/* Amount Input & Quick Chips */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1">
              {t('amountLabel')}
            </label>
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-2.5 text-lg font-black text-amber-400">
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                min="1"
                disabled={isSubmitting}
                placeholder={t('amountPlaceholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-amber-500/30 bg-black/50 pl-8 pr-3.5 py-2 text-lg sm:text-xl font-black text-amber-200 placeholder-orange-300/40 outline-none backdrop-blur-md transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
            </div>

            {/* Quick Amount Touch Chips */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickAmount(val)}
                  className={`min-h-[38px] rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center disabled:opacity-50 active:scale-95 ${
                    amount === val.toString()
                      ? 'bg-amber-400 text-black shadow-md ring-2 ring-amber-300'
                      : 'border border-amber-500/25 bg-orange-950/40 text-orange-200 hover:bg-orange-800/40 hover:text-white'
                  }`}
                >
                  ₹{val.toLocaleString(lang === 'mr' ? 'mr-IN' : 'en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Seva Category Selector */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1">
              {t('sevaTypeLabel')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SEVA_CATEGORIES.map((seva) => (
                <button
                  key={seva.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedCategoryId(seva.id)}
                  className={`min-h-[42px] flex items-center gap-2 rounded-xl p-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50 active:scale-95 ${
                    selectedCategoryId === seva.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-amber-300/60 shadow-md font-bold'
                      : 'border border-amber-500/20 bg-orange-950/30 text-orange-200/70 hover:bg-orange-900/30 hover:text-white'
                  }`}
                >
                  <span className="text-base">{seva.icon}</span>
                  <span className="truncate">{lang === 'mr' ? seva.mr : seva.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City & WhatsApp Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/70 mb-1">
                {t('cityLabel')}
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder={t('cityPlaceholder')}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-amber-500/30 bg-black/50 px-3 py-2 text-xs sm:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/70 mb-1">
                {t('phoneLabel')}
              </label>
              <input
                type="tel"
                inputMode="tel"
                disabled={isSubmitting}
                placeholder={t('phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-amber-500/30 bg-black/50 px-3 py-2 text-xs sm:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Big Thumb-Friendly Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 px-6 text-base sm:text-lg font-black text-white shadow-xl shadow-orange-600/40 ring-2 ring-amber-300/60 transition-all active:brightness-95 flex items-center justify-center gap-2.5 cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('submitting')}</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🪔</span>
                  <span>{t('submitDonationBtn')}</span>
                  <span className="text-lg">🚩</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        isOpen={showFullReceipt}
        onClose={() => setShowFullReceipt(false)}
        donation={recentReceipt}
      />
    </div>
  );
}
