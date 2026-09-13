import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, User, KeyRound, Eye, EyeOff, ArrowLeft, ShieldAlert, Clock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const { login } = useAuth();
  const { t, isMarathi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  // Real-time second countdown for IP lockout
  useEffect(() => {
    if (!isBlocked || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsBlocked(false);
          setErrorMsg('');
          setRemainingAttempts(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBlocked, countdown]);

  const formatCountdown = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDemoFill = (role) => {
    if (isBlocked) return;
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('volunteer1');
      setPassword('vol123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg(t('loginEmptyError'));
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(username.trim(), password);
      // Determine redirection target
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/volunteer', { replace: true });
      }
    } catch (err) {
      if (err.blocked || err.status === 429) {
        setIsBlocked(true);
        const secs = err.retryAfterSeconds || (err.retryAfterMinutes ? err.retryAfterMinutes * 60 : 1800);
        setCountdown(secs);
        setErrorMsg(err.message || t('loginBlockedSub'));
        setRemainingAttempts(0);
      } else {
        if (err.remainingAttempts !== undefined) {
          setRemainingAttempts(err.remainingAttempts);
        }
        setErrorMsg(err.message || t('loginFailedError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_rgba(234,88,12,0.3)]">
          {/* Top Decorative Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400/90 tracking-widest uppercase">
              <span>{t('sacredMantra')}</span>
            </div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-0.5 shadow-lg shadow-orange-600/40">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-orange-950 text-2xl">
                🪔
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              {t('loginHeaderTitle')}
            </h1>
            <p className="text-xs text-orange-200/75">
              {t('loginHeaderSub')}
            </p>
          </div>

          {/* 30-Minute IP Blockout Alert Banner */}
          {isBlocked ? (
            <div className="mb-6 rounded-2xl border-2 border-red-500/70 bg-red-950/80 p-4 text-center shadow-xl shadow-red-950/60 animate-pulse">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-600/30 border border-red-500 text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-red-200 uppercase tracking-wide">
                {t('loginBlockedTitle')}
              </h3>
              <p className="mt-1 text-xs text-red-300/90 leading-relaxed">
                {t('loginBlockedSub')}
              </p>

              {/* Countdown Timer Display */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-black/60 px-4 py-2 text-red-200">
                <Clock className="h-4 w-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs text-orange-200/80">{t('loginBlockedTimeRemaining')}</span>
                <span className="font-mono text-base font-black tracking-wider text-amber-400">
                  {formatCountdown(countdown)}
                </span>
              </div>

              <p className="mt-3 text-[11px] text-red-300/70">
                {t('securityLockoutNotice')}
              </p>
            </div>
          ) : (
            <>
              {/* Standard Error Banner with Remaining Attempts Warning */}
              {errorMsg && (
                <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200 flex items-start gap-2 animate-shake">
                  <span className="text-base leading-none">⚠️</span>
                  <div className="space-y-1">
                    <p className="font-medium">{errorMsg}</p>
                    {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 10 && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                        <span>🛡️ {t('attemptsRemainingWarning')}: {remainingAttempts}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Demo Fill Buttons (Hidden when blocked) */}
          {!isBlocked && (
            <div className="mb-5 rounded-2xl border border-amber-500/20 bg-black/40 p-3 text-xs">
              <span className="text-orange-200/70 font-semibold block mb-2">
                {t('demoAccountsTitle')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin')}
                  className="py-1.5 px-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-bold transition text-center cursor-pointer"
                >
                  {t('demoAdminBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('volunteer')}
                  className="py-1.5 px-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-bold transition text-center cursor-pointer"
                >
                  {t('demoVolBtn')}
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-200/90">
                {t('usernameLoginLabel')}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-400/70">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  disabled={isBlocked}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('usernameLoginPlaceholder')}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-orange-200/30 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-200/90">
                {t('passwordLoginLabel')}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-400/70">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isBlocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordLoginPlaceholder')}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-orange-200/30 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isBlocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-orange-300/60 hover:text-orange-200 transition-colors disabled:opacity-40"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || isBlocked}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isBlocked ? (
                <>
                  <ShieldAlert className="h-4 w-4 text-red-300" />
                  <span>{isMarathi ? 'प्रवेश तात्पुरता ब्लॉक आहे (IP Blocked)' : 'Access Blocked for 30 min'}</span>
                </>
              ) : submitting ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>{t('verifyingLogin')}</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>{t('loginBtn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-amber-500/20 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-orange-200/70 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('backToHome')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
