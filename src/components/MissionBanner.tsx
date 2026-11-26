import React, { useEffect, useState } from 'react';
import familyMeetingImage from '../assets/images/family_assisted_meeting_1793883128679.jpg';
import communityNikahImage from '../assets/images/islamic_community_nikah_1793883128899.jpg';
import celebrationImage from '../assets/images/nikah_hero_celebration_1793883128650.jpg';
import { CheckCircle2, XCircle, HeartHandshake, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';

interface MissionBannerProps {
  onOpenRegister: () => void;
}

export const MissionBanner: React.FC<MissionBannerProps> = ({ onOpenRegister }) => {
  const familySlides = [
    {
      image: familyMeetingImage,
      alt: 'Muslim family gathered warmly to assist with matrimony',
      caption: 'Family-Assisted Matchmaking with Dignity',
      detail: 'Respecting privacy, modesty, and the Sunnah of involving elders and guardians.',
    },
    {
      image: communityNikahImage,
      alt: 'Muslim families coming together for a respectful nikah gathering',
      caption: 'Families Coming Together',
      detail: 'Building sincere connections through trust, care, and family participation.',
    },
    {
      image: celebrationImage,
      alt: 'A joyful and dignified Muslim wedding celebration',
      caption: 'A Blessed Beginning',
      detail: 'Helping families take the first step towards a meaningful marriage.',
    },
  ];
  const [activeFamilySlide, setActiveFamilySlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFamilySlide((current) => (current + 1) % familySlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [familySlides.length]);

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

        {/* 2-Column Split: Story & Family Slideshow */}
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

          {/* Right Column: Family-Assisted Matrimony Slideshow */}
          <div className="lg:col-span-6">
            <div
              className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-[4/3] bg-stone-900"
              aria-label="Muslim family gathered warmly to assist with matrimony photo slideshow"
            >
              {familySlides.map((slide, index) => (
                <img
                  key={slide.image}
                  src={slide.image}
                  alt={slide.alt}
                  aria-hidden={index !== activeFamilySlide}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${index === activeFamilySlide ? 'opacity-100' : 'opacity-0'}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/20 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                <p className="font-serif font-bold text-base sm:text-lg mb-1" aria-live="polite">
                  {familySlides[activeFamilySlide].caption}
                </p>
                <p className="text-xs sm:text-sm text-stone-200 max-w-lg">
                  {familySlides[activeFamilySlide].detail}
                </p>
                <div className="flex items-center gap-2 mt-4" aria-label="Choose family slideshow image">
                  {familySlides.map((slide, index) => (
                    <button
                      key={slide.image}
                      type="button"
                      onClick={() => setActiveFamilySlide(index)}
                      aria-label={`Show family photo ${index + 1}: ${slide.alt}`}
                      aria-pressed={index === activeFamilySlide}
                      className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${index === activeFamilySlide ? 'w-7 bg-amber-300' : 'w-2 bg-white/70 hover:bg-white'}`}
                    />
                  ))}
                </div>
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
                  <span><strong>Privacy-conscious profile options:</strong> Photo visibility preference and Deen & Salah information.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
