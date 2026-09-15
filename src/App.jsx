import React, { Suspense } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import BottomMobileNav from './components/BottomMobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeSelectorModal from './components/ThemeSelectorModal';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import useDonations, { DonationsProvider } from './hooks/useDonations';

// Code-split route components for instant initial load and high mobile scalability
const Home = React.lazy(() => import('./pages/Home'));
const DakshinaBoard = React.lazy(() => import('./pages/DakshinaBoard'));
const MusicPage = React.lazy(() => import('./pages/MusicPage'));
const VolunteerDesk = React.lazy(() => import('./pages/VolunteerDesk'));
const AdminManagement = React.lazy(() => import('./pages/AdminManagement'));
const Login = React.lazy(() => import('./pages/Login'));

// Festive fast loading spinner for route transitions
function PageLoadingFallback() {
  const { currentTheme, isLight } = useTheme();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div
        style={{
          borderTopColor: currentTheme.accentHex || '#CC5500',
          borderColor: isLight ? 'rgba(204, 85, 0, 0.25)' : 'rgba(245, 158, 11, 0.25)',
        }}
        className="h-10 w-10 animate-spin rounded-full border-3"
      />
      <span
        style={{ color: currentTheme.accentHex || '#CC5500' }}
        className="text-xs font-bold animate-pulse font-serif tracking-wide"
      >
        ॥ श्री गणेशाय नमः ॥ लोड होत आहे...
      </span>
    </div>
  );
}

function AppContent() {
  const { isConnected } = useDonations();
  const { t } = useLanguage();
  const { isLight, isRoyal, isGold, isMidnight } = useTheme();

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-300 overflow-x-hidden pb-24 md:pb-14 ${
        isLight
          ? 'bg-[#F5F5DC] text-[#2B2B2B] selection:bg-[#CC5500] selection:text-[#FFFDD0]'
          : isRoyal
          ? 'bg-[#170408] text-rose-50 selection:bg-[#e11d48] selection:text-white'
          : isGold
          ? 'bg-[#0f0a02] text-amber-50 selection:bg-[#eab308] selection:text-black'
          : 'bg-[#0d0705] text-amber-50 selection:bg-orange-500 selection:text-white'
      }`}
    >
      {/* Ambient Festive Radial Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        {isLight ? (
          <>
            <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#CC5500]/12 via-[#B7410E]/8 to-transparent blur-[130px] animate-pulse-slow" />
            <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-[#B7410E]/12 via-[#CC5500]/8 to-transparent blur-[140px] animate-pulse-slow" />
            <div className="absolute bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#CC5500]/10 via-[#FFFDD0]/20 to-transparent blur-[110px]" />
          </>
        ) : isRoyal ? (
          <>
            <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-600/20 via-red-900/18 to-transparent blur-[125px] animate-pulse-slow" />
            <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-amber-500/18 via-rose-700/15 to-transparent blur-[135px] animate-pulse-slow" />
            <div className="absolute bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-rose-700/15 via-amber-600/10 to-transparent blur-[110px]" />
          </>
        ) : isGold ? (
          <>
            <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-yellow-500/22 via-amber-600/18 to-transparent blur-[125px] animate-pulse-slow" />
            <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-amber-400/20 via-yellow-600/15 to-transparent blur-[135px] animate-pulse-slow" />
            <div className="absolute bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-yellow-600/15 via-amber-500/12 to-transparent blur-[110px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-600/20 via-orange-600/15 to-transparent blur-[120px] animate-pulse-slow" />
            <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-red-600/20 via-rose-700/15 to-transparent blur-[130px] animate-pulse-slow" />
            <div className="absolute bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-transparent blur-[100px]" />
          </>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-3 sm:px-6 pt-3 space-y-6">
        {/* Shared Festive Navbar with Theme & Language Switchers */}
        <Navbar isConnected={isConnected} />

        {/* Page Routes with Lazy Loading Suspense */}
        <main className="min-h-[70vh]">
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
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
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Shared Festive Footer */}
        <footer
          className={`mt-14 rounded-3xl border p-6 md:p-8 text-center backdrop-blur-xl space-y-3 transition-colors ${
            isLight
              ? 'border-[#CC5500]/30 bg-[#FFFDD0]/85 text-[#2B2B2B] shadow-[0_10px_35px_rgba(204,85,0,0.1)]'
              : isRoyal
              ? 'border-rose-500/30 bg-gradient-to-br from-[#24070e]/80 via-[#180408]/80 to-black/85 text-rose-50 shadow-[0_10px_35px_rgba(225,29,72,0.2)]'
              : isGold
              ? 'border-yellow-500/30 bg-gradient-to-br from-[#1c1304]/80 via-[#120b02]/80 to-black/85 text-amber-50 shadow-[0_10px_35px_rgba(234,179,8,0.2)]'
              : 'border-amber-500/20 bg-orange-950/25 text-amber-50'
          }`}
        >
          <div
            className={`flex justify-center items-center gap-2 ${
              isLight ? 'text-[#CC5500]' : isRoyal ? 'text-rose-300' : isGold ? 'text-yellow-300' : 'text-amber-300'
            }`}
          >
            <span className="text-xl">🪔</span>
            <p className="font-serif font-bold text-sm sm:text-base italic">
              {t('footerShloka')}
            </p>
            <span className="text-xl">🪔</span>
          </div>

          <div
            className={`text-xs pt-1 ${
              isLight ? 'text-stone-600' : isRoyal ? 'text-rose-200/70' : isGold ? 'text-yellow-200/70' : 'text-orange-200/70'
            }`}
          >
            {t('trustNotice')}
          </div>
        </footer>

        {/* Floating Bottom Nav for Mobile Phone Screens */}
        <BottomMobileNav />
      </div>

      {/* Global Interactive Theme Selector Modal */}
      <ThemeSelectorModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <DonationsProvider>
              <AppContent />
              <Analytics />
            </DonationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
