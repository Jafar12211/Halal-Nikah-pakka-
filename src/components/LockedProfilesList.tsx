import React from 'react';
import { LockKeyhole, ShieldCheck, Crown } from 'lucide-react';
import { LanguageCode } from '../types/database';

export interface LockedProfilePreview {
  id: string;
  gender: 'bride' | 'groom';
  ageBand: string;
  district: string;
}

interface LockedProfilesListProps {
  previews: LockedProfilePreview[];
  language: LanguageCode;
  onViewPlans: () => void;
}

export const LockedProfilesList: React.FC<LockedProfilesListProps> = ({
  previews,
  language,
  onViewPlans,
}) => {
  const isTelugu = language === 'te';

  return (
    <section className="py-12 sm:py-16 bg-[#fdfbf7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isTelugu ? 'అడ్మిన్ ధృవీకరించిన సంబంధాలు' : 'Admin-verified community profiles'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {isTelugu ? 'లాక్ చేసిన ప్రొఫైల్ ప్రివ్యూలు' : 'Locked profile previews'}
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-2xl">
              {isTelugu
                ? 'గోప్యత కోసం వ్యక్తిగత వివరాలు దాచబడ్డాయి. పూర్తి బయోడేటా యాక్టివ్ మెంబర్‌షిప్‌తో మాత్రమే అందుబాటులో ఉంటుంది.'
                : 'Approved profiles are shown in a privacy-safe locked state. Names, photos, exact ages and personal biodata stay protected until membership is active.'}
            </p>
          </div>
          <button type="button" onClick={onViewPlans} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900">
            <Crown className="w-4 h-4 text-amber-300" />
            {isTelugu ? 'మెంబర్‌షిప్ ప్లాన్లు' : 'View membership plans'}
          </button>
        </div>

        {previews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
            {isTelugu ? 'ప్రస్తుతం ధృవీకరించిన ప్రివ్యూలు లేవు.' : 'No approved profile previews are available yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((preview) => (
              <article key={preview.id} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center text-2xl text-amber-200">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-base font-bold text-stone-900">
                      {isTelugu ? 'ధృవీకరించిన అభ్యర్థి' : 'Verified candidate'}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {preview.gender === 'bride' ? (isTelugu ? 'వధువు' : 'Bride') : (isTelugu ? 'వరుడు' : 'Groom')}
                      {' · '}{preview.ageBand} {isTelugu ? 'సంవత్సరాలు' : 'years'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-stone-50 px-3 py-3 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800">{isTelugu ? 'ప్రాంతం: ' : 'Region: '}</span>
                  {preview.district || 'Godavari region'}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    {isTelugu ? 'పూర్తి వివరాలు లాక్‌లో' : 'Full biodata locked'}
                  </span>
                  <button type="button" onClick={onViewPlans} className="text-xs font-bold text-emerald-800 hover:text-emerald-950">
                    {isTelugu ? 'అన్‌లాక్' : 'Unlock'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
