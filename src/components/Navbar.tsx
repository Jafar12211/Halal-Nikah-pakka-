import { isAdminUser } from '../utils/admin';
import React, { useState } from 'react';
import {
  Heart,
  UserPlus,
  Share2,
  Globe,
  MessageCircle,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { LanguageCode, UserAccount } from '../types/database';
import { translations } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  language: LanguageCode;
  onToggleLanguage: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenProfileEdit: () => void;
  onOpenMessaging: () => void;
  onOpenAdmin: () => void;
  onSignOut: () => void;
  onOpenRegister: () => void;
  onOpenShare: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  currentUser,
  onOpenAuth,
  onOpenProfileEdit,
  onOpenMessaging,
  onOpenAdmin,
  onSignOut,
  onOpenRegister,
  onOpenShare,
  activeTab,
  setActiveTab,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const t = translations[language];
  const isAdmin = isAdminUser(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark (Single text element with tasteful icon) */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-emerald-900 group whitespace-nowrap shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-emerald-900 transition-colors">
              🌙
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-emerald-950 font-serif flex items-center gap-1.5">
                {t.brandTitle || 'NIKAH PAKKA'}
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600 inline" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium">
                {t.brandSubtitle || 'Yanam & Godavari Matrimony'}
              </span>
            </div>
          </a>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <button
              onClick={() => {
                setActiveTab('matches');
                const el = document.getElementById('matches-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'matches'
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              {t.navMatches || 'Browse Matches'}
            </button>
            <button
              onClick={() => {
                setActiveTab('family');
                const el = document.getElementById('mission-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'family'
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              {t.navWhyUs || 'Why Nikah Pakka'}
            </button>
            <button
              onClick={() => {
                setActiveTab('faqs');
                const el = document.getElementById('faqs-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'faqs'
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              {t.navFAQs || 'FAQs'}
            </button>
            <button
              onClick={() => {
                setActiveTab('share');
                const el = document.getElementById('share-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'share'
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              {t.shareBarakah || 'Our Request'}
            </button>
            <button
              onClick={() => {
                setActiveTab('duas');
                const el = document.getElementById('duas-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'duas'
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              {t.navDuas || "Du'as & Sunnah"}
            </button>
          </nav>

          {/* Zone 3: Interactive Actions & Account Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton language={language} />

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              title="Switch language between English, Telugu, and Urdu"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-800" />
              <span>{language === 'en' ? 'తెలుగు' : language === 'te' ? 'اردو' : 'English'}</span>
            </button>

            {/* In-app Family Chat */}
            <button
              onClick={onOpenMessaging}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 relative"
              aria-label="Open Family & Wali Chaperoned Chat"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">{t.navMessaging || 'Family Chat'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white"></span>
            </button>

            {/* Admin Dashboard (if admin or demo test) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
                title="Open Administrator Verification Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden md:inline">{t.navAdmin || 'Admin'}</span>
              </button>
            )}

            {/* User Session / Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300"
                >
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="max-w-[90px] truncate">{currentUser.name || 'Account'}</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 text-xs z-50">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenProfileEdit();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{t.btnMyAccount || 'My Profile & Preferences'}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-amber-900 font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t.navAdmin || 'Admin Dashboard'}</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-700"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.btnSignOut || 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              >
                <User className="w-3.5 h-3.5 text-emerald-800" />
                <span>{t.btnLogin || 'Sign In'}</span>
              </button>
            )}

            {/* Primary Action: Register */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
              aria-label="Register candidate"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.btnRegister || 'Register Free'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
