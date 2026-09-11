import React from 'react';
import TotalCounter from './TotalCounter';
import RecentDonorsList from './RecentDonorsList';

export default function DakshinaPage({
  totalAmount,
  targetAmount,
  donorCount,
  prasadCount,
  aartiSponsors,
  donors,
  donorName,
  setDonorName,
  donorCity,
  setDonorCity,
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
  selectedCategory,
  setSelectedCategory,
  handleDonate,
  successMessage,
  quickAmounts
}) {
  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-orange-950/60 via-amber-950/40 to-red-950/60 p-6 md:p-8 backdrop-blur-2xl shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
            <span>🪙</span>
            <span>दान व दक्षिणा सेवा पोर्टल</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            श्री गणेशोत्सव सेवा व महाप्रसाद निधी
          </h2>
          <p className="text-xs sm:text-sm text-orange-200/80 mt-1 max-w-xl leading-relaxed">
            ‘अन्नदान हेच सर्वश्रेष्ठ दान’. बाप्पाच्या उत्सवासाठी आणि हजारो भाविकांच्या महाप्रसादासाठी आपण दिलेली प्रत्येक सेवा पावन ठरेल.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-4 text-center shrink-0">
          <span className="text-2xl">🪔</span>
          <div className="text-xs font-bold text-amber-300 mt-1">१००% पारदर्शक सेवा</div>
          <div className="text-[11px] text-orange-200/60">थेट लाइव्ह स्क्रीनवर नोंद</div>
        </div>
      </div>

      {/* 1. Total Counter Component */}
      <TotalCounter
        totalAmount={totalAmount}
        targetAmount={targetAmount}
        donorCount={donorCount}
        prasadCount={prasadCount}
        aartiSponsors={aartiSponsors}
      />

      {/* 2. Quick Seva Contribution Glassmorphic Card */}
      <section id="donate-section" className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/60 p-6 md:p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(234,88,12,0.2)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-300 mb-2">
              <span>🙏</span>
              <span>थेट सेवा नोंदणी (Live Seva Portal)</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              बाप्पाच्या चरणी सेवा अर्पण करा (Offer Seva)
            </h3>
            <p className="text-xs md:text-sm text-orange-200/70 mt-0.5">
              आपली सेवा थेट डॅशबोर्डवर जोडली जाईल आणि खालील देणगीदार यादीत दिसेल.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300/80 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <span>🪔</span>
            <span>सुरक्षित व पारदर्शक सेवा निधी</span>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-500/40 bg-green-950/40 p-4 text-sm font-semibold text-green-300 backdrop-blur-md flex items-center gap-3">
            <span className="text-xl">🌺</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleDonate} className="space-y-5">
          {/* Seva Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-2">
              सेवा प्रकार निवडा (Select Seva Type)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: "महाप्रसाद सेवा", icon: "🍛" },
                { name: "दैनिक महाआरती", icon: "🔔" },
                { name: "मोदक नैवेद्य अर्पण", icon: "🍬" },
                { name: "पुष्पवृष्टी व सजावट", icon: "🌸" }
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedCategory(item.name)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    selectedCategory === item.name
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/30 border border-amber-300/50"
                      : "border border-amber-500/20 bg-orange-950/20 text-orange-200/70 hover:bg-orange-900/30 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/80 mb-2">
              सेवा रक्कम निवडा (Select Amount)
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    selectedAmount === amt && !customAmount
                      ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-600/30 border border-amber-300/50"
                      : "border border-amber-500/20 bg-orange-950/20 text-orange-200/80 hover:bg-orange-900/40"
                  }`}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
              <div className="relative flex-1 min-w-[140px]">
                <input
                  type="number"
                  placeholder="इतर रक्कम (₹)..."
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="w-full rounded-xl border border-amber-500/30 bg-orange-950/40 px-3.5 py-2 text-xs md:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* Devotee Info & Submit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <input
              type="text"
              placeholder="आपले नाव (Devotee Name)"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-orange-950/40 px-3.5 py-2.5 text-xs md:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
            />

            <input
              type="text"
              placeholder="गाव / शहर (City/Locality)"
              value={donorCity}
              onChange={(e) => setDonorCity(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-orange-950/40 px-3.5 py-2.5 text-xs md:text-sm text-white placeholder-orange-300/40 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02] hover:shadow-orange-500/50 active:scale-95 ring-1 ring-amber-300/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>सेवा समर्पित करा</span>
              <span>🚩</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. Recent Donors List */}
      <RecentDonorsList donors={donors} />
    </div>
  );
}
