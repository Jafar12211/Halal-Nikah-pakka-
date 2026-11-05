import React from 'react';
import { Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { OFFICIAL_REGISTRATION_URL } from '../utils/matrimony';

interface FooterProps {
  onOpenRegister: () => void;
  onOpenShare: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRegister, onOpenShare }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-serif text-white flex items-center gap-1.5">
                NIKAH PAKKA
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 inline" />
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Your Community. Your Connection. Your Nikah. Built to help Muslim brothers and sisters find their life partners with dignity, affordability, and family involvement.
            </p>
            <p className="text-xs text-amber-300 font-medium">
              May Allah bless every genuine search with a beautiful outcome. Ameen! 🤲
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Community Links</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <a href="#home" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#matches-section" className="hover:text-white transition-colors">Browse Verified Matches</a>
              </li>
              <li>
                <a href="#mission-section" className="hover:text-white transition-colors">Why Nikah Pakka</a>
              </li>
              <li>
                <a href="#duas-section" className="hover:text-white transition-colors">Du'as for Marriage</a>
              </li>
            </ul>
          </div>

          {/* Quick Actions & Official Link */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Direct Registration</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Register yourself or help your unmarried sibling/relative register with their consent.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Register Candidate
              </button>
              <button
                onClick={onOpenShare}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors"
              >
                Share with Friends
              </button>
            </div>
            <a
              href={OFFICIAL_REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 mt-2 underline"
            >
              <span>Visit External Profile Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quiet Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Nikah Pakka. Community-driven Muslim Matrimony.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Honest intentions · Respect for modesty · No exploitative fees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
