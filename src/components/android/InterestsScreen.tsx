import React from 'react';
import { Heart, Users, MessageSquare, Phone, ChevronRight, ShieldCheck, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { UserProfile, LanguageCode } from '../../types/database';

interface InterestsScreenProps {
  language: LanguageCode;
  allProfiles: UserProfile[];
  userInterests: Set<string>;
  onSelectProfile: (profile: UserProfile) => void;
  onRemoveInterest: (profileId: string) => void;
  onStartChat: (profile: UserProfile) => void;
  onNavigateToMatches: () => void;
}

export const InterestsScreen: React.FC<InterestsScreenProps> = ({
  language,
  allProfiles,
  userInterests,
  onSelectProfile,
  onRemoveInterest,
  onStartChat,
  onNavigateToMatches,
}) => {
  const isTelugu = language === 'te';

  // Find profiles user is interested in
  const interestedProfiles = allProfiles.filter((p) => userInterests.has(p.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm mb-5 border border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-300 flex items-center justify-center border border-rose-500/40">
            <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif text-white">
              {isTelugu ? 'ఆసక్తి గల సంబంధాలు (ఖబర్)' : 'My Shortlist & Proposals'}
            </h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              {isTelugu
                ? `${interestedProfiles.length} ప్రొఫైల్స్ షార్ట్‌లిస్ట్ చేయబడ్డాయి · కుటుంబ పెద్దలతో సంప్రదించండి`
                : `${interestedProfiles.length} candidate(s) saved on this device only · Not sent to any family`}
            </p>
          </div>
        </div>
      </div>

      {interestedProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/90 shadow-xs">
          <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Heart className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="text-base font-bold text-stone-800 font-serif">
            {isTelugu ? 'ఇంకా ఎటువంటి ఆసక్తి రికార్డు కాలేదు' : 'No Shortlisted Profiles Yet'}
          </h2>
          <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {isTelugu
              ? 'సంబంధాల జాబితా నుండి నచ్చిన ప్రొఫైల్‌పై గుండె గుర్తుపై క్లిక్ చేసి మీ ఆసక్తిని (ఖబర్) పంపండి.'
              : 'Browse approved profiles from Yanam, Kakinada & Godavari districts. Tap the heart to save a profile to this device; this does not notify the other family.'}
          </p>
          <button
            onClick={onNavigateToMatches}
            className="mt-5 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{isTelugu ? 'సంబంధాలు చూడండి' : 'Browse Matches'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {interestedProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-4 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div
                  className={`w-14 h-14 rounded-2xl ${
                    profile.avatarBgColor || 'bg-emerald-800'
                  } text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs border border-stone-200`}
                >
                  {profile.avatarInitials || profile.candidateName.substring(0, 2).toUpperCase()}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-stone-900 truncate font-serif">
                      {profile.candidateName}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {profile.gender === 'bride' ? (isTelugu ? 'వధువు' : 'Bride') : (isTelugu ? 'వరుడు' : 'Groom')}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mt-0.5 font-medium">
                    {profile.age} {isTelugu ? 'సంవత్సరాలు' : 'yrs'} · {profile.height} · {profile.religion.sect}
                  </p>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[11px] text-stone-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{profile.education}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{profile.profession}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{profile.mandalCity}, {profile.district.replace(' District', '')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isTelugu ? 'అడ్మిన్ సమీక్షించారు' : 'Admin Reviewed'}</span>
                    </div>
                  </div>

                  {/* Guardian Notice */}
                  {profile.guardianWaliContact && (
                    <div className="mt-3 p-2 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] flex items-center justify-between">
                      <div className="text-stone-700">
                        <span className="font-semibold text-stone-900">
                          {isTelugu ? 'కుటుంబ పెద్ద (వలీ): ' : 'Wali: '}
                        </span>
                        <span>{profile.guardianWaliContact.name} ({profile.guardianWaliContact.relationship})</span>
                      </div>
                      <a
                        href={`tel:${profile.guardianWaliContact.phone}`}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{isTelugu ? 'కాల్' : 'Call'}</span>
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onRemoveInterest(profile.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      {isTelugu ? 'ఆసక్తి తొలగించు' : 'Remove'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStartChat(profile)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isTelugu ? 'కుటుంబ చాట్' : 'Chat'}</span>
                      </button>

                      <button
                        onClick={() => onSelectProfile(profile)}
                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>{isTelugu ? 'పూర్తి బయోడేటా' : 'View Bio'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
