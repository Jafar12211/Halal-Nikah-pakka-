import React from 'react';
import { BookOpen, Heart, Sparkles } from 'lucide-react';

export const DuaSection: React.FC = () => {
  return (
    <section id="duas-section" className="py-20 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Spiritual Foundations of Nikah</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-4">
            Du'as & Sunnah for Finding a Righteous Spouse
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed text-balance">
            Matrimony is a sacred covenant ordained by Allah. Keep your intentions pure, seek istikhara, and recite these authentic Quranic prayers regularly.
          </p>
        </div>

        {/* 3 Du'a Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1: Rabbana Hablana */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-2 border-b border-stone-100">
                <span className="font-semibold text-emerald-800">Surah Al-Furqan (25:74)</span>
                <span>Du'a for Comfort & Spouses</span>
              </div>
              <p className="font-arabic text-xl sm:text-2xl text-right text-emerald-950 leading-loose mb-4">
                رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا
              </p>
              <p className="text-xs font-medium text-stone-500 italic mb-2">
                "Rabbana hablana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama."
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                "Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-emerald-800 font-medium">
              Recommended after every Fardh prayer.
            </div>
          </div>

          {/* Card 2: Musa AS Dua */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-2 border-b border-stone-100">
                <span className="font-semibold text-emerald-800">Surah Al-Qasas (28:24)</span>
                <span>Du'a of Prophet Musa (AS)</span>
              </div>
              <p className="font-arabic text-xl sm:text-2xl text-right text-emerald-950 leading-loose mb-4">
                رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ
              </p>
              <p className="text-xs font-medium text-stone-500 italic mb-2">
                "Rabbi innee limaaa anzalta ilayya min khairin faqeer."
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                "My Lord, indeed I am in desperate need of whatever good You would send down to me."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-emerald-800 font-medium">
              Recited by Prophet Musa before Allah blessed him with a spouse and work.
            </div>
          </div>

          {/* Card 3: The 4 Criteria in Sunnah */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-2 border-b border-stone-100">
                <span className="font-semibold text-emerald-800">Sahih al-Bukhari (5090)</span>
                <span>The Golden Guidance</span>
              </div>
              <p className="font-arabic text-lg sm:text-xl text-right text-emerald-950 leading-loose mb-4">
                فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-2">
                "A person is sought for marriage for four reasons: wealth, lineage, beauty, and religious commitment. So seek the one who is religious, and you will prosper."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Prioritize character and sincere faith above all.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
