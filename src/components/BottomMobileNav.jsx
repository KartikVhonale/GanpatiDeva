import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tv, Music, UserCheck, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function BottomMobileNav() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { isLight, isRoyal, isGold } = useTheme();

  const items = [
    {
      to: '/',
      label: t('homeShort'),
      icon: Home,
    },
    {
      to: '/dakshina',
      label: t('liveBoardShort'),
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
      label: t('volunteerShort'),
      icon: UserCheck,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin',
            label: t('adminShort'),
            icon: Shield,
          },
        ]
      : !isAuthenticated
      ? [
          {
            to: '/login',
            label: t('login'),
            icon: LogIn,
          },
        ]
      : []),
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 md:hidden backdrop-blur-2xl px-2 py-1.5 transition-colors duration-300 ${
        isLight
          ? 'bg-[#F5F5DC]/95 border-t border-[#CC5500]/30 shadow-[0_-8px_30px_rgba(204,85,0,0.12)] text-[#2B2B2B]'
          : isRoyal
          ? 'bg-gradient-to-t from-black via-[#1c0409]/95 to-[#2a0710]/90 border-t border-rose-500/35 shadow-[0_-8px_30px_rgba(225,29,72,0.3)] text-rose-100'
          : isGold
          ? 'bg-gradient-to-t from-black via-[#150d03]/95 to-[#241804]/90 border-t border-yellow-500/35 shadow-[0_-8px_30px_rgba(234,179,8,0.3)] text-amber-100'
          : 'bg-gradient-to-t from-black via-orange-950/95 to-orange-950/90 border-t border-amber-500/30 shadow-[0_-8px_30px_rgba(234,88,12,0.3)] text-orange-100'
      }`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[10px] font-bold transition-all relative ${
                  isLight
                    ? isActive
                      ? 'text-[#CC5500] scale-105 font-black'
                      : 'text-stone-600 hover:text-[#CC5500]'
                    : isRoyal
                    ? isActive
                      ? 'text-rose-300 scale-105 font-black'
                      : 'text-rose-200/60 hover:text-rose-100'
                    : isGold
                    ? isActive
                      ? 'text-yellow-300 scale-105 font-black'
                      : 'text-yellow-200/60 hover:text-yellow-100'
                    : isActive
                    ? item.highlight
                      ? 'text-amber-300 scale-105 font-black'
                      : 'text-amber-400 scale-105 font-black'
                    : 'text-orange-200/60 hover:text-orange-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? isLight
                          ? 'bg-[#CC5500]/15 border border-[#CC5500]/40 shadow-[0_0_12px_rgba(204,85,0,0.3)]'
                          : isRoyal
                          ? 'bg-rose-500/25 border border-rose-400/50 shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                          : isGold
                          ? 'bg-yellow-500/25 border border-yellow-400/50 shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                          : 'bg-amber-500/25 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? isLight
                            ? 'text-[#CC5500]'
                            : isRoyal
                            ? 'text-rose-300'
                            : isGold
                            ? 'text-yellow-300'
                            : 'text-amber-300'
                          : isLight
                          ? 'text-stone-500'
                          : isRoyal
                          ? 'text-rose-300/70'
                          : isGold
                          ? 'text-yellow-300/70'
                          : 'text-orange-300/70'
                      }`}
                    />
                  </div>
                  <span className="mt-0.5 tracking-tight">{item.label}</span>
                  {isActive && (
                    <span
                      className={`absolute -bottom-1 h-1 w-4 rounded-full ${
                        isLight
                          ? 'bg-[#CC5500]'
                          : isRoyal
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : isGold
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
