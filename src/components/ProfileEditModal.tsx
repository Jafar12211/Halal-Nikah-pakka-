import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  FileText,
  Upload,
  AlertCircle,
  Star,
  Camera,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserAccount, DistrictAP, ValidGovtDocType } from '../types/database';
import { storageService, GODAVARI_DISTRICTS } from '../services/storageService';
import { maskGovtIdNumber } from '../utils/matrimony';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onProfileUpdated: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'deen' | 'family' | 'preferences' | 'privacy'>('personal');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form State
  const [candidateName, setCandidateName] = useState('');
  const [gender, setGender] = useState<'groom' | 'bride'>('bride');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(`5'4"`);
  const [maritalStatus, setMaritalStatus] = useState<'Never Married' | 'Divorced' | 'Widowed'>('Never Married');
  const [district, setDistrict] = useState<DistrictAP>('Kakinada District');
  const [mandalCity, setMandalCity] = useState('');
  const [motherTongue, setMotherTongue] = useState('Urdu & Telugu');

  // Deen & Career
  const [sect, setSect] = useState('Sunni Hanafi');
  const [salah, setSalah] = useState<'5 times daily' | 'Regularly' | 'Usually' | 'Striving'>('5 times daily');
  const [hijabOrBeard, setHijabOrBeard] = useState<'Observes Hijab/Niqab' | 'Full Beard' | 'Trimmed Beard' | 'Modest Dressing' | 'Not strictly'>('Observes Hijab/Niqab');
  const [quranRecitation, setQuranRecitation] = useState<'Daily' | 'Weekly' | 'Regular'>('Daily');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [employedIn, setEmployedIn] = useState<UserProfile['employedIn']>('Private Sector');
  const [annualIncomeRange, setAnnualIncomeRange] = useState('₹12 - 18 Lakhs');

  // Family Background
  const [fatherNameAndOcc, setFatherNameAndOcc] = useState('');
  const [motherNameAndOcc, setMotherNameAndOcc] = useState('');
  const [brothersCount, setBrothersCount] = useState(1);
  const [sistersCount, setSistersCount] = useState(1);
  const [nativePlace, setNativePlace] = useState('');
  const [familyStatus, setFamilyStatus] = useState<UserProfile['familyDetails']['familyStatus']>('Upper Middle Class');
  const [familyValues, setFamilyValues] = useState<UserProfile['familyDetails']['familyValues']>('Traditional & Practicing');

  // Partner Preferences, Must-Haves & Deal-Breakers
  const [minAgePref, setMinAgePref] = useState(24);
  const [maxAgePref, setMaxAgePref] = useState(30);
  const [mustHaves, setMustHaves] = useState<string[]>([
    'Observes 5 daily Salah',
    'Halal livelihood & clean habits',
    'Respectful of parents and elders',
  ]);
  const [dealBreakers, setDealBreakers] = useState<string[]>([
    'Demand for dowry / Jahez',
    'Smoking, tobacco, or alcohol',
    'Lack of prayer or casual Deen attitude',
  ]);
  const [newMustHave, setNewMustHave] = useState('');
  const [newDealBreaker, setNewDealBreaker] = useState('');
  const [aboutCandidate, setAboutCandidate] = useState('');

  // Guardian Contact
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [photoPrivacy, setPhotoPrivacy] = useState<UserProfile['photoPrivacy']>('blurred_until_request');
  const [photos, setPhotos] = useState<string[]>([]);

  // Document Record
  const [docType, setDocType] = useState<ValidGovtDocType>('Aadhaar Card');
  const [docLast4, setDocLast4] = useState('');
  const [hasDocAttached, setHasDocAttached] = useState(false);

  // Load existing profile on open
  useEffect(() => {
    if (currentUser) {
      const myProfile = storageService.getMyProfile(currentUser.id);
      if (myProfile) {
        setCandidateName(myProfile.candidateName || '');
        setGender(myProfile.gender || 'bride');
        setAge(myProfile.age || 25);
        setHeight(myProfile.height || `5'4"`);
        setMaritalStatus(myProfile.maritalStatus || 'Never Married');
        setDistrict(myProfile.district || 'Kakinada District');
        setMandalCity(myProfile.mandalCity || '');
        setMotherTongue(myProfile.motherTongue || 'Urdu & Telugu');
        setSect(myProfile.religion?.sect || 'Sunni Hanafi');
        setSalah(myProfile.religion?.salah || '5 times daily');
        setHijabOrBeard(myProfile.religion?.hijabOrBeard || 'Observes Hijab/Niqab');
        setQuranRecitation(myProfile.religion?.quranRecitation || 'Daily');
        setEducation(myProfile.education || '');
        setProfession(myProfile.profession || '');
        setEmployedIn(myProfile.employedIn || 'Private Sector');
        setAnnualIncomeRange(myProfile.annualIncomeRange || '₹12 - 18 Lakhs');
        setFatherNameAndOcc(myProfile.familyDetails?.fatherNameAndOcc || '');
        setMotherNameAndOcc(myProfile.familyDetails?.motherNameAndOcc || '');
        setBrothersCount(myProfile.familyDetails?.brothersCount || 0);
        setSistersCount(myProfile.familyDetails?.sistersCount || 0);
        setNativePlace(myProfile.familyDetails?.nativePlace || '');
        setFamilyStatus(myProfile.familyDetails?.familyStatus || 'Upper Middle Class');
        setFamilyValues(myProfile.familyDetails?.familyValues || 'Traditional & Practicing');
        setMinAgePref(myProfile.partnerPreferences?.minAge || 24);
        setMaxAgePref(myProfile.partnerPreferences?.maxAge || 30);
        setMustHaves(myProfile.mustHaves || []);
        setDealBreakers(myProfile.dealBreakers || []);
        setAboutCandidate(myProfile.aboutCandidate || '');
        setGuardianName(myProfile.guardianWaliContact?.name || '');
        setGuardianRelationship(myProfile.guardianWaliContact?.relationship || 'Father');
        setGuardianPhone(myProfile.guardianWaliContact?.phone || '');
        setPhotoPrivacy(myProfile.photoPrivacy || 'blurred_until_request');
        setPhotos(myProfile.photos || []);
        if (myProfile.documents && myProfile.documents.length > 0) {
          setHasDocAttached(true);
          setDocType((myProfile.documents[0].type as ValidGovtDocType) || 'Aadhaar Card');
          setDocLast4(myProfile.documents[0].maskedId.slice(-4));
        }
      } else {
        // Pre-fill user name
        setCandidateName(currentUser.name || '');
      }
    }
  }, [currentUser, isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    const readers = filesToUpload.map((f) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(f);
      });
    });

    Promise.all(readers).then((newPics) => {
      setPhotos((prev) => [...prev, ...newPics].slice(0, 5));
    });
    e.target.value = '';
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSetPrimaryPhoto = (idx: number) => {
    setPhotos((prev) => {
      const selected = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      return [selected, ...rest];
    });
  };

  if (!isOpen) return null;

  const handleAddMustHave = () => {
    if (newMustHave.trim()) {
      setMustHaves([...mustHaves, newMustHave.trim()]);
      setNewMustHave('');
    }
  };

  const handleRemoveMustHave = (idx: number) => {
    setMustHaves(mustHaves.filter((_, i) => i !== idx));
  };

  const handleAddDealBreaker = () => {
    if (newDealBreaker.trim()) {
      setDealBreakers([...dealBreakers, newDealBreaker.trim()]);
      setNewDealBreaker('');
    }
  };

  const handleRemoveDealBreaker = (idx: number) => {
    setDealBreakers(dealBreakers.filter((_, i) => i !== idx));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);

    const existingProfile = storageService.getMyProfile(currentUser.id);
    const initials = candidateName
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NP';

    const maskedDocumentRecord = docLast4
      ? [
          {
            id: `doc-${Date.now()}`,
            type: docType,
            fileName: `${docType.replace(/\s+/g, '_')}_Masked.pdf`,
            maskedId: maskGovtIdNumber(docLast4, docType),
            uploadedAt: new Date().toISOString().split('T')[0],
            verified: true,
            isRestricted: true,
          },
        ]
      : existingProfile?.documents || [];

    const updatedProfile: UserProfile = {
      id: existingProfile?.id || `prof-${currentUser.id}`,
      userId: currentUser.id,
      candidateName,
      gender,
      dob: existingProfile?.dob || '1998-05-15',
      age: Number(age),
      height,
      maritalStatus,
      religion: {
        sect,
        salah,
        hijabOrBeard,
        quranRecitation,
        fastingRamadan: true,
        halalDiet: true,
      },
      education,
      profession,
      employedIn,
      annualIncomeRange,
      district,
      mandalCity: mandalCity || district,
      motherTongue,
      familyDetails: {
        fatherNameAndOcc,
        motherNameAndOcc,
        brothersCount,
        brothersMarried: Math.max(0, brothersCount - 1),
        sistersCount,
        sistersMarried: Math.max(0, sistersCount - 1),
        nativePlace: nativePlace || district,
        familyStatus,
        familyValues,
      },
      partnerPreferences: {
        minAge: Number(minAgePref),
        maxAge: Number(maxAgePref),
        preferredDistricts: [district],
        educationPreference: 'Graduate or Professional degree',
        maritalStatusPreference: [maritalStatus],
        religiosityPreference: 'Observes 5 daily Salah, honest earnings',
      },
      mustHaves,
      dealBreakers,
      aboutCandidate:
        aboutCandidate ||
        `Alhamdulillah, practicing and cultured candidate from ${district}. Seeking a deen-conscious life partner with mutual family blessings.`,
      guardianWaliContact: {
        name: guardianName || 'Guardian / Father',
        relationship: guardianRelationship,
        phone: guardianPhone || currentUser.phone || '+91 98490 00000',
        preferredCallTime: '6:00 PM - 9:00 PM',
        includeInMessaging: true,
        visibility: 'verified_families_only',
      },
      photos: photos.slice(0, 5),
      photoPrivacy,
      avatarInitials: initials,
      avatarBgColor: gender === 'bride' ? '#047857' : '#0284c7',
      documents: maskedDocumentRecord,
      isVerified: true,
      approvalStatus: existingProfile?.approvalStatus || 'approved',
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favoritesCount: existingProfile?.favoritesCount || 1,
      interestsReceivedCount: existingProfile?.interestsReceivedCount || 0,
    };

    storageService.saveProfile(updatedProfile);
    setSaving(false);
    setStatusMsg('Profile details updated successfully!');
    setTimeout(() => {
      setStatusMsg(null);
      onProfileUpdated();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <span>My Matrimonial Biodata & Privacy Settings</span>
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-stone-300">
              Only you and verified admins can edit your profile. Other members only see your public biodata.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors"
            aria-label="Close profile editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-stone-200 flex gap-4 text-xs font-semibold bg-stone-50 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'personal'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            1. Personal & Location
          </button>
          <button
            onClick={() => setActiveTab('deen')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'deen'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            2. Deen & Profession
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'family'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            3. Family Background & Wali
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'preferences'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            4. Must-Haves & Deal-Breakers
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'privacy'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            5. ID Verification & Privacy
          </button>
        </div>

        {statusMsg && (
          <div className="bg-emerald-100 text-emerald-900 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: Personal & Location */}
          {activeTab === 'personal' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gender *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('bride')}
                      className={`py-2 px-3 rounded-lg border font-semibold text-center ${
                        gender === 'bride'
                          ? 'bg-emerald-50 border-emerald-700 text-emerald-900'
                          : 'bg-white border-stone-300 text-stone-600'
                      }`}
                    >
                      Bride (Dulhan)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('groom')}
                      className={`py-2 px-3 rounded-lg border font-semibold text-center ${
                        gender === 'groom'
                          ? 'bg-emerald-50 border-emerald-700 text-emerald-900'
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
                  <label className="block font-semibold text-stone-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min="18"
                    max="75"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Height *</label>
                  <select
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    {[`5'0"`, `5'1"`, `5'2"`, `5'3"`, `5'4"`, `5'5"`, `5'6"`, `5'7"`, `5'8"`, `5'9"`, `5'10"`, `5'11"`, `6'0"`, `6'1"`, `6'2"`].map(
                      (h) => (
                        <option key={h} value={h}>{h}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Marital Status *</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Godavari District / Region *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as DistrictAP)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium"
                  >
                    {GODAVARI_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mandal / Town / Locality *</label>
                  <input
                    type="text"
                    placeholder="e.g. Yanam Ferry Road / Danavaipeta / Palakollu"
                    value={mandalCity}
                    onChange={(e) => setMandalCity(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mother Tongue / Spoken Languages</label>
                <input
                  type="text"
                  placeholder="e.g. Urdu & Telugu / Telugu & English"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Deen & Profession */}
          {activeTab === 'deen' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sect / Maslak</label>
                  <select
                    value={sect}
                    onChange={(e) => setSect(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Sunni Hanafi">Sunni Hanafi</option>
                    <option value="Sunni Shafi'i">Sunni Shafi'i</option>
                    <option value="Ahl-e-Hadith">Ahl-e-Hadith</option>
                    <option value="Deen First">Deen First / General Sunni</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Salah (Prayer) Observance *</label>
                  <select
                    value={salah}
                    onChange={(e) => setSalah(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="5 times daily">5 times daily (Strict)</option>
                    <option value="Regularly">Regularly</option>
                    <option value="Usually">Usually</option>
                    <option value="Striving">Striving to improve</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {gender === 'bride' ? 'Hijab / Niqab Observance' : 'Sunnah Beard'}
                  </label>
                  <select
                    value={hijabOrBeard}
                    onChange={(e) => setHijabOrBeard(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    {gender === 'bride' ? (
                      <>
                        <option value="Observes Hijab/Niqab">Observes Hijab/Niqab</option>
                        <option value="Modest Dressing">Modest Dressing (Dupatta/Abaya)</option>
                        <option value="Not strictly">Not strictly</option>
                      </>
                    ) : (
                      <>
                        <option value="Full Beard">Full Beard (Sunnah)</option>
                        <option value="Trimmed Beard">Trimmed Beard</option>
                        <option value="Clean Shaven">Clean Shaven</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quran Recitation Routine</label>
                  <select
                    value={quranRecitation}
                    onChange={(e) => setQuranRecitation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Daily">Daily with understanding</option>
                    <option value="Weekly">Weekly / Jummah regular</option>
                    <option value="Regular">Occasional / Ramadan regular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Highest Education *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, M.Tech, CA, MCA"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current Profession *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pediatric Doctor, Offshore Engineer, CA"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Employment Sector</label>
                  <select
                    value={employedIn}
                    onChange={(e) => setEmployedIn(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
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
                  <label className="block font-semibold text-stone-700 mb-1">Annual Income Range</label>
                  <select
                    value={annualIncomeRange}
                    onChange={(e) => setAnnualIncomeRange(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
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

          {/* TAB 3: Family Background & Wali */}
          {activeTab === 'family' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Father's Name & Occupation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haji Mohammed Abdul Razzaq (Business)"
                    value={fatherNameAndOcc}
                    onChange={(e) => setFatherNameAndOcc(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mother's Name & Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Sultana Begum (Homemaker)"
                    value={motherNameAndOcc}
                    onChange={(e) => setMotherNameAndOcc(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brothers Count</label>
                  <input
                    type="number"
                    min="0"
                    value={brothersCount}
                    onChange={(e) => setBrothersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sisters Count</label>
                  <input
                    type="number"
                    min="0"
                    value={sistersCount}
                    onChange={(e) => setSistersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Native Place in AP / Yanam</label>
                  <input
                    type="text"
                    placeholder="e.g. Kakinada, Yanam, Amalapuram"
                    value={nativePlace}
                    onChange={(e) => setNativePlace(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              {/* Guardian / Wali Contact */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  Guardian (Wali) Details for Chaperoned Messaging
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Haji Abdul Razzaq"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Relationship *</label>
                    <select
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Elder Brother">Elder Brother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Self / Candidate">Self (Male Candidate)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Guardian Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98480 12345"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Must-Haves & Deal-Breakers */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                <strong>Clarity Prevents Heartache:</strong> Stating non-negotiable expectations upfront ensures only genuinely compatible Godavari families initiate contact.
              </div>

              {/* Must-Haves */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3">
                <span className="font-semibold text-emerald-950 block">
                  ✨ Non-Negotiable Must-Haves (What You Require in a Spouse)
                </span>
                <div className="space-y-2">
                  {mustHaves.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200">
                      <span className="text-stone-800 font-medium">✓ {m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMustHave(idx)}
                        className="text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a must-have (e.g. Respects working spouse, values Quran study)..."
                    value={newMustHave}
                    onChange={(e) => setNewMustHave(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMustHave();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddMustHave}
                    className="px-3.5 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Deal-Breakers */}
              <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/30 space-y-3">
                <span className="font-semibold text-rose-950 block">
                  🚫 Strict Deal-Breakers (Things You Cannot Accept)
                </span>
                <div className="space-y-2">
                  {dealBreakers.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-rose-200">
                      <span className="text-rose-900 font-medium">✕ {d}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDealBreaker(idx)}
                        className="text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a deal-breaker (e.g. Dowry demands, smoking, bad temper)..."
                    value={newDealBreaker}
                    onChange={(e) => setNewDealBreaker(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDealBreaker();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDealBreaker}
                    className="px-3.5 py-2 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ID Verification & Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                <Lock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-950">Restricted Identity Verification (UIDAI Compliant)</p>
                  <p className="text-stone-600 leading-relaxed">
                    Identity documents are confidential and restricted from other users. We store only masked identifiers (e.g. XXXX-XXXX-4921) to confirm age and Godavari residence.
                  </p>
                </div>
              </div>

              {/* Section 1: Candidate Photographs (Up to 5 pictures) */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-800" />
                    <span className="font-semibold text-stone-900 block">
                      Candidate Photographs (Up to 5 Pictures):
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {photos.length}/5 Photos Added
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Manage up to 5 photos for your biodata. The first photo is your primary cover picture.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {Array.from({ length: 5 }).map((_, slotIndex) => {
                    const photoUrl = photos[slotIndex];
                    const isPrimary = slotIndex === 0;

                    if (photoUrl) {
                      return (
                        <div
                          key={slotIndex}
                          className="relative rounded-xl overflow-hidden border-2 border-emerald-700/50 bg-stone-900 aspect-square shadow-xs"
                        >
                          <img
                            src={photoUrl}
                            alt={`Candidate photo ${slotIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isPrimary ? (
                            <span className="absolute top-1 left-1 bg-emerald-800/90 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryPhoto(slotIndex)}
                              className="absolute top-1 left-1 bg-stone-950/70 hover:bg-emerald-800 text-white text-[8px] font-semibold px-1 py-0.5 rounded transition-colors"
                            >
                              Make Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(slotIndex)}
                            className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full transition-colors shadow"
                            title="Remove picture"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <label
                        key={slotIndex}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/50 cursor-pointer aspect-square transition-all p-2 text-center group"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                        <div className="w-7 h-7 rounded-full bg-stone-200 group-hover:bg-emerald-100 flex items-center justify-center text-stone-500 group-hover:text-emerald-700 mb-1 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-semibold text-stone-600 group-hover:text-emerald-900">
                          {slotIndex === 0 ? 'Primary' : `Photo ${slotIndex + 1}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Identity Document Record */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-white">
                <span className="font-semibold text-stone-900 block">Valid Government ID Document Record:</span>
                <p className="text-[11px] text-stone-500">
                  Valid identity documents are strictly limited to <strong>Aadhaar Card</strong>, <strong>PAN Card</strong>, <strong>Passport</strong>, or <strong>Driving Licence</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 mb-1">Document Type *</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (UIDAI Masked)</option>
                      <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                      <option value="Passport">Passport (Govt of India)</option>
                      <option value="Driving Licence">Driving Licence (Transport Dept)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-700 mb-1">Masked ID / Last 4 Digits *</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 7860 or XXXX-XXXX-7860"
                      value={docLast4}
                      onChange={(e) => setDocLast4(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-stone-500">
                  Document ID preview:{' '}
                  <span className="font-mono font-bold text-emerald-800">
                    {maskGovtIdNumber(docLast4 || 'XXXX', docType)}
                  </span>
                </div>
              </div>

              {/* Section 3: Photo Privacy */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-2 bg-white">
                <span className="font-semibold text-stone-900 block">Photo Display & Modesty Preference:</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="photoPrivacy"
                      checked={photoPrivacy === 'blurred_until_request'}
                      onChange={() => setPhotoPrivacy('blurred_until_request')}
                      className="text-emerald-800"
                    />
                    <span className="text-stone-800">
                      <strong>Blurred until mutual family interest</strong> (Recommended for Muslimahs for modesty)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="photoPrivacy"
                      checked={photoPrivacy === 'avatar_only'}
                      onChange={() => setPhotoPrivacy('avatar_only')}
                      className="text-emerald-800"
                    />
                    <span className="text-stone-800">
                      <strong>Tasteful Monogram Avatar Only</strong> (No photos displayed online)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="photoPrivacy"
                      checked={photoPrivacy === 'visible'}
                      onChange={() => setPhotoPrivacy('visible')}
                      className="text-emerald-800"
                    />
                    <span className="text-stone-800">
                      <strong>Visible to logged-in verified members</strong>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Updates take effect immediately on your matrimonial biodata.
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
                disabled={saving}
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
