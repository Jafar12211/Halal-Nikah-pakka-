import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, HelpCircle, Smartphone, Lock, HeartHandshake } from 'lucide-react';
import { LanguageCode } from '../types/database';

interface FAQSectionProps {
  language: LanguageCode;
  onOpenRegister: () => void;
}

interface FAQItem {
  id: string;
  category: 'general' | 'privacy' | 'technical';
  questionEn: string;
  questionTe: string;
  answerEn: string;
  answerTe: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    questionEn: 'How is Nikah Pakka different from expensive matrimony websites?',
    questionTe: 'ఖరీదైన మ్యాట్రిమోనీ వెబ్‌సైట్ల కంటే నికాహ్ పక్కా ఎలా భిన్నమైనది?',
    answerEn:
      'Nikah Pakka is a community matrimony directory for Yanam and the Godavari region. Browsing and profile registration are currently free. Public profiles show only approved information; guardian contact details are not shared through the public directory, and in-app messaging is not yet available.',
    answerTe:
      'నికాహ్ పక్కా యానాం మరియు గోదావరి ప్రాంతాల కోసం రూపొందించిన కమ్యూనిటీ మ్యాట్రిమోనీ డైరెక్టరీ. ప్రస్తుతం ప్రొఫైల్ నమోదు మరియు బ్రౌజింగ్ ఉచితం. పబ్లిక్ ప్రొఫైళ్లలో ఆమోదించిన వివరాలే కనిపిస్తాయి; సంరక్షకుల ఫోన్ నంబర్లు పబ్లిక్‌గా చూపించబడవు, యాప్‌లో మెసేజింగ్ ఇంకా అందుబాటులో లేదు.',
  },
  {
    id: 'faq-2',
    category: 'general',
    questionEn: 'Why focus specifically on Yanam and the Godavari districts?',
    questionTe: 'ప్రత్యేకంగా యానాం మరియు గోదావరి జిల్లాలపై ఎందుకు దృష్టి సారించారు?',
    answerEn:
      'Yanam (Puducherry) and the adjoining districts of Kakinada, Konaseema, East Godavari (Rajahmundry), West Godavari (Bhimavaram), and Eluru have deeply connected Muslim communities with shared Telugu/Urdu cultural ties. A local focus can make in-person family introductions easier. Families should still independently confirm each candidate’s identity and details.',
    answerTe:
      'యానాం (పుదుచ్చేరి) మరియు పక్కనే ఉన్న కాకినాడ, కోనసీమ, రాజమండ్రి, భీమవరం, ఏలూరు ముస్లిం సమాజాలు బలమైన సాంస్కృతిక బంధాలను కలిగి ఉన్నాయి. స్థానికంగా దృష్టి పెట్టడం వల్ల కుటుంబాలను వ్యక్తిగతంగా కలవడం సులభం కావచ్చు. ప్రతి అభ్యర్థి గుర్తింపు మరియు వివరాలను కుటుంబాలు స్వయంగా నిర్ధారించుకోవాలి.',
  },
  {
    id: 'faq-3',
    category: 'privacy',
    questionEn: 'Is family messaging available?',
    questionTe: 'కుటుంబ మెసేజింగ్ సదుపాయం అందుబాటులో ఉందా?',
    answerEn:
      'Family involvement is encouraged throughout the introduction process. In-app family messaging is not yet enabled, so no messages can currently be sent through Nikah Pakka. Families should arrange introductions through contact details they have independently verified.',
    answerTe:
      'కుటుంబ సభ్యుల భాగస్వామ్యంతో పరిచయాలు చేసుకోవాలని ప్రోత్సహిస్తున్నాము. నికాహ్ పక్కాలో ఇన్-యాప్ కుటుంబ మెసేజింగ్ ఇంకా ప్రారంభం కాలేదు; ప్రస్తుతం ఈ వెబ్‌సైట్ ద్వారా సందేశాలు పంపడం సాధ్యం కాదు.',
  },
  {
    id: 'faq-4',
    category: 'privacy',
    questionEn: 'How are Aadhaar, Voter ID, and identity documents protected?',
    questionTe: 'ఆధార్, ఓటర్ ఐడీ మరియు గుర్తింపు పత్రాలు ఎలా భద్రపరచబడతాయి?',
    answerEn:
      'Secure photo and identity-document uploads are not currently available on this project. Do not enter Aadhaar, PAN, passport, or driving-licence numbers into profile fields or send sensitive documents through public channels. A profile must not be described as identity-verified until a secure upload and documented administrator review have actually taken place.',
    answerTe:
      'ఈ ప్రాజెక్ట్‌లో ప్రస్తుతం సురక్షిత ఫోటో మరియు గుర్తింపు పత్రాల అప్‌లోడ్ సదుపాయం అందుబాటులో లేదు. ఆధార్, PAN, పాస్‌పోర్ట్ లేదా డ్రైవింగ్ లైసెన్స్ నంబర్లను ప్రొఫైల్‌లో నమోదు చేయవద్దు లేదా పబ్లిక్ ఛానళ్లలో పంపవద్దు. సురక్షిత అప్‌లోడ్ మరియు అడ్మిన్ సమీక్ష పూర్తయ్యే వరకు ఏ ప్రొఫైల్‌నూ గుర్తింపు ధృవీకరించబడిందని చెప్పకూడదు.',
  },
  {
    id: 'faq-5',
    category: 'technical',
    questionEn: 'How do I install Nikah Pakka on my Android phone?',
    questionTe: 'నా ఆండ్రాయిడ్ ఫోన్‌లో నికాహ్ పక్కా యాప్‌ను ఎలా ఇన్‌స్టాల్ చేసుకోవాలి?',
    answerEn:
      'Nikah Pakka is a Progressive Web App (PWA). Click the "Install App" button in the top navigation or banner on Android Chrome. You can also tap the 3 dots in Chrome and select "Install app" or "Add to Home screen". It installs directly without needing Google Play Store fees and works smoothly on low-speed networks.',
    answerTe:
      'నికాహ్ పక్కా ప్రోగ్రెసివ్ వెబ్ యాప్ (PWA). గూగుల్ క్రోమ్‌లో "Install App" బటన్‌పై క్లిక్ చేయడం ద్వారా లేదా బ్రౌజర్ మెనూలో "Add to Home screen" నొక్కడం ద్వారా నేరుగా ఫోన్ హోమ్ స్క్రీన్‌కు ఇన్‌స్టాల్ చేసుకోవచ్చు.',
  },
  {
    id: 'faq-6',
    category: 'technical',
    questionEn: 'What are the hosting limits, OTP charges, and native Android plans?',
    questionTe: 'ఉచిత హోస్టింగ్ పరిమితులు, OTP ఛార్జీలు మరియు స్థానిక ఆండ్రాయిడ్ యాప్ ప్రణాళిక ఏమిటి?',
    answerEn:
      'Email/password and Google sign-in are provided through Firebase Authentication. SMS OTP sign-in is not currently configured, and there is no demo OTP. App installation depends on PWA support in the browser. Hosting and native Android app availability should be confirmed from the live deployment before being promised.',
    answerTe:
      'ఈ వెబ్‌సైట్‌లో ఇమెయిల్/పాస్‌వర్డ్ మరియు Google సైన్-ఇన్ Firebase Authentication ద్వారా పనిచేస్తాయి. SMS OTP ప్రస్తుతం అమలులో లేదు; డెమో OTP కూడా లేదు. యాప్ ఇన్‌స్టాలేషన్ బ్రౌజర్‌లోని PWA మద్దతుపై ఆధారపడి ఉంటుంది. హోస్టింగ్ లేదా ప్రత్యేక Android యాప్ అందుబాటును లైవ్ విడుదలలో నిర్ధారించిన తర్వాత మాత్రమే ప్రకటిస్తాము.',
  },
];

export const FAQSection: React.FC<FAQSectionProps> = ({ language, onOpenRegister }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs-section" className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-3 border border-emerald-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'సందేహాలు & సమాధానాలు' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 tracking-tight">
            {language === 'te'
              ? 'నికాహ్ పక్కా గురించి కుటుంబాలు అడిగే ముఖ్య ప్రశ్నలు'
              : 'Clear, Transparent Answers for Respectable Families'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl mx-auto">
            {language === 'te'
              ? 'యానాం, కాకినాడ మరియు గోదావరి జిల్లాల ముస్లింల కోసం పారదర్శకమైన నియమ నిబంధనలు.'
              : 'Our commitment to Islamic ethics, local community trust, and family peace of mind.'}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3.5">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            const q = language === 'te' ? faq.questionTe : faq.questionEn;
            const a = language === 'te' ? faq.answerTe : faq.answerEn;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                    {q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-emerald-100 text-emerald-900 rotate-180'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    <p>{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Community Trust Callout */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-base sm:text-lg text-emerald-950 flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>
                {language === 'te'
                  ? 'మీ కుటుంబ సభ్యుని సంబంధం కోసం సిద్ధంగా ఉన్నారా?'
                  : 'Ready to Register with Dignity & Full Consent?'}
              </span>
            </h3>
            <p className="text-xs text-stone-600">
              {language === 'te'
                ? 'ఉచితంగా ప్రొఫైల్ నమోదు చేసి మీ ప్రాంతీయ సంబంధాలను అన్వేషించండి.'
                : 'Community registration is currently free. Any future paid service would be clearly disclosed before a payment is requested.'}
            </p>
          </div>
          <button
            onClick={onOpenRegister}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            {language === 'te' ? 'ఇప్పుడే రిజిస్టర్ చేసుకోండి' : 'Register Profile Free'}
          </button>
        </div>
      </div>
    </section>
  );
};
