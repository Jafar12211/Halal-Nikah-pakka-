import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  Eye,
  Heart,
  Share2,
  Lock,
  Sparkles,
  MapPin,
  GraduationCap,
  Briefcase,
  UserCheck,
  MessageCircle,
  ShieldCheck,
  AlertOctagon,
  FileCheck
} from 'lucide-react';
import { UserProfile, LanguageCode, DistrictAP } from '../types/database';
import { FilterState } from '../types/matrimony';
import { generateWhatsAppShareMessage, getProfileDistanceKm } from '../utils/matrimony';
import { translations } from '../utils/translations';
import { GODAVARI_DISTRICTS } from '../services/storageService';
import { ProfilePhotoCarousel } from './ProfilePhotoCarousel';

interface ProfilesListProps {
  profiles: UserProfile[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProfile: (profile: UserProfile) => void;
  onExpressInterest: (profileId: string) => void;
  userInterests: Set<string>;
  language: LanguageCode;
  onStartChat: (profile: UserProfile) => void;
}

export const ProfilesList: React.FC<ProfilesListProps> = ({
  profiles,
  filters,
  setFilters,
  onSelectProfile,
  onExpressInterest,
  userInterests,
  language,
  onStartChat,
}) => {
  const t = translations[language];

  const handleShareProfile = (profile: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = generateWhatsAppShareMessage(profile.candidateName);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="matches-section" className="py-16 sm:py-20 bg-[#fdfbf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.directoryTitle || 'Approved Community Directory'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {language === 'te'
                ? 'యానాం & గోదావరి ముస్లిం సంబంధాలు'
                : 'Yanam & Godavari Muslim Matrimony Profiles'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {t.directorySub ||
                'Candidates from Yanam, Kakinada, Rajahmundry, Konaseema, Bhimavaram, and Eluru with family involvement.'}
            </p>
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex items-center p-1 bg-stone-200/80 rounded-xl shrink-0">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, gender: 'all' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.gender === 'all'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'te' ? 'అన్నీ' : 'All Candidates'} ({profiles.length})
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, gender: 'bride' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.gender === 'bride'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'te' ? 'వధువులు (Dulhan)' : 'Brides (Dulhan)'}
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, gender: 'groom' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.gender === 'groom'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {language === 'te' ? 'వరులు (Dulha)' : 'Grooms (Dulha)'}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-8 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Free Search */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={
                  language === 'te'
                    ? 'ఉద్యోగం, అర్హత, పట్టణం ద్వారా వెతకండి...'
                    : 'Search by profession, qualification, district...'
                }
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* District / City Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={filters.city}
                onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="All Cities">{t.filterAllDistricts || 'All Godavari & Yanam Districts'}</option>
                {GODAVARI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Sect / Maslak */}
            <div className="lg:col-span-2">
              <select
                value={filters.sect}
                onChange={(e) => setFilters((prev) => ({ ...prev, sect: e.target.value }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="All Sects">All Sects</option>
                <option value="Sunni Hanafi">Sunni Hanafi</option>
                <option value="Sunni Shafi'i">Sunni Shafi'i</option>
                <option value="Ahl-e-Hadith">Ahl-e-Hadith</option>
                <option value="Deen First">Deen First / Sunni</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters({
                    gender: 'all',
                    city: 'All Cities',
                    sect: 'All Sects',
                    maritalStatus: 'All',
                    minAge: 18,
                    maxAge: 60,
                    education: 'All',
                    searchQuery: '',
                    userCity: 'All Cities',
                    radiusKm: 0,
                  })
                }
                className="w-full py-2 px-3 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-center"
              >
                {language === 'te' ? 'ఫిల్టర్లు రీసెట్' : 'Reset Filters'}
              </button>
            </div>
          </div>

          {/* Kilometer Radius Filter Row */}
          <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700">📍 Search within radius from:</span>
              <select
                value={filters.userCity || 'All Cities'}
                onChange={(e) => setFilters((prev) => ({ ...prev, userCity: e.target.value }))}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="All Cities">Select My Location / District</option>
                {GODAVARI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700">Max Distance:</span>
              <select
                value={filters.radiusKm || 0}
                onChange={(e) => setFilters((prev) => ({ ...prev, radiusKm: Number(e.target.value) }))}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value={0}>Any Distance (No limit)</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
                <option value={100}>Within 100 km</option>
                <option value={200}>Within 200 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
            <UserCheck className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              {language === 'te' ? 'సంబంధాలు కనుగొనబడలేదు' : 'No matching profiles found'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mb-4">
              {language === 'te'
                ? 'దయచేసి మీ శోధన నిబంధనలను సవరించండి లేదా ఫిల్టర్లను రీసెట్ చేయండి.'
                : 'Try adjusting your search criteria or resetting filters to see all community candidates.'}
            </p>
            <button
              onClick={() =>
                setFilters({
                  gender: 'all',
                  city: 'All Cities',
                  sect: 'All Sects',
                  maritalStatus: 'All',
                  minAge: 18,
                  maxAge: 60,
                  education: 'All',
                  searchQuery: '',
                  userCity: 'All Cities',
                  radiusKm: 0,
                })
              }
              className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
            >
              {language === 'te' ? 'అన్ని సంబంధాలను చూపించు' : 'Show All Candidates'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const hasExpressedInterest = userInterests.has(profile.id);

              return (
                <div
                  key={profile.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile for ${profile.candidateName}`}
                  onClick={() => onSelectProfile(profile)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectProfile(profile);
                    }
                  }}
                  className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div>
                    {/* Top strip: District & Verification Info */}
                    <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-100 text-xs text-stone-500">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {profile.isVerified === true ? 'Admin Reviewed' : 'Review Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {filters.userCity && filters.userCity !== 'All Cities' && (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                            ~{getProfileDistanceKm(profile.district, filters.userCity)} km
                          </span>
                        )}
                        {profile.photos && profile.photos.length > 1 && (
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                            📷 {profile.photos.length}
                          </span>
                        )}
                        <span className="font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          📍 {profile.district}
                        </span>
                      </div>
                    </div>

                    {/* Candidate Identity Section */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start gap-4">
                        {/* Candidate photo carousel or monogram placeholder */}
                        <ProfilePhotoCarousel
                          photos={profile.photos}
                          alt={profile.candidateName}
                          initials={profile.avatarInitials}
                          backgroundColor={profile.avatarBgColor}
                          className="w-14 h-14 rounded-2xl border border-emerald-700/30 shadow-xs shrink-0"
                          blurred={profile.photoPrivacy !== 'visible'}
                        />

                        {/* Name & Basic Details */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors truncate">
                            {profile.candidateName}
                          </h3>

                          {/* Zero-pill unboxed metadata with typographic separators */}
                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                            <span>{profile.age} yrs</span>
                            <span aria-hidden="true">·</span>
                            <span>{profile.height}</span>
                            <span aria-hidden="true">·</span>
                            <span>{profile.maritalStatus}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-stone-600 mt-1.5">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="truncate">{profile.mandalCity || profile.district}</span>
                          </div>
                        </div>
                      </div>

                      {/* Education & Profession */}
                      <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-700">
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                          <span className="font-semibold text-stone-900 truncate">
                            {profile.profession} ({profile.annualIncomeRange})
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-stone-600">
                          <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span className="truncate">{profile.education}</span>
                        </div>
                      </div>

                      {/* Deen Highlights */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100">
                        <div className="flex items-center gap-2 text-[11px] text-stone-600">
                          <span className="font-semibold text-emerald-900">Deen:</span>
                          <span>{profile.religion?.salah || 'Not specified'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{profile.religion?.hijabOrBeard || 'Not specified'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{profile.religion?.sect || 'Sunni'}</span>
                        </div>
                      </div>

                      {/* Must-Haves & Deal-Breakers Highlight */}
                      {profile.mustHaves && profile.mustHaves.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px]">
                          <span className="text-emerald-900 font-semibold block mb-0.5">
                            ✓ Must-Have: {profile.mustHaves[0]}
                          </span>
                          {profile.dealBreakers && profile.dealBreakers.length > 0 && (
                            <span className="text-rose-800 font-medium block truncate">
                              ✕ Deal-Breaker: {profile.dealBreakers[0]}
                            </span>
                          )}
                        </div>
                      )}

                      {/* About Teaser */}
                      <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed italic">
                        "{profile.aboutCandidate}"
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProfile(profile);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.viewBiodata || 'View Biodata'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Family Chat Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartChat(profile);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                        title="Chat with Wali / Family"
                        aria-label="Start family chat"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="hidden sm:inline">Family Chat</span>
                      </button>

                      {/* Share WhatsApp */}
                      <button
                        onClick={(e) => handleShareProfile(profile, e)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors"
                        title="Share profile with family on WhatsApp"
                        aria-label={`Share profile of ${profile.candidateName} on WhatsApp`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Send Khabar / Express Interest */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpressInterest(profile.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          hasExpressedInterest
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-800 text-white hover:bg-emerald-900'
                        }`}
                        aria-label={`Express interest in profile of ${profile.candidateName}`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            hasExpressedInterest ? 'fill-rose-700 text-rose-700' : 'text-amber-300'
                          }`}
                        />
                        <span>{hasExpressedInterest ? 'Saved' : 'Save Profile'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
