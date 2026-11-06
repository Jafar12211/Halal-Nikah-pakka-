import React, { useState } from 'react';
import {
  X,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Camera,
  UploadCloud,
  FileCheck,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Plus,
  Star,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { MatrimonyProfile, RegisteredByRole } from '../types/matrimony';
import {
  RegistrationInput,
  validateRegistrationForm,
  OFFICIAL_REGISTRATION_URL,
  maskGovtIdNumber,
  VALID_GOVT_DOC_TYPES
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<RegistrationInput & { photos: string[] }>({
    registeredBy: 'parent',
    registrantName: '',
    candidateName: '',
    gender: 'bride',
    age: 24,
    height: `5'4"`,
    maritalStatus: 'Never Married',
    city: 'Kakinada',
    motherTongue: 'Urdu & Telugu',
    sect: 'Sunni Hanafi',
    salah: '5 times daily',
    education: '',
    profession: '',
    annualIncomeRange: '₹8 - 12 Lakhs',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    consentConfirmed: true,
    photoFile: '',
    photos: [],
    photoPrivacy: 'blurred_until_request',
    govtIdType: 'Aadhaar Card',
    govtIdNumber: '',
    govtIdFileName: '',
    govtIdFile: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - (formData.photos?.length || 0);
    if (remainingSlots <= 0) {
      setErrors((prev) => ({ ...prev, photo: 'Maximum 5 pictures allowed per profile.' }));
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validate size
    for (const f of filesToUpload) {
      if (f.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'Each photo size must be under 5MB.' }));
        return;
      }
    }

    const readers = filesToUpload.map((f) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(f);
      });
    });

    Promise.all(readers).then((newPhotos) => {
      setFormData((prev) => {
        const combined = [...(prev.photos || []), ...newPhotos].slice(0, 5);
        return {
          ...prev,
          photos: combined,
          photoFile: combined[0] || '',
        };
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo;
        return next;
      });
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData((prev) => {
      const updated = prev.photos.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        photos: updated,
        photoFile: updated[0] || '',
      };
    });
  };

  const handleSetPrimaryPhoto = (indexToPrimary: number) => {
    setFormData((prev) => {
      const selected = prev.photos[indexToPrimary];
      const rest = prev.photos.filter((_, idx) => idx !== indexToPrimary);
      const updated = [selected, ...rest];
      return {
        ...prev,
        photos: updated,
        photoFile: updated[0] || '',
      };
    });
  };

  const handleGovtIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, govtId: 'Document size should be under 8MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          govtIdFile: base64Url,
          govtIdFileName: file.name,
        }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.govtId;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhotos = () => {
    // Dignified sample portrait photos (sets 3 pictures)
    const samples =
      formData.gender === 'bride'
        ? [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
          ]
        : [
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
          ];
    setFormData((prev) => ({
      ...prev,
      photos: samples,
      photoFile: samples[0],
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
  };

  const handleUseSampleGovtId = (docType: 'Aadhaar Card' | 'PAN Card' = 'Aadhaar Card') => {
    setFormData((prev) => ({
      ...prev,
      govtIdType: docType,
      govtIdFileName:
        docType === 'Aadhaar Card'
          ? 'Aadhaar_UIDAI_Masked_Verified.pdf'
          : 'PAN_Card_Masked_Verified.pdf',
      govtIdNumber: docType === 'Aadhaar Card' ? 'XXXX-XXXX-7860' : 'XXXX-XX-4456',
      govtIdFile: 'sample_verified_document',
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.govtId;
      return next;
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      const errs: Record<string, string> = {};
      if (!formData.candidateName.trim()) errs.candidateName = 'Candidate name is required.';
      if (!formData.city.trim()) errs.city = 'City / District is required.';
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
    } else if (step === 3) {
      // Step 3: Validate Photo and Govt ID Document
      const errs: Record<string, string> = {};
      const hasPhoto = (formData.photos && formData.photos.length > 0) || !!formData.photoFile;
      if (!hasPhoto) {
        errs.photo = 'Please upload at least 1 candidate photo (you can add up to 5 pictures).';
      }
      if (!formData.govtIdFile && !formData.govtIdNumber?.trim() && !formData.govtIdFileName) {
        errs.govtId = 'Please upload a valid Govt ID document (Aadhaar, PAN, Passport, or Driving Licence).';
      }
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStep(4);
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
    const initials =
      formData.candidateName
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'NP';

    const maskedId = maskGovtIdNumber(
      formData.govtIdNumber || 'XXXX-XXXX-7860',
      formData.govtIdType
    );

    const candidatePhotos =
      formData.photos && formData.photos.length > 0
        ? formData.photos
        : formData.photoFile
        ? [formData.photoFile]
        : [];

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
      stateCountry: 'Andhra Pradesh, India',
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
        fatherNameAndOcc: formData.guardianName
          ? `${formData.guardianName} (${formData.guardianRelation})`
          : 'Respectable Family',
        motherNameAndOcc: 'Homemaker',
        brothersCount: 1,
        brothersMarried: 0,
        sistersCount: 1,
        sistersMarried: 0,
        nativePlace: formData.city,
        familyValues: 'Traditional & Practicing',
      },
      partnerPreferences: {
        minAge:
          formData.gender === 'bride'
            ? Number(formData.age)
            : Math.max(18, Number(formData.age) - 5),
        maxAge:
          formData.gender === 'bride' ? Number(formData.age) + 6 : Number(formData.age),
        educationPreference: 'Graduate or Professional degree',
        maritalStatusPreference: [formData.maritalStatus],
        locationPreference: [formData.city, 'Godavari Region & AP'],
        religiosityPreference: 'Observes 5 daily Salah, honest earnings',
      },
      aboutCandidate: `Alhamdulillah a sincere, family-oriented ${
        formData.gender === 'bride' ? 'Muslimah' : 'Muslim brother'
      } seeking a righteous spouse for the sake of Allah with family consent.`,
      guardianWaliContact: {
        name: formData.guardianName,
        relationship: formData.guardianRelation,
        phone: formData.guardianPhone,
        preferredCallTime: '6:00 PM - 9:00 PM',
        visibility: 'visible',
      },
      isVerified: false, // Submitted for Admin Review based on Photo & Identity!
      verificationBadge: 'Phone & ID Checked',
      photoUrl: candidatePhotos[0] || undefined,
      photos: candidatePhotos,
      photoPrivacy: formData.photoPrivacy || 'blurred_until_request',
      avatarInitials: initials,
      avatarBgColor: formData.gender === 'bride' ? '#047857' : '#1e3a8a',
      documents: [
        {
          id: `doc-${Date.now()}`,
          type: (formData.govtIdType as any) || 'Aadhaar Card',
          fileName: formData.govtIdFileName || `${formData.govtIdType || 'Govt_ID'}_Masked.pdf`,
          maskedId: maskedId,
          uploadedAt: new Date().toISOString().split('T')[0],
          verified: false,
          isRestricted: true,
        },
      ],
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
              Verified Muslim matrimony with photo & government ID protection.
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
              Alhamdulillah! Profile Registered & Verified
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Your profile for <strong>{formData.candidateName}</strong> with verified photo and
              government ID (<strong>{formData.govtIdType}</strong>) has been created and verified.
              It is now active in the Godavari & Yanam community directory.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors shadow-sm"
              >
                View Matches in Directory
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            {/* Steps Progress */}
            <div className="grid grid-cols-4 gap-2 mb-8 pb-4 border-b border-stone-200 text-[11px] font-semibold text-center">
              <div
                className={`flex flex-col items-center gap-1 ${
                  step >= 1 ? 'text-emerald-800 font-bold' : 'text-stone-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-600'}`}>1</span>
                <span>Particulars</span>
              </div>
              <div
                className={`flex flex-col items-center gap-1 ${
                  step >= 2 ? 'text-emerald-800 font-bold' : 'text-stone-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-600'}`}>2</span>
                <span>Deen & Career</span>
              </div>
              <div
                className={`flex flex-col items-center gap-1 ${
                  step >= 3 ? 'text-emerald-800 font-bold' : 'text-stone-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-600'}`}>3</span>
                <span>Photo & Govt ID</span>
              </div>
              <div
                className={`flex flex-col items-center gap-1 ${
                  step === 4 ? 'text-emerald-800 font-bold' : 'text-stone-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-600'}`}>4</span>
                <span>Wali & Consent</span>
              </div>
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
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                            formData.gender === 'bride'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          Bride (Dulhan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'groom' })}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                            formData.gender === 'groom'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
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
                        Current City / District *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kakinada, Yanam, Rajahmundry"
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
                        <option value="Urdu & Telugu">Urdu & Telugu</option>
                        <option value="Urdu">Urdu</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Hindi / Urdu">Hindi / Urdu</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <span>Continue to Photo & Govt ID</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Valid Photo (Up to 5 pictures) & Government ID Upload */}
              {step === 3 && (
                <div className="space-y-5">
                  {/* Notice on security & verification */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Identity & Photo Verification Standards</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        Nikah Pakka maintains strict community trust. Add up to 5 clear photographs and upload a valid government ID (strictly Aadhaar, PAN, Passport, or Driving Licence).
                      </p>
                    </div>
                  </div>

                  {/* Section 1: Candidate Photographs (Up to 5 pictures) */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-800" />
                        <h4 className="text-xs font-bold text-stone-900">
                          1. Candidate Photographs (Upload Up to 5 Pictures) *
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {formData.photos?.length || 0}/5 Added
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleUseSamplePhotos}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Add Sample Photos (3)
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      Upload up to 5 recent, dignified photographs. The first photo serves as your primary profile display.
                    </p>

                    {/* Photo Grid: 5 slots */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                      {Array.from({ length: 5 }).map((_, slotIndex) => {
                        const photoUrl = formData.photos?.[slotIndex];
                        const isPrimary = slotIndex === 0;

                        if (photoUrl) {
                          return (
                            <div
                              key={slotIndex}
                              className="relative group rounded-xl overflow-hidden border-2 border-emerald-700/50 bg-stone-900 aspect-square shadow-xs"
                            >
                              <img
                                src={photoUrl}
                                alt={`Candidate photo ${slotIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Primary badge */}
                              {isPrimary ? (
                                <span className="absolute top-1 left-1 bg-emerald-800/90 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryPhoto(slotIndex)}
                                  className="absolute top-1 left-1 bg-stone-950/70 hover:bg-emerald-800 text-white text-[8px] font-semibold px-1 py-0.5 rounded transition-colors"
                                  title="Set as primary photo"
                                >
                                  Make Cover
                                </button>
                              )}
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(slotIndex)}
                                className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full transition-colors shadow"
                                title="Remove picture"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-1 right-1 bg-stone-950/60 text-white text-[9px] font-mono px-1 rounded">
                                #{slotIndex + 1}
                              </span>
                            </div>
                          );
                        }

                        // Empty slot
                        return (
                          <label
                            key={slotIndex}
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 cursor-pointer aspect-square transition-all p-2 text-center group"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handlePhotoUpload}
                            />
                            <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center text-stone-400 group-hover:text-emerald-700 mb-1 transition-colors">
                              <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-stone-600 group-hover:text-emerald-900">
                              {slotIndex === 0 ? 'Primary Photo' : `Photo ${slotIndex + 1}`}
                            </span>
                            <span className="text-[8px] text-stone-400">Max 5MB</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Modesty Photo Privacy setting */}
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Photo Privacy Preference
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoPrivacy: 'blurred_until_request' })}
                          className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                            formData.photoPrivacy === 'blurred_until_request'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          <EyeOff className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700" />
                          <div>
                            <p className="text-[11px]">Blurred for Public</p>
                            <p className="text-[9px] text-stone-500 font-normal">
                              Islamic modesty: unblurred only after mutual interest & Guardian approval
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoPrivacy: 'visible' })}
                          className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-colors ${
                            formData.photoPrivacy === 'visible'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                              : 'bg-white border-stone-300 text-stone-600'
                          }`}
                        >
                          <Eye className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700" />
                          <div>
                            <p className="text-[11px]">Visible to Members</p>
                            <p className="text-[9px] text-stone-500 font-normal">
                              Visible to logged-in, verified matrimony seekers
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {errors.photo && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.photo}</span>
                      </p>
                    )}
                  </div>

                  {/* Section 2: Government Identity Proof */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-800" />
                        <h4 className="text-xs font-bold text-stone-900">
                          2. Valid Government ID Document *
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUseSampleGovtId('Aadhaar Card')}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Sample Aadhaar
                        </button>
                        <span className="text-stone-300">·</span>
                        <button
                          type="button"
                          onClick={() => handleUseSampleGovtId('PAN Card')}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Sample PAN
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      Valid identity documents are strictly limited to <strong>Aadhaar Card</strong>, <strong>PAN Card</strong>, <strong>Passport</strong>, or <strong>Driving Licence</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Valid Document Type *
                        </label>
                        <select
                          value={formData.govtIdType}
                          onChange={(e) => setFormData({ ...formData, govtIdType: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 font-medium"
                        >
                          <option value="Aadhaar Card">Aadhaar Card (UIDAI Masked)</option>
                          <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                          <option value="Passport">Passport (Govt of India)</option>
                          <option value="Driving Licence">Driving Licence (Transport Dept)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Masked ID Number / Last 4 Digits *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. XXXX-XXXX-7860 or last 4 digits"
                          value={formData.govtIdNumber}
                          onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Document Upload Button */}
                    <div className="pt-1">
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold shadow-xs transition-colors w-full">
                        <UploadCloud className="w-4 h-4 text-emerald-700" />
                        <span>
                          {formData.govtIdFileName
                            ? `Selected: ${formData.govtIdFileName}`
                            : `Upload ${formData.govtIdType || 'Govt ID'} Document (PDF, PNG, JPG)`}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleGovtIdUpload}
                        />
                      </label>
                    </div>

                    {/* Government ID Privacy Guarantee Reassurance */}
                    <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Govt ID & Photo Confidentiality Guarantee:</p>
                        <p className="text-[10px] text-amber-900/90 mt-0.5 leading-relaxed">
                          Identity documents and uploaded pictures are reviewed strictly by authorized matrimony administrators (<strong>jafarmd0007@gmail.com</strong>). Full ID documents are NEVER revealed to other users or public visitors.
                        </p>
                      </div>
                    </div>

                    {errors.govtId && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.govtId}</span>
                      </p>
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
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <span>Continue to Guardian & Consent</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Guardian Details & Consent */}
              {step === 4 && (
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

                  {/* Verification Summary Chip */}
                  <div className="p-3 bg-stone-100/90 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-800" />
                      <span>
                        Verified with {formData.govtIdType || 'Govt ID'}:{' '}
                        <strong className="font-mono text-stone-900">
                          {maskGovtIdNumber(formData.govtIdNumber || 'XXXX-XXXX-7860', formData.govtIdType)}
                        </strong>
                      </span>
                    </div>
                    {((formData.photos && formData.photos.length > 0) || formData.photoFile) && (
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        📷 {formData.photos && formData.photos.length > 0 ? `${formData.photos.length} Photos` : 'Photo'} Attached
                      </span>
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
                        I confirm that the candidate has given their full consent, the uploaded photo and government ID are valid, and this registration is made with sincere intentions for Nikah (Marriage).
                      </span>
                    </label>
                    {errors.consentConfirmed && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.consentConfirmed}</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
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
                      <span>Complete Verified Registration</span>
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
