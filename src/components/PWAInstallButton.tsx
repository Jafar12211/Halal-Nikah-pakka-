import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  language: 'en' | 'te';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // In web preview or development where beforeinstallprompt may not fire natively
      setShowIOSGuide(true);
    }
  };

  const isTelugu = language === 'te';

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-amber-300 hover:bg-amber-200 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
        title="Install Android PWA App"
        aria-label="Install Nikah Pakka mobile application"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-950" />
        <span>{isTelugu ? 'యాప్ ఇన్‌స్టాల్' : 'Install App'}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-800" />
                {isTelugu ? 'యాప్ ఇన్‌స్టాలేషన్ గైడ్' : 'Install on Android / iPhone'}
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="font-semibold text-emerald-900 mb-1">
                  {isTelugu ? 'యాండ్రాయిడ్ (Chrome బ్రౌజర్):' : 'Android (Chrome):'}
                </p>
                <p>
                  {isTelugu
                    ? '1. బ్రౌజర్ మెనూ (మూడు చుక్కలు ⋮) నొక్కండి.\n2. "Install App" లేదా "Add to Home screen" ఎంచుకోండి.'
                    : '1. Tap the three dots (⋮) menu in Chrome.\n2. Tap "Install App" or "Add to Home screen".'}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="font-semibold text-amber-900 mb-1">
                  {isTelugu ? 'ఐఫోన్ (Safari బ్రౌజర్):' : 'iPhone / iPad (Safari):'}
                </p>
                <p>
                  {isTelugu
                    ? '1. సఫారి టూల్‌బార్ లో Share ఐకాన్ నొక్కండి.\n2. "Add to Home Screen" ఎంచుకోండి.'
                    : '1. Tap the Share button in Safari toolbar.\n2. Scroll and tap "Add to Home Screen".'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                {isTelugu ? 'అర్థమైంది' : 'Got It'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
