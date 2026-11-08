import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Copy,
  Check,
  Share2,
  Heart,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  MessageCircle,
  AlertTriangle,
  Lock,
  BadgeCheck,
  Briefcase,
  Camera
} from 'lucide-react';
import { UserProfile, LanguageCode } from '../types/database';
import { generateWhatsAppShareMessage } from '../utils/matrimony';
import { translations } from '../utils/translations';

interface ProfileDetailModalProps {
  profile: UserProfile | null;
  onClose: () => void;
  onExpressInterest: (profileId: string) => void;
  isInterested: boolean;
  language: LanguageCode;
  onStartChat: (profile: UserProfile) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  onClose,
  onExpressInterest,
  isInterested,
  language,
  onStartChat,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedBiodata, setCopiedBiodata] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [profile?.id]);

  useEffect(() => {
    const photoCount = profile?.photos?.length || 0;
    if (photoCount < 2) return undefined;

    const timer = window.setInterval(() => {
      setSelectedPhotoIndex((current) => (current + 1) % photoCount);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [profile?.id, profile?.photos?.length]);

  if (!profile) return null;
  const t = translations[language];

  const handleCopyBiodata = () => {
    const text = `*NIKAH PAKKA - Candidate Biodata*
Candidate: ${profile.candidateName} (${profile.gender === 'bride' ? 'Bride' : 'Groom'})
Age/Height: ${profile.age} Years, ${profile.height}
District: ${profile.district} (${profile.mandalCity})
Education: ${profile.education}
Profession: ${profile.profession} (${profile.annualIncomeRange})
Deen: ${profile.religion?.sect || 'Not provided'} · Salah: ${profile.religion?.salah || 'Not provided'} · Modesty: ${profile.religion?.hijabOrBeard || 'Not provided'}
Family: ${profile.familyDetails?.fatherNameAndOcc || 'Not shared publicly'} (Father) · Native: ${profile.familyDetails?.nativePlace || 'Not shared publicly'}
Must-Haves: ${profile.mustHaves?.join(', ') || 'Practicing Deen, good character'}
Deal-Breakers: ${profile.dealBreakers?.join(', ') || 'Dowry, smoking, lack of prayer'}
Guardian Contact: Shared privately with families when consent is provided.
Profile listed on Nikah Pakka. Identity documents have not been verified through this public profile.`;

    navigator.clipboard.writeText(text);
    setCopiedBiodata(true);
    setTimeout(() => setCopiedBiodata(false), 2500);
  };

  const handleCopyPhone = () => {
    if (!profile.guardianWaliContact?.phone) return;
    navigator.clipboard.writeText(profile.guardianWaliContact?.phone || '');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = generateWhatsAppShareMessage(profile.candidateName);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-amber-300 text-lg">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span className="text-stone-300 text-xs hidden sm:inline">
              · {t.bismillahHeader || 'Verified Matrimonial Biodata'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors"
            aria-label="Close biodata modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 max-h-[78vh] overflow-y-auto space-y-7">
          {/* Candidate Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile.photos && profile.photos.length > 0 ? (
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-700/40 shadow-sm shrink-0 relative bg-stone-900">
                    <img
                      src={profile.photos[selectedPhotoIndex] || profile.photos[0]}
                      alt={profile.candidateName}
                      className={`w-full h-full object-cover transition-all ${
                        profile.photoPrivacy === 'blurred_until_request' && !isInterested
                          ? 'blur-xs scale-105'
                          : ''
                      }`}
                    />
                    {profile.photoPrivacy === 'blurred_until_request' && !isInterested && (
                      <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-[2px] flex items-center justify-center" title="Photo blurred for modesty until interest accepted">
                        <Lock className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-serif font-bold text-2xl shadow-xs shrink-0"
                    style={{ backgroundColor: profile.avatarBgColor || '#047857' }}
                  >
                    {profile.avatarInitials}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-serif font-bold text-stone-900">
                    {profile.candidateName}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    {profile.gender === 'bride' ? 'Bride / Dulhan' : 'Groom / Dulha'}
                  </span>
                  {profile.photos && profile.photos.length > 1 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-700" />
                      {profile.photos.length} Photos
                    </span>
                  )}
                  {profile.photos && profile.photos.length > 0 && profile.photoPrivacy === 'blurred_until_request' && !isInterested && (
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                      Modesty Protected Photo
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                  <span>{profile.age} Years</span>
                  <span aria-hidden="true">·</span>
                  <span>{profile.height}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profile.maritalStatus}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profile.motherTongue}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-700 mt-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  <span>
                    {profile.district} ({profile.mandalCity})
                  </span>
                </div>
              </div>
            </div>

            {/* Verification & ID Protection Badge */}
            <div className="text-right flex flex-col items-start sm:items-end">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>
                  {profile.isVerified
                    ? 'Profile Verified'
                    : profile.documents && profile.documents.length > 0
                      ? 'Document Submitted · Review Pending'
                      : 'Not Document Verified'}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 font-mono">
                {profile.documents && profile.documents.length > 0 && profile.documents[0].maskedId
                  ? `Masked ID: ${profile.documents[0].maskedId}`
                  : 'No government ID details available'}
              </span>
            </div>
          </div>

          {/* Multi-Photo Gallery Strip if > 1 photo */}
          {profile.photos && profile.photos.length > 1 && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-800" />
                  Candidate Photo Gallery ({profile.photos.length} Pictures)
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  Showing Photo #{selectedPhotoIndex + 1} of {profile.photos.length}
                </span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {profile.photos.map((picUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedPhotoIndex === idx
                        ? 'border-emerald-700 ring-2 ring-emerald-500/40 shadow-sm scale-105'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={picUrl}
                      alt={`Candidate picture ${idx + 1}`}
                      className={`w-14 h-14 sm:w-16 sm:h-16 object-cover ${
                        profile.photoPrivacy === 'blurred_until_request' && !isInterested
                          ? 'blur-[1.5px]'
                          : ''
                      }`}
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-emerald-950/85 text-[8px] text-amber-300 font-bold text-center py-0.5">
                        Cover
                      </span>
                    )}
                    <span className="absolute top-0.5 left-0.5 bg-stone-950/60 text-white text-[8px] px-1 rounded font-mono">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* About Statement */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-emerald-900 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.candidateSummary || 'Candidate Summary & Character'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
              "{profile.aboutCandidate}"
            </p>
          </div>

          {/* Section: Must-Haves and Deal-Breakers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Non-negotiable Must-Haves */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.mustHavesTitle || 'Non-Negotiable Must-Haves'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-800">
                {profile.mustHaves && profile.mustHaves.length > 0 ? (
                  profile.mustHaves.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold shrink-0">✓</span>
                      <span>{m}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-stone-500 italic">5 Daily Salah, Halal earnings, respect for elders</li>
                )}
              </ul>
            </div>

            {/* Strict Deal-Breakers */}
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-950 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>{t.dealBreakersTitle || 'Strict Deal-Breakers'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-800">
                {profile.dealBreakers && profile.dealBreakers.length > 0 ? (
                  profile.dealBreakers.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold shrink-0">✕</span>
                      <span>{d}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-stone-500 italic">Dowry demands, smoking/drinking, casual attitude to Deen</li>
                )}
              </ul>
            </div>
          </div>

          {/* Section: Deen & Religious Practice */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-2 border-b border-stone-200 pb-2">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>{t.deenLifestyle || 'Deen, Salah & Religious Observance'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-xs">Salah / Daily Prayers:</span>
                <span className="font-semibold text-stone-900">{profile.religion?.salah || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-xs">Dress / Modesty:</span>
                <span className="font-semibold text-stone-900">{profile.religion?.hijabOrBeard || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-xs">Sect / Maslak:</span>
                <span className="font-semibold text-stone-900">{profile.religion?.sect || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-xs">Quran & Halal Diet:</span>
                <span className="font-semibold text-stone-900">
                  {profile.religion?.quranRecitation || 'Not provided'} recitation · Strict Halal food
                </span>
              </div>
            </div>
          </div>

          {/* Section: Education & Profession */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-200 pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-800" />
              <span>{t.educationCareer || 'Education & Career'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-stone-500 block text-xs">Highest Qualification:</span>
                <span className="font-semibold text-stone-900">{profile.education}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Current Profession:</span>
                <span className="font-semibold text-stone-900">{profile.profession}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Employment Sector:</span>
                <span className="font-semibold text-stone-900">{profile.employedIn}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Annual Income Bracket:</span>
                <span className="font-semibold text-stone-900">{profile.annualIncomeRange}</span>
              </div>
            </div>
          </div>

          {/* Section: Family Background */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-200 pb-2">
              <span>{t.familyBackground || 'Family Background & Lineage'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-stone-500 block text-xs">Father's Particulars:</span>
                <span className="font-medium text-stone-900">{profile.familyDetails?.fatherNameAndOcc || 'Not shared publicly'}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Mother's Particulars:</span>
                <span className="font-medium text-stone-900">{profile.familyDetails?.motherNameAndOcc || 'Not shared publicly'}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Brothers & Sisters:</span>
                <span className="font-medium text-stone-900">
                  {profile.familyDetails?.brothersCount ?? '—'} Brothers ({profile.familyDetails?.brothersMarried ?? '—'} Married) · {profile.familyDetails?.sistersCount ?? '—'} Sisters ({profile.familyDetails?.sistersMarried ?? '—'} Married)
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-xs">Native Place & Family Status:</span>
                <span className="font-medium text-stone-900">
                  {profile.familyDetails?.nativePlace || 'Not shared publicly'} · {profile.familyDetails?.familyStatus || 'Not shared publicly'}
                </span>
              </div>
            </div>
          </div>

          {/* Guardian / Wali Direct Contact Card */}
          <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-950 block">
                  {t.guardianContact || 'Direct Guardian (Wali) Contact'}
                </span>
                <p className="text-xs text-amber-900 mt-0.5">
                  Available for respectful family-to-family communication. Zero paywall coins.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPhone}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? 'Copied' : 'Copy Number'}</span>
                </button>

                <a
                  href={`tel:${profile.guardianWaliContact?.phone || ''}`}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Wali</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block">Wali / Contact Person:</span>
                <span className="font-semibold text-stone-900">
                  {profile.guardianWaliContact?.name || 'Shared after family consent'} ({profile.guardianWaliContact?.relationship || ''})
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Phone Number:</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {profile.guardianWaliContact?.phone || ''}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Preferred Calling Time:</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {profile.guardianWaliContact?.preferredCallTime || 'To be arranged privately'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBiodata}
              className="px-3 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copiedBiodata ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBiodata ? 'Biodata Copied!' : 'Copy Full Biodata'}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Start Chaperoned Chat Button */}
            <button
              onClick={() => {
                onClose();
                onStartChat(profile);
              }}
              className="px-4 py-2 bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-800" />
              <span>Chaperoned Family Chat</span>
            </button>

            {/* Express Interest Button */}
            <button
              onClick={() => onExpressInterest(profile.id)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                isInterested
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInterested ? 'fill-rose-700 text-rose-700' : 'text-amber-300'}`} />
              <span>{isInterested ? 'Interest Sent to Family' : 'Send Khabar / Interest'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
