import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Receipt, Clock, CheckCircle2, DollarSign, Shield, ArrowRight, User } from 'lucide-react';
import AdminForm from '../components/AdminForm';
import useDonations from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';

export default function VolunteerDesk() {
  const { user, token, isAdmin } = useAuth();
  const { addManualDonation, donors, totalAmount, donorCount } = useDonations();

  // Session history for volunteer tracking
  const [sessionEntries, setSessionEntries] = useState([]);

  const handleAdminDonation = async (donationData) => {
    // Record in global hook / backend API with current volunteer attribution & auth token
    const result = await addManualDonation(
      {
        ...donationData,
        recordedBy: user?.name || 'मंडळ स्वयंसेवक',
      },
      token
    );

    // Also record in volunteer's local session history table
    const newEntry = {
      id: result?.donation?._id || `SES-${Date.now().toString().slice(-5)}`,
      name: donationData.name,
      amount: donationData.amount,
      category: donationData.category,
      city: donationData.city || 'स्थानिक भाविक',
      recordedBy: user?.name || 'स्वयंसेवक',
      time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setSessionEntries((prev) => [newEntry, ...prev]);
  };

  const displayList = sessionEntries.length > 0
    ? [...sessionEntries, ...donors.filter(d => !sessionEntries.some(s => s.id === d.id))]
    : donors;

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
                  स्वयंसेवक कक्ष (Volunteer Desk)
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  अधिकृत प्रवेश 🟢
                </span>
              </div>
              <p className="text-xs text-orange-200/75">
                कॅश व ऑनलाइन देणग्यांची थेट नोंदणी कक्ष
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
                <span>व्यवस्थापक कक्ष</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-orange-500/15 border border-orange-400/40 px-3 py-1 text-xs font-bold text-orange-200">
              <User className="h-3.5 w-3.5 text-amber-400" />
              <span>कार्यरत: <strong className="text-white">{user?.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <Receipt className="h-3.5 w-3.5 text-amber-400" />
              <span>नोंदणीकृत पावत्या (Receipts)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {displayList.length} पावती
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>एकूण जमा सेवा निधी (Live)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">
              ₹{totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span>नोंदणीकर्ता</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate">
              {user?.name} ({user?.role === 'admin' ? 'व्यवस्थापक' : 'स्वयंसेवक'})
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
              नोंदणीकृत देणगी इतिहास (Live Donation Records)
            </h3>
          </div>
          <span className="text-xs text-orange-300/70">
            {displayList.length} नोंदी
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
                    <span>नोंदणी: {entry.recordedBy}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20 text-[11px] font-bold uppercase tracking-wider text-orange-200/70">
                    <th className="py-2.5 px-3">पावती क्र.</th>
                    <th className="py-2.5 px-3">भाविकांचे नाव</th>
                    <th className="py-2.5 px-3">सेवा प्रकार</th>
                    <th className="py-2.5 px-3">नोंदणीकर्ता</th>
                    <th className="py-2.5 px-3 text-right">रक्कम (₹)</th>
                    <th className="py-2.5 px-3 text-right">वेळ</th>
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
              या सत्रात अद्याप कोणतीही देणगी नोंदवली गेलेली नाही. वरील फॉर्म वापरून पहिली देणगी नोंदवा.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
