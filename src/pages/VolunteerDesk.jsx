import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Receipt, Clock, CheckCircle2, DollarSign, Shield, ArrowRight, User, Trash2 } from 'lucide-react';
import AdminForm from '../components/AdminForm';
import useDonations from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function VolunteerDesk() {
  const { user, token, isAdmin } = useAuth();
  const { addManualDonation, deleteDonation, donors, totalAmount } = useDonations();
  const { t, lang } = useLanguage();

  // Session history for volunteer tracking
  const [sessionEntries, setSessionEntries] = useState([]);

  const handleAdminDonation = async (donationData) => {
    // Record in global hook / backend API with current volunteer attribution & auth token
    const result = await addManualDonation(
      {
        ...donationData,
        recordedBy: user?.name || (lang === 'mr' ? 'मंडळ स्वयंसेवक' : 'Mandal Volunteer'),
      },
      token
    );

    // Also record in volunteer's local session history table
    const newEntry = {
      id: result?.donation?._id || `SES-${Date.now().toString().slice(-5)}`,
      name: donationData.name,
      amount: donationData.amount,
      category: donationData.category,
      city: donationData.city || (lang === 'mr' ? 'स्थानिक भाविक' : 'Local Devotee'),
      recordedBy: user?.name || (lang === 'mr' ? 'स्वयंसेवक' : 'Volunteer'),
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

      {/* Recent Submission History Table for the volunteer on duty */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/50 via-red-950/40 to-black/75 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg text-white">
              {t('sessionHistoryTitle')}
            </h3>
          </div>
          <span className="text-xs text-orange-300/70">
            {displayList.length} {lang === 'mr' ? 'नोंदी' : 'Entries'}
          </span>
        </div>

        {displayList.length > 0 ? (
          <>
            {/* Mobile Card List (Phones) */}
            <div className="sm:hidden space-y-2.5">
              {displayList.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-amber-500/20 bg-black/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {entry.id}
                    </span>
                    <span className="text-[11px] text-orange-200/60 font-mono">
                      {entry.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{entry.name}</div>
                      <div className="text-[11px] text-orange-200/60">📍 {entry.city}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-amber-300">₹{entry.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-orange-300/80">{entry.category}</div>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-orange-200/60">
                    <span>{lang === 'mr' ? 'नोंदणी:' : 'Logged By:'} {entry.recordedBy}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20 text-[11px] font-bold uppercase tracking-wider text-orange-200/70">
                    <th className="py-2.5 px-3">{t('receiptCol')}</th>
                    <th className="py-2.5 px-3">{t('donorCol')}</th>
                    <th className="py-2.5 px-3">{t('sevaCol')}</th>
                    <th className="py-2.5 px-3">{t('recorderCol')}</th>
                    <th className="py-2.5 px-3 text-right">{t('amountCol')}</th>
                    <th className="py-2.5 px-3 text-right">{t('timeCol')}</th>
                    {isAdmin && <th className="py-2.5 px-3 text-center">{t('actionCol')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/15">
                  {displayList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-orange-900/20 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-300/90">
                        {entry.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {entry.name}
                        <span className="block text-[10px] text-orange-200/60 font-normal">
                          📍 {entry.city}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-orange-200">
                        {entry.category}
                      </td>
                      <td className="py-2.5 px-3 text-orange-200/80 text-xs">
                        {entry.recordedBy}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                        ₹{entry.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-orange-200/60 text-xs">
                        {entry.time}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmMsg = lang === 'mr'
                                ? `⚠️ प्रशासक क्रिया: खरोखर ${entry.name} यांची ₹${entry.amount.toLocaleString()} ची देणगी हटवायची आहे का?`
                                : `⚠️ Admin Action: Are you sure you want to delete ${entry.name}'s donation of ₹${entry.amount.toLocaleString()}?`;
                              if (window.confirm(confirmMsg)) {
                                try {
                                  await deleteDonation(entry.id, token);
                                  setSessionEntries((prev) => prev.filter((s) => s.id !== entry.id));
                                } catch (err) {
                                  alert(err.message || t('error'));
                                }
                              }
                            }}
                            className="p-1 rounded-lg bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white border border-red-500/40 text-xs transition cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-8 text-center rounded-2xl border border-dashed border-amber-500/20 bg-black/30">
            <Receipt className="h-8 w-8 text-orange-400/40 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-orange-200/60 font-medium">
              {t('noDonationsYet')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
