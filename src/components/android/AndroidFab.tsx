import React from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types/database';

interface AndroidFabProps {
  onClick: () => void;
  language: LanguageCode;
}

export const AndroidFab: React.FC<AndroidFabProps> = ({ onClick, language }) => {
  const isTelugu = language === 'te';

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(12);
    }
  };

  return (
    <aside aria-label="Quick Actions" className="fixed bottom-20 right-4 z-30">
      <button
        onClick={() => {
          triggerHaptic();
          onClick();
        }}
        className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-amber-300 font-bold text-xs rounded-2xl shadow-[0_8px_20px_rgba(6,78,59,0.35)] hover:shadow-xl active:scale-95 transition-all duration-200 border border-emerald-700/60"
        aria-label={isTelugu ? 'కొత్త సంబంధం నమోదు చేయండి' : 'Register New Matrimony Candidate'}
      >
        <span className="relative flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-amber-300 group-hover:rotate-6 transition-transform" />
          <Sparkles className="w-2.5 h-2.5 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
        </span>
        <span className="font-semibold tracking-wide">
          {isTelugu ? 'నమోదు' : 'Register'}
        </span>
      </button>
    </aside>
  );
};
