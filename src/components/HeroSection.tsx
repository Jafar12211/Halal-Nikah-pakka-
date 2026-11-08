import React from 'react';
import { Search, Heart, ShieldCheck, Users, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { FilterState } from '../types/matrimony';
import { LanguageCode } from '../types/database';
import { translations } from '../utils/translations';
import { GODAVARI_DISTRICTS } from '../services/storageService';

interface HeroSectionProps {
  language: LanguageCode;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenRegister: () => void;
  onOpenShare: () => void;
  onSearchClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  filters,
  setFilters,
  onOpenRegister,
  onOpenShare,
  onSearchClick,
}) => {
  const t = translations[language];

  return (
    <section id="home" className="relative overflow-hidden bg-stone-900 text-white">
      {/* Background Image with carefully calibrated contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/nikah_hero_celebration_1793883128650.jpg"
          alt="Dignified Muslim wedding celebration in Godavari"
          className="w-full h-full object-cover object-center brightness-[0.42] scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/65 to-stone-950/45" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-3xl">
          {/* Spiritual Kicker without static pill enclosure */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300 mb-4">
            <span>{t.bismillah || 'Bismillahir Rahmanir Raheem'}</span>
            <span aria-hidden="true">·</span>
            <span>{t.heroTag || 'Godavari & Yanam Muslim Matrimony'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.18] mb-6 text-balance">
            {language === 'te' ? (
              <>
                యానాం మరియు గోదావరి ముస్లింల <br />
                <span className="text-amber-300">పవిత్ర వివాహ బంధాల వేదిక</span>
              </>
            ) : (
              <>
                A Blessed Beginning for <br />
                <span className="text-amber-300">Godavari & Yanam Muslim Matrimony</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-stone-200 leading-relaxed mb-8 max-w-2xl font-light">
            {t.heroSub ||
              'Connecting genuine Muslim families across Yanam, Kakinada, Rajahmundry, Konaseema, Bhimavaram, and Eluru with zero subscription traps and complete family dignity.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span>{t.btnStartFree || 'Register Candidate Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenShare}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>{t.shareBarakah || 'Share Barakah'}</span>
            </button>
          </div>

          {/* Core Pillars unboxed metadata with dot separators */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-stone-300 border-t border-white/15 pt-6">
            <span className="flex items-center gap-1.5 text-amber-200 font-medium">
              <Sparkles className="w-4 h-4 text-amber-300" />
              {language === 'te' ? 'ఉచిత నమోదు' : 'Free Registration'}
            </span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="flex items-center gap-1.5 text-emerald-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              {language === 'te' ? 'మాన్యువల్ ఐడీ వెరిఫికేషన్' : 'Manual ID Verification'}
            </span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="flex items-center gap-1.5 text-amber-200 font-medium">
              <Users className="w-4 h-4 text-amber-300" />
              {language === 'te' ? 'వలీ / కుటుంబ పర్యవేక్షణ' : 'Family involvement encouraged'}
            </span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-stone-300 font-medium">
              {language === 'te' ? 'ఖరీదైన ఫీజులు లేవు' : 'Zero Expensive Subscriptions'}
            </span>
          </div>
        </div>

        {/* Quick Search Card */}
        <div className="mt-12 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-stone-200/80 text-stone-900">
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-800 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              {language === 'te' ? 'గోదావరి & యానాం సంబంధాలు వెతకండి' : 'Browse Approved Profiles Across Godavari & Yanam'}
            </span>
            <span className="text-stone-500 font-normal normal-case hidden sm:inline">
              {language === 'te' ? '100% నమ్మకమైన సంబంధాలు' : 'Review profile details and confirm them with the family'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
            {/* Looking for */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.filterLookingFor || 'Looking For'}
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">{t.filterAll || 'All Candidates'}</option>
                <option value="bride">{t.filterBrides || 'Muslim Bride (Dulhan)'}</option>
                <option value="groom">{t.filterGrooms || 'Muslim Groom (Dulha)'}</option>
              </select>
            </div>

            {/* District / City */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.filterDistrict || 'District / Region'}
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="All Cities">{t.filterAllDistricts || 'All Godavari & Yanam Districts'}</option>
                {GODAVARI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Slider */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.filterAge || 'Max Age'}: {filters.maxAge} yrs
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={filters.maxAge}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: Number(e.target.value) }))}
                  className="w-full accent-emerald-700 cursor-pointer"
                  aria-label="Filter maximum age"
                />
              </div>
            </div>

            {/* Search Button */}
            <div>
              <button
                onClick={onSearchClick}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs hover:shadow transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{t.btnSearchMatches || 'Search Matches'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
