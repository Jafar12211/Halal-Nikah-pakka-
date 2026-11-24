import type { LanguageCode } from '../types/database';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Key,
  Loader2,
} from 'lucide-react';

import {
  signInWithGoogleAccount,
  loginWithEmailPassword,
  registerWithEmailPassword,
  sendPasswordReset,
} from '../services/firestoreService';

import { auth } from '../services/firebase';
import { sendEmailVerification, signOut, updateProfile } from 'firebase/auth';
import type { UserAccount } from '../types/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  language: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  language,
}) => {
  const isTelugu = language === 'te';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const finishAuthentication = (user: UserAccount) => {
    onAuthSuccess(user);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setToast(null);

      const user = await signInWithGoogleAccount();
      finishAuthentication(user);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Google sign-in failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError(
        isTelugu
          ? 'ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.'
          : 'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setToast(null);

      const user = await loginWithEmailPassword(email, password);
      finishAuthentication(user);
    } catch (err: any) {
      const code = err?.code;

      if (code === 'auth/email-not-verified') {
        setError(err?.message || 'Check your email for a verification link, then sign in again.');
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setError('Incorrect email or password. If you forgot it, use “Forgot password?” to reset it.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err?.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError(
        isTelugu
          ? 'దయచేసి అన్ని వివరాలను నమోదు చేయండి.'
          : 'Please complete all required fields.'
      );
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setToast(null);

      const user = await registerWithEmailPassword(email, password);

      if (!auth.currentUser) {
        throw new Error('Account was created, but the sign-in session is unavailable. Please sign in.');
      }

      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
      });
      await sendEmailVerification(auth.currentUser);
      await signOut(auth);

      setMode('login');
      setPassword('');
      setToast('Account created. A verification link has been sent to your email. Verify your email, then sign in.');
      setEmail(email.trim());
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        // Move directly to the sign-in form and keep the email the user entered.
        setEmail(email.trim());
        setPassword('');
        setMode('login');
        setError('This email already has an account. Sign in with its existing password, or choose “Forgot password?” if you need to reset it.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        const code = typeof err?.code === 'string' ? ` (${err.code})` : '';
        const message = typeof err?.message === 'string' ? err.message : 'Please try again.';
        setError(`Registration failed${code}: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendPasswordReset(email);

      setToast(
        'Password reset instructions have been sent if this email is registered.'
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode: 'login' | 'register' | 'forgot') => {
    setMode(nextMode);
    setError(null);
    setToast(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">

        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              {isTelugu
                ? 'నికాహ్ పక్కా లాగిన్ / రిజిస్ట్రేషన్'
                : 'Nikah Pakka Sign In & Register'}
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h3>

            <p className="text-xs text-stone-300 mt-0.5">
              {isTelugu
                ? 'యానాం & గోదావరి ముస్లిం కుటుంబాల ప్రత్యేక వేదిక'
                : 'Dedicated to Godavari & Yanam Muslim Families'}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">

          {/* Tabs */}
          {mode !== 'forgot' && (
            <div className="flex border-b border-stone-200 mb-6 text-xs font-semibold">
              <button
                onClick={() => changeMode('login')}
                className={`flex-1 py-2.5 border-b-2 ${
                  mode === 'login'
                    ? 'border-emerald-800 text-emerald-900'
                    : 'border-transparent text-stone-500'
                }`}
              >
                {isTelugu ? 'లాగిన్' : 'Sign In'}
              </button>

              <button
                onClick={() => changeMode('register')}
                className={`flex-1 py-2.5 border-b-2 ${
                  mode === 'register'
                    ? 'border-emerald-800 text-emerald-900'
                    : 'border-transparent text-stone-500'
                }`}
              >
                {isTelugu ? 'కొత్త ఖాతా' : 'Create Account'}
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4">
              {error}
            </div>
          )}

          {toast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-4">
              {toast}
            </div>
          )}

          {/* Google Sign-In */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <span className="font-bold text-base text-blue-600">G</span>
                {isTelugu ? 'Google ద్వారా కొనసాగించండి' : 'Continue with Google'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-stone-400">
                    {isTelugu ? 'లేదా ఈమెయిల్ ద్వారా' : 'or with email'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Password
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => changeMode('forgot')}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Sign In to Account
              </button>
            </form>
          )}

          {/* Registration */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name
                </label>

                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Create Password
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <p className="text-stone-500 leading-relaxed">
                Your account will be created using Firebase Authentication.
                You can add your mobile number and profile details after signing in.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Create Account
              </button>
            </form>
          )}

          {/* Password Reset */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div className="text-center mb-4">
                <Key className="w-8 h-8 mx-auto text-emerald-800 mb-2" />
                <h4 className="font-bold text-sm text-stone-900">
                  Reset Your Password
                </h4>
                <p className="text-stone-500 mt-1">
                  Enter your registered email address.
                </p>
              </div>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your registered email"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </button>

              <button
                type="button"
                onClick={() => changeMode('login')}
                className="w-full text-emerald-800 font-semibold py-2"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Privacy footer */}
          <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isTelugu
                ? 'మీ ఖాతా వివరాలు భద్రంగా ఉంచబడతాయి.'
                : 'Your account authentication is handled securely by Firebase.'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
