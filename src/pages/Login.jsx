import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('कृपया वापरकर्ता नाव आणि पासवर्ड प्रविष्ट करा.');
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
      setErrorMsg(err.message || 'लॉगिन अयशस्वी झाले. कृपया तपशील तपासा.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_rgba(234,88,12,0.3)]">
          {/* Top Decorative Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400/90 tracking-widest uppercase">
              <span>॥ श्री गणेशाय नमः ॥</span>
            </div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-0.5 shadow-lg shadow-orange-600/40">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-orange-950 text-2xl">
                🪔
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              मंडळ कक्ष प्रवेश
            </h1>
            <p className="text-xs text-orange-200/75">
              स्वयंसेवक व व्यवस्थापकांसाठी अधिकृत प्रवेशद्वार
            </p>
          </div>

          {/* Quick Demo Autofill Bar */}
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-black/40 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                त्वरित चाचणीसाठी डेमो खाती (Demo Fill):
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'admin@ganpati2026')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 font-bold text-amber-200 hover:bg-amber-500/25 transition-all text-[11px] cursor-pointer"
              >
                <span>👑 व्यवस्थापक (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('volunteer1', 'volunteer@2026')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 font-bold text-orange-200 hover:bg-orange-500/25 transition-all text-[11px] cursor-pointer"
              >
                <span>🙋‍♂️ स्वयंसेवक (Volunteer)</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200 flex items-start gap-2 animate-shake">
              <span className="text-base leading-none">⚠️</span>
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-200/90">
                वापरकर्ता नाव (Username / ID)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-400/70">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="उदा. admin किंवा volunteer1"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-orange-200/30 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-200/90">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-400/70">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="आपला सुरक्षित पासवर्ड टाका"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-orange-200/30 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-orange-300/60 hover:text-orange-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>पडताळणी सुरू आहे...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>प्रवेश करा (Sign In)</span>
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
              <span>मुख्य पृष्ठावर परत जा</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
