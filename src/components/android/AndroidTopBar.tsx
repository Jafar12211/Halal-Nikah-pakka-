import React from 'react';
import { Menu, Globe, ShieldCheck, Heart, ArrowLeft, Download, Bell } from 'lucide-react';
import { LanguageCode, UserAccount } from '../../types/database';
import { translations } from '../../utils/translations';
import { PWAInstallButton } from '../PWAInstallButton';
import { isAdminUser } from '../../utils/admin';

interface AndroidTopBarProps {
  language: LanguageCode;
  onToggleLanguage: () => void;
  currentUser: UserAccount | null;
  onOpenDrawer: () => void;
  onOpenAdmin: () => void;
  activeScreen: string;
  onNavigateHome: () => void;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  language,
  onToggleLanguage,
  currentUser,
  onOpenDrawer,
  onOpenAdmin,
  activeScreen,
  onNavigateHome,
}) => {
  const t = translations[language];
  const isTelugu = language === 'te';
  const isAdmin = isAdminUser(currentUser);

  const isSubScreen = activeScreen !== 'home';

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-md border-b border-emerald-900/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14">
        {/* Left: Hamburger Drawer or Back arrow */}
        <div className="flex items-center gap-2">
          {isSubScreen ? (
            <button
              onClick={() => {
                triggerHaptic();
                onNavigateHome();
              }}
              className="p-2 -ml-1 text-emerald-100 hover:text-white active:bg-emerald-900/60 rounded-full transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic();
                onOpenDrawer();
              }}
              className="p-2 -ml-1 text-emerald-100 hover:text-white active:bg-emerald-900/60 rounded-full transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* App Wordmark */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onNavigateHome();
            }}
            className="flex items-center gap-2 cursor-pointer select-none text-left"
            aria-label="Go to Nikah Pakka home"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs border border-emerald-700">
              🌙
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white font-serif flex items-center gap-1 leading-none">
                {t.brandTitle || 'NIKAH PAKKA'}
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500 inline" />
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-medium leading-tight mt-0.5">
                {isTelugu ? 'యానాం & గోదావరి' : 'Yanam & Godavari'}
              </span>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA In-App Install Button */}
          <PWAInstallButton language={language} />

          {/* Language Toggle Chip */}
          <button
            onClick={() => {
              triggerHaptic();
              onToggleLanguage();
            }}
            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-900/90 hover:bg-emerald-800 active:bg-emerald-700 text-emerald-100 border border-emerald-700/80 rounded-full transition-colors flex items-center gap-1"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-amber-300" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Admin badge button */}
          {isAdmin && (
          <button
            onClick={() => {
              triggerHaptic();
              onOpenAdmin();
            }}
            className="px-2.5 py-1 text-[11px] font-bold bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 rounded-full transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            title="Administrator Photo & ID Verification Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-950" />
            <span>Admin</span>
          </button>
          )}
        </div>
      </div>
    </header>
  );
};
