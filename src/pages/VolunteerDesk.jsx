import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Receipt,
  Clock,
  CheckCircle2,
  DollarSign,
  Shield,
  ArrowRight,
  User,
  Trash2,
  Search,
  Printer,
  Share2,
  Eye,
} from 'lucide-react';
import AdminForm from '../components/AdminForm';
import ReceiptModal from '../components/ReceiptModal';
import useDonations from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function VolunteerDesk() {
  const { user, token, isAdmin } = useAuth();
  const { addManualDonation, deleteDonation, donors, totalAmount } = useDonations();
  const { t, lang, isMarathi } = useLanguage();

  // Session history for volunteer tracking
  const [sessionEntries, setSessionEntries] = useState([]);

  // Search & Filter State for Receipts
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'my_shift' | 'cash' | 'online'

  // Selected Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const openReceipt = (entry) => {
    setSelectedReceipt(entry);
    setIsReceiptOpen(true);
  };

  const handleAdminDonation = async (donationData) => {
    // Record in global hook / backend API with current volunteer attribution & auth token
    const result = await addManualDonation(
      {
        ...donationData,
        recordedBy: user?.name || (lang === 'mr' ? 'मंडळ स्वयंसेवक' : 'Mandal Volunteer'),
      },
      token
    );

    const donationId = result?.donation?._id || result?.donation?.id || `SES-${Date.now().toString().slice(-5)}`;
    const receiptNumber =
      result?.donation?.receiptNo || `REC-${String(donationId).slice(-6).toUpperCase()}`;

    // Also record in volunteer's local session history table
    const newEntry = {
      id: donationId,
      receiptNo: receiptNumber,
      name: donationData.name,
      phone: donationData.phone || '',
      amount: donationData.amount,
      category: donationData.category,
      city: donationData.city || (lang === 'mr' ? 'स्थानिक भाविक' : 'Local Devotee'),
      recordedBy: user?.name || (lang === 'mr' ? 'स्वयंसेवक' : 'Volunteer'),
      paymentMethod: donationData.paymentMethod || donationData.paymentMode || 'cash',
      utrNumber: donationData.utrNumber || '',
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setSessionEntries((prev) => [newEntry, ...prev].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0)));
  };

  const rawList = sessionEntries.length > 0
    ? [...sessionEntries, ...donors.filter(d => !sessionEntries.some(s => s.id === d.id))]
    : donors;

  const displayList = [...rawList].sort(
    (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0) || new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
  );

  const filteredList = displayList.filter((entry) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      entry.name?.toLowerCase().includes(q) ||
      entry.phone?.includes(q) ||
      entry.city?.toLowerCase().includes(q) ||
      entry.category?.toLowerCase().includes(q) ||
      entry.recordedBy?.toLowerCase().includes(q) ||
      entry.receiptNo?.toLowerCase().includes(q) ||
      String(entry.id).toLowerCase().includes(q) ||
      String(entry.amount).includes(q);

    if (!matchesSearch) return false;

    if (filterType === 'my_shift') {
      return (
        sessionEntries.some((s) => s.id === entry.id) ||
        (user?.name && entry.recordedBy?.toLowerCase() === user.name.toLowerCase())
      );
    }
    if (filterType === 'cash') return entry.paymentMethod !== 'online';
    if (filterType === 'online') return entry.paymentMethod === 'online';

    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Volunteer Shift Header & Live Session Summary Badges */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-orange-950/70 via-red-950/50 to-black/80 p-5 sm:p-7 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {t('volunteerDeskTitle')}
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  {t('authorizedAccessBadge')}
                </span>
              </div>
              <p className="text-xs text-orange-200/75">
                {t('volunteerDeskSub')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all shadow-sm"
              >
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>{t('adminDesk')}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-orange-500/15 border border-orange-400/40 px-3 py-1 text-xs font-bold text-orange-200">
              <User className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === 'mr' ? 'कार्यरत:' : 'On-Duty:'} <strong className="text-white">{user?.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <Receipt className="h-3.5 w-3.5 text-amber-400" />
              <span>{t('sessionEntriesBadge')}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {displayList.length} {lang === 'mr' ? 'पावती' : 'Receipts'}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t('sessionTotalBadge')}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">
              ₹{totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span>{t('recorderBadge')}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate">
              {user?.name} ({user?.role === 'admin' ? t('roleAdmin') : t('roleVolunteer')})
            </div>
          </div>
        </div>
      </div>

      {/* Embed AdminForm Component */}
      <AdminForm onSubmitDonation={handleAdminDonation} />

      {/* Recent Submission History & Devotee Receipts Search */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/50 via-red-950/40 to-black/75 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-base sm:text-lg text-white">
                {t('sessionHistoryTitle')}
              </h3>
            </div>
            <p className="text-xs text-orange-200/70 mt-0.5">
              {isMarathi ? 'कोणत्याही भाविकांची पावती पहा, प्रिंट करा किंवा व्हॉट्सॲपवर पाठवा' : 'Access, print or WhatsApp share receipts of all devotees'}
            </p>
          </div>

          {/* Search Bar for Receipts */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder={t('searchReceiptPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-orange-200/40 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <Search className="h-4 w-4 text-orange-300/60 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-amber-500/15 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: t('allReceiptsFilter') },
              { id: 'my_shift', label: t('myShiftFilter') },
              { id: 'cash', label: isMarathi ? '💵 रोख (Cash)' : '💵 Cash' },
              { id: 'online', label: isMarathi ? '📱 ऑनलाइन (Online)' : '📱 Online' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md shadow-orange-500/20'
                    : 'border border-amber-500/25 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-orange-300/80 font-mono">
            {filteredList.length} / {displayList.length} {isMarathi ? 'पावत्या' : 'Receipts'}
          </span>
        </div>

        {filteredList.length > 0 ? (
          <>
            {/* Mobile Card List (Phones) */}
            <div className="sm:hidden space-y-3">
              {filteredList.map((entry) => {
                const donId = entry.id || entry._id;
                const recNum = entry.receiptNo || `REC-${String(donId).slice(-6).toUpperCase()}`;
                return (
                  <div key={donId} className="rounded-2xl border border-amber-500/20 bg-black/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/30">
                        {recNum}
                      </span>
                      <span className="text-[11px] text-orange-200/60 font-mono">
                        {entry.time}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-white">{entry.name}</div>
                        <div className="text-xs text-orange-200/70">📍 {entry.city || (isMarathi ? 'स्थानिक भाविक' : 'Local Devotee')}</div>
                        {entry.phone && (
                          <div className="text-xs text-amber-300/80 font-mono">📞 {entry.phone}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-amber-300">₹{Number(entry.amount).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}</div>
                        <div className="text-[10px] text-orange-300/80">{entry.category}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-orange-200/60 truncate">
                        {isMarathi ? 'नोंदणी:' : 'Logged By:'} {entry.recordedBy}
                      </span>

                      {/* Receipt Action Button */}
                      <button
                        type="button"
                        onClick={() => openReceipt(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black text-xs font-black shadow-md shadow-orange-600/30 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>{isMarathi ? 'पावती पहा' : 'View Receipt'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tablet & Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-amber-500/20">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-black/70 border-b border-amber-500/20 text-[11px] font-bold uppercase tracking-wider text-orange-200/80">
                  <tr>
                    <th className="py-3 px-3">{t('receiptCol')}</th>
                    <th className="py-3 px-3">{t('donorCol')}</th>
                    <th className="py-3 px-3">{t('sevaCol')}</th>
                    <th className="py-3 px-3">{t('recorderCol')}</th>
                    <th className="py-3 px-3 text-right">{t('amountCol')}</th>
                    <th className="py-3 px-3 text-right">{t('timeCol')}</th>
                    <th className="py-3 px-3 text-center">{t('actionCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10 bg-black/40">
                  {filteredList.map((entry) => {
                    const donId = entry.id || entry._id;
                    const recNum = entry.receiptNo || `REC-${String(donId).slice(-6).toUpperCase()}`;
                    return (
                      <tr key={donId} className="hover:bg-orange-900/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                          {recNum}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-white block">{entry.name}</span>
                          <span className="text-[11px] text-orange-200/60 font-normal">
                            📍 {entry.city || (isMarathi ? 'स्थानिक भाविक' : 'Local Devotee')} {entry.phone ? `• 📞 ${entry.phone}` : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-orange-200">
                          <span className="inline-block rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-orange-200/80 text-xs">
                          {entry.recordedBy}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-300">
                          ₹{Number(entry.amount).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-orange-200/60 text-xs font-mono">
                          {entry.time}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Open Receipt Modal Button */}
                            <button
                              type="button"
                              onClick={() => openReceipt(entry)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
                              title={isMarathi ? 'अधिकृत पावती पहा, प्रिंट करा किंवा व्हॉट्सॲपवर पाठवा' : 'View, Print or WhatsApp Share Receipt'}
                            >
                              <Receipt className="h-3.5 w-3.5" />
                              <span>{isMarathi ? 'पावती' : 'Receipt'}</span>
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const confirmMsg = isMarathi
                                    ? `⚠️ प्रशासक क्रिया: खरोखर ${entry.name} यांची ₹${Number(entry.amount).toLocaleString('mr-IN')} ची देणगी हटवायची आहे का?`
                                    : `⚠️ Admin Action: Are you sure you want to delete ${entry.name}'s donation of ₹${Number(entry.amount).toLocaleString('en-IN')}?`;
                                  if (window.confirm(confirmMsg)) {
                                    try {
                                      await deleteDonation(donId, token);
                                      setSessionEntries((prev) => prev.filter((s) => s.id !== donId));
                                    } catch (err) {
                                      alert(err.message || t('error'));
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white border border-red-500/40 text-xs transition cursor-pointer"
                                title={t('delete')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-8 text-center rounded-2xl border border-dashed border-amber-500/20 bg-black/30">
            <Receipt className="h-8 w-8 text-orange-400/40 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-orange-200/60 font-medium">
              {searchQuery ? (isMarathi ? 'शोधलेले भाविक किंवा पावती आढळली नाही.' : 'No devotee or receipt matched your search.') : t('noDonationsYet')}
            </p>
          </div>
        )}
      </div>

      {/* Official Receipt Modal for Any Devotee */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        donation={selectedReceipt}
      />
    </div>
  );
}
