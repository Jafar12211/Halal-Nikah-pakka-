import React from 'react';
import { CheckCircle2, XCircle, HeartHandshake, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';

interface MissionBannerProps {
  onOpenRegister: () => void;
}

export const MissionBanner: React.FC<MissionBannerProps> = ({ onOpenRegister }) => {
  return (
    <section id="mission-section" className="py-20 bg-stone-100 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-3">
            <span>Our Sacred Community Mission</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-4">
            Why Nikah Pakka is Different
          </h2>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Finding a life partner shouldn't put financial pressure on families. We are replacing expensive corporate paywalls with genuine local community connections.
          </p>
        </div>

        {/* 2-Column Split: Story & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80">
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-700" />
                The Story Behind Nikah Pakka
              </h3>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-base mb-4">
                Have you ever seen your brother, sister, cousin, relative or friend struggling to find the right life partner?
              </p>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-base mb-4">
                Many families spend hard-earned money on multiple matrimony portals year after year, only to be trapped behind paywalls just to exchange phone numbers.
              </p>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-base font-medium text-emerald-900">
                We believe that Nikah is half of our Deen. Finding a righteous partner should be dignified, respectful of Islamic traditions, and accessible to every family regardless of financial background.
              </p>
            </div>

            {/* 3 Core Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-800" />
                </div>
                <h4 className="font-semibold text-stone-900 text-sm mb-1">Manual Verification</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Every profile is manually vetted with family references to filter time-wasters.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-2.5">
                  <PhoneCall className="w-5 h-5 text-amber-800" />
                </div>
                <h4 className="font-semibold text-stone-900 text-sm mb-1">Wali & Family Involved</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Parents, guardians, and siblings can register and facilitate respectful communication.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-[4/3]">
              <img
                src="/src/assets/images/family_assisted_meeting_1793883128679.jpg"
                alt="Muslim family gathered warmly to assist with matrimony"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-stone-950/90 via-stone-900/60 to-transparent text-white">
                <p className="font-serif font-bold text-base sm:text-lg mb-1">
                  Family-Assisted Matchmaking with Dignity
                </p>
                <p className="text-xs text-stone-200">
                  Respecting privacy, modesty, and the Sunnah of involving elders and guardians.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison: Expensive Subscriptions vs Nikah Pakka */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 bg-emerald-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold">
                Why Families Are Switching to Nikah Pakka
              </h3>
              <p className="text-xs text-emerald-200">
                A fair comparison between commercial portals and community-led matrimony
              </p>
            </div>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Join Our Community Free
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            {/* Commercial Portals */}
            <div className="p-6 sm:p-8 bg-rose-50/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-rose-800">
                  Commercial Matrimony Portals
                </span>
              </div>
              <ul className="space-y-3.5 text-sm text-stone-700">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Costly subscriptions ranging from ₹5,000 to ₹35,000 every 3-6 months.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Contact numbers locked behind coin systems and credit packages.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Unmoderated accounts, fake profiles, and commercial sales telecallers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Algorithms designed to keep users searching to maximize renewals.</span>
                </li>
              </ul>
            </div>

            {/* Nikah Pakka */}
            <div className="p-6 sm:p-8 bg-emerald-50/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Nikah Pakka Community
                </span>
              </div>
              <ul className="space-y-3.5 text-sm text-stone-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Accessible to all families</strong> with an affordable, non-exploitative model.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Guardian privacy</strong> is respected; guardian contact details are not displayed in the public directory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Administrator review</strong> is required before a profile can appear in the approved directory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Islamic modesty compliance:</strong> Photo privacy control, Deen & Salah practice info.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
