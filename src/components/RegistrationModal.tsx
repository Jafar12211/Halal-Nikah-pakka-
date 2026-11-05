import React, { useState } from 'react';
import {
  X,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { MatrimonyProfile, RegisteredByRole } from '../types/matrimony';
import {
  RegistrationInput,
  validateRegistrationForm,
  OFFICIAL_REGISTRATION_URL
} from '../utils/matrimony';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (newProfile: MatrimonyProfile) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<RegistrationInput>({
    registeredBy: 'parent',
    registrantName: '',
    candidateName: '',
    gender: 'bride',
    age: 24,
    height: `5'4"`,
    maritalStatus: 'Never Married',
    city: 'Hyderabad',
    motherTongue: 'Urdu',
    sect: 'Sunni Hanafi',
    salah: '5 times daily',
    education: '',
    profession: '',
    annualIncomeRange: '₹8 - 12 Lakhs',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    consentConfirmed: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      const errs: Record<string, string> = {};
      if (!formData.candidateName.trim()) errs.candidateName = 'Candidate name is required.';
      if (!formData.city.trim()) errs.city = 'City is required.';
      if (Number(formData.age) < 18 || Number(formData.age) > 75) errs.age = 'Age must be 18 to 75.';
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const errs: Record<string, string> = {};
      if (!formData.education.trim()) errs.education = 'Qualification is required.';
      if (!formData.profession.trim()) errs.profession = 'Profession is required.';
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Build newly created profile
    const initials = formData.candidateName
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NP';

    const newProfile: MatrimonyProfile = {
      id: `np-${Date.now().toString().slice(-4)}`,
      registeredBy: (formData.registeredBy as RegisteredByRole) || 'self',
      registrantName: formData.registrantName || formData.guardianName || 'Family Member',
      candidateName: formData.candidateName,
      gender: formData.gender as 'groom' | 'bride',
      age: Number(formData.age),
      height: formData.height,
      maritalStatus: formData.maritalStatus as any,
      city: formData.city,
      stateCountry: 'India / Global',
      motherTongue: formData.motherTongue,
      sect: formData.sect,
      religiousPractice: {
        salah: formData.salah as any,
        hijabOrBeard: formData.gender === 'bride' ? 'Observes Hijab/Niqab' : 'Full Beard',
        quranRecitation: 'Daily',
        halalDiet: true,
        hajjUmrahDone: false,
      },
      education: formData.education,
      profession: formData.profession,
      employedIn: 'Private Sector',
      annualIncomeRange: formData.annualIncomeRange,
      familyDetails: {
        fatherNameAndOcc: formData.guardianName ? `${formData.guardianName} (${formData.guardianRelation})` : 'Respectable Family',
        motherNameAndOcc: 'Homemaker',
        brothersCount: 1,
        brothersMarried: 0,
        sistersCount: 1,
        sistersMarried: 0,
        nativePlace: formData.city,
        familyValues: 'Traditional & Practicing'
      },
      partnerPreferences: {
        minAge: formData.gender === 'bride' ? Number(formData.age) : Math.max(18, Number(formData.age) - 5),
        maxAge: formData.gender === 'bride' ? Number(formData.age) + 6 : Number(formData.age),
        educationPreference: 'Graduate or Professional degree',
        maritalStatusPreference: [formData.maritalStatus],
        locationPreference: [formData.city, 'Open to discuss'],
        religiosityPreference: 'Observes 5 daily Salah, honest earnings'
      },
      aboutCandidate: `Alhamdulillah a sincere, family-oriented ${formData.gender === 'bride' ? 'Muslimah' : 'Muslim brother'} seeking a righteous spouse for the sake of Allah with family consent.`,
      guardianWaliContact: {
        name: formData.guardianName,
        relationship: formData.guardianRelation,
        phone: formData.guardianPhone,
        preferredCallTime: '6:00 PM - 9:00 PM',
        visibility: 'visible'
      },
      isVerified: true,
      verificationBadge: 'Family Reference Verified',
      photoPrivacy: 'blurred_until_request',
      avatarInitials: initials,
      avatarBgColor: formData.gender === 'bride' ? '#047857' : '#1e3a8a',
      createdAt: 'Just now',
      interestsCount: 0,
    };

    onProfileCreated(newProfile);
    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span>Nikah Pakka Registration</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Family-assisted, dignified matchmaking without expensive subscriptions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors"
            aria-label="Close registration modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice linking to official Google Form / Web page */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <span>Prefer direct Google/Web form?</span>
          <a
            href={OFFICIAL_REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 underline"
          >
            Open External Portal
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Alhamdulillah! Profile Registered
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Your profile for <strong>{formData.candidateName}</strong> has been created and verified. It is now active on the community directory for compatible families to view.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
              >
                View Matches in Directory
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            {/* Steps Progress (Functional unboxed indicators) */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200 text-xs font-semibold">
              <span className={step >= 1 ? 'text-emerald-800 font-bold' : 'text-stone-400'}>
                1. Candidate Particulars
              </span>
              <span className="text-stone-300">→</span>
              <span className={step >= 2 ? 'text-emerald-800 font-bold' : 'text-stone-400'}>
                2. Deen & Profession
              </span>
              <span className="text-stone-300">→</span>
              <span className={step === 3 ? 'text-emerald-800 font-bold' : 'text-stone-400'}>
                3. Guardian (Wali) & Consent
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Who is Registering?
                    </label>
                    <select
                      value={formData.registeredBy}
                      onChange={(e) => setFormData({ ...formData, registeredBy: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                    >
                      <option value="parent">Parent (Father / Mother)</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="relative">Uncle / Aunt / Relative</option>
                      <option value="self">Registering for Myself</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Candidate Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Ayesha Khan"
                        value={formData.candidateName}
                        onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                      />
                      {errors.candidateName && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.candidateName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Candidate Gender *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'bride' })}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center ${
                            formData.gender === 'bride'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          Bride (Dulhan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'groom' })}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center ${
                            formData.gender === 'groom'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          Groom (Dulha)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Age (Years) *
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="75"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                      />
                      {errors.age && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.age}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Height
                      </label>
                      <select
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        {[`5'0"`, `5'1"`, `5'2"`, `5'3"`, `5'4"`, `5'5"`, `5'6"`, `5'7"`, `5'8"`, `5'9"`, `5'10"`, `5'11"`, `6'0"`, `6'1"`].map(
                          (h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Marital Status
                      </label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Current City *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                      />
                      {errors.city && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Mother Tongue
                      </label>
                      <select
                        value={formData.motherTongue}
                        onChange={(e) => setFormData({ ...formData, motherTongue: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        <option value="Urdu">Urdu</option>
                        <option value="Hindi / Urdu">Hindi / Urdu</option>
                        <option value="English">English</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <span>Continue to Deen & Profession</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Deen & Career */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Sect / Maslak
                      </label>
                      <select
                        value={formData.sect}
                        onChange={(e) => setFormData({ ...formData, sect: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        <option value="Sunni Hanafi">Sunni Hanafi</option>
                        <option value="Sunni Shafi'i">Sunni Shafi'i</option>
                        <option value="Ahl-e-Hadith">Ahl-e-Hadith</option>
                        <option value="Deen First">Deen First / General Sunni</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Salah (Prayers) Practice
                      </label>
                      <select
                        value={formData.salah}
                        onChange={(e) => setFormData({ ...formData, salah: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        <option value="5 times daily">5 times daily (Regular)</option>
                        <option value="Regularly">Regularly</option>
                        <option value="Usually">Usually / Friday & Daily</option>
                        <option value="Striving">Striving to improve</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Highest Education / Qualification *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MBBS Doctor / B.Tech Computer Science / CA"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                    />
                    {errors.education && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.education}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Current Profession / Occupation *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer, Lecturer, Business"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                      />
                      {errors.profession && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.profession}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Annual Income Bracket
                      </label>
                      <select
                        value={formData.annualIncomeRange}
                        onChange={(e) => setFormData({ ...formData, annualIncomeRange: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        <option value="₹5 - 8 Lakhs">₹5 - 8 Lakhs</option>
                        <option value="₹8 - 12 Lakhs">₹8 - 12 Lakhs</option>
                        <option value="₹12 - 18 Lakhs">₹12 - 18 Lakhs</option>
                        <option value="₹18 - 30 Lakhs">₹18 - 30 Lakhs</option>
                        <option value="₹30 Lakhs+ / NRI">₹30 Lakhs+ / NRI</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-200"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <span>Continue to Guardian & Consent</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Guardian Details & Consent */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      In Islamic matrimony, guardian (Wali) involvement ensures respectful intentions and protects both families.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Guardian (Wali / Elder) Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mohammed Abdul Raheem"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                      />
                      {errors.guardianName && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.guardianName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Relationship to Candidate
                      </label>
                      <select
                        value={formData.guardianRelation}
                        onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Elder Brother">Elder Brother</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Self / Candidate">Self (Male Candidate)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Guardian Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98490 12345"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                    />
                    {errors.guardianPhone && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.guardianPhone}</p>
                    )}
                  </div>

                  {/* Consent checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentConfirmed}
                        onChange={(e) => setFormData({ ...formData, consentConfirmed: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                      />
                      <span className="text-xs text-stone-700 leading-relaxed">
                        I confirm that the candidate has given their full consent, all information provided is truthful, and this registration is made with sincere intentions for Nikah (Marriage).
                      </span>
                    </label>
                    {errors.consentConfirmed && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.consentConfirmed}</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-200"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <UserCheck className="w-4 h-4 text-amber-300" />
                      <span>Complete Free Registration</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
