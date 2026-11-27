import React from 'react';
import { Menu, Globe, ArrowLeft } from 'lucide-react';
import { LanguageCode, UserAccount } from '../../types/database';
import { translations } from '../../utils/translations';
import { PWAInstallButton } from '../PWAInstallButton';

interface AndroidTopBarProps {
  language: LanguageCode;
  onToggleLanguage: () => void;
  currentUser: UserAccount | null;
  onOpenDrawer: () => void;
  activeScreen: string;
  onNavigateHome: () => void;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  language,
  onToggleLanguage,
  currentUser,
  onOpenDrawer,
  activeScreen,
  onNavigateHome,
}) => {
  const t = translations[language];
  const isTelugu = language === 'te';

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
            <img src="/brand-mark.svg" alt="" className="w-9 h-9 shrink-0 drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-[15px] font-extrabold tracking-wide text-white font-serif leading-none">
                {t.brandTitle || 'NIKAH PAKKA'}
              </span>
              <span className="text-[8px] uppercase tracking-[0.13em] text-amber-300 font-semibold leading-tight mt-1">
                Where Faith Meets Forever
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
            <span>{language === 'en' ? 'తెలుగు' : language === 'te' ? 'اردو' : 'English'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
