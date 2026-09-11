import React, { useState } from 'react';
import { UserCheck, Receipt, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import AdminForm from '../components/AdminForm';
import useDonations from '../hooks/useDonations';

export default function Admin() {
  const { addManualDonation } = useDonations();

  // Session history for volunteer tracking
  const [sessionEntries, setSessionEntries] = useState([]);

  const handleAdminDonation = (donationData) => {
    // Record in global hook / backend API
    addManualDonation(donationData);

    // Also record in volunteer's local session history table
    const newEntry = {
      id: `SES-${Date.now().toString().slice(-5)}`,
      name: donationData.name,
      amount: donationData.amount,
      category: donationData.category,
      city: donationData.city || 'स्थानिक भाविक',
      time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setSessionEntries(prev => [newEntry, ...prev]);
  };

  const sessionTotal = sessionEntries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Volunteer Shift Header & Live Session Summary Badges */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-orange-950/70 via-red-950/50 to-black/80 p-5 sm:p-7 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                स्वयंसेवक कक्ष (Volunteer Desk)
              </h1>
              <p className="text-xs text-orange-200/75">
                कॅश व ऑनलाइन देणग्यांची थेट नोंदणी कक्ष
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>सत्र चालू आहे (Active Session)</span>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <Receipt className="h-3.5 w-3.5 text-amber-400" />
              <span>सत्रातील नोंदी</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {sessionEntries.length} पावती
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>जमा रोख रक्कम</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">
              ₹{sessionTotal.toLocaleString()}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs text-orange-200/70 mb-1">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span>सुरक्षित सिंक</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">
              थेट डेटाबेसमध्ये सुरक्षित
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
              सध्याच्या सत्रातील नोंदणी इतिहास (Session History)
            </h3>
          </div>
          <span className="text-xs text-orange-300/70">
            {sessionEntries.length} नोंदी
          </span>
        </div>

        {sessionEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-amber-500/20 text-[11px] font-bold uppercase tracking-wider text-orange-200/70">
                  <th className="py-2.5 px-3">पावती क्र.</th>
                  <th className="py-2.5 px-3">भाविकांचे नाव</th>
                  <th className="py-2.5 px-3">सेवा प्रकार</th>
                  <th className="py-2.5 px-3 text-right">रक्कम (₹)</th>
                  <th className="py-2.5 px-3 text-right">वेळ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/15">
                {sessionEntries.map((entry) => (
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
