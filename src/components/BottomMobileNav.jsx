import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tv, UserCheck, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomMobileNav() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();

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
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-gradient-to-t from-black via-orange-950/95 to-orange-950/90 border-t border-amber-500/30 backdrop-blur-2xl px-2 py-1.5 shadow-[0_-8px_30px_rgba(234,88,12,0.3)]">
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
                  isActive
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
                        ? 'bg-amber-500/25 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : ''
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-orange-300/70'}`} />
                  </div>
                  <span className="mt-0.5 tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
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
