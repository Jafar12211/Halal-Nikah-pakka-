
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
  Camera,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { auth } from '../services/firebase';
import { MatrimonyProfile, RegisteredByRole } from '../types/matrimony';
import { uploadProfilePhoto, uploadGovernmentId, deleteStorageFile, type GovernmentDocumentType } from '../services/firebaseStorageService';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (newProfile: MatrimonyProfile) => Promise<void>;
}

type RegistrationForm = {
  registeredBy: RegisteredByRole;
  registrantName: string;
  candidateName: string;
  gender: 'bride' | 'groom';
  age: string;
  dob: string;
  height: string;
  maritalStatus: string;
  city: string;
  motherTongue: string;
  sect: string;
  salah: string;
  education: string;
  profession: string;
  annualIncomeRange: string;
  employedIn: string;
  religion: string;
  quranRecitation: string;
  hijabOrBeard: string;
  halalDiet: string;
  hajjUmrahDone: string;
  fastingRamadan: string;
  familyStatus: string;
  fatherNameAndOcc: string;
  motherNameAndOcc: string;
  brothersCount: string;
  brothersMarried: string;
  sistersCount: string;
  sistersMarried: string;
  familyValues: string;
  nativePlace: string;
  aboutCandidate: string;
  preferredMinAge: string;
  preferredMaxAge: string;
  preferredHeight: string;
  educationPreference: string;
  maritalStatusPreference: string;
  locationPreference: string;
  religiosityPreference: string;
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
    dob: '',
    height: '',
    maritalStatus: 'Never Married',
    city: '',
    motherTongue: 'Urdu & Telugu',
    sect: 'Sunni Hanafi',
    salah: '',
    education: '',
    profession: '',
    annualIncomeRange: '',
    employedIn: '',
    religion: 'Islam',
    quranRecitation: '',
    hijabOrBeard: '',
    halalDiet: 'true',
    hajjUmrahDone: 'false',
    fastingRamadan: 'true',
    familyStatus: '',
    fatherNameAndOcc: '',
    motherNameAndOcc: '',
    brothersCount: '0',
    brothersMarried: '0',
    sistersCount: '0',
    sistersMarried: '0',
    familyValues: '',
    nativePlace: '',
    aboutCandidate: '',
    preferredMinAge: '21',
    preferredMaxAge: '35',
    preferredHeight: '',
    educationPreference: '',
    maritalStatusPreference: 'Never Married',
    locationPreference: '',
    religiosityPreference: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    consentConfirmed: false,
    photoPrivacy: 'blurred_until_request',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<NonNullable<MatrimonyProfile['documents']>>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentType, setDocumentType] = useState<'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Driving Licence' | 'Voter ID' | 'Other Government ID'>('Aadhaar Card');
  const [maskedDocumentId, setMaskedDocumentId] = useState('');


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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!auth.currentUser || !files.length) return;
    if (uploadedPhotos.length + files.length > 5) {
      setErrorMessage('You can upload a maximum of five candidate photographs.');
      return;
    }
    setUploadingPhotos(true);
    setErrorMessage('');
    try {
      const paths: string[] = [];
      for (const file of files) paths.push(await uploadProfilePhoto(auth.currentUser.uid, file));
      setUploadedPhotos((previous) => [...previous, ...paths]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Photograph upload failed. Please try again.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleIdentityUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!auth.currentUser || !file) return;
    if (!maskedDocumentId.trim()) {
      setErrorMessage('Enter a masked ID reference only (for example, XXXX-1234). Never enter the full ID number.');
      return;
    }
    if (uploadedDocuments.length >= 5) {
      setErrorMessage('You can attach up to five government identity documents.');
      return;
    }
    const typeMap: Record<typeof documentType, GovernmentDocumentType> = {
      'Aadhaar Card': 'aadhaar',
      'PAN Card': 'pan',
      Passport: 'passport',
      'Driving Licence': 'driving_license',
      'Voter ID': 'voter_id',
      'Other Government ID': 'other',
    };
    setUploadingDocument(true);
    setErrorMessage('');
    try {
      const uploaded = await uploadGovernmentId(auth.currentUser.uid, file, typeMap[documentType]);
      setUploadedDocuments((previous) => [...previous, {
        id: crypto.randomUUID(),
        type: documentType,
        fileName: uploaded.fileName,
        storagePath: uploaded.storagePath,
        maskedId: maskedDocumentId.trim(),
        uploadedAt: new Date().toISOString(),
        verified: false,
        isRestricted: true,
      }]);
      setMaskedDocumentId('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Identity document upload failed. Please try again.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const removeUploadedFile = async (storagePath: string, kind: 'photo' | 'document') => {
    try {
      await deleteStorageFile(storagePath);
      if (kind === 'photo') setUploadedPhotos((previous) => previous.filter((path) => path !== storagePath));
      else setUploadedDocuments((previous) => previous.filter((item) => item.storagePath !== storagePath));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The uploaded file could not be removed.');
    }
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
    if (uploadingPhotos || uploadingDocument) {
      setErrorMessage('Please wait for all selected uploads to finish before submitting.');
      return;
    }

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
        dob: formData.dob,
        height: formData.height,
        maritalStatus: formData.maritalStatus,
        city: formData.city.trim(),
        stateCountry: 'Andhra Pradesh, India',
        motherTongue: formData.motherTongue,
        sect: formData.sect,
        religion: { name: formData.religion },
        religiousPractice: {
          salah: formData.salah,
          hijabOrBeard: formData.hijabOrBeard,
          quranRecitation: formData.quranRecitation,
          halalDiet: formData.halalDiet === 'true',
          hajjUmrahDone: formData.hajjUmrahDone === 'true',
          fastingRamadan: formData.fastingRamadan === 'true',
        },
        education: formData.education.trim(),
        profession: formData.profession.trim(),
        employedIn: formData.employedIn,
        annualIncomeRange: formData.annualIncomeRange,
        familyDetails: {
          fatherNameAndOcc: formData.fatherNameAndOcc.trim(),
          motherNameAndOcc: formData.motherNameAndOcc.trim(),
          brothersCount: Number(formData.brothersCount) || 0,
          brothersMarried: Number(formData.brothersMarried) || 0,
          sistersCount: Number(formData.sistersCount) || 0,
          sistersMarried: Number(formData.sistersMarried) || 0,
          nativePlace: formData.nativePlace.trim() || formData.city.trim(),
          familyValues: formData.familyValues,
          familyStatus: formData.familyStatus,
        },
        partnerPreferences: {
          minAge: Number(formData.preferredMinAge) || 18,
          maxAge: Number(formData.preferredMaxAge) || 75,
          minHeight: formData.preferredHeight,
          educationPreference: formData.educationPreference,
          maritalStatusPreference: formData.maritalStatusPreference ? [formData.maritalStatusPreference] : [],
          locationPreference: formData.locationPreference.split(',').map((value) => value.trim()).filter(Boolean),
          religiosityPreference: formData.religiosityPreference,
        },
        aboutCandidate: formData.aboutCandidate.trim(),
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
        photos: uploadedPhotos,
        documents: uploadedDocuments,
        photoPrivacy: formData.photoPrivacy,
        avatarInitials: initials || 'NP',
        avatarBgColor:
          formData.gender === 'bride' ? '#047857' : '#1e3a8a',
        createdAt: new Date().toISOString(),
        interestsCount: 0,
      } as unknown as MatrimonyProfile;

      await onProfileCreated(newProfile);
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
                      <label className={labelClass}>Date of Birth</label>
                      <input type="date" max={new Date().toISOString().slice(0, 10)} value={formData.dob} onChange={(e) => updateField('dob', e.target.value)} className={inputClass} />
                    </div>
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
                    <label className={labelClass}>Employment Type</label>
                    <select value={formData.employedIn} onChange={(e) => updateField('employedIn', e.target.value)} className={inputClass}>
                      <option value="">Select employment type</option><option>Private Sector</option><option>Government / PSU</option><option>Business / Self-Employed</option><option>Defense / Healthcare</option><option>Homemaker</option><option>Student</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>About the Candidate</label>
                    <textarea value={formData.aboutCandidate} onChange={(e) => updateField('aboutCandidate', e.target.value)} maxLength={1200} rows={3} placeholder="Share personality, interests, values and marriage expectations (up to 1,200 characters)." className={inputClass} />
                    <p className="text-[10px] text-stone-400 text-right">{formData.aboutCandidate.length}/1200</p>
                  </div>
                  <div className="border-t border-stone-200 pt-4">
                    <h3 className="text-sm font-bold text-emerald-950">Religious & Lifestyle Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div><label className={labelClass}>Quran Recitation</label><select value={formData.quranRecitation} onChange={(e) => updateField('quranRecitation', e.target.value)} className={inputClass}><option value="">Select</option><option>Daily</option><option>Weekly</option><option>Regular</option><option>Learning</option></select></div>
                      <div><label className={labelClass}>Hijab / Beard / Modesty</label><select value={formData.hijabOrBeard} onChange={(e) => updateField('hijabOrBeard', e.target.value)} className={inputClass}><option value="">Prefer not to say</option><option>Observes Hijab/Niqab</option><option>Full Beard</option><option>Trimmed Beard</option><option>Modest Dressing</option><option>Not strictly</option></select></div>
                      <div><label className={labelClass}>Halal Diet</label><select value={formData.halalDiet} onChange={(e) => updateField('halalDiet', e.target.value)} className={inputClass}><option value="true">Yes</option><option value="false">Prefer not to say</option></select></div>
                      <div><label className={labelClass}>Hajj / Umrah Completed</label><select value={formData.hajjUmrahDone} onChange={(e) => updateField('hajjUmrahDone', e.target.value)} className={inputClass}><option value="false">No / Prefer not to say</option><option value="true">Yes</option></select></div>
                      <div><label className={labelClass}>Fasting in Ramadan</label><select value={formData.fastingRamadan} onChange={(e) => updateField('fastingRamadan', e.target.value)} className={inputClass}><option value="true">Yes</option><option value="false">Prefer not to say</option></select></div>
                    </div>
                  </div>
                  <div className="border-t border-stone-200 pt-4">
                    <h3 className="text-sm font-bold text-emerald-950">Family Background</h3>
                    <div className="space-y-3 mt-3">
                      <div><label className={labelClass}>Father's Name & Occupation</label><input value={formData.fatherNameAndOcc} onChange={(e) => updateField('fatherNameAndOcc', e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Mother's Name & Occupation</label><input value={formData.motherNameAndOcc} onChange={(e) => updateField('motherNameAndOcc', e.target.value)} className={inputClass} /></div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([['brothersCount','Brothers'],['brothersMarried','Married brothers'],['sistersCount','Sisters'],['sistersMarried','Married sisters']] as const).map(([field,label]) => <div key={field}><label className={labelClass}>{label}</label><input type="number" min="0" max="20" value={formData[field]} onChange={(e) => updateField(field, e.target.value)} className={inputClass} /></div>)}
                      </div>
                      <div><label className={labelClass}>Family Financial Status</label><select value={formData.familyStatus} onChange={(e) => updateField('familyStatus', e.target.value)} className={inputClass}><option value="">Prefer not to say</option><option>Affluent</option><option>Upper Middle Class</option><option>Middle Class</option></select></div>
                      <div><label className={labelClass}>Family Values</label><select value={formData.familyValues} onChange={(e) => updateField('familyValues', e.target.value)} className={inputClass}><option value="">Select family values</option><option>Traditional & Practicing</option><option>Moderate Religious</option><option>Modern Religious</option></select></div>
                      <div><label className={labelClass}>Native Place</label><input value={formData.nativePlace} onChange={(e) => updateField('nativePlace', e.target.value)} placeholder="Village / town / district" className={inputClass} /></div>
                    </div>
                  </div>
                  <div className="border-t border-stone-200 pt-4">
                    <h3 className="text-sm font-bold text-emerald-950">Partner Preferences</h3>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div><label className={labelClass}>Preferred Minimum Age</label><input type="number" min="18" max="75" value={formData.preferredMinAge} onChange={(e) => updateField('preferredMinAge', e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Preferred Maximum Age</label><input type="number" min="18" max="75" value={formData.preferredMaxAge} onChange={(e) => updateField('preferredMaxAge', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="space-y-3 mt-3">
                      <div><label className={labelClass}>Preferred Height</label><input value={formData.preferredHeight} onChange={(e) => updateField('preferredHeight', e.target.value)} placeholder="Optional" className={inputClass} /></div>
                      <div><label className={labelClass}>Preferred Education</label><input value={formData.educationPreference} onChange={(e) => updateField('educationPreference', e.target.value)} placeholder="e.g. Graduate, professional" className={inputClass} /></div>
                      <div><label className={labelClass}>Preferred Marital Status</label><select value={formData.maritalStatusPreference} onChange={(e) => updateField('maritalStatusPreference', e.target.value)} className={inputClass}><option>Never Married</option><option>Divorced</option><option>Widowed</option><option>Any</option></select></div>
                      <div><label className={labelClass}>Preferred Locations (comma separated)</label><input value={formData.locationPreference} onChange={(e) => updateField('locationPreference', e.target.value)} placeholder="Yanam, Kakinada, Rajahmundry" className={inputClass} /></div>
                      <div><label className={labelClass}>Religious Preference</label><input value={formData.religiosityPreference} onChange={(e) => updateField('religiosityPreference', e.target.value)} placeholder="Optional" className={inputClass} /></div>
                    </div>
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
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950">
                    <strong>Secure uploads for administrator verification</strong>
                    <p className="mt-1">Photos and ID images are compressed and stored in private Firestore records. They are not exposed in the public directory unless you separately choose photo visibility.</p>
                  </div>

                  <section className="rounded-xl border border-stone-200 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900">
                      <Camera className="w-4 h-4 text-emerald-800" />
                      <strong>Candidate photographs ({uploadedPhotos.length}/5)</strong>
                    </div>
                    <p className="text-xs text-stone-600">Upload up to five clear candidate photos. JPG, PNG or WEBP, up to 5 MB each. Each photo is compressed before secure storage.</p>
                    <label className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer">
                      <Camera className="w-4 h-4" /> {uploadingPhotos ? 'Uploading photos…' : 'Choose candidate photos'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploadingPhotos || uploadedPhotos.length >= 5} onChange={handlePhotoUpload} className="sr-only" />
                    </label>
                    {uploadedPhotos.map((path, index) => (
                      <div key={path} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 p-2 text-xs">
                        <span className="truncate">Candidate photo {index + 1} · Uploaded securely</span>
                        <button type="button" onClick={() => void removeUploadedFile(path, 'photo')} className="text-rose-700 font-semibold"><Trash2 className="inline h-3.5 w-3.5" /> Remove</button>
                      </div>
                    ))}
                  </section>

                  <section className="rounded-xl border border-stone-200 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900">
                      <FileCheck className="w-4 h-4 text-emerald-800" />
                      <strong>Government identity document</strong>
                    </div>
                    <p className="text-xs text-stone-600">Accepted options: Aadhaar Card, PAN Card, Passport, Driving Licence, Voter ID, or another valid government-issued identity document. JPG, PNG or WEBP image up to 5 MB.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select value={documentType} onChange={(event) => setDocumentType(event.target.value as typeof documentType)} className={inputClass}>
                        <option>Aadhaar Card</option><option>PAN Card</option><option>Passport</option><option>Driving Licence</option><option>Voter ID</option><option>Other Government ID</option>
                      </select>
                      <input value={maskedDocumentId} onChange={(event) => setMaskedDocumentId(event.target.value)} maxLength={32} placeholder="Masked reference only (e.g. XXXX-1234)" className={inputClass} />
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer">
                      <Lock className="w-4 h-4" /> {uploadingDocument ? 'Uploading ID…' : 'Upload private ID image'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingDocument || uploadedDocuments.length >= 5} onChange={handleIdentityUpload} className="sr-only" />
                    </label>
                    {uploadedDocuments.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 p-2 text-xs">
                        <span className="truncate">{item.type} · {item.maskedId} · Pending admin review</span>
                        <button type="button" onClick={() => void removeUploadedFile(item.storagePath, 'document')} className="text-rose-700 font-semibold"><Trash2 className="inline h-3.5 w-3.5" /> Remove</button>
                      </div>
                    ))}
                    <p className="text-[11px] text-rose-700">Never enter or upload your full Aadhaar/PAN number in a text field. Only the masked reference is collected here. The actual document image remains private to the candidate and authorized administrators.</p>
                  </section>

                  <div>
                    <label className={labelClass}>Photo Privacy Preference</label>
                    <div className="space-y-2">
                      <button type="button" onClick={() => updateField('photoPrivacy', 'blurred_until_request')} className={`w-full p-3 rounded-lg border text-left text-xs ${formData.photoPrivacy === 'blurred_until_request' ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white border-stone-300 text-stone-600'}`}>
                        <strong>Private — not visible to other members</strong>
                        <p className="text-[11px] mt-1">Only you and authorized administrators can access these photos.</p>
                      </button>
                      <button type="button" onClick={() => updateField('photoPrivacy', 'visible')} className={`w-full p-3 rounded-lg border text-left text-xs ${formData.photoPrivacy === 'visible' ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white border-stone-300 text-stone-600'}`}>
                        <strong>Visible to approved members</strong>
                        <p className="text-[11px] mt-1">Photos may be shown only after the profile is approved and verified.</p>
                      </button>
                    </div>
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
