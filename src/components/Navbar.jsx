import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Tv, UserCheck, Bell } from 'lucide-react';
import { playTempleBell } from '../utils/audio';

export default function Navbar({ isConnected }) {
  const [bellRung, setBellRung] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRingBell = () => {
    playTempleBell();
    setBellRung(true);
    setTimeout(() => setBellRung(false), 1200);
  };

  const navLinks = [
    {
      to: '/',
      label: 'मुख्य पृष्ठ (Home)',
      icon: Home,
    },
    {
      to: '/dakshina',
      label: 'थेट देणगी फलक (Live Board)',
      icon: Tv,
      highlight: true,
    },
    {
      to: '/admin',
      label: 'स्वयंसेवक कक्ष (Volunteer Desk)',
      icon: UserCheck,
    },
  ];

  return (
    <header className="sticky top-2 z-50 w-full mb-4 px-2 sm:px-0">
      <div className="mx-auto max-w-6xl rounded-2xl border border-amber-500/30 bg-gradient-to-r from-orange-950/85 via-red-950/75 to-black/90 px-4 py-2.5 backdrop-blur-2xl shadow-[0_10px_35px_rgba(234,88,12,0.28)]">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Mandal Title */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer select-none"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-0.5 shadow-md shadow-orange-600/40 group-hover:scale-105 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-orange-950/90 text-lg">
                🪔
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  श्री गणेश उत्सव मंडळ
                </span>
                <span className="hidden md:inline text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                  २०२६
                </span>
              </div>
              <span className="block text-[11px] text-amber-300/80 font-medium">
                ॥ ॐ गं गणपतये नमः ॥
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
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
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Icons: Temple Bell & Live Status */}
          <div className="flex items-center gap-2">
            {/* Interactive Temple Bell */}
            <button
              type="button"
              onClick={handleRingBell}
              title="घंटी वाजवा (Ring Temple Bell)"
              className={`flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm ${
                bellRung ? 'scale-110 rotate-12 text-yellow-100 ring-2 ring-amber-300' : ''
              }`}
            >
              <Bell className={`h-3.5 w-3.5 text-amber-400 ${bellRung ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">घंटी वाजवा</span>
            </button>

            {/* Socket Status Indicator */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md ${
                isConnected
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
              title={isConnected ? 'Realtime Backend Connected' : 'Running in Offline / Standalone mode'}
            >
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isConnected ? 'Live' : 'Bhakti'}</span>
            </span>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-amber-500/30 bg-orange-950/40 text-amber-200 hover:text-white cursor-pointer"
              aria-label="Toggle navigation"
            >
              <span className="text-lg">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col gap-2 md:hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow'
                        : 'border border-amber-500/20 bg-orange-950/30 text-orange-200/80 hover:bg-orange-900/40 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
