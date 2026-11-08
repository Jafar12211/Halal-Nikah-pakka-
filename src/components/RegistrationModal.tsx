
import React, { useState } from 'react';
import {
  X,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { auth } from '../services/firebase';
import { MatrimonyProfile, RegisteredByRole } from '../types/matrimony';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (newProfile: MatrimonyProfile) => void;
}

type RegistrationForm = {
  registeredBy: RegisteredByRole;
  registrantName: string;
  candidateName: string;
  gender: 'bride' | 'groom';
  age: string;
  height: string;
  maritalStatus: string;
  city: string;
  motherTongue: string;
  sect: string;
  salah: string;
  education: string;
  profession: string;
  annualIncomeRange: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  consentConfirmed: boolean;
  photoPrivacy: 'blurred_until_request' | 'visible';
};

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<RegistrationForm>({
    registeredBy: 'parent',
    registrantName: '',
    candidateName: '',
    gender: 'bride',
    age: '',
    height: '',
    maritalStatus: 'Never Married',
    city: '',
    motherTongue: 'Urdu & Telugu',
    sect: 'Sunni Hanafi',
    salah: '',
    education: '',
    profession: '',
    annualIncomeRange: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    consentConfirmed: false,
    photoPrivacy: 'blurred_until_request',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const updateField = (field: keyof RegistrationForm, value: string | boolean) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setErrorMessage('');
  };

  const validateStep = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.candidateName.trim()) {
        nextErrors.candidateName = 'Candidate name is required.';
      }

      const age = Number(formData.age);
      if (!formData.age || !Number.isInteger(age) || age < 18 || age > 75) {
        nextErrors.age = 'Age must be between 18 and 75.';
      }

      if (!formData.city.trim()) {
        nextErrors.city = 'City / District is required.';
      }
    }

    if (step === 2) {
      if (!formData.education.trim()) {
        nextErrors.education = 'Education is required.';
      }

      if (!formData.profession.trim()) {
        nextErrors.profession = 'Profession is required.';
      }
    }

    if (step === 4) {
      if (!formData.guardianName.trim()) {
        nextErrors.guardianName = 'Guardian name is required.';
      }

      if (!formData.guardianPhone.trim()) {
        nextErrors.guardianPhone = 'Guardian phone number is required.';
      } else if (!/^[+0-9\s()-]{8,20}$/.test(formData.guardianPhone.trim())) {
        nextErrors.guardianPhone = 'Enter a valid phone number.';
      }

      if (!formData.consentConfirmed) {
        nextErrors.consentConfirmed = 'Candidate consent is required.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    setStep((current) => Math.min(4, current + 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateStep()) return;

    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setErrorMessage('Please sign in before submitting your registration.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const initials = formData.candidateName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const newProfile = {
        id: firebaseUser.uid,
        registeredBy: formData.registeredBy,
        registrantName:
          formData.registrantName.trim() ||
          formData.guardianName.trim() ||
          formData.candidateName.trim(),
        candidateName: formData.candidateName.trim(),
        candidateConsentConfirmed: formData.consentConfirmed,
        candidateConsentAt: new Date().toISOString(),
        gender: formData.gender,
        age: Number(formData.age),
        height: formData.height,
        maritalStatus: formData.maritalStatus,
        city: formData.city.trim(),
        stateCountry: 'Andhra Pradesh, India',
        motherTongue: formData.motherTongue,
        sect: formData.sect,
        religiousPractice: {
          salah: formData.salah,
        },
        education: formData.education.trim(),
        profession: formData.profession.trim(),
        annualIncomeRange: formData.annualIncomeRange,
        familyDetails: {
          fatherNameAndOcc: '',
          motherNameAndOcc: '',
          brothersCount: 0,
          brothersMarried: 0,
          sistersCount: 0,
          sistersMarried: 0,
          nativePlace: formData.city.trim(),
          familyValues: '',
        },
        partnerPreferences: {
          minAge: 18,
          maxAge: 75,
          educationPreference: '',
          maritalStatusPreference: [],
          locationPreference: [],
          religiosityPreference: '',
        },
        aboutCandidate: '',
        guardianWaliContact: {
          name: formData.guardianName.trim(),
          relationship: formData.guardianRelation,
          phone: formData.guardianPhone.trim(),
          preferredCallTime: '',
          visibility: 'restricted',
        },
        isVerified: false,
        verificationBadge: 'Pending admin review',
        photoUrl: undefined,
        photos: [],
        photoPrivacy: formData.photoPrivacy,
        avatarInitials: initials || 'NP',
        avatarBgColor:
          formData.gender === 'bride' ? '#047857' : '#1e3a8a',
        createdAt: new Date().toISOString(),
        interestsCount: 0,
      } as unknown as MatrimonyProfile;

      onProfileCreated(newProfile);
      setSubmittedSuccess(true);
    } catch (error) {
      console.error('Registration submission failed:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Registration could not be submitted. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900';

  const labelClass =
    'block text-xs font-semibold text-stone-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">

        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div>
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              Nikah Pakka Registration
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Register a matrimonial profile securely.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg"
            aria-label="Close registration"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Registration Submitted
            </h3>

            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              The registration details for{' '}
              <strong>{formData.candidateName}</strong> have been submitted
              to the application. The profile is not verified or approved yet.
              An administrator must review it before approval.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmittedSuccess(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">

            <div className="grid grid-cols-4 gap-2 mb-8 pb-4 border-b border-stone-200 text-[11px] font-semibold text-center">
              {['Particulars', 'Deen & Career', 'Photo Privacy', 'Wali & Consent'].map(
                (name, index) => (
                  <div
                    key={name}
                    className={step >= index + 1 ? 'text-emerald-800' : 'text-stone-400'}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-1 text-[10px] ${
                      step >= index + 1
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {index + 1}
                    </span>
                    {name}
                  </div>
                )
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Who is Registering?</label>
                    <select
                      value={formData.registeredBy}
                      onChange={(e) => updateField('registeredBy', e.target.value)}
                      className={inputClass}
                    >
                      <option value="parent">Parent</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="relative">Relative</option>
                      <option value="self">Myself</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Candidate Full Name *</label>
                    <input
                      value={formData.candidateName}
                      onChange={(e) => updateField('candidateName', e.target.value)}
                      placeholder="Candidate full name"
                      className={inputClass}
                    />
                    {errors.candidateName && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.candidateName}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Candidate Gender *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['bride', 'groom'] as const).map((gender) => (
                        <button
                          type="button"
                          key={gender}
                          onClick={() => updateField('gender', gender)}
                          className={`py-2 px-3 text-xs rounded-lg border ${
                            formData.gender === gender
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          {gender === 'bride' ? 'Bride (Dulhan)' : 'Groom (Dulha)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Age *</label>
                      <input
                        type="number"
                        min="18"
                        max="75"
                        value={formData.age}
                        onChange={(e) => updateField('age', e.target.value)}
                        className={inputClass}
                      />
                      {errors.age && <p className="text-[11px] text-rose-600 mt-1">{errors.age}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Height</label>
                      <input
                        value={formData.height}
                        onChange={(e) => updateField('height', e.target.value)}
                        placeholder={`e.g. 5'6"`}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => updateField('maritalStatus', e.target.value)}
                      className={inputClass}
                    >
                      <option>Never Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Current City / District *</label>
                    <input
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g. Yanam, Kakinada, Rajahmundry"
                      className={inputClass}
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Mother Tongue</label>
                    <select
                      value={formData.motherTongue}
                      onChange={(e) => updateField('motherTongue', e.target.value)}
                      className={inputClass}
                    >
                      <option>Urdu & Telugu</option>
                      <option>Urdu</option>
                      <option>Telugu</option>
                      <option>Hindi / Urdu</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Sect / Maslak</label>
                    <select
                      value={formData.sect}
                      onChange={(e) => updateField('sect', e.target.value)}
                      className={inputClass}
                    >
                      <option>Sunni Hanafi</option>
                      <option>Sunni Shafi'i</option>
                      <option>Ahl-e-Hadith</option>
                      <option>Deen First / General Sunni</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Salah Practice</label>
                    <select
                      value={formData.salah}
                      onChange={(e) => updateField('salah', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select practice</option>
                      <option>5 times daily</option>
                      <option>Regularly</option>
                      <option>Usually</option>
                      <option>Striving to improve</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Education / Qualification *</label>
                    <input
                      value={formData.education}
                      onChange={(e) => updateField('education', e.target.value)}
                      placeholder="e.g. B.Tech, MBBS, MBA"
                      className={inputClass}
                    />
                    {errors.education && <p className="text-[11px] text-rose-600 mt-1">{errors.education}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Profession / Occupation *</label>
                    <input
                      value={formData.profession}
                      onChange={(e) => updateField('profession', e.target.value)}
                      placeholder="Current occupation"
                      className={inputClass}
                    />
                    {errors.profession && <p className="text-[11px] text-rose-600 mt-1">{errors.profession}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Annual Income Bracket (Optional)</label>
                    <select
                      value={formData.annualIncomeRange}
                      onChange={(e) => updateField('annualIncomeRange', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Prefer not to say</option>
                      <option>Below ₹5 Lakhs</option>
                      <option>₹5 - 8 Lakhs</option>
                      <option>₹8 - 12 Lakhs</option>
                      <option>₹12 - 18 Lakhs</option>
                      <option>₹18 - 30 Lakhs</option>
                      <option>₹30 Lakhs+ / NRI</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs flex gap-3">
                    <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Photo and document uploads are temporarily unavailable.</p>
                      <p className="mt-1 leading-relaxed">
                        Firebase Storage is not enabled on the current project plan.
                        This form will not store photos or identity documents in Firestore.
                        You can complete the profile now and provide photos through a
                        secure upload process when Storage is configured.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Photo Privacy Preference</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => updateField('photoPrivacy', 'blurred_until_request')}
                        className={`w-full p-3 rounded-lg border text-left text-xs ${
                          formData.photoPrivacy === 'blurred_until_request'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                            : 'bg-white border-stone-300 text-stone-600'
                        }`}
                      >
                        <strong>Blurred until request</strong>
                        <p className="text-[11px] mt-1">Preferred privacy setting.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateField('photoPrivacy', 'visible')}
                        className={`w-full p-3 rounded-lg border text-left text-xs ${
                          formData.photoPrivacy === 'visible'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                            : 'bg-white border-stone-300 text-stone-600'
                        }`}
                      >
                        <strong>Visible to members</strong>
                        <p className="text-[11px] mt-1">Choose this only when photos have been uploaded securely.</p>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
                    Identity verification is not performed by this form.
                    Do not enter Aadhaar, PAN, passport or driving licence numbers here.
                    An administrator must review identity evidence separately before
                    a profile can be verified.
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    Guardian details are collected for registration purposes.
                    They should not be displayed publicly.
                  </div>

                  <div>
                    <label className={labelClass}>Registrant Name (Optional)</label>
                    <input
                      value={formData.registrantName}
                      onChange={(e) => updateField('registrantName', e.target.value)}
                      placeholder="Name of person submitting this form"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Guardian / Wali Name *</label>
                    <input
                      value={formData.guardianName}
                      onChange={(e) => updateField('guardianName', e.target.value)}
                      placeholder="Guardian's full name"
                      className={inputClass}
                    />
                    {errors.guardianName && <p className="text-[11px] text-rose-600 mt-1">{errors.guardianName}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Relationship to Candidate</label>
                    <select
                      value={formData.guardianRelation}
                      onChange={(e) => updateField('guardianRelation', e.target.value)}
                      className={inputClass}
                    >
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Elder Brother</option>
                      <option>Uncle</option>
                      <option>Self / Candidate</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Guardian Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => updateField('guardianPhone', e.target.value)}
                      placeholder="Guardian contact number"
                      className={inputClass}
                    />
                    {errors.guardianPhone && <p className="text-[11px] text-rose-600 mt-1">{errors.guardianPhone}</p>}
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentConfirmed}
                        onChange={(e) => updateField('consentConfirmed', e.target.checked)}
                        className="mt-0.5 rounded text-emerald-800"
                      />
                      <span className="text-xs text-stone-700 leading-relaxed">
                        I confirm that the candidate has given consent for this
                        registration and that the information provided is accurate.
                        I understand that registration does not mean the profile
                        has been verified or approved.
                      </span>
                    </label>
                    {errors.consentConfirmed && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.consentConfirmed}</p>
                    )}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <div className="pt-4 flex justify-between border-t border-stone-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => (current - 1) as 1 | 2 | 3 | 4)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white text-xs font-semibold rounded-lg"
                  >
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    {saving ? 'Submitting...' : 'Submit Registration'}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
