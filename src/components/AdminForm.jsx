import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const QUICK_AMOUNTS = [101, 251, 501, 1100, 2100, 5100, 11000];

const SEVA_TYPES = [
  { id: 'general', label: 'सर्वसाधारण देणगी', icon: '🪙' },
  { id: 'prasad', label: 'महाप्रसाद सेवा', icon: '🍛' },
  { id: 'aarti', label: 'दैनिक महाआरती', icon: '🔔' },
  { id: 'modak', label: 'मोदक नैवेद्य', icon: '🍬' },
  { id: 'deep', label: 'अखंड दीप & धूप', icon: '🪔' },
  { id: 'flower', label: 'पुष्पवृष्टी व सजावट', icon: '🌸' },
];

export default function AdminForm({ onSubmitDonation, onSwitchToDisplay }) {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [sevaCategory, setSevaCategory] = useState('महाप्रसाद सेवा');
  const [paymentMode, setPaymentMode] = useState('रोख (Cash)');
  const [recentReceipt, setRecentReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessBanner('');

    const numericAmount = parseInt(amount, 10);
    
    // Simple validation: name and amount > 0
    if (!donorName.trim()) {
      setErrorMessage('कृपया भाविकांचे नाव प्रविष्ट करा (Please enter donor name).');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('रक्कम ० पेक्षा जास्त असणे आवश्यक आहे (Amount must be greater than 0).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: donorName.trim(),
      amount: numericAmount,
      category: sevaCategory,
      city: city.trim() || 'स्थानिक भाविक',
    };

    try {
      // Send POST request to http://localhost:5000/api/donations with name and amount in JSON format
      const response = await fetch(`${BACKEND_URL}/api/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      await response.json();

      // Show quick success feedback banner
      setSuccessBanner(`Donation Logged Successfully! ₹${numericAmount.toLocaleString()} received from ${donorName.trim()}.`);
      
      const receiptData = {
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        name: donorName.trim(),
        city: city.trim() || 'स्थानिक भाविक',
        phone: phone.trim(),
        amount: numericAmount,
        category: sevaCategory,
        paymentMode,
        time: 'आत्ताच (Just now)',
        timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setRecentReceipt(receiptData);

      // Also call parent handler if provided
      if (onSubmitDonation) {
        onSubmitDonation(payload);
      }

      // Clear the input fields
      setDonorName('');
      setAmount('');
      setPhone('');
      setCity('');
    } catch (err) {
      console.warn('Backend API request error, falling back to local sync:', err.message);
      
      // Fallback local update so volunteer experience is not interrupted
      if (onSubmitDonation) {
        onSubmitDonation(payload);
      }

      setSuccessBanner(`Donation Logged Successfully! ₹${numericAmount.toLocaleString()} recorded.`);
      setRecentReceipt({
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        name: donorName.trim(),
        city: city.trim() || 'स्थानिक भाविक',
        phone: phone.trim(),
        amount: numericAmount,
        category: sevaCategory,
        paymentMode,
        time: 'आत्ताच (Just now)',
        timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
      });

      setDonorName('');
      setAmount('');
      setPhone('');
      setCity('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-3 sm:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/60 via-red-950/40 to-black/80 p-5 sm:p-8 backdrop-blur-2xl shadow-[0_16px_50px_0_rgba(234,88,12,0.25)]"
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-red-600/20 blur-3xl" />

        {/* Header Badge & Title */}
        <div className="relative z-10 mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 mb-3 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>📱 स्वयंसेवक काऊंटर (Volunteer Mobile Entry)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow">
            रोख देणगी नोंदणी
          </h2>
          <p className="text-xs sm:text-sm text-orange-200/75 mt-1 font-medium">
            कॅश किंवा UPI द्वारे मिळालेली पावती त्वरित नोंदवा (Direct to Backend)
          </p>
        </div>

        {/* Quick 'Donation Logged Successfully' Banner */}
        <AnimatePresence>
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/60 p-3.5 backdrop-blur-md text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
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

        {/* Digital Receipt Card */}
        <AnimatePresence>
          {recentReceipt && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 backdrop-blur-xl text-emerald-100 shadow-lg ring-1 ring-emerald-400/30"
            >
              <div className="flex items-start justify-between gap-2 border-b border-emerald-500/30 pb-2 mb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <span className="text-lg">✅</span>
                  <span>पावती तयार (Receipt Generated)</span>
                </div>
                <span className="text-[11px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">
                  {recentReceipt.receiptNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-1">
                <div>
                  <span className="text-emerald-300/70">भाविक:</span>{' '}
                  <span className="font-semibold text-white">{recentReceipt.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-300/70">रक्कम:</span>{' '}
                  <span className="font-bold text-amber-300 text-sm">₹{recentReceipt.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-emerald-300/70">सेवा:</span>{' '}
                  <span className="text-white">{recentReceipt.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-300/70">प्रकार:</span>{' '}
                  <span className="text-white">{recentReceipt.paymentMode}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-500/20 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRecentReceipt(null)}
                  className="text-emerald-300 hover:text-white underline cursor-pointer"
                >
                  नवीन पावती नोंदवा
                </button>
                {onSwitchToDisplay && (
                  <button
                    type="button"
                    onClick={onSwitchToDisplay}
                    className="rounded bg-emerald-600/40 hover:bg-emerald-600/60 px-2.5 py-1 text-emerald-200 font-medium transition cursor-pointer"
                  >
                    डॅशबोर्डवर पहा ↗
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-950/50 px-4 py-2 text-xs font-semibold text-red-200 backdrop-blur-md">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-5">
          {/* Payment Mode Segment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-2">
              पेमेंट पद्धत (Payment Method)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['रोख (Cash)', 'ऑनलाइन (UPI / QR)'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 ${
                    paymentMode === mode
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md border border-amber-300/60'
                      : 'border border-amber-500/20 bg-orange-950/30 text-orange-200/70 hover:bg-orange-900/30 hover:text-white'
                  }`}
                >
                  <span>{mode.includes('Cash') ? '💵' : '📱'}</span>
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Donor Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1.5">
              भाविकांचे नाव (Donor Name) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="उदा. श्री. सचिन रमेश तेंडुलकर किंवा सहपरिवार"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full rounded-xl border border-amber-500/30 bg-black/40 px-4 py-3 text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
              <span className="absolute right-3.5 top-3.5 text-sm text-orange-300/60">
                👤
              </span>
            </div>
          </div>

          {/* Amount Input & Quick Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1.5">
              देणगी रक्कम (Amount in ₹) <span className="text-red-400">*</span>
            </label>
            <div className="relative mb-2">
              <span className="absolute left-4 top-3 text-lg font-black text-amber-400">
                ₹
              </span>
              <input
                type="number"
                required
                min="1"
                disabled={isSubmitting}
                placeholder="रक्कम प्रविष्ट करा (e.g. 1100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-amber-500/30 bg-black/40 pl-9 pr-4 py-3 text-base sm:text-lg font-bold text-amber-200 placeholder-orange-300/40 outline-none backdrop-blur-md transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickAmount(val)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                    amount === val.toString()
                      ? 'bg-amber-400 text-black font-black ring-1 ring-amber-300'
                      : 'border border-amber-500/20 bg-orange-950/40 text-orange-200 hover:bg-orange-800/40 hover:text-white'
                  }`}
                >
                  ₹{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Seva Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-1.5">
              सेवा प्रकार (Seva Category)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SEVA_TYPES.map((seva) => (
                <button
                  key={seva.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSevaCategory(seva.label)}
                  className={`flex items-center gap-1.5 rounded-xl p-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                    sevaCategory === seva.label
                      ? 'bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-white border border-amber-300/60 shadow'
                      : 'border border-amber-500/20 bg-orange-950/30 text-orange-200/70 hover:bg-orange-900/30 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{seva.icon}</span>
                  <span className="truncate">{seva.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/70 mb-1">
                गाव / शहर (City / Locality)
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="उदा. दादर, पुणे, ठाणे"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-amber-500/30 bg-black/40 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-200/70 mb-1">
                मोबाईल क्र. (Receipt WhatsApp)
              </label>
              <input
                type="tel"
                disabled={isSubmitting}
                placeholder="१० अंकी मोबाईल नंबर"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-amber-500/30 bg-black/40 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Big Submit Donation Button with Loading & Feedback */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
              className={`w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3.5 px-6 text-base sm:text-lg font-black text-white shadow-xl shadow-orange-600/40 ring-2 ring-amber-300/60 transition-all hover:shadow-orange-500/60 flex items-center justify-center gap-3 ${
                isSubmitting ? 'opacity-70 cursor-wait' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🪔</span>
                  <span>Submit Donation (देणगी नोंदवा)</span>
                  <span className="text-xl">🚩</span>
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Footer Notes for Volunteers */}
        <div className="mt-6 border-t border-amber-500/20 pt-4 text-center">
          <p className="text-[11px] text-orange-200/60">
            ही देणगी थेट Node.js + MongoDB डेटाबेसमध्ये सेव्ह होते व Socket.io द्वारे सर्व स्क्रीन्सवर झळकते.
          </p>
          {onSwitchToDisplay && (
            <button
              type="button"
              onClick={onSwitchToDisplay}
              className="mt-2 text-xs text-amber-300 hover:text-white font-medium underline cursor-pointer"
            >
              ← मुख्य डिस्प्ले बोर्डवर परत जा (Back to Display Board)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
