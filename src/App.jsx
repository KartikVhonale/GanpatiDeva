import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DakshinaBoard from './pages/DakshinaBoard';
import Admin from './pages/Admin';
import useDonations from './hooks/useDonations';

function AppContent() {
  const { isConnected } = useDonations();

  return (
    <div className="relative min-h-screen w-full bg-[#0d0705] text-amber-50 overflow-x-hidden selection:bg-orange-500 selection:text-white pb-14">
      {/* Ambient Festive Radial Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-600/20 via-orange-600/15 to-transparent blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-red-600/20 via-rose-700/15 to-transparent blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-transparent blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-3 sm:px-6 pt-3 space-y-6">
        {/* Shared Festive Navbar */}
        <Navbar isConnected={isConnected} />

        {/* Page Routes */}
        <main className="min-h-[70vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dakshina" element={<DakshinaBoard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Shared Festive Footer */}
        <footer className="mt-14 rounded-3xl border border-amber-500/20 bg-orange-950/25 p-6 md:p-8 text-center backdrop-blur-xl space-y-3">
          <div className="flex justify-center items-center gap-2 text-amber-300">
            <span className="text-xl">🪔</span>
            <p className="font-serif font-bold text-sm sm:text-base italic">
              ॥ मोरया रे बाप्पा मोरया रे, गणपती बाप्पा मोरया, मंगलमूर्ती मोरया ॥
            </p>
            <span className="text-xl">🪔</span>
          </div>

          <div className="text-xs text-orange-200/70 pt-1">
            सार्वजनिक श्री गणेश उत्सव मंडळ ट्रस्ट • नोंदणी क्र. महा/२०२६/गणेश-१
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
