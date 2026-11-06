import React from 'react';
import {
  X,
  User,
  Users,
  MessageSquare,
  Heart,
  ShieldCheck,
  HelpCircle,
  Share2,
  BookOpen,
  Smartphone,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Lock
} from 'lucide-react';
import { UserAccount, LanguageCode } from '../../types/database';
import { translations } from '../../utils/translations';
import { OFFICIAL_REGISTRATION_URL } from '../../utils/matrimony';

interface AndroidDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  language: LanguageCode;
  onNavigateTab: (tab: 'home' | 'matches' | 'messages' | 'interests' | 'profile') => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenRegister: () => void;
  onOpenShare: () => void;
  onSignOut: () => void;
}

export const AndroidDrawer: React.FC<AndroidDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onNavigateTab,
  onOpenAuth,
  onOpenAdmin,
  onOpenRegister,
  onOpenShare,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const isTelugu = language === 'te';
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email.toLowerCase() === 'jafarmd0007@gmail.com';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Scrim overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header with Islamic Pattern background */}
        <div className="bg-emerald-950 text-white p-5 pt-7 pb-6 relative overflow-hidden border-b border-emerald-900">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-white rounded-full transition-colors"
            aria-label="Close menu drawer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Profile or Guest info */}
          {currentUser ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg border border-emerald-700 shadow-xs">
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div>
                <p className="font-serif font-bold text-base text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-emerald-300/90 truncate font-mono">
                  {currentUser.email}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{isTelugu ? 'ధృవీకరించబడిన ఖాతా' : 'Verified Member'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg border border-emerald-700">
                🌙
              </div>
              <div>
                <p className="font-serif font-bold text-base text-white">
                  {isTelugu ? 'నికాహ్ పక్కా' : 'Nikah Pakka'}
                </p>
                <p className="text-xs text-emerald-300">
                  {isTelugu ? 'యానాం & గోదావరి ముస్లిం మ్యాట్రిమోనీ' : 'Yanam & Godavari Matrimony'}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                {isTelugu ? 'లాగిన్ / రిజిస్ట్రేషన్' : 'Sign In / Register'}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 text-xs divide-y divide-stone-100">
          {/* Main Navigation */}
          <div className="py-2">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('matches');
              }}
              className="w-full px-5 py-3 text-left hover:bg-emerald-50/60 active:bg-emerald-100 flex items-center justify-between text-stone-800 font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>{isTelugu ? 'సంబంధాలు వెతకండి' : 'Browse Matches'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('messages');
              }}
              className="w-full px-5 py-3 text-left hover:bg-emerald-50/60 active:bg-emerald-100 flex items-center justify-between text-stone-800 font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <span>{isTelugu ? 'కుటుంబ సంభాషణ (చాట్)' : 'Family Chat'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('interests');
              }}
              className="w-full px-5 py-3 text-left hover:bg-emerald-50/60 active:bg-emerald-100 flex items-center justify-between text-stone-800 font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>{isTelugu ? 'ఆసక్తి గల సంబంధాలు (ఖబర్)' : 'My Interests & Khabar'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="w-full px-5 py-3 text-left hover:bg-emerald-50/60 active:bg-emerald-100 flex items-center justify-between text-emerald-900 font-bold transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isTelugu ? 'ఉచితంగా ప్రొఫైల్ నమోదు' : 'Register New Candidate'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* Admin Area */}
          {isAdmin && (
            <div className="py-2 bg-amber-50/50">
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full px-5 py-3 text-left hover:bg-amber-100/70 flex items-center justify-between text-amber-950 font-bold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-800" />
                  <span>{isTelugu ? 'అడ్మిన్ వెరిఫికేషన్ కన్సోల్' : 'Admin Verification Console'}</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                  Review
                </span>
              </button>
            </div>
          )}

          {/* Secondary Community Sections */}
          <div className="py-2">
            <button
              onClick={() => {
                onClose();
                const el = document.getElementById('mission-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full px-5 py-2.5 text-left hover:bg-stone-50 flex items-center gap-3 text-stone-600"
            >
              <ShieldCheck className="w-4 h-4 text-stone-400" />
              <span>{isTelugu ? 'మా లక్ష్యం & సేవ' : 'Why Nikah Pakka'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                const el = document.getElementById('faqs-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full px-5 py-2.5 text-left hover:bg-stone-50 flex items-center gap-3 text-stone-600"
            >
              <HelpCircle className="w-4 h-4 text-stone-400" />
              <span>{isTelugu ? 'సందేహాలు & సమాధానాలు' : 'FAQs & Privacy'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                const el = document.getElementById('duas-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full px-5 py-2.5 text-left hover:bg-stone-50 flex items-center gap-3 text-stone-600"
            >
              <BookOpen className="w-4 h-4 text-stone-400" />
              <span>{isTelugu ? 'వివాహ దువాలు & సున్నత్' : "Marriage Du'as & Sunnah"}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenShare();
              }}
              className="w-full px-5 py-2.5 text-left hover:bg-stone-50 flex items-center gap-3 text-emerald-800 font-medium"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>{isTelugu ? 'కుటుంబాలకు షేర్ చేయండి' : 'Share with 3 Families'}</span>
            </button>
          </div>

          {/* External portal link */}
          <div className="py-2 px-5">
            <a
              href={OFFICIAL_REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-stone-500 hover:text-emerald-900 flex items-center gap-1.5 underline"
            >
              <span>{isTelugu ? 'బాహ్య రిజిస్ట్రేషన్ పోర్టల్' : 'External Web Portal'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs">
          {currentUser ? (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full py-2 bg-stone-200 hover:bg-rose-100 text-stone-700 hover:text-rose-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{isTelugu ? 'లాగౌట్' : 'Sign Out'}</span>
            </button>
          ) : (
            <div className="text-center text-[11px] text-stone-400">
              Nikah Pakka Android PWA v1.2.0 · Godavari Edition
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
