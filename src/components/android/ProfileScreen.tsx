import React from 'react';
import {
  User,
  ShieldCheck,
  Edit3,
  Globe,
  Share2,
  Lock,
  LogOut,
  Sparkles,
  Phone,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Info
} from 'lucide-react';
import { UserAccount, UserProfile, LanguageCode } from '../../types/database';
import { translations } from '../../utils/translations';
import { storageService } from '../../services/storageService';
import { OFFICIAL_REGISTRATION_URL } from '../../utils/matrimony';
import { PWAInstallButton } from '../PWAInstallButton';

interface ProfileScreenProps {
  currentUser: UserAccount | null;
  language: LanguageCode;
  onToggleLanguage: () => void;
  onOpenAuth: () => void;
  onOpenRegister: () => void;
  onOpenProfileEdit: () => void;
  onOpenAdmin: () => void;
  onOpenShare: () => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  language,
  onToggleLanguage,
  onOpenAuth,
  onOpenRegister,
  onOpenProfileEdit,
  onOpenAdmin,
  onOpenShare,
  onSignOut,
}) => {
  const isTelugu = language === 'te';
  const t = translations[language];

  const myProfile: UserProfile | undefined = currentUser
    ? storageService.getMyProfile(currentUser.id)
    : undefined;

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email.toLowerCase() === 'jafarmd0007@gmail.com';

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Account Card */}
      {currentUser ? (
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-2xl border-2 border-amber-400/30 shadow-md">
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-serif text-white truncate">
                  {currentUser.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700 shrink-0">
                  {currentUser.role === 'admin' ? 'Admin' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-mono truncate mt-0.5">
                {currentUser.email}
              </p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {currentUser.phone}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{isTelugu ? 'భద్రత & ప్రైవసీ: 100% రక్షితం' : 'UIDAI Verified & Protected'}</span>
            </div>
            <span className="text-[10px] bg-emerald-900 text-amber-300 px-2 py-0.5 rounded font-mono">
              Godavari Reg.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-3xl p-6 shadow-sm border border-emerald-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-2xl mx-auto mb-3 border border-emerald-700">
            🌙
          </div>
          <h2 className="text-lg font-bold font-serif text-white">
            {isTelugu ? 'నికాహ్ పక్కా ఖాతా' : 'Nikah Pakka Account'}
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-sm mx-auto leading-relaxed">
            {isTelugu
              ? 'మీ వ్యక్తిగత ప్రొఫైల్, ఆసక్తి వివరాలు మరియు కుటుంబ చాట్ వీక్షించడానికి లాగిన్ అవ్వండి.'
              : 'Sign in to access your matrimony biodata, monitor chaperone family chats, and track received proposals.'}
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-4 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>{isTelugu ? 'లాగిన్ లేదా ఉచిత నమోదు' : 'Sign In / Register Free'}</span>
          </button>
        </div>
      )}

      {/* Linked Candidate Biodata Card */}
      {currentUser && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 font-serif">
                {isTelugu ? 'నా వివాహ బయోడేటా' : 'My Matrimony Biodata'}
              </h2>
            </div>
            {myProfile ? (
              <button
                onClick={onOpenProfileEdit}
                className="text-xs text-emerald-800 font-bold flex items-center gap-1 hover:text-emerald-900 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isTelugu ? 'సవరించండి' : 'Edit'}</span>
              </button>
            ) : null}
          </div>

          {myProfile ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between bg-stone-50 p-3.5 rounded-xl border border-stone-200/70">
                <div>
                  <p className="font-bold text-stone-900 text-sm">{myProfile.candidateName}</p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {myProfile.age} yrs · {myProfile.education} · {myProfile.profession}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {myProfile.mandalCity}, {myProfile.district} · {myProfile.religion.sect}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {myProfile.approvalStatus === 'approved' ? (isTelugu ? 'ఆమోదించబడింది' : 'Approved') : (isTelugu ? 'పరిశీలనలో ఉంది' : 'Pending')}
                </span>
              </div>

              {/* Wali guardian info */}
              {myProfile.guardianWaliContact && (
                <div className="text-xs text-stone-600 flex items-center justify-between px-1">
                  <span>
                    <strong className="text-stone-800">{isTelugu ? 'వలీ / సంరక్షకుడు: ' : 'Wali: '}</strong>
                    {myProfile.guardianWaliContact.name} ({myProfile.guardianWaliContact.relationship})
                  </span>
                  <span className="font-mono text-stone-700">{myProfile.guardianWaliContact.phone}</span>
                </div>
              )}

              {/* Masked Aadhaar info */}
              <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>UIDAI Aadhaar Document</span>
                </span>
                <span className="font-mono text-[11px] font-semibold text-stone-700">XXXX-XXXX-7860</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-stone-500 mb-3">
                {isTelugu
                  ? 'మీరు ఇంకా వివాహ బయోడేటాను నమోదు చేయలేదు. ఇప్పుడే ఉచితంగా నమోదు చేయండి.'
                  : 'You have not registered a candidate profile yet. Register your biodata or help a family member.'}
              </p>
              <button
                onClick={onOpenRegister}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isTelugu ? 'బయోడేటా నమోదు చేయండి' : 'Create Candidate Biodata'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin verification button if admin */}
      {isAdmin && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-800" />
              <div>
                <h2 className="text-sm font-bold text-amber-950">
                  {isTelugu ? 'అడ్మినిస్ట్రేటర్ కన్సోల్' : 'Admin Verification Console'}
                </h2>
                <p className="text-[11px] text-amber-800">
                  {isTelugu ? 'కొత్త ప్రొఫైల్స్ మరియు ఆధార్ ధృవీకరణలను సమీక్షించండి' : 'Review pending profiles and Aadhaar IDs'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Open
            </button>
          </div>
        </div>
      )}

      {/* Quick Settings & App Tools */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs divide-y divide-stone-100 overflow-hidden text-xs">
        {/* Language switch */}
        <button
          onClick={() => {
            triggerHaptic();
            onToggleLanguage();
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-emerald-800" />
            <div>
              <p className="font-semibold text-stone-900">
                {isTelugu ? 'యాప్ భాష మార్చండి' : 'App Language'}
              </p>
              <p className="text-[11px] text-stone-500">
                {language === 'en' ? 'English (Tap to switch to తెలుగు)' : 'తెలుగు (English కోసం నొక్కండి)'}
              </p>
            </div>
          </div>
          <span className="font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200 text-[11px]">
            {language === 'en' ? 'తెలుగు' : 'English'}
          </span>
        </button>

        {/* PWA Install Button row */}
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-emerald-800" />
            <div>
              <p className="font-semibold text-stone-900">
                {isTelugu ? 'ఆండ్రాయిడ్ యాప్ ఇన్‌స్టాల్' : 'Android App Install'}
              </p>
              <p className="text-[11px] text-stone-500">
                {isTelugu ? 'హోమ్ స్క్రీన్‌కు నేరుగా జోడించండి' : 'Fast, offline-ready Android PWA'}
              </p>
            </div>
          </div>
          <PWAInstallButton language={language} />
        </div>

        {/* Share Campaign */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenShare();
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4 text-emerald-800" />
            <div>
              <p className="font-semibold text-stone-900">
                {isTelugu ? '3 కుటుంబాలతో పంచుకోండి' : 'Share with 3 Families'}
              </p>
              <p className="text-[11px] text-stone-500">
                {isTelugu ? 'నికాహ్ పక్కా ప్రచారంలో పాలుపంచుకోండి' : 'Help genuine Muslim seekers connect'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        {/* External Registration Portal */}
        <a
          href={OFFICIAL_REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left text-stone-700"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-stone-500" />
            <div>
              <p className="font-semibold text-stone-900">
                {isTelugu ? 'బాహ్య వెబ్ రిజిస్ట్రేషన్' : 'External Web Portal'}
              </p>
              <p className="text-[11px] text-stone-400 font-mono truncate max-w-[220px]">
                site-75bd7eafe06f4ebf8c6d057f860920dd.freebuff.page
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-stone-400" />
        </a>
      </div>

      {/* Sign Out Button */}
      {currentUser && (
        <button
          onClick={() => {
            triggerHaptic();
            onSignOut();
          }}
          className="w-full py-3 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-stone-200/90 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{isTelugu ? 'ఖాతా నుండి నిష్క్రమించండి (లాగౌట్)' : 'Sign Out of Account'}</span>
        </button>
      )}

      {/* Footer Info */}
      <div className="text-center pt-2 pb-6 text-stone-400 text-[11px] space-y-1">
        <p className="font-serif">🌙 నికాహ్ పక్కా · Yanam & Godavari Muslim Matrimony</p>
        <p>Built with Islamic principles · No brokers · Direct Wali contact</p>
      </div>
    </div>
  );
};
