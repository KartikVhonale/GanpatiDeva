import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Tv,
  Music,
  UserCheck,
  Bell,
  Shield,
  LogIn,
  LogOut,
  ChevronDown,
  X,
  Languages,
  Palette,
  Menu
} from 'lucide-react';
import { playTempleBell } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import websiteIcon from '../assets/svg.png';

export default function Navbar({ isConnected }) {
  const [bellRung, setBellRung] = useState(false);
  const [bellCount, setBellCount] = useState(0);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { isLight, isRoyal, isGold, isMidnight, openThemeModal, currentTheme } = useTheme();
  const navigate = useNavigate();

  const handleRingBell = () => {
    playTempleBell();
    setBellRung(true);
    setBellCount((prev) => prev + 1);
    setTimeout(() => setBellRung(false), 900);
  };

  const handleLogout = () => {
    setProfileDrawerOpen(false);
    setMobileMenuOpen(false);
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
      to: '/music',
      label: t('musicShort'),
      icon: Music,
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
      <div
        className={`relative mx-auto max-w-6xl rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-2xl transition-colors duration-300 overflow-hidden ${
          isLight
            ? 'border border-[#CC5500]/30 bg-[#FFFDD0]/90 shadow-[0_10px_35px_rgba(204,85,0,0.14)] text-[#2B2B2B]'
            : isRoyal
            ? 'border border-rose-500/40 bg-gradient-to-r from-[#26070e]/95 via-[#1a0408]/95 to-[#120205]/95 shadow-[0_10px_35px_rgba(225,29,72,0.35)] text-rose-50'
            : isGold
            ? 'border border-yellow-500/45 bg-gradient-to-r from-[#1c1304]/95 via-[#120b02]/95 to-[#0b0701]/95 shadow-[0_10px_35px_rgba(234,179,8,0.35)] text-amber-50'
            : 'border border-amber-500/35 bg-gradient-to-r from-orange-950/95 via-red-950/90 to-black/95 shadow-[0_10px_35px_rgba(234,88,12,0.3)] text-white'
        }`}
      >
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
            <div
              className={`relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl p-0.5 group-hover:scale-105 transition-all overflow-hidden ${
                isLight
                  ? 'border-2 border-[#CC5500] bg-gradient-to-br from-[#B7410E] via-[#CC5500] to-[#E06D1A] shadow-md shadow-[#CC5500]/35'
                  : isRoyal
                  ? 'border-2 border-amber-400/80 bg-gradient-to-br from-amber-500 via-rose-700 to-red-800 shadow-md shadow-rose-900/50'
                  : isGold
                  ? 'border-2 border-yellow-300 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-md shadow-yellow-600/40'
                  : 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-md shadow-orange-600/40'
              }`}
            >
              <img
                src={websiteIcon}
                alt="Shree Ganesh Logo"
                className="h-full w-full object-cover rounded-[9px] sm:rounded-[10px]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLight
                      ? 'bg-[#CC5500]'
                      : isRoyal
                      ? 'bg-rose-400'
                      : isGold
                      ? 'bg-yellow-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-full w-full ${
                    isLight
                      ? 'bg-[#B7410E]'
                      : isRoyal
                      ? 'bg-rose-600'
                      : isGold
                      ? 'bg-yellow-500'
                      : 'bg-amber-500'
                  }`}
                />
              </span>
            </div>

            {/* Title & Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span
                  className={`text-xs sm:text-sm md:text-base font-black tracking-tight transition-colors truncate ${
                    isLight
                      ? 'text-[#2B2B2B] group-hover:text-[#CC5500]'
                      : isRoyal
                      ? 'text-rose-50 group-hover:text-amber-300'
                      : isGold
                      ? 'text-amber-100 group-hover:text-yellow-300'
                      : 'text-white group-hover:text-amber-300'
                  }`}
                >
                  {t('mandalName')}
                </span>
                <span
                  className={`text-[8px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                    isLight
                      ? 'bg-[#CC5500]/15 text-[#CC5500] border-[#CC5500]/35'
                      : isRoyal
                      ? 'bg-rose-500/20 text-rose-200 border-rose-400/40 shadow-sm'
                      : isGold
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40 shadow-sm'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {t('year')}
                </span>
              </div>
            </div>
          </Link>

          {/* CENTER: Desktop Navigation Links */}
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
                      isLight
                        ? isActive
                          ? link.highlight
                            ? 'bg-[#CC5500] text-[#FFFDD0] shadow-md shadow-[#CC5500]/30 ring-1 ring-[#B7410E]'
                            : 'bg-[#CC5500]/15 text-[#CC5500] border border-[#CC5500]/40 font-black shadow-sm'
                          : link.highlight
                          ? 'border border-[#CC5500]/30 bg-[#FFFDD0] text-[#CC5500] hover:bg-[#CC5500] hover:text-[#FFFDD0]'
                          : 'text-[#2B2B2B] hover:text-[#CC5500] hover:bg-[#CC5500]/10'
                        : isRoyal
                        ? isActive
                          ? link.highlight
                            ? 'bg-gradient-to-r from-rose-700 to-red-600 text-amber-100 shadow-md shadow-rose-900/50 ring-1 ring-amber-400'
                            : 'bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-sm'
                          : link.highlight
                          ? 'border border-rose-500/40 bg-[#25070e]/70 text-amber-200 hover:bg-rose-900/60 hover:text-white'
                          : 'text-rose-200/80 hover:text-white hover:bg-rose-950/50'
                        : isGold
                        ? isActive
                          ? link.highlight
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black shadow-md shadow-yellow-600/40 ring-1 ring-yellow-200'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50 shadow-sm'
                          : link.highlight
                          ? 'border border-yellow-500/40 bg-[#1c1304]/70 text-yellow-300 hover:bg-yellow-900/50 hover:text-stone-900'
                          : 'text-yellow-200/80 hover:text-yellow-100 hover:bg-yellow-950/50'
                        : isActive
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

          {/* RIGHT: Quick Action Buttons & Theme Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 🎨 Theme Selector Button */}
            <motion.button
              type="button"
              onClick={openThemeModal}
              whileTap={{ scale: 0.92 }}
              title={lang === 'mr' ? 'रंग शैली निवडा (Themes)' : 'Choose Website Theme'}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isLight
                  ? 'border border-[#CC5500]/40 bg-[#CC5500]/10 text-[#CC5500] hover:bg-[#CC5500]/20'
                  : isRoyal
                  ? 'border border-rose-400/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 shadow-rose-950/40'
                  : isGold
                  ? 'border border-yellow-400/50 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 shadow-yellow-950/40'
                  : 'border border-amber-400/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <Palette className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="hidden sm:inline">{lang === 'mr' ? 'थीम' : 'Theme'}</span>
              <span
                style={{ backgroundColor: currentTheme.accentHex }}
                className="h-2 w-2 rounded-full ring-1 ring-black/20 dark:ring-white/30 shrink-0"
              />
            </motion.button>

            {/* 🌐 Language Switcher Button */}
            <motion.button
              type="button"
              onClick={toggleLanguage}
              whileTap={{ scale: 0.92 }}
              title={lang === 'mr' ? 'Switch to English' : 'मराठीमध्ये पहा'}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isLight
                  ? 'border border-[#CC5500]/40 bg-[#CC5500]/10 text-[#2B2B2B] hover:bg-[#CC5500]/20'
                  : 'border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 hover:bg-amber-500/30'
              }`}
            >
              <Languages
                className={`h-3 w-3 shrink-0 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`}
              />
              <span
                className={
                  lang === 'mr'
                    ? isLight
                      ? 'text-[#CC5500] font-black'
                      : 'text-amber-300 font-black'
                    : isLight
                    ? 'text-stone-500'
                    : 'text-orange-200/60'
                }
              >
                मराठी
              </span>
              <span className={isLight ? 'text-[#CC5500]/40 text-[9px]' : 'text-amber-500/40 text-[9px]'}>
                |
              </span>
              <span
                className={
                  lang === 'en'
                    ? isLight
                      ? 'text-[#CC5500] font-black'
                      : 'text-amber-300 font-black'
                    : isLight
                    ? 'text-stone-500'
                    : 'text-orange-200/60'
                }
              >
                EN
              </span>
            </motion.button>

            {/* Interactive Temple Bell */}
            <motion.button
              type="button"
              onClick={handleRingBell}
              whileTap={{ scale: 0.88 }}
              title="घंटी वाजवा (Ring Temple Bell)"
              className={`relative flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full border transition-all cursor-pointer shadow-sm ${
                bellRung
                  ? isLight
                    ? 'border-[#CC5500] bg-[#CC5500] text-[#FFFDD0] shadow-lg shadow-[#CC5500]/40 scale-105'
                    : isRoyal
                    ? 'border-amber-300 bg-rose-600 text-amber-100 shadow-lg shadow-rose-900/50 scale-105'
                    : isGold
                    ? 'border-yellow-200 bg-yellow-400 text-stone-950 shadow-lg shadow-yellow-500/50 scale-105'
                    : 'border-amber-300 bg-amber-400 text-black shadow-lg shadow-amber-400/40 scale-105'
                  : isLight
                  ? 'border-[#CC5500]/40 bg-[#CC5500]/10 text-[#CC5500] hover:bg-[#CC5500]/20'
                  : isRoyal
                  ? 'border-rose-400/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                  : isGold
                  ? 'border-yellow-400/50 bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25'
                  : 'border-amber-400/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
              }`}
            >
              <Bell
                className={`h-3.5 w-3.5 ${
                  bellRung
                    ? 'animate-bounce'
                    : isLight
                    ? 'text-[#CC5500]'
                    : isRoyal
                    ? 'text-rose-300'
                    : isGold
                    ? 'text-yellow-300'
                    : 'text-amber-400'
                }`}
              />
              {bellCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-black text-white ${
                    isLight
                      ? 'bg-[#B7410E] ring-1 ring-[#FFFDD0]'
                      : isRoyal
                      ? 'bg-rose-700 ring-1 ring-amber-300'
                      : isGold
                      ? 'bg-amber-600 ring-1 ring-yellow-200'
                      : 'bg-red-600 ring-1 ring-amber-300'
                  }`}
                >
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
                  className={`flex items-center gap-1 rounded-full sm:rounded-xl p-0.5 sm:px-2 sm:py-1 text-xs transition-all cursor-pointer shadow-sm ${
                    isLight
                      ? 'border border-[#CC5500]/40 bg-[#FFFDD0] text-[#2B2B2B] hover:border-[#CC5500]'
                      : isRoyal
                      ? 'border border-rose-400/40 bg-rose-950/60 text-rose-100 hover:border-amber-300'
                      : isGold
                      ? 'border border-yellow-400/40 bg-yellow-950/60 text-yellow-100 hover:border-yellow-300'
                      : 'border border-amber-400/40 bg-black/40 text-orange-100 hover:border-amber-300'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs ${
                      isLight
                        ? 'bg-[#CC5500]/15 border border-[#CC5500]/40 text-[#CC5500]'
                        : isRoyal
                        ? 'bg-rose-900 border border-amber-400/50 text-rose-200'
                        : isGold
                        ? 'bg-yellow-900 border border-yellow-400/50 text-yellow-200'
                        : 'bg-orange-950 border border-amber-400/50'
                    }`}
                  >
                    {user?.role === 'admin' ? '👑' : '🙋‍♂️'}
                  </div>
                  <span className="hidden sm:inline font-bold truncate max-w-[90px] text-[11px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      isLight
                        ? 'text-[#CC5500]'
                        : isRoyal
                        ? 'text-rose-300'
                        : isGold
                        ? 'text-yellow-300'
                        : 'text-orange-300'
                    } ${profileDrawerOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`hidden sm:flex items-center gap-1 rounded-full sm:rounded-xl px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition-all shadow-md ${
                  isLight
                    ? 'border border-[#CC5500] bg-[#CC5500] text-[#FFFDD0] hover:bg-[#B7410E] shadow-[#CC5500]/25'
                    : isRoyal
                    ? 'border border-amber-400/50 bg-gradient-to-r from-rose-700 to-red-600 text-amber-100 shadow-rose-900/40 hover:brightness-110'
                    : isGold
                    ? 'border border-yellow-300/60 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black shadow-yellow-600/40 hover:brightness-110'
                    : 'border border-amber-400/50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-600/30 hover:brightness-110'
                }`}
              >
                <LogIn className="h-3 w-3" />
                <span className="text-[11px] sm:text-xs">{t('login')}</span>
              </Link>
            )}

            {/* 📱 Mobile Menu Indicator */}
            <motion.button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setProfileDrawerOpen(false);
              }}
              whileTap={{ scale: 0.9 }}
              title={lang === 'mr' ? 'मेनू (Menu)' : 'Menu'}
              className={`md:hidden flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'border border-[#CC5500]/50 text-[#CC5500] bg-[#FFFDD0]/90 shadow-[0_0_12px_rgba(204,85,0,0.35)] hover:bg-[#CC5500] hover:text-[#FFFDD0]'
                  : isRoyal
                  ? 'border border-rose-400/60 text-amber-300 bg-[#25070e]/90 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : isGold
                  ? 'border border-yellow-400/60 text-yellow-300 bg-[#1c1304]/90 shadow-[0_0_15px_rgba(234,179,8,0.45)]'
                  : 'border border-amber-400/50 text-amber-300 bg-black/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4 stroke-[2.5]" />
              )}
            </motion.button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE SLIDE-DOWN DRAWER                                  */}
        {/* ========================================================= */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-2.5 pt-2.5 border-t space-y-2.5 ${
                isLight
                  ? 'border-[#CC5500]/25'
                  : isRoyal
                  ? 'border-rose-500/30'
                  : isGold
                  ? 'border-yellow-500/30'
                  : 'border-amber-500/25'
              }`}
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 rounded-xl p-2 font-bold transition-all text-xs ${
                          isLight
                            ? isActive
                              ? 'bg-[#CC5500] text-[#FFFDD0] shadow-sm'
                              : 'bg-[#FFFDD0] text-[#2B2B2B] hover:text-[#CC5500] border border-[#CC5500]/20'
                            : isRoyal
                            ? isActive
                              ? 'bg-rose-600 text-amber-100 shadow-sm border border-amber-400/40'
                              : 'bg-[#25070e]/70 text-rose-200 hover:text-white border border-rose-500/30'
                            : isGold
                            ? isActive
                              ? 'bg-yellow-400 text-stone-950 font-black shadow-sm border border-yellow-200'
                              : 'bg-[#1c1304]/70 text-yellow-200 hover:text-yellow-100 border border-yellow-500/30'
                            : isActive
                            ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                            : 'bg-orange-950/40 text-orange-200 hover:text-white border border-amber-500/20'
                        }`
                      }
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile Theme Switch Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openThemeModal();
                  }}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer ${
                    isLight
                      ? 'border border-[#CC5500] bg-[#CC5500]/10 text-[#CC5500] hover:bg-[#CC5500] hover:text-[#FFFDD0]'
                      : isRoyal
                      ? 'border border-rose-400/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                      : isGold
                      ? 'border border-yellow-400/40 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                      : 'border border-amber-400/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                  }`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span>
                    {lang === 'mr'
                      ? `थीम: ${currentTheme.shortName.mr}`
                      : `Theme: ${currentTheme.shortName.en}`}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              className={`mt-2.5 pt-2.5 border-t space-y-2.5 ${
                isLight ? 'border-[#CC5500]/25' : 'border-amber-500/25'
              }`}
            >
              {/* User Profile Header */}
              <div
                className={`flex items-center justify-between rounded-xl p-2.5 border ${
                  isLight
                    ? 'bg-[#FFFDD0] border-[#CC5500]/25 text-[#2B2B2B]'
                    : 'bg-black/50 border-amber-500/20 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-base border ${
                      isLight
                        ? 'bg-[#CC5500]/15 border-[#CC5500]/30 text-[#CC5500]'
                        : 'bg-amber-500/20 border-amber-400/30'
                    }`}
                  >
                    {user?.role === 'admin' ? '👑' : '🙋‍♂️'}
                  </div>
                  <div>
                    <div
                      className={`text-xs sm:text-sm font-black ${
                        isLight ? 'text-[#2B2B2B]' : 'text-white'
                      }`}
                    >
                      {user?.name}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[10px] ${
                        isLight ? 'text-stone-600' : 'text-orange-200/70'
                      }`}
                    >
                      <span className={isLight ? 'text-[#CC5500] font-semibold' : 'text-amber-300 font-semibold'}>
                        @{user?.username}
                      </span>
                      <span>•</span>
                      <span
                        className={`rounded px-1 py-0.2 text-[9px] font-bold ${
                          isLight
                            ? 'bg-[#CC5500]/15 text-[#CC5500]'
                            : 'bg-amber-500/20 text-amber-200'
                        }`}
                      >
                        {user?.role === 'admin' ? t('roleAdmin') : t('roleVolunteer')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(false)}
                  className={`p-1 rounded-lg cursor-pointer ${
                    isLight ? 'text-stone-700 hover:text-[#CC5500]' : 'text-orange-300 hover:text-white'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Links in Mobile Header */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/volunteer"
                  onClick={() => setProfileDrawerOpen(false)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 font-bold text-xs ${
                    isLight
                      ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-[#CC5500] hover:bg-[#CC5500]/10'
                      : 'border-amber-500/30 bg-orange-950/40 text-amber-200 hover:bg-orange-900/50'
                  }`}
                >
                  <UserCheck
                    className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`}
                  />
                  <span className="truncate">{t('volunteerDesk')}</span>
                </Link>

                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 font-bold text-xs ${
                      isLight
                        ? 'border-[#CC5500]/40 bg-[#CC5500]/20 text-[#CC5500] hover:bg-[#CC5500]/30'
                        : 'border-amber-500/30 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                    }`}
                  >
                    <Shield
                      className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`}
                    />
                    <span className="truncate">{t('adminDesk')}</span>
                  </Link>
                ) : (
                  <Link
                    to="/dakshina"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 font-bold text-xs ${
                      isLight
                        ? 'border-[#CC5500]/30 bg-[#FFFDD0] text-[#CC5500] hover:bg-[#CC5500]/10'
                        : 'border-amber-500/30 bg-orange-950/40 text-amber-200 hover:bg-orange-900/50'
                    }`}
                  >
                    <Tv
                      className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-[#CC5500]' : 'text-amber-400'}`}
                    />
                    <span className="truncate">{t('liveBoard')}</span>
                  </Link>
                )}
              </div>

              {/* Sign Out Button */}
              <div className="pt-1 flex items-center justify-between">
                <span className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>
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
