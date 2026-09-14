import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DakshinaBoard from './pages/DakshinaBoard';
import MusicPage from './pages/MusicPage';
import VolunteerDesk from './pages/VolunteerDesk';
import AdminManagement from './pages/AdminManagement';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import BottomMobileNav from './components/BottomMobileNav';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import useDonations from './hooks/useDonations';

function AppContent() {
  const { isConnected } = useDonations();
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen w-full bg-[#0d0705] text-amber-50 overflow-x-hidden selection:bg-orange-500 selection:text-white pb-24 md:pb-14">
      {/* Ambient Festive Radial Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-600/20 via-orange-600/15 to-transparent blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-red-600/20 via-rose-700/15 to-transparent blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-transparent blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-3 sm:px-6 pt-3 space-y-6">
        {/* Shared Festive Navbar with Language Switcher */}
        <Navbar isConnected={isConnected} />

        {/* Page Routes */}
        <main className="min-h-[70vh]">
          <Routes>
            {/* Devotional Home Page */}
            <Route path="/" element={<Home />} />

            {/* Live TV Dakshina Board (Public display) */}
            <Route path="/dakshina" element={<DakshinaBoard />} />

            {/* Ganpati Bhakti Music & Suggestions (YouTube Player) */}
            <Route path="/music" element={<MusicPage />} />

            {/* Login for Volunteers & Admin */}
            <Route path="/login" element={<Login />} />

            {/* Volunteer Desk - Protected for logged-in users with access */}
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute>
                  <VolunteerDesk />
                </ProtectedRoute>
              }
            />

            {/* Admin Management - Protected strictly for Admin role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminManagement />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Shared Festive Footer */}
        <footer className="mt-14 rounded-3xl border border-amber-500/20 bg-orange-950/25 p-6 md:p-8 text-center backdrop-blur-xl space-y-3">
          <div className="flex justify-center items-center gap-2 text-amber-300">
            <span className="text-xl">🪔</span>
            <p className="font-serif font-bold text-sm sm:text-base italic">
              {t('footerShloka')}
            </p>
            <span className="text-xl">🪔</span>
          </div>

          <div className="text-xs text-orange-200/70 pt-1">
            {t('trustNotice')}
          </div>
        </footer>

        {/* Floating Bottom Nav for Mobile Phone Screens */}
        <BottomMobileNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <Analytics />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
