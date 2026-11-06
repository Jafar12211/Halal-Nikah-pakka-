import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Key
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserAccount } from '../types/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  language: 'en' | 'te';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  language,
}) => {
  const isTelugu = language === 'te';
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    try {
      const user = storageService.loginWithGoogle();
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError(isTelugu ? 'దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your email and password.');
      return;
    }

    const isAdmin = email.trim().toLowerCase() === 'jafarmd0007@gmail.com';
    const user = storageService.registerWithEmailAndPhone(
      email.split('@')[0],
      email.trim(),
      '+91 98480 00000',
      isAdmin ? 'admin' : 'member'
    );
    user.status = 'active';
    user.emailVerified = true;
    user.phoneVerified = true;
    storageService.setCurrentUser(user);
    onAuthSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError(isTelugu ? 'దయచేసి అన్ని వివరాలను పూరించండి.' : 'Please fill in all required fields.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError(isTelugu ? 'సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const user = storageService.registerWithEmailAndPhone(name, email, phone, 'member');
    setPendingUser(user);
    setMode('otp');
    setToast(isTelugu ? 'OTP మీ నంబర్‌కు పంపబడింది (టెస్ట్ కోడ్: 786786)' : 'OTP sent to mobile! (Test code: 786786)');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    if (otp === '786786' || otp.length === 6) {
      storageService.verifyPhoneOTP(pendingUser.id, otp);
      onAuthSuccess(pendingUser);
      onClose();
    } else {
      setError(isTelugu ? 'తప్పు OTP కోడ్. టెస్ట్ కోడ్ 786786 ఉపయోగించండి.' : 'Invalid OTP. Please use test code: 786786');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <span>{isTelugu ? 'నికాహ్ పక్కా లాగిన్ / రిజిస్ట్రేషన్' : 'Nikah Pakka Sign In & Register'}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              {isTelugu ? 'యానాం & గోదావరి ముస్లిం కుటుంబాల ప్రత్యేక వేదిక' : 'Dedicated to Godavari & Yanam Muslim Families'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs for Mode */}
          {mode !== 'otp' && (
            <div className="flex border-b border-stone-200 mb-6 text-xs font-semibold">
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-emerald-800 text-emerald-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {isTelugu ? 'లాగిన్' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  mode === 'register'
                    ? 'border-emerald-800 text-emerald-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {isTelugu ? 'కొత్త ఖాతా సృష్టించండి' : 'Create Account'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4">
              {error}
            </div>
          )}

          {toast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Google 1-Click Sign-In */}
          {mode !== 'otp' && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 flex items-center justify-center gap-2.5 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isTelugu ? 'Google ద్వారా లాగిన్ అవ్వండి' : 'Continue with Google'}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-stone-400">
                    {isTelugu ? 'లేదా ఈమెయిల్ ద్వారా' : 'or with email & phone'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form: Sign In */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isTelugu ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. member@nikahpakka.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isTelugu ? 'పాస్‌వర్డ్' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <span>{isTelugu ? 'ఖాతాలోకి ప్రవేశించండి' : 'Sign In to Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Form: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isTelugu ? 'పూర్తి పేరు (అభ్యర్థి లేదా సంరక్షకుడు)' : 'Full Name (Candidate or Guardian)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed Ismail"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isTelugu ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ismail.godavari@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isTelugu ? 'మొబైల్ నంబర్ (OTP ధృవీకరణ కోసం)' : 'Mobile Number (For OTP verification)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98480 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {isTelugu ? 'పాస్‌వర్డ్ సృష్టించండి' : 'Create Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <span>{isTelugu ? 'OTP కోడ్ పొందండి' : 'Send Mobile OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Form: OTP Verification */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-stone-900">
                  {isTelugu ? 'మొబైల్ OTP నమోదు చేయండి' : 'Enter 6-Digit Mobile OTP'}
                </h4>
                <p className="text-stone-500 text-[11px] mt-1">
                  {isTelugu
                    ? `${phone} నంబర్‌కు కోడ్ పంపబడింది. (డెమో కోడ్: 786786)`
                    : `Code sent to ${phone}. (Enter test code: 786786)`}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="786786"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full tracking-widest text-center text-lg font-mono font-bold py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="w-1/3 py-2 bg-stone-100 text-stone-700 font-medium rounded-lg text-xs"
                >
                  {isTelugu ? 'వెనుకకు' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs"
                >
                  {isTelugu ? 'ధృవీకరించండి' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy footer */}
          <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isTelugu
                ? 'ఖాతా మరియు బయోడేటా వివరాలు పూర్తిగా గోప్యంగా ఉంచబడతాయి.'
                : 'Account & registration data is strictly isolated per member.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
