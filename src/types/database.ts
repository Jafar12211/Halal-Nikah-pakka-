export type DistrictAP =
  | 'Yanam (Puducherry)'
  | 'Kakinada District'
  | 'Dr. B.R. Ambedkar Konaseema'
  | 'East Godavari (Rajahmundry)'
  | 'West Godavari (Bhimavaram)'
  | 'Eluru District'
  | 'Visakhapatnam'
  | 'Vijayawada / Krishna'
  | 'Guntur'
  | 'Hyderabad (Telangana)'
  | 'Gulf / Overseas NRI (Godavari Roots)';

export type LanguageCode = 'en' | 'te';

export interface UserAccount {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'member' | 'admin';
  emailVerified: boolean;
  phoneVerified: boolean;
  authProvider: 'email' | 'google' | 'phone';
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended' | 'pending';
}

export type ValidGovtDocType = 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Driving Licence';

export interface DocumentRecord {
  id: string;
  type: ValidGovtDocType;
  fileName: string;
  storagePath?: string;
  maskedId: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  isRestricted: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  candidateName: string;
  candidateConsentConfirmed?: boolean;
  candidateConsentAt?: string;
  gender: 'groom' | 'bride';
  dob: string;
  age: number;
  height: string;
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed';
  religion: {
    sect: string;
    salah: '5 times daily' | 'Regularly' | 'Usually' | 'Striving' | 'Not specified';
    hijabOrBeard: 'Observes Hijab/Niqab' | 'Full Beard' | 'Trimmed Beard' | 'Modest Dressing' | 'Not strictly' | 'Not specified';
    quranRecitation: 'Daily' | 'Weekly' | 'Regular' | 'Not specified';
    fastingRamadan: boolean;
    halalDiet: boolean;
  };
  education: string;
  profession: string;
  employedIn: 'Private Sector' | 'Government / PSU' | 'Business / Self-Employed' | 'Defense / Healthcare' | 'Homemaker' | 'Overseas / Gulf' | 'Not specified';
  annualIncomeRange: string;
  district: DistrictAP;
  mandalCity: string;
  motherTongue: string;
  familyDetails: {
    fatherNameAndOcc: string;
    motherNameAndOcc: string;
    brothersCount: number;
    brothersMarried: number;
    sistersCount: number;
    sistersMarried: number;
    nativePlace: string;
    familyStatus: 'Affluent' | 'Upper Middle Class' | 'Middle Class' | 'Not specified';
    familyValues: 'Traditional & Practicing' | 'Moderate Religious' | 'Modern Religious' | 'Not specified';
  };
  partnerPreferences: {
    minAge: number;
    maxAge: number;
    minHeight?: string;
    preferredDistricts: DistrictAP[];
    educationPreference: string;
    maritalStatusPreference: string[];
    religiosityPreference: string;
  };
  mustHaves: string[];
  dealBreakers: string[];
  aboutCandidate: string;
  guardianWaliContact: {
    name: string;
    relationship: string;
    phone: string;
    preferredCallTime: string;
    includeInMessaging: boolean;
    visibility: 'verified_families_only' | 'on_mutual_interest' | 'visible';
  };
  photos: string[];
  photoPrivacy: 'visible' | 'blurred_until_request' | 'avatar_only';
  avatarInitials: string;
  avatarBgColor: string;
  documents: DocumentRecord[];
  isVerified: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
  favoritesCount: number;
  interestsReceivedCount: number;
}

export interface InterestRequest {
  id: string;
  senderUserId: string;
  senderProfileId: string;
  senderName: string;
  receiverProfileId: string;
  receiverName: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  senderRole: 'candidate' | 'wali' | 'parent';
  text: string;
  isEncrypted: boolean;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantUserIds: string[];
  participantProfileIds: string[];
  profileAName: string;
  profileBName: string;
  profileAGender: 'groom' | 'bride';
  profileBGender: 'groom' | 'bride';
  waliMonitored: boolean;
  waliDetails?: {
    name: string;
    relationship: string;
    phone: string;
  };
  isEncrypted: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AuditLog {
  id: string;
  action: 'PROFILE_APPROVED' | 'PROFILE_REJECTED' | 'PROFILE_SUSPENDED' | 'DOCUMENT_VERIFIED' | 'USER_LOGIN' | 'INTEREST_EXPRESSED';
  performedBy: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: 'free_basic' | 'godavari_premium_community';
  name: string;
  priceINR: number;
  features: string[];
  isActive: boolean;
}
