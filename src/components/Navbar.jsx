import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Tv,
  UserCheck,
  Bell,
  Shield,
  LogIn,
  LogOut,
  ChevronDown,
  X,
  Languages
} from 'lucide-react';
import { playTempleBell } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import websiteIcon from '../assets/svg.png';
export default function Navbar({ isConnected }) {
  const [bellRung, setBellRung] = useState(false);
  const [bellCount, setBellCount] = useState(0);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleRingBell = () => {
    playTempleBell();
    setBellRung(true);
    setBellCount((prev) => prev + 1);
    setTimeout(() => setBellRung(false), 900);
  };

  const handleLogout = () => {
    setProfileDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/',
      label: t('home'),
      icon: Home,
    },
    {
      to: '/dakshina',
      label: t('liveBoard'),
      icon: Tv,
      highlight: true,
    },
    {
      to: '/volunteer',
      label: t('volunteerDesk'),
      icon: UserCheck,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin',
            label: t('adminDesk'),
            icon: Shield,
            adminOnly: true,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-1 sm:top-2 z-50 w-full mb-3 sm:mb-5 px-1 sm:px-0">
      <div className="relative mx-auto max-w-6xl rounded-2xl sm:rounded-3xl border border-amber-500/35 bg-gradient-to-r from-orange-950/95 via-red-950/90 to-black/95 px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-2xl shadow-[0_10px_35px_rgba(234,88,12,0.3)] overflow-hidden">
        {/* ========================================================= */}
        {/* TOP ROW: Brand, Nav & Quick Actions                       */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* LEFT: Logo & Festive Title */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer select-none min-w-0"
          >
            {/* Official Website Ganesha Icon */}
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-0.5 shadow-md shadow-orange-600/40 group-hover:scale-105 transition-all overflow-hidden">
              <img
                src={websiteIcon}
                alt="Shree Ganesh Logo"
                className="h-full w-full object-cover rounded-[9px] sm:rounded-[10px]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-full w-full bg-amber-500" />
              </span>
            </div>

            {/* Title & Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white group-hover:text-amber-300 transition-colors truncate">
                  {t('mandalName')}
                </span>
                <span className="text-[8px] sm:text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/30 shrink-0">
                  {t('year')}
                </span>
              </div>
            </div>
          </Link>

          {/* CENTER: Desktop Navigation Links (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? link.highlight
                          ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-600/40 ring-1 ring-amber-300'
                          : 'bg-amber-500/20 text-amber-200 border border-amber-400/50 shadow-sm'
                        : link.highlight
                        ? 'border border-amber-500/30 bg-orange-950/40 text-amber-300 hover:bg-orange-900/50 hover:text-white'
                        : 'text-orange-200/80 hover:text-white hover:bg-orange-950/40'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* RIGHT: Mobile-Optimized Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 🌐 Language Switcher Button (Compact on Mobile) */}
            <motion.button
              type="button"
              onClick={toggleLanguage}
              whileTap={{ scale: 0.92 }}
              title={lang === 'mr' ? 'Switch to English' : 'मराठीमध्ये पहा'}
              className="flex items-center gap-1 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2 py-1 text-[10px] sm:text-xs font-bold text-amber-200 hover:border-amber-300 hover:bg-amber-500/30 transition-all shadow-sm cursor-pointer"
            >
              <Languages className="h-3 w-3 text-amber-400 shrink-0" />
              <span className={lang === 'mr' ? 'text-amber-300 font-black' : 'text-orange-200/60'}>
                मराठी
              </span>
              <span className="text-amber-500/40 text-[9px]">|</span>
              <span className={lang === 'en' ? 'text-amber-300 font-black' : 'text-orange-200/60'}>
                EN
              </span>
            </motion.button>

            {/* Interactive Temple Bell (Devotional Audio Chime) */}
            <motion.button
              type="button"
              onClick={handleRingBell}
              whileTap={{ scale: 0.88 }}
              title="घंटी वाजवा (Ring Temple Bell)"
              className={`relative flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full border transition-all cursor-pointer shadow-sm ${
                bellRung
                  ? 'border-amber-300 bg-amber-400 text-black shadow-lg shadow-amber-400/40 scale-105'
                  : 'border-amber-400/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
              }`}
            >
              <Bell
                className={`h-3.5 w-3.5 ${
                  bellRung ? 'animate-bounce text-black' : 'text-amber-400'
                }`}
              />
              {bellCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-black text-white ring-1 ring-amber-300">
                  {bellCount > 9 ? '9+' : bellCount}
                </span>
              )}
            </motion.button>

            {/* Profile Avatar / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(!profileDrawerOpen)}
                  className="flex items-center gap-1 rounded-full sm:rounded-xl border border-amber-400/40 bg-black/40 p-0.5 sm:px-2 sm:py-1 text-xs text-orange-100 hover:border-amber-300 transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-orange-950 border border-amber-400/50 text-xs">
                    {user?.role === 'admin' ? '👑' : '🙋‍♂️'}
                  </div>
                  <span className="hidden sm:inline font-bold truncate max-w-[90px] text-[11px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-orange-300 transition-transform ${
                      profileDrawerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-full sm:rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500 to-orange-600 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-white shadow-md shadow-orange-600/30 hover:brightness-110 active:scale-95 transition-all"
              >
                <LogIn className="h-3 w-3" />
                <span className="text-[11px] sm:text-xs">{t('login')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE SLIDE-DOWN PROFILE & QUICK SHORTCUTS DRAWER        */}
        {/* ========================================================= */}
        <AnimatePresence>
          {profileDrawerOpen && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-2.5 pt-2.5 border-t border-amber-500/25 space-y-2.5"
            >
              {/* User Profile Header */}
              <div className="flex items-center justify-between rounded-xl bg-black/50 p-2.5 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-base border border-amber-400/30">
                    {user?.role === 'admin' ? '👑' : '🙋‍♂️'}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">{user?.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-orange-200/70">
                      <span className="text-amber-300 font-semibold">@{user?.username}</span>
                      <span>•</span>
                      <span className="rounded bg-amber-500/20 text-amber-200 px-1 py-0.2 text-[9px] font-bold">
                        {user?.role === 'admin' ? t('roleAdmin') : t('roleVolunteer')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(false)}
                  className="p-1 text-orange-300 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Links in Mobile Header */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/volunteer"
                  onClick={() => setProfileDrawerOpen(false)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/40 p-2 text-amber-200 font-bold hover:bg-orange-900/50 text-xs"
                >
                  <UserCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{t('volunteerDesk')}</span>
                </Link>

                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setProfileDrawerOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/20 p-2 text-amber-200 font-bold hover:bg-amber-500/30 text-xs"
                  >
                    <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{t('adminDesk')}</span>
                  </Link>
                ) : (
                  <Link
                    to="/dakshina"
                    onClick={() => setProfileDrawerOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/40 p-2 text-amber-200 font-bold hover:bg-orange-900/50 text-xs"
                  >
                    <Tv className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{t('liveBoard')}</span>
                  </Link>
                )}
              </div>

              {/* Sign Out Button */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-orange-200/50">
                  {lang === 'mr' ? 'सत्र सुरक्षितपणे समाप्त करा' : 'End session securely'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 rounded-xl border border-red-500/40 bg-red-950/60 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-900/60 active:scale-95 transition-all cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
