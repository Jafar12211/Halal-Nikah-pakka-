export type RegisteredByRole = 'self' | 'parent' | 'brother' | 'sister' | 'relative' | 'friend';

export interface ReligiousPractice {
  salah: '5 times daily' | 'Regularly' | 'Usually' | 'Striving';
  hijabOrBeard: 'Observes Hijab/Niqab' | 'Full Beard' | 'Trimmed Beard' | 'Modest Dressing' | 'Not strictly';
  quranRecitation: 'Daily' | 'Weekly' | 'Regular';
  halalDiet: boolean;
  hajjUmrahDone: boolean;
}

export interface FamilyDetails {
  fatherNameAndOcc: string;
  motherNameAndOcc: string;
  brothersCount: number;
  brothersMarried: number;
  sistersCount: number;
  sistersMarried: number;
  nativePlace: string;
  familyValues: 'Traditional & Practicing' | 'Moderate Religious' | 'Modern Religious';
}

export interface PartnerPreferences {
  minAge: number;
  maxAge: number;
  minHeight?: string;
  educationPreference?: string;
  maritalStatusPreference: string[];
  locationPreference: string[];
  religiosityPreference?: string;
}

export interface GuardianWaliContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  preferredCallTime: string;
  visibility: 'verified_families_only' | 'on_mutual_interest' | 'visible';
}

export interface MatrimonyProfile {
  id: string;
  registeredBy: RegisteredByRole;
  registrantName: string;
  candidateName: string;
  candidateConsentConfirmed?: boolean;
  candidateConsentAt?: string;
  gender: 'groom' | 'bride';
  age: number;
  height: string;
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed';
  city: string;
  stateCountry: string;
  motherTongue: string;
  sect: string;
  religiousPractice: ReligiousPractice;
  education: string;
  profession: string;
  employedIn: 'Private Sector' | 'Government / PSU' | 'Business / Self-Employed' | 'Defense / Healthcare' | 'Homemaker';
  annualIncomeRange: string;
  familyDetails: FamilyDetails;
  partnerPreferences: PartnerPreferences;
  aboutCandidate: string;
  guardianWaliContact: GuardianWaliContact;
  isVerified: boolean;
  verificationBadge: 'Family Reference Verified' | 'Phone & ID Checked' | 'Community Elder Verified';
  photoUrl?: string;
  photos?: string[];
  photoPrivacy: 'blurred_until_request' | 'visible' | 'avatar_only';
  avatarInitials: string;
  avatarBgColor: string;
  createdAt: string;
  interestsCount: number;
  documents?: {
    id: string;
    type: 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Driving Licence';
    fileName: string;
    maskedId: string;
    uploadedAt: string;
    verified: boolean;
    isRestricted: boolean;
  }[];
}

export interface FilterState {
  gender: 'all' | 'groom' | 'bride';
  city: string;
  sect: string;
  maritalStatus: string;
  minAge: number;
  maxAge: number;
  education: string;
  searchQuery: string;
  userCity: string;
  radiusKm: number;
}
