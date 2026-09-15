import React, { useState, useRef } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  Calendar,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function ReceiptModal({ isOpen, onClose, donation }) {
  const { isMarathi } = useLanguage();
  const { isLight } = useTheme();
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  if (!isOpen || !donation) return null;

  const receiptNo =
    donation.receiptNo ||
    (donation.id || donation._id
      ? `REC-${String(donation.id || donation._id).slice(-6).toUpperCase()}`
      : `REC-${Date.now().toString().slice(-6)}`);

  const amount = Number(donation.amount || 0);
  const formattedAmount = amount.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN');
  const devoteeName = donation.name || (isMarathi ? 'अनामिक भाविक' : 'Anonymous Devotee');
  const city = donation.city || (isMarathi ? 'स्थानिक भाविक' : 'Local Devotee');
  const phone = donation.phone || '';
  const category = donation.category || (isMarathi ? 'महाप्रसाद सेवा' : 'Maha-Prasad Seva');
  const paymentMode =
    donation.paymentMethod === 'online' || donation.paymentMode === 'online' || String(donation.paymentMode).includes('ऑनलाइन')
      ? (isMarathi ? 'ऑनलाइन (UPI)' : 'Online (UPI)')
      : (isMarathi ? 'रोख (Cash)' : 'Cash');
  const recordedBy = donation.recordedBy || (isMarathi ? 'मंडळ स्वयंसेवक' : 'Mandal Volunteer');
  const utrNumber = donation.utrNumber || '';

  const dateStr = donation.timestamp
    ? new Date(donation.timestamp).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN');

  const timeStr = donation.timestamp
    ? new Date(donation.timestamp).toLocaleTimeString(isMarathi ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : (donation.time || 'आत्ताच');

  // WhatsApp formatted receipt text
  const getWhatsAppShareUrl = () => {
    const text = isMarathi
      ? `॥ श्री गणेशाय नमः ॥\n\n🚩 *श्री बाल गणेश मंडळ धानोरा बु. २०२६*\n\n📜 *अधिकृत देणगी पावती (Official Receipt)*\n━━━━━━━━━━━━━━━━━━━━\n• *पावती क्र:* ${receiptNo}\n• *भाविकांचे नाव:* ${devoteeName}\n• *गाव / शहर:* ${city}\n${phone ? `• *मोबाईल:* ${phone}\n` : ''}• *देणगी रक्कम:* ₹${formattedAmount}/-\n• *सेवा प्रकार:* ${category}\n• *पेमेंट माध्यम:* ${paymentMode}${utrNumber ? ` (UTR: ${utrNumber})` : ''}\n• *तारीख व वेळ:* ${dateStr}, ${timeStr}\n• *पावती देणारा:* ${recordedBy}\n━━━━━━━━━━━━━━━━━━━━\nबाप्पाच्या चरणी आपली सेवा रुजू झाली आहे!\nश्री गणेश कृपेने आपल्या सर्व मनोकामना पूर्ण होवोत.\n\n॥ गणपती बाप्पा मोरया, मंगलमूर्ती मोरया ॥`
      : `|| Shree Ganeshaya Namah ||\n\n🚩 *Shri Baal Ganesh Mandal Dhanora Bk. 2026*\n\n📜 *Official Donation Receipt*\n━━━━━━━━━━━━━━━━━━━━\n• *Receipt No:* ${receiptNo}\n• *Devotee Name:* ${devoteeName}\n• *City / Locality:* ${city}\n${phone ? `• *Mobile:* ${phone}\n` : ''}• *Donation Amount:* ₹${formattedAmount}/-\n• *Seva Offering:* ${category}\n• *Payment Mode:* ${paymentMode}${utrNumber ? ` (UTR: ${utrNumber})` : ''}\n• *Date & Time:* ${dateStr}, ${timeStr}\n• *Issued By:* ${recordedBy}\n━━━━━━━━━━━━━━━━━━━━\nYour devotional offering has been gratefully accepted at Lord Ganesha's sacred feet!\nMay Bappa bless you and your family with health, happiness and prosperity.\n\n|| Ganpati Bappa Morya ||`;

    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
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

  const handleCopyReceipt = () => {
    const text = `॥ श्री गणेशाय नमः ॥\nश्री बाल गणेश मंडळ धानोरा बु. २०२६\nपावती क्र: ${receiptNo}\nनाव: ${devoteeName}\nरक्कम: ₹${formattedAmount}\nसेवा: ${category}\nपेमेंट: ${paymentMode}\nतारीख: ${dateStr} ${timeStr}\nपावती देणारा: ${recordedBy}\n॥ गणपती बाप्पा मोरया ॥`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Modal Card */}
      <div className={`relative w-full max-w-lg rounded-3xl border p-4 sm:p-6 shadow-2xl my-auto ${
        isLight
          ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-stone-900 shadow-2xl'
          : 'border-amber-500/40 bg-gradient-to-b from-orange-950/95 via-red-950/90 to-black/95 text-white'
      }`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer z-10 ${
            isLight
              ? 'bg-stone-200/80 hover:bg-stone-300 text-stone-700'
              : 'bg-white/10 hover:bg-white/20 text-orange-200 hover:text-white'
          }`}
          title={isMarathi ? 'बंद करा' : 'Close'}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Printable Receipt Paper Container */}
        <div
          ref={printRef}
          id="printable-receipt"
          className="receipt-print-area relative bg-amber-50/95 text-stone-900 rounded-2xl p-5 sm:p-6 shadow-xl border-4 border-double border-amber-600/40 select-text"
        >
          {/* Top Traditional Mandir Header */}
          <div className="text-center border-b-2 border-amber-700/30 pb-3 space-y-1">
            <div className="text-amber-800 font-bold text-xs tracking-widest uppercase">
              ॥ श्री गणेशाय नमः ॥
            </div>
            <h2 className="text-lg sm:text-xl font-black text-amber-950 tracking-tight leading-tight">
              {isMarathi ? 'श्री बाल गणेश मंडळ' : 'Shri Baal Ganesh Mandal'}
            </h2>
            <div className="text-[11px] font-semibold text-amber-900/80">
              {isMarathi ? 'धानोरा बुद्रुक • उत्सव वर्ष २०२६' : 'Dhanora Bk. • Utsav Year 2026'}
            </div>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
              {isMarathi ? 'अधिकृत देणगी पावती' : 'Official Donation Receipt'}
            </div>
          </div>

          {/* Receipt Number & Date Row */}
          <div className="flex items-center justify-between py-2 border-b border-amber-600/20 text-xs font-semibold text-stone-700">
            <div className="flex items-center gap-1">
              <span className="text-stone-500 font-normal">{isMarathi ? 'पावती क्र:' : 'Receipt No:'}</span>
              <span className="font-mono font-bold text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded border border-amber-400/50">
                {receiptNo}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <Calendar className="h-3 w-3 text-amber-700" />
              <span>{dateStr}</span>
              <span className="text-stone-400">•</span>
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Devotee Info & Offering Breakdown */}
          <div className="py-3 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-stone-600 shrink-0 font-medium">
                {isMarathi ? 'भाविकांचे नाव (Name):' : 'Devotee Name:'}
              </span>
              <span className="font-bold text-stone-900 text-right truncate">
                {devoteeName}
              </span>
            </div>

            {phone && (
              <div className="flex justify-between items-baseline gap-2 text-xs">
                <span className="text-stone-600 shrink-0 font-medium">
                  {isMarathi ? 'संपर्क क्र. (Phone):' : 'Phone No:'}
                </span>
                <span className="font-mono text-stone-800 text-right">
                  {phone}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline gap-2 text-xs">
              <span className="text-stone-600 shrink-0 font-medium">
                {isMarathi ? 'गाव / शहर (Locality):' : 'City / Town:'}
              </span>
              <span className="text-stone-800 text-right">
                {city}
              </span>
            </div>

            <div className="flex justify-between items-baseline gap-2 text-xs">
              <span className="text-stone-600 shrink-0 font-medium">
                {isMarathi ? 'सेवा प्रकार (Seva):' : 'Seva Offering:'}
              </span>
              <span className="font-bold text-amber-800 text-right bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/40">
                {category}
              </span>
            </div>

            <div className="flex justify-between items-baseline gap-2 text-xs">
              <span className="text-stone-600 shrink-0 font-medium">
                {isMarathi ? 'पेमेंट पद्धत (Mode):' : 'Payment Mode:'}
              </span>
              <span className="text-stone-800 text-right font-medium">
                {paymentMode} {utrNumber ? `(UTR: ${utrNumber})` : ''}
              </span>
            </div>
          </div>

          {/* Amount Box (High Contrast) */}
          <div className="my-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-2 border-amber-600/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                {isMarathi ? 'स्वीकारलेली देणगी रक्कम' : 'Donation Amount'}
              </span>
              <span className="text-[11px] font-semibold text-amber-900 italic">
                {isMarathi ? `रुपये ${formattedAmount} फक्त` : `Rupees ${formattedAmount} Only`}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight font-mono">
              ₹{formattedAmount}
            </div>
          </div>

          {/* Signatures & Mandir Seal */}
          <div className="pt-2 border-t border-amber-600/20 flex items-end justify-between text-[11px] text-stone-600">
            <div className="space-y-0.5">
              <div className="text-[10px] text-stone-500">
                {isMarathi ? 'पावती देणारा / नोंदकर्ता:' : 'Issued By:'}
              </div>
              <div className="font-bold text-stone-800">
                {recordedBy}
              </div>
            </div>

            {/* Traditional Verification Seal Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-400/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>{isMarathi ? 'अधिकृत मुद्रा' : 'Trust Verified'}</span>
              </div>
            </div>
          </div>

          {/* Devotional Footer Blessing */}
          <div className="mt-3 pt-2 border-t border-dashed border-amber-700/20 text-center text-[10px] text-amber-950 font-semibold italic">
            बाप्पाच्या चरणी आपली सेवा रुजू झाली आहे. ॥ गणपती बाप्पा मोरया ॥
          </div>
        </div>

        {/* Action Buttons (Screen Only, Hidden on Print) */}
        <div className={`mt-4 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 print:hidden ${
          isLight ? 'border-[#CC5500]/20' : 'border-amber-500/20'
        }`}>
          {/* WhatsApp Share Button */}
          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-700/30 active:scale-95 transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{isMarathi ? 'व्हॉट्सॲपवर पाठवा' : 'Share on WhatsApp'}</span>
          </a>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-[#CC5500] hover:bg-[#B7410E] text-white shadow-[#CC5500]/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black font-black shadow-orange-600/30'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{isMarathi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
          </button>

          {/* Copy Receipt Text Button */}
          <button
            type="button"
            onClick={handleCopyReceipt}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'border-[#CC5500]/30 bg-[#F5F5DC] hover:bg-[#FFFDD0] text-stone-700'
                : 'border-amber-500/30 bg-black/40 hover:bg-black/60 text-orange-200'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? (isMarathi ? 'प्रत झाली!' : 'Copied!') : (isMarathi ? 'प्रत करा' : 'Copy')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
