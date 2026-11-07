
import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Camera,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';

import {
  UserProfile,
  UserAccount,
  DistrictAP,
} from '../types/database';

import { GODAVARI_DISTRICTS } from '../services/storageService';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveProfileToFirestore } from '../services/firestoreService';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onProfileUpdated: () => void;
}

type Tab = 'personal' | 'deen' | 'family' | 'preferences' | 'privacy';

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null);

  // Personal details
  const [candidateName, setCandidateName] = useState('');
  const [gender, setGender] = useState<'groom' | 'bride'>('bride');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(`5'4"`);
  const [maritalStatus, setMaritalStatus] =
    useState<UserProfile['maritalStatus']>('Never Married');
  const [district, setDistrict] = useState<DistrictAP>('Kakinada District');
  const [mandalCity, setMandalCity] = useState('');
  const [motherTongue, setMotherTongue] = useState('Urdu & Telugu');

  // Religious and career details
  const [sect, setSect] = useState('Sunni Hanafi');
  const [salah, setSalah] =
    useState<UserProfile['religion']['salah']>('5 times daily');
  const [hijabOrBeard, setHijabOrBeard] =
    useState<UserProfile['religion']['hijabOrBeard']>('Observes Hijab/Niqab');
  const [quranRecitation, setQuranRecitation] =
    useState<UserProfile['religion']['quranRecitation']>('Daily');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [employedIn, setEmployedIn] =
    useState<UserProfile['employedIn']>('Private Sector');
  const [annualIncomeRange, setAnnualIncomeRange] = useState('');

  // Family
  const [fatherNameAndOcc, setFatherNameAndOcc] = useState('');
  const [motherNameAndOcc, setMotherNameAndOcc] = useState('');
  const [brothersCount, setBrothersCount] = useState(0);
  const [brothersMarried, setBrothersMarried] = useState(0);
  const [sistersCount, setSistersCount] = useState(0);
  const [sistersMarried, setSistersMarried] = useState(0);
  const [nativePlace, setNativePlace] = useState('');
  const [familyStatus, setFamilyStatus] =
    useState<UserProfile['familyDetails']['familyStatus']>('Upper Middle Class');
  const [familyValues, setFamilyValues] =
    useState<UserProfile['familyDetails']['familyValues']>('Traditional & Practicing');

  // Partner preferences
  const [minAgePref, setMinAgePref] = useState(24);
  const [maxAgePref, setMaxAgePref] = useState(30);
  const [mustHaves, setMustHaves] = useState<string[]>([]);
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);
  const [newMustHave, setNewMustHave] = useState('');
  const [newDealBreaker, setNewDealBreaker] = useState('');
  const [aboutCandidate, setAboutCandidate] = useState('');

  // Guardian contact
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [photoPrivacy, setPhotoPrivacy] =
    useState<UserProfile['photoPrivacy']>('blurred_until_request');

  // Only existing image URLs can be retained.
  // Base64 photos cannot be uploaded without Firebase Storage.
  const [photos, setPhotos] = useState<string[]>([]);

  // Load the signed-in user's private Firestore registration.
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      setStatusMsg('');

      try {
        const profileRef = doc(db, 'registrations', currentUser.id);
        const snapshot = await getDoc(profileRef);

        if (cancelled) return;

        if (!snapshot.exists()) {
          setExistingProfile(null);
          setCandidateName(currentUser.name || '');
          setErrorMsg('No saved profile was found. You can create your profile using the registration form.');
          return;
        }

        const data = {
          ...snapshot.data(),
          id: snapshot.id,
          userId: currentUser.id,
        } as UserProfile;

        setExistingProfile(data);

        setCandidateName(data.candidateName || '');
        setGender(data.gender || 'bride');
        setAge(data.age || 25);
        setHeight(data.height || `5'4"`);
        setMaritalStatus(data.maritalStatus || 'Never Married');
        setDistrict(data.district || 'Kakinada District');
        setMandalCity(data.mandalCity || '');
        setMotherTongue(data.motherTongue || '');

        setSect(data.religion?.sect || 'Sunni Hanafi');
        setSalah(data.religion?.salah || '5 times daily');
        setHijabOrBeard(data.religion?.hijabOrBeard || 'Observes Hijab/Niqab');
        setQuranRecitation(data.religion?.quranRecitation || 'Daily');

        setEducation(data.education || '');
        setProfession(data.profession || '');
        setEmployedIn(data.employedIn || 'Private Sector');
        setAnnualIncomeRange(data.annualIncomeRange || '');

        setFatherNameAndOcc(data.familyDetails?.fatherNameAndOcc || '');
        setMotherNameAndOcc(data.familyDetails?.motherNameAndOcc || '');
        setBrothersCount(data.familyDetails?.brothersCount || 0);
        setBrothersMarried(data.familyDetails?.brothersMarried || 0);
        setSistersCount(data.familyDetails?.sistersCount || 0);
        setSistersMarried(data.familyDetails?.sistersMarried || 0);
        setNativePlace(data.familyDetails?.nativePlace || '');
        setFamilyStatus(data.familyDetails?.familyStatus || 'Upper Middle Class');
        setFamilyValues(data.familyDetails?.familyValues || 'Traditional & Practicing');

        setMinAgePref(data.partnerPreferences?.minAge || 24);
        setMaxAgePref(data.partnerPreferences?.maxAge || 30);

        setMustHaves(data.mustHaves || []);
        setDealBreakers(data.dealBreakers || []);
        setAboutCandidate(data.aboutCandidate || '');

        setGuardianName(data.guardianWaliContact?.name || '');
        setGuardianRelationship(data.guardianWaliContact?.relationship || 'Father');
        setGuardianPhone(data.guardianWaliContact?.phone || '');

        setPhotoPrivacy(data.photoPrivacy || 'blurred_until_request');

        setPhotos(
          (data.photos || []).filter(
            (photo) => typeof photo === 'string' && !photo.startsWith('data:')
          )
        );
      } catch (error) {
        console.error('Could not load Firestore profile:', error);
        if (!cancelled) {
          setErrorMsg('Unable to load your profile. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const addMustHave = () => {
    if (!newMustHave.trim()) return;
    setMustHaves((previous) => [...previous, newMustHave.trim()]);
    setNewMustHave('');
  };

  const addDealBreaker = () => {
    if (!newDealBreaker.trim()) return;
    setDealBreakers((previous) => [...previous, newDealBreaker.trim()]);
    setNewDealBreaker('');
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMsg('Please sign in before saving your profile.');
      return;
    }

    if (!candidateName.trim()) {
      setErrorMsg('Please enter the candidate name.');
      setActiveTab('personal');
      return;
    }

    if (!Number.isFinite(age) || age < 18 || age > 100) {
      setErrorMsg('Candidate age must be between 18 and 100.');
      setActiveTab('personal');
      return;
    }

    if (!education.trim() || !profession.trim()) {
      setErrorMsg('Please enter education and profession details.');
      setActiveTab('deen');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');

    const initials = candidateName
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const safePhotos = photos
      .filter((photo) => !photo.startsWith('data:'))
      .slice(0, 5);

    const updatedProfile: UserProfile = {
      id: existingProfile?.id || currentUser.id,
      userId: currentUser.id,

      candidateName: candidateName.trim(),
      gender,
      dob: existingProfile?.dob || '',
      age: Number(age),
      height,
      maritalStatus,

      religion: {
        sect,
        salah,
        hijabOrBeard,
        quranRecitation,
        fastingRamadan: existingProfile?.religion?.fastingRamadan ?? false,
        halalDiet: existingProfile?.religion?.halalDiet ?? false,
      },

      education: education.trim(),
      profession: profession.trim(),
      employedIn,
      annualIncomeRange,

      district,
      mandalCity: mandalCity.trim(),
      motherTongue,

      familyDetails: {
        fatherNameAndOcc: fatherNameAndOcc.trim(),
        motherNameAndOcc: motherNameAndOcc.trim(),
        brothersCount: Number(brothersCount),
        brothersMarried: Number(brothersMarried),
        sistersCount: Number(sistersCount),
        sistersMarried: Number(sistersMarried),
        nativePlace: nativePlace.trim(),
        familyStatus,
        familyValues,
      },

      partnerPreferences: {
        minAge: Number(minAgePref),
        maxAge: Number(maxAgePref),
        preferredDistricts:
          existingProfile?.partnerPreferences?.preferredDistricts || [district],
        educationPreference:
          existingProfile?.partnerPreferences?.educationPreference || '',
        maritalStatusPreference:
          existingProfile?.partnerPreferences?.maritalStatusPreference || [],
        religiosityPreference:
          existingProfile?.partnerPreferences?.religiosityPreference || '',
      },

      mustHaves,
      dealBreakers,
      aboutCandidate: aboutCandidate.trim(),

      guardianWaliContact: {
        name: guardianName.trim(),
        relationship: guardianRelationship,
        phone: guardianPhone.trim(),
        preferredCallTime:
          existingProfile?.guardianWaliContact?.preferredCallTime || '',
        includeInMessaging:
          existingProfile?.guardianWaliContact?.includeInMessaging ?? false,
        visibility:
          existingProfile?.guardianWaliContact?.visibility || 'verified_families_only',
      },

      photos: safePhotos,
      photoPrivacy,
      avatarInitials: initials || 'NP',
      avatarBgColor: gender === 'bride' ? '#047857' : '#0284c7',

      // These are not user-editable verification fields.
      documents: [],
      isVerified: false,
      approvalStatus: existingProfile?.approvalStatus || 'pending',
      approvalNotes: existingProfile?.approvalNotes || '',

      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      favoritesCount: existingProfile?.favoritesCount || 0,
      interestsReceivedCount: existingProfile?.interestsReceivedCount || 0,
    };

    try {
      await saveProfileToFirestore(updatedProfile);

      setExistingProfile(updatedProfile);
      setStatusMsg('Your profile has been saved successfully.');

      onProfileUpdated();

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Profile save failed:', error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Unable to save your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-emerald-700';

  const labelClass = 'block font-semibold text-stone-700 mb-1';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'personal', label: '1. Personal & Location' },
    { id: 'deen', label: '2. Deen & Profession' },
    { id: 'family', label: '3. Family & Wali' },
    { id: 'preferences', label: '4. Preferences' },
    { id: 'privacy', label: '5. Photos & Privacy' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold flex items-center gap-2">
              My Matrimonial Biodata & Privacy Settings
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-stone-300">
              Your private profile is saved to your Firebase account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg"
            aria-label="Close profile editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 border-b border-stone-200 flex gap-4 text-xs font-semibold bg-stone-50 overflow-x-auto shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {statusMsg && (
          <div className="bg-emerald-100 text-emerald-900 px-6 py-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-amber-50 text-amber-900 px-6 py-3 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-stone-600 text-sm">
            Loading your Firebase profile...
          </div>
        ) : (
          <form
            onSubmit={handleSaveProfile}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
          >

            {/* Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Candidate Full Name *</label>
                    <input
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'groom' | 'bride')}
                      className={inputClass}
                    >
                      <option value="bride">Bride (Dulhan)</option>
                      <option value="groom">Groom (Dulha)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Age *</label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      required
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Height</label>
                    <select
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={inputClass}
                    >
                      {[
                        `4'10"`, `4'11"`, `5'0"`, `5'1"`, `5'2"`,
                        `5'3"`, `5'4"`, `5'5"`, `5'6"`, `5'7"`,
                        `5'8"`, `5'9"`, `5'10"`, `5'11"`, `6'0"`,
                        `6'1"`, `6'2"`, `6'3"`,
                      ].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as UserProfile['maritalStatus'])}
                      className={inputClass}
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>District / Region *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value as DistrictAP)}
                      className={inputClass}
                    >
                      {GODAVARI_DISTRICTS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Mandal / Town / Locality *</label>
                    <input
                      required
                      value={mandalCity}
                      onChange={(e) => setMandalCity(e.target.value)}
                      placeholder="Enter your town or locality"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Mother Tongue / Languages</label>
                  <input
                    value={motherTongue}
                    onChange={(e) => setMotherTongue(e.target.value)}
                    className={inputClass}
                    placeholder="Urdu, Telugu, English..."
                  />
                </div>
              </div>
            )}

            {/* Deen and Profession */}
            {activeTab === 'deen' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Sect / Maslak</label>
                    <select
                      value={sect}
                      onChange={(e) => setSect(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Sunni Hanafi">Sunni Hanafi</option>
                      <option value="Sunni Shafi'i">Sunni Shafi'i</option>
                      <option value="Ahl-e-Hadith">Ahl-e-Hadith</option>
                      <option value="Deen First">Deen First / General Sunni</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Salah Observance</label>
                    <select
                      value={salah}
                      onChange={(e) => setSalah(e.target.value as UserProfile['religion']['salah'])}
                      className={inputClass}
                    >
                      <option value="5 times daily">5 times daily</option>
                      <option value="Regularly">Regularly</option>
                      <option value="Usually">Usually</option>
                      <option value="Striving">Striving to improve</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      {gender === 'bride' ? 'Hijab / Niqab' : 'Beard'}
                    </label>
                    <select
                      value={hijabOrBeard}
                      onChange={(e) => setHijabOrBeard(e.target.value as UserProfile['religion']['hijabOrBeard'])}
                      className={inputClass}
                    >
                      <option value="Observes Hijab/Niqab">Observes Hijab/Niqab</option>
                      <option value="Full Beard">Full Beard</option>
                      <option value="Trimmed Beard">Trimmed Beard</option>
                      <option value="Modest Dressing">Modest Dressing</option>
                      <option value="Not strictly">Not strictly</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Quran Recitation</label>
                    <select
                      value={quranRecitation}
                      onChange={(e) => setQuranRecitation(e.target.value as UserProfile['religion']['quranRecitation'])}
                      className={inputClass}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Highest Education *</label>
                    <input
                      required
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. B.Tech, MBBS, MBA"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Current Profession *</label>
                    <input
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className={inputClass}
                      placeholder="Enter profession"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Employment Sector</label>
                    <select
                      value={employedIn}
                      onChange={(e) => setEmployedIn(e.target.value as UserProfile['employedIn'])}
                      className={inputClass}
                    >
                      <option value="Private Sector">Private Sector / MNC</option>
                      <option value="Government / PSU">Government / PSU / Bank</option>
                      <option value="Business / Self-Employed">Business / Self-Employed</option>
                      <option value="Defense / Healthcare">Healthcare / Hospital</option>
                      <option value="Overseas / Gulf">Gulf / Overseas NRI</option>
                      <option value="Homemaker">Homemaker</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Annual Income Range</label>
                    <select
                      value={annualIncomeRange}
                      onChange={(e) => setAnnualIncomeRange(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="₹6 - 10 Lakhs">₹6 - 10 Lakhs</option>
                      <option value="₹10 - 15 Lakhs">₹10 - 15 Lakhs</option>
                      <option value="₹15 - 25 Lakhs">₹15 - 25 Lakhs</option>
                      <option value="₹25 - 40 Lakhs">₹25 - 40 Lakhs</option>
                      <option value="₹40 Lakhs+ / NRI">₹40 Lakhs+ / NRI</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Family and Guardian */}
            {activeTab === 'family' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Father's Name & Occupation</label>
                    <input
                      value={fatherNameAndOcc}
                      onChange={(e) => setFatherNameAndOcc(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Mother's Name & Occupation</label>
                    <input
                      value={motherNameAndOcc}
                      onChange={(e) => setMotherNameAndOcc(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Brothers</label>
                    <input
                      type="number"
                      min="0"
                      value={brothersCount}
                      onChange={(e) => setBrothersCount(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Married Brothers</label>
                    <input
                      type="number"
                      min="0"
                      max={brothersCount}
                      value={brothersMarried}
                      onChange={(e) => setBrothersMarried(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Sisters</label>
                    <input
                      type="number"
                      min="0"
                      value={sistersCount}
                      onChange={(e) => setSistersCount(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Married Sisters</label>
                    <input
                      type="number"
                      min="0"
                      max={sistersCount}
                      value={sistersMarried}
                      onChange={(e) => setSistersMarried(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Native Place</label>
                    <input
                      value={nativePlace}
                      onChange={(e) => setNativePlace(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Family Status</label>
                    <select
                      value={familyStatus}
                      onChange={(e) => setFamilyStatus(e.target.value as UserProfile['familyDetails']['familyStatus'])}
                      className={inputClass}
                    >
                      <option value="Upper Middle Class">Upper Middle Class</option>
                      <option value="Middle Class">Middle Class</option>
                      <option value="Affluent">Affluent</option>
                      <option value="Traditional">Traditional</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Family Values</label>
                    <select
                      value={familyValues}
                      onChange={(e) => setFamilyValues(e.target.value as UserProfile['familyDetails']['familyValues'])}
                      className={inputClass}
                    >
                      <option value="Traditional & Practicing">Traditional & Practicing</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Religious">Religious</option>
                      <option value="Modern">Modern</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Guardian / Wali Contact
                  </div>

                  <p className="text-stone-600">
                    These details are stored in your private registration. They are not published as public profile details.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Guardian Name</label>
                      <input
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Relationship</label>
                      <select
                        value={guardianRelationship}
                        onChange={(e) => setGuardianRelationship(e.target.value)}
                        className={inputClass}
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Elder Brother">Elder Brother</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Self / Candidate">Self / Candidate</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Guardian Phone</label>
                      <input
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Preferred Minimum Age</label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={minAgePref}
                      onChange={(e) => setMinAgePref(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Preferred Maximum Age</label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={maxAgePref}
                      onChange={(e) => setMaxAgePref(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                  <strong className="text-emerald-950">Must-Haves</strong>

                  {mustHaves.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => setMustHaves((old) => old.filter((_, i) => i !== index))}
                        className="text-rose-600"
                        aria-label="Remove must-have"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={newMustHave}
                      onChange={(e) => setNewMustHave(e.target.value)}
                      className={inputClass}
                      placeholder="Add a must-have"
                    />
                    <button
                      type="button"
                      onClick={addMustHave}
                      className="px-3 bg-emerald-800 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-rose-200 rounded-xl p-4 space-y-3">
                  <strong className="text-rose-900">Deal-Breakers</strong>

                  {dealBreakers.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex justify-between items-center bg-rose-50 p-2 rounded-lg">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => setDealBreakers((old) => old.filter((_, i) => i !== index))}
                        className="text-rose-600"
                        aria-label="Remove deal-breaker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={newDealBreaker}
                      onChange={(e) => setNewDealBreaker(e.target.value)}
                      className={inputClass}
                      placeholder="Add a deal-breaker"
                    />
                    <button
                      type="button"
                      onClick={addDealBreaker}
                      className="px-3 bg-rose-700 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>About the Candidate</label>
                  <textarea
                    rows={5}
                    value={aboutCandidate}
                    onChange={(e) => setAboutCandidate(e.target.value)}
                    className={inputClass}
                    placeholder="Write a genuine introduction about the candidate..."
                  />
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-3">
                  <Lock className="w-5 h-5 text-emerald-800 shrink-0" />
                  <div>
                    <strong className="text-emerald-950">Your privacy matters</strong>
                    <p className="text-stone-600 mt-1">
                      Government ID numbers and identity documents are not collected or verified by this profile editor. Never enter a full Aadhaar, PAN, or passport number here.
                    </p>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <Camera className="w-4 h-4 text-emerald-800" />
                    Profile Photographs
                  </div>

                  <p className="text-stone-600">
                    Firebase Storage is not enabled. New photo uploads are temporarily unavailable. Existing web image URLs can be retained or removed.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {photos.map((photo, index) => (
                      <div key={`${photo}-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-stone-300">
                        <img
                          src={photo}
                          alt={`Profile photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos((old) => old.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {photos.length === 0 && (
                    <p className="text-stone-500">No existing web photos saved.</p>
                  )}
                </div>

                <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                  <strong className="text-stone-900">Photo Display Preference</strong>

                  {[
                    {
                      value: 'blurred_until_request',
                      label: 'Blurred until mutual family interest',
                    },
                    {
                      value: 'avatar_only',
                      label: 'Monogram avatar only',
                    },
                    {
                      value: 'visible',
                      label: 'Visible to logged-in members',
                    },
                  ].map((option) => (
                    <label key={option.value} className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="radio"
                        name="photoPrivacy"
                        value={option.value}
                        checked={photoPrivacy === option.value}
                        onChange={() => setPhotoPrivacy(option.value as UserProfile['photoPrivacy'])}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  Profile verification and approval can only be performed by an authorized administrator. Saving your profile does not mean it is verified or approved.
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                Your changes are saved to your private Firebase registration.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
