import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
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
import { signInWithGoogleAccount } from '../services/firestoreService';
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

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const user = await signInWithGoogleAccount();
      if (!user.emailVerified) throw new Error('Please verify your Google account email before continuing.');
      storageService.setCurrentUser(user);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    }
  };

  const toUserAccount = (firebaseUser: import('firebase/auth').User): UserAccount => {
    const emailAddress = firebaseUser.email || '';
    return {
      id: firebaseUser.uid,
      email: emailAddress,
      phone: firebaseUser.phoneNumber || phone,
      name: firebaseUser.displayName || emailAddress.split('@')[0],
      role: emailAddress.toLowerCase() === 'jafarmd0007@gmail.com' ? 'admin' : 'member',
      emailVerified: firebaseUser.emailVerified,
      phoneVerified: Boolean(firebaseUser.phoneNumber),
      authProvider: 'email',
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(isTelugu ? 'దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your email and password.');
      return;
    }
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(auth);
        setError(isTelugu
          ? 'మీ ఈమెయిల్ ఇంకా ధృవీకరించబడలేదు. మీ ఇన్‌బాక్స్‌లోని లింక్‌ను తెరిచి మళ్లీ లాగిన్ అవ్వండి.'
          : 'Please verify your email using the link sent to your inbox, then sign in again. A fresh verification email has been sent.');
        return;
      }
      const user = toUserAccount(credential.user);
      storageService.setCurrentUser(user);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      const code = err?.code;
      setError(code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
        ? (isTelugu ? 'ఈమెయిల్ లేదా పాస్‌వర్డ్ తప్పు.' : 'Incorrect email or password.')
        : err?.message || 'Sign in failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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
    if (password.length < 6) {
      setError(isTelugu ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'Password must be at least 6 characters.');
      return;
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setPassword('');
      setMode('login');
      setToast(isTelugu
        ? 'ఖాతా సృష్టించబడింది. మీ ఈమెయిల్‌లోని ధృవీకరణ లింక్‌ను తెరిచి, ఆపై లాగిన్ అవ్వండి.'
        : 'Account created. Open the verification link sent to your email, then sign in. Your account will not be signed in until verified.');
    } catch (err: any) {
      const code = err?.code;
      setError(code === 'auth/email-already-in-use'
        ? (isTelugu ? 'ఈ ఈమెయిల్‌తో ఇప్పటికే ఖాతా ఉంది. లాగిన్ అవ్వండి.' : 'An account already exists for this email. Please sign in.')
        : err?.message || 'Registration failed. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    if (!email.trim()) {
      setError(isTelugu ? 'ముందుగా మీ ఈమెయిల్ నమోదు చేయండి.' : 'Enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setToast(isTelugu ? 'పాస్‌వర్డ్ రీసెట్ లింక్ పంపబడింది.' : 'Password reset link sent. Check your email.');
    } catch (err: any) {
      setError(err?.message || 'Unable to send password reset email.');
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
              <button type="button" onClick={handlePasswordReset} className="w-full text-emerald-800 hover:underline text-xs font-semibold">
                {isTelugu ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot password? Send reset link'}
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
                  {isTelugu ? 'మొబైల్ నంబర్' : 'Mobile Number'}
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
                <span>{isTelugu ? 'ఈమెయిల్ ద్వారా ఖాతా ధృవీకరించండి' : 'Create Account & Verify Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {mode === 'otp' && (
            <div className="space-y-4 text-xs text-center">
              <p className="text-stone-700">Email verification is now used instead of demo SMS codes. Please sign in after verifying your email.</p>
              <button type="button" onClick={() => setMode('login')} className="w-full py-2 bg-emerald-800 text-white rounded-lg">Back to Sign In</button>
            </div>
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
