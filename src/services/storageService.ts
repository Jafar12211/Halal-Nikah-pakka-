import {
  UserAccount,
  UserProfile,
  Conversation,
  Message,
  InterestRequest,
  AuditLog,
  DistrictAP
} from '../types/database';

const DEFAULT_ADMIN_EMAIL = 'jafarmd0007@gmail.com';

export const GODAVARI_DISTRICTS: DistrictAP[] = [
  'Yanam (Puducherry)',
  'Kakinada District',
  'Dr. B.R. Ambedkar Konaseema',
  'East Godavari (Rajahmundry)',
  'West Godavari (Bhimavaram)',
  'Eluru District',
  'Visakhapatnam',
  'Vijayawada / Krishna',
  'Guntur',
  'Hyderabad (Telangana)',
  'Gulf / Overseas NRI (Godavari Roots)',
];

const SEED_PROFILES: UserProfile[] = [
  {
    id: 'prof-godavari-101',
    userId: 'usr-ayesha-101',
    candidateName: 'Dr. Ayesha Begum',
    gender: 'bride',
    dob: '1999-06-15',
    age: 25,
    height: `5'4"`,
    maritalStatus: 'Never Married',
    religion: {
      sect: 'Sunni Hanafi',
      salah: '5 times daily',
      hijabOrBeard: 'Observes Hijab/Niqab',
      quranRecitation: 'Daily',
      fastingRamadan: true,
      halalDiet: true,
    },
    education: 'MBBS, DNB Pediatrics (Rangaraya Medical College)',
    profession: 'Pediatric Specialist Resident',
    employedIn: 'Defense / Healthcare',
    annualIncomeRange: '₹14 - 18 Lakhs',
    district: 'Kakinada District',
    mandalCity: 'Kakinada Port Town / Samalkota',
    motherTongue: 'Urdu & Telugu',
    familyDetails: {
      fatherNameAndOcc: 'Haji Mohammed Abdul Razzaq (Timber Merchant & Community Elder)',
      motherNameAndOcc: 'Sultana Begum (Homemaker)',
      brothersCount: 1,
      brothersMarried: 1,
      sistersCount: 1,
      sistersMarried: 0,
      nativePlace: 'Kakinada, Andhra Pradesh',
      familyStatus: 'Upper Middle Class',
      familyValues: 'Traditional & Practicing',
    },
    partnerPreferences: {
      minAge: 26,
      maxAge: 31,
      minHeight: `5'7"`,
      preferredDistricts: ['Kakinada District', 'East Godavari (Rajahmundry)', 'Yanam (Puducherry)', 'Hyderabad (Telangana)'],
      educationPreference: 'Doctor, Engineer, CA, or Class-1 Professional',
      maritalStatusPreference: ['Never Married'],
      religiosityPreference: 'Strict 5 times Salah, honest halal earnings, respectful of elders',
    },
    mustHaves: [
      'Observes 5 daily Salah punctually',
      'Honest and strictly Halal livelihood',
      'Respect for family elders and parents',
      'Open to living in Godavari region or Hyderabad',
    ],
    dealBreakers: [
      'Demand for dowry / Jahez of any form',
      'Habit of smoking, tobacco, or alcohol',
      'Lack of regular prayer or casual attitude to Deen',
      'Disrespectful attitude towards women',
    ],
    aboutCandidate: 'Alhamdulillah courteous, deen-conscious pediatrician who balances hospital rounds with daily Quran recitation. Raised in an educated, God-fearing family in Kakinada.',
    guardianWaliContact: {
      name: 'Haji Mohammed Abdul Razzaq',
      relationship: 'Father',
      phone: '+91 98480 12345',
      preferredCallTime: '6:30 PM - 9:30 PM',
      includeInMessaging: true,
      visibility: 'verified_families_only',
    },
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    ],
    photoPrivacy: 'blurred_until_request',
    avatarInitials: 'AB',
    avatarBgColor: '#047857',
    documents: [
      {
        id: 'doc-1',
        type: 'Aadhaar Card',
        fileName: 'Aadhaar_Ayesha_Masked.pdf',
        maskedId: 'XXXX-XXXX-4921',
        uploadedAt: '2026-03-01',
        verified: true,
        verifiedBy: DEFAULT_ADMIN_EMAIL,
        isRestricted: true,
      },
    ],
    isVerified: true,
    approvalStatus: 'approved',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01',
    favoritesCount: 14,
    interestsReceivedCount: 9,
  },
  {
    id: 'prof-godavari-102',
    userId: 'usr-rayan-102',
    candidateName: 'Er. Mohammed Rayan',
    gender: 'groom',
    dob: '1996-08-20',
    age: 28,
    height: `5'11"`,
    maritalStatus: 'Never Married',
    religion: {
      sect: 'Sunni Hanafi',
      salah: '5 times daily',
      hijabOrBeard: 'Full Beard',
      quranRecitation: 'Daily',
      fastingRamadan: true,
      halalDiet: true,
    },
    education: 'B.Tech Mechanical (JNTUK), M.S. Offshore Robotics',
    profession: 'Senior Marine Offshore Engineering Specialist',
    employedIn: 'Private Sector',
    annualIncomeRange: '₹28 - 36 Lakhs',
    district: 'Yanam (Puducherry)',
    mandalCity: 'Yanam Ferry Road / Godavari Waterfront',
    motherTongue: 'Telugu, Urdu & French (basic)',
    familyDetails: {
      fatherNameAndOcc: 'Ibrahim Basha (Retd. PWD Engineer, Yanam Govt)',
      motherNameAndOcc: 'Zulekha Khatoon (Homemaker)',
      brothersCount: 1,
      brothersMarried: 0,
      sistersCount: 2,
      sistersMarried: 2,
      nativePlace: 'Yanam, Godavari Delta',
      familyStatus: 'Upper Middle Class',
      familyValues: 'Traditional & Practicing',
    },
    partnerPreferences: {
      minAge: 22,
      maxAge: 27,
      preferredDistricts: ['Yanam (Puducherry)', 'Kakinada District', 'Dr. B.R. Ambedkar Konaseema', 'West Godavari (Bhimavaram)'],
      educationPreference: 'Graduate or Post-Graduate',
      maritalStatusPreference: ['Never Married'],
      religiosityPreference: 'Practicing Muslimah who values modesty, family warmth, and Sunnah',
    },
    mustHaves: [
      'Modest lifestyle and family values',
      'Observant of daily Salah and fasting',
      'Affectionate towards parents and joint family visits in Yanam',
    ],
    dealBreakers: [
      'Reluctance towards family involvement / elder guidance',
      'Ostentatious, extravagant wedding expectations',
      'Neglect of basic Islamic obligations',
    ],
    aboutCandidate: 'Well-settled offshore engineer based in Yanam with ancestral roots along the Gautami Godavari river. Calm, soft-spoken, active in local masjid charity, enjoys coastal sports and literature.',
    guardianWaliContact: {
      name: 'Ibrahim Basha',
      relationship: 'Father',
      phone: '+91 94401 56789',
      preferredCallTime: '7:00 PM - 10:00 PM',
      includeInMessaging: true,
      visibility: 'visible',
    },
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
    ],
    photoPrivacy: 'visible',
    avatarInitials: 'MR',
    avatarBgColor: '#0369a1',
    documents: [
      {
        id: 'doc-2',
        type: 'PAN Card',
        fileName: 'PAN_Rayan_Masked.pdf',
        maskedId: 'XXXX-XX-8114',
        uploadedAt: '2026-03-02',
        verified: true,
        verifiedBy: DEFAULT_ADMIN_EMAIL,
        isRestricted: true,
      },
    ],
    isVerified: true,
    approvalStatus: 'approved',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02',
    favoritesCount: 21,
    interestsReceivedCount: 18,
  },
  {
    id: 'prof-godavari-103',
    userId: 'usr-faiza-103',
    candidateName: 'Faiza Sultana',
    gender: 'bride',
    dob: '1998-11-04',
    age: 26,
    height: `5'3"`,
    maritalStatus: 'Never Married',
    religion: {
      sect: 'Sunni Shafi\'i',
      salah: '5 times daily',
      hijabOrBeard: 'Observes Hijab/Niqab',
      quranRecitation: 'Daily',
      fastingRamadan: true,
      halalDiet: true,
    },
    education: 'M.Sc. Microbiology, B.Ed (Andhra University)',
    profession: 'Senior College Lecturer in Life Sciences',
    employedIn: 'Government / PSU',
    annualIncomeRange: '₹9 - 12 Lakhs',
    district: 'East Godavari (Rajahmundry)',
    mandalCity: 'Rajahmundry / Danavaipeta',
    motherTongue: 'Telugu & Urdu',
    familyDetails: {
      fatherNameAndOcc: 'Prof. Syed Anwarullah (Retd. Govt College Principal)',
      motherNameAndOcc: 'Mehrunissa Begum (High School Headmistress)',
      brothersCount: 2,
      brothersMarried: 1,
      sistersCount: 0,
      sistersMarried: 0,
      nativePlace: 'Rajahmundry, East Godavari',
      familyStatus: 'Middle Class',
      familyValues: 'Traditional & Practicing',
    },
    partnerPreferences: {
      minAge: 27,
      maxAge: 32,
      preferredDistricts: ['East Godavari (Rajahmundry)', 'Eluru District', 'Kakinada District', 'Hyderabad (Telangana)'],
      educationPreference: 'Post-Graduate, Engineer, Professor, Govt Officer, or Doctor',
      maritalStatusPreference: ['Never Married'],
      religiosityPreference: 'Sincere Muslim brother who fears Allah and treats his spouse with kindness',
    },
    mustHaves: [
      'Gentle character, respects educated working spouse',
      'Salah observance and honesty in all dealings',
      'Supportive of Islamic educational pursuits',
    ],
    dealBreakers: [
      'Bad temper, abusive language, or harsh temperament',
      'Habits like smoking, drinking, or gambling',
      'Financial demands or insistence on un-Islamic customs',
    ],
    aboutCandidate: 'Lecturer in Rajahmundry with a quiet, dignified personality. Passionate about science education, Urdu poetry, and household harmony. Brought up in a respected scholarly family.',
    guardianWaliContact: {
      name: 'Prof. Syed Anwarullah',
      relationship: 'Father',
      phone: '+91 98492 33445',
      preferredCallTime: '5:00 PM - 8:30 PM',
      includeInMessaging: true,
      visibility: 'verified_families_only',
    },
    photos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    ],
    photoPrivacy: 'blurred_until_request',
    avatarInitials: 'FS',
    avatarBgColor: '#7c3aed',
    documents: [
      {
        id: 'doc-3',
        type: 'Passport',
        fileName: 'Passport_Faiza_Masked.pdf',
        maskedId: 'PASS-XXXX-6290',
        uploadedAt: '2026-03-02',
        verified: true,
        verifiedBy: DEFAULT_ADMIN_EMAIL,
        isRestricted: true,
      },
    ],
    isVerified: true,
    approvalStatus: 'approved',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02',
    favoritesCount: 16,
    interestsReceivedCount: 12,
  },
  {
    id: 'prof-godavari-104',
    userId: 'usr-zayd-104',
    candidateName: 'Syed Zayd Ali',
    gender: 'groom',
    dob: '1995-02-18',
    age: 30,
    height: `6'0"`,
    maritalStatus: 'Never Married',
    religion: {
      sect: 'Sunni Hanafi',
      salah: '5 times daily',
      hijabOrBeard: 'Full Beard',
      quranRecitation: 'Daily',
      fastingRamadan: true,
      halalDiet: true,
    },
    education: 'Chartered Accountant (FCA), B.Com (Honours)',
    profession: 'Partner at Auditing Firm & Agro-Food Exporter',
    employedIn: 'Business / Self-Employed',
    annualIncomeRange: '₹35 - 50 Lakhs',
    district: 'Dr. B.R. Ambedkar Konaseema',
    mandalCity: 'Amalapuram / Ravulapalem',
    motherTongue: 'Telugu & Urdu',
    familyDetails: {
      fatherNameAndOcc: 'Syed Ghulam Dastagir (Former Agricultural Officer & Coconut Planter)',
      motherNameAndOcc: 'Hameeda Begum (Homemaker)',
      brothersCount: 1,
      brothersMarried: 1,
      sistersCount: 1,
      sistersMarried: 1,
      nativePlace: 'Amalapuram, Konaseema',
      familyStatus: 'Affluent',
      familyValues: 'Traditional & Practicing',
    },
    partnerPreferences: {
      minAge: 23,
      maxAge: 28,
      preferredDistricts: ['Dr. B.R. Ambedkar Konaseema', 'Kakinada District', 'West Godavari (Bhimavaram)', 'Yanam (Puducherry)'],
      educationPreference: 'Graduate in any field / Professional',
      maritalStatusPreference: ['Never Married'],
      religiosityPreference: 'Humble, religious Muslimah who loves family life and Islamic values',
    },
    mustHaves: [
      'Grounded in Islamic ethics and modesty',
      'Affectionate towards parents and joint-family gatherings',
      'Comfortable residing in Konaseema / Godavari region',
    ],
    dealBreakers: [
      'Lack of modesty or disregard for Islamic modesty',
      'Arrogance or disrespect towards elders',
    ],
    aboutCandidate: 'Practicing Chartered Accountant and agro-commodity exporter in Konaseema. Warm, humble, values Sunnah in financial dealings and community service. Loves Godavari nature and reading.',
    guardianWaliContact: {
      name: 'Syed Ghulam Dastagir',
      relationship: 'Father',
      phone: '+91 94410 77889',
      preferredCallTime: '6:00 PM - 9:00 PM',
      includeInMessaging: true,
      visibility: 'visible',
    },
    photos: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600',
    ],
    photoPrivacy: 'visible',
    avatarInitials: 'ZA',
    avatarBgColor: '#059669',
    documents: [
      {
        id: 'doc-4',
        type: 'Driving Licence',
        fileName: 'DrivingLicence_Zayd_AP05.pdf',
        maskedId: 'DL-XXXX-3341',
        uploadedAt: '2026-03-03',
        verified: true,
        verifiedBy: DEFAULT_ADMIN_EMAIL,
        isRestricted: true,
      },
    ],
    isVerified: true,
    approvalStatus: 'approved',
    createdAt: '2026-03-03',
    updatedAt: '2026-03-03',
    favoritesCount: 28,
    interestsReceivedCount: 22,
  },
  {
    id: 'prof-godavari-105',
    userId: 'usr-samina-105',
    candidateName: 'Samina Khatoon',
    gender: 'bride',
    dob: '2000-01-12',
    age: 24,
    height: `5'5"`,
    maritalStatus: 'Never Married',
    religion: {
      sect: 'Sunni Hanafi',
      salah: '5 times daily',
      hijabOrBeard: 'Observes Hijab/Niqab',
      quranRecitation: 'Daily',
      fastingRamadan: true,
      halalDiet: true,
    },
    education: 'B.Tech IT (SRKR Engineering College), MBA Finance',
    profession: 'Financial Systems Risk Analyst',
    employedIn: 'Private Sector',
    annualIncomeRange: '₹11 - 15 Lakhs',
    district: 'West Godavari (Bhimavaram)',
    mandalCity: 'Bhimavaram Town / Palakollu',
    motherTongue: 'Telugu & Urdu',
    familyDetails: {
      fatherNameAndOcc: 'Shaik Meera Saheb (Aqua Feed Manufacturer)',
      motherNameAndOcc: 'Zubaida Begum (Homemaker)',
      brothersCount: 1,
      brothersMarried: 0,
      sistersCount: 1,
      sistersMarried: 1,
      nativePlace: 'Bhimavaram, West Godavari',
      familyStatus: 'Upper Middle Class',
      familyValues: 'Modern Religious',
    },
    partnerPreferences: {
      minAge: 25,
      maxAge: 30,
      preferredDistricts: ['West Godavari (Bhimavaram)', 'Eluru District', 'Kakinada District', 'Hyderabad (Telangana)'],
      educationPreference: 'Engineer, CA, MBA, or Class-1 Professional',
      maritalStatusPreference: ['Never Married'],
      religiosityPreference: 'Prays regularly, clean habits, progressive yet deen-committed',
    },
    mustHaves: [
      'Clean habits, non-smoker, halal income',
      'Respectful and encouraging partner',
      'Belief in mutual consultation (Shura)',
    ],
    dealBreakers: [
      'Dowry demands, gold demands, or coercive rituals',
      'Addictions of any kind (cigarettes, alcohol, betel nut)',
      'Controlling or abusive mindset',
    ],
    aboutCandidate: 'Sharp, energetic financial analyst with strong spiritual discipline. Enjoys family cooking, interior gardening, and volunteer tutoring. Seeking an understanding partner for a peaceful home.',
    guardianWaliContact: {
      name: 'Shaik Meera Saheb',
      relationship: 'Father',
      phone: '+91 98485 99001',
      preferredCallTime: '7:30 PM - 10:00 PM',
      includeInMessaging: true,
      visibility: 'verified_families_only',
    },
    photos: [
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600',
    ],
    photoPrivacy: 'blurred_until_request',
    avatarInitials: 'SK',
    avatarBgColor: '#d97706',
    documents: [
      {
        id: 'doc-5',
        type: 'Aadhaar Card',
        fileName: 'Aadhaar_Samina_Bhimavaram.pdf',
        maskedId: 'XXXX-XXXX-9023',
        uploadedAt: '2026-03-03',
        verified: false,
        isRestricted: true,
      },
    ],
    isVerified: false,
    approvalStatus: 'pending',
    approvalNotes: 'Awaiting Admin review of candidate photos (3 attached) & Aadhaar identity document.',
    createdAt: '2026-03-03',
    updatedAt: '2026-03-03',
    favoritesCount: 19,
    interestsReceivedCount: 14,
  },
  {
    id: 'prof-godavari-106',
    userId: 'usr-imran-106',
    candidateName: 'Er. Mohammed Imran',
    gender: 'groom',
    dob: '1997-04-15',
    age: 28,
    height: `5'10"`,
    maritalStatus: 'Never Married',
    religion: {
      sect: 'Sunni Hanafi',
      salah: '5 times daily',
      hijabOrBeard: 'Trimmed Beard',
      quranRecitation: 'Daily',
      fastingRamadan: true,
      halalDiet: true,
    },
    education: 'B.Tech Mechanical, PMP Certified',
    profession: 'Senior Project Engineer (L&T Marine)',
    employedIn: 'Private Sector',
    annualIncomeRange: '₹14 - 18 Lakhs',
    district: 'Kakinada District',
    mandalCity: 'Kakinada Port & Smart City',
    motherTongue: 'Telugu & Urdu',
    familyDetails: {
      fatherNameAndOcc: 'Mohammed Ghouse (Retd. Port Trust Officer)',
      motherNameAndOcc: 'Noorjahan Begum (Homemaker)',
      brothersCount: 1,
      brothersMarried: 1,
      sistersCount: 0,
      sistersMarried: 0,
      nativePlace: 'Kakinada Town',
      familyStatus: 'Upper Middle Class',
      familyValues: 'Traditional & Practicing',
    },
    partnerPreferences: {
      minAge: 22,
      maxAge: 26,
      preferredDistricts: ['Kakinada District', 'East Godavari (Rajahmundry)', 'Yanam (Puducherry)'],
      educationPreference: 'Any Graduate / Professional Degree',
      maritalStatusPreference: ['Never Married'],
      religiosityPreference: 'Observes regular prayer, modest, family oriented',
    },
    mustHaves: [
      'Regular Salah practice',
      'Kind and respectful towards family',
      'Willingness to settle in Godavari / Hyderabad',
    ],
    dealBreakers: [
      'Smoking or addictions',
      'Disrespect towards parents',
    ],
    aboutCandidate: 'Dedicated marine engineer working on seaport infrastructure projects. Calm, deen-conscious, and values family closeness.',
    guardianWaliContact: {
      name: 'Mohammed Ghouse',
      relationship: 'Father',
      phone: '+91 98481 44556',
      preferredCallTime: '6:00 PM - 9:00 PM',
      includeInMessaging: true,
      visibility: 'visible',
    },
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
    ],
    photoPrivacy: 'visible',
    avatarInitials: 'MI',
    avatarBgColor: '#0284c7',
    documents: [
      {
        id: 'doc-6',
        type: 'PAN Card',
        fileName: 'PAN_Card_Imran_Kakinada.pdf',
        maskedId: 'XXXX-XX-4456',
        uploadedAt: '2026-03-04',
        verified: false,
        isRestricted: true,
      },
    ],
    isVerified: false,
    approvalStatus: 'pending',
    approvalNotes: 'Pending Admin review of uploaded candidate photos & PAN Card verification.',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-04',
    favoritesCount: 8,
    interestsReceivedCount: 5,
  },
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participantUserIds: ['usr-rayan-102', 'usr-ayesha-101'],
    participantProfileIds: ['prof-godavari-102', 'prof-godavari-101'],
    profileAName: 'Er. Mohammed Rayan',
    profileBName: 'Dr. Ayesha Begum',
    profileAGender: 'groom',
    profileBGender: 'bride',
    waliMonitored: true,
    waliDetails: {
      name: 'Haji Mohammed Abdul Razzaq',
      relationship: 'Father of Bride',
      phone: '+91 98480 12345',
    },
    isEncrypted: true,
    lastMessage: 'Assalamu Alaikum! My father would be delighted to welcome your family to Kakinada next Sunday inshaAllah.',
    lastMessageAt: '10:45 AM',
    unreadCount: 0,
  },
];

const SEED_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderUserId: 'usr-rayan-102',
      senderName: 'Er. Mohammed Rayan',
      senderRole: 'candidate',
      text: 'Assalamu Alaikum wa Rahmatullah. We reviewed your biodata through Nikah Pakka. My parents in Yanam would like to express sincere interest.',
      isEncrypted: true,
      timestamp: 'Yesterday 4:15 PM',
      read: true,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderUserId: 'usr-ayesha-101',
      senderName: 'Haji Mohammed Abdul Razzaq (Wali / Father)',
      senderRole: 'wali',
      text: 'Wa Alaikum Assalam brother Rayan. Alhamdulillah, we noted your Marine Engineering profile and background in Yanam. We value practicing Deen and family compatibility.',
      isEncrypted: true,
      timestamp: 'Yesterday 6:30 PM',
      read: true,
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderUserId: 'usr-rayan-102',
      senderName: 'Er. Mohammed Rayan',
      senderRole: 'candidate',
      text: 'Assalamu Alaikum! My father would be delighted to welcome your family to Kakinada next Sunday inshaAllah.',
      isEncrypted: true,
      timestamp: 'Today 10:45 AM',
      read: true,
    },
  ],
};

class StorageService {
  private usersKey = 'nikah_godavari_users';
  private profilesKey = 'nikah_godavari_profiles';
  private conversationsKey = 'nikah_godavari_conversations';
  private messagesKey = 'nikah_godavari_messages';
  private sessionKey = 'nikah_godavari_current_user';
  private auditLogsKey = 'nikah_godavari_audit_logs';

  // Legacy local-storage service retained only for compatibility with older UI imports.
  // Do not seed demo profiles, conversations, messages or audit records into real browsers.
  constructor() {}

  private initStorage() {
    if (!localStorage.getItem(this.profilesKey)) {
      localStorage.setItem(this.profilesKey, JSON.stringify(SEED_PROFILES));
    }
    if (!localStorage.getItem(this.conversationsKey)) {
      localStorage.setItem(this.conversationsKey, JSON.stringify(SEED_CONVERSATIONS));
    }
    if (!localStorage.getItem(this.messagesKey)) {
      localStorage.setItem(this.messagesKey, JSON.stringify(SEED_MESSAGES));
    }
    if (!localStorage.getItem(this.auditLogsKey)) {
      const initialLogs: AuditLog[] = [
        {
          id: 'log-1',
          action: 'PROFILE_APPROVED',
          performedBy: DEFAULT_ADMIN_EMAIL,
          targetId: 'prof-godavari-101',
          details: 'Dr. Ayesha Begum profile verified with Aadhaar and medical credentials.',
          timestamp: '2026-03-01 10:00:00',
        },
        {
          id: 'log-2',
          action: 'DOCUMENT_VERIFIED',
          performedBy: DEFAULT_ADMIN_EMAIL,
          targetId: 'prof-godavari-102',
          details: 'Yanam residence and identity document verified.',
          timestamp: '2026-03-02 11:30:00',
        },
      ];
      localStorage.setItem(this.auditLogsKey, JSON.stringify(initialLogs));
    }
  }

  // --- Auth & Session ---
  getCurrentUser(): UserAccount | null {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      this.recordAuditLog('USER_LOGIN', user.email, user.id, `User signed in via ${user.authProvider}`);
    } else {
      localStorage.removeItem(this.sessionKey);
    }
  }

  loginWithGoogle(emailOverride?: string): UserAccount {
    const email = emailOverride || 'godavari.candidate@gmail.com';
    // Legacy local authentication is never an administrator authority.
    const isAdmin = false;

    const user: UserAccount = {
      id: `usr-g-${Date.now()}`,
      email,
      phone: '+91 98490 00000',
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: isAdmin ? 'admin' : 'member',
      emailVerified: true,
      phoneVerified: true,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };

    this.setCurrentUser(user);
    return user;
  }

  registerWithEmailAndPhone(
    name: string,
    email: string,
    phone: string,
    role: 'member' | 'admin' = 'member'
  ): UserAccount {
    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      email,
      phone,
      name,
      role: 'member',
      emailVerified: false,
      phoneVerified: false,
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'pending',
    };

    this.setCurrentUser(user);
    return user;
  }

  verifyPhoneOTP(userId: string, otp: string): boolean {
    if (otp === '786786' || otp.length === 6) {
      const user = this.getCurrentUser();
      if (user && user.id === userId) {
        user.phoneVerified = true;
        user.status = 'active';
        this.setCurrentUser(user);
        return true;
      }
    }
    return false;
  }

  // --- Profiles ---
  getProfiles(): UserProfile[] {
    try {
      const raw = localStorage.getItem(this.profilesKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getApprovedProfiles(): UserProfile[] {
    return this.getProfiles().filter((p) => p.approvalStatus === 'approved');
  }

  getProfileById(id: string): UserProfile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  getMyProfile(userId: string): UserProfile | undefined {
    return this.getProfiles().find((p) => p.userId === userId);
  }

  saveProfile(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id || (profile.userId && p.userId === profile.userId));
    if (index >= 0) {
      profiles[index] = { ...profile, updatedAt: new Date().toISOString() };
    } else {
      profiles.unshift({
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(this.profilesKey, JSON.stringify(profiles));
  }

  deleteProfile(profileId: string, currentUserId: string): boolean {
    const profiles = this.getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return false;

    // Check authorization
    const currentUser = this.getCurrentUser();
    if (target.userId !== currentUserId && currentUser?.role !== 'admin') {
      throw new Error('Unauthorized to delete this profile.');
    }

    const filtered = profiles.filter((p) => p.id !== profileId);
    localStorage.setItem(this.profilesKey, JSON.stringify(filtered));
    return true;
  }

  // --- Messaging (Chaperoned & Encrypted) ---
  getConversations(userId: string): Conversation[] {
    try {
      const raw = localStorage.getItem(this.conversationsKey);
      const list: Conversation[] = raw ? JSON.parse(raw) : [];
      return list.filter((c) => c.participantUserIds.includes(userId));
    } catch {
      return [];
    }
  }

  getMessages(conversationId: string): Message[] {
    try {
      const raw = localStorage.getItem(this.messagesKey);
      const all: Record<string, Message[]> = raw ? JSON.parse(raw) : {};
      return all[conversationId] || [];
    } catch {
      return [];
    }
  }

  sendMessage(
    conversationId: string,
    senderUserId: string,
    senderName: string,
    senderRole: 'candidate' | 'wali' | 'parent',
    text: string
  ): Message {
    const raw = localStorage.getItem(this.messagesKey);
    const all: Record<string, Message[]> = raw ? JSON.parse(raw) : {};
    const conversationMessages = all[conversationId] || [];

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderUserId,
      senderName,
      senderRole,
      text,
      isEncrypted: true,
      timestamp: 'Just now',
      read: false,
    };

    conversationMessages.push(newMessage);
    all[conversationId] = conversationMessages;
    localStorage.setItem(this.messagesKey, JSON.stringify(all));

    // Update conversation lastMessage
    const convRaw = localStorage.getItem(this.conversationsKey);
    const convs: Conversation[] = convRaw ? JSON.parse(convRaw) : [];
    const convIndex = convs.findIndex((c) => c.id === conversationId);
    if (convIndex >= 0) {
      convs[convIndex].lastMessage = text;
      convs[convIndex].lastMessageAt = 'Just now';
      localStorage.setItem(this.conversationsKey, JSON.stringify(convs));
    }

    return newMessage;
  }

  createOrGetConversation(
    userAId: string,
    userBId: string,
    profileA: UserProfile,
    profileB: UserProfile
  ): Conversation {
    const convs = this.getConversations(userAId);
    const existing = convs.find(
      (c) => c.participantUserIds.includes(userAId) && c.participantUserIds.includes(userBId)
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      participantUserIds: [userAId, userBId],
      participantProfileIds: [profileA.id, profileB.id],
      profileAName: profileA.candidateName,
      profileBName: profileB.candidateName,
      profileAGender: profileA.gender,
      profileBGender: profileB.gender,
      waliMonitored: true,
      waliDetails: {
        name: profileB.guardianWaliContact.name || 'Wali / Elder',
        relationship: profileB.guardianWaliContact.relationship || 'Guardian',
        phone: profileB.guardianWaliContact.phone || '',
      },
      isEncrypted: true,
      lastMessage: 'Conversation initiated with Wali / Family inclusion.',
      lastMessageAt: 'Just now',
      unreadCount: 0,
    };

    const allConvsRaw = localStorage.getItem(this.conversationsKey);
    const allConvs: Conversation[] = allConvsRaw ? JSON.parse(allConvsRaw) : [];
    allConvs.unshift(newConv);
    localStorage.setItem(this.conversationsKey, JSON.stringify(allConvs));

    return newConv;
  }

  // --- Admin Approvals & Audits ---
  getAuditLogs(): AuditLog[] {
    try {
      const raw = localStorage.getItem(this.auditLogsKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  recordAuditLog(
    action: AuditLog['action'],
    performedBy: string,
    targetId: string,
    details: string
  ): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      performedBy,
      targetId,
      details,
      timestamp: new Date().toLocaleString(),
    });
    localStorage.setItem(this.auditLogsKey, JSON.stringify(logs.slice(0, 50)));
  }

  setProfileApprovalStatus(
    profileId: string,
    status: 'approved' | 'rejected' | 'suspended',
    reviewerEmail: string,
    notes?: string
  ): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profileId);
    if (index >= 0) {
      profiles[index].approvalStatus = status;
      profiles[index].approvalNotes = notes;
      if (status === 'approved') {
        profiles[index].isVerified = true;
        if (profiles[index].documents) {
          profiles[index].documents = profiles[index].documents.map((d) => ({
            ...d,
            verified: true,
            verifiedBy: reviewerEmail,
          }));
        }
      } else if (status === 'rejected') {
        profiles[index].isVerified = false;
        if (profiles[index].documents) {
          profiles[index].documents = profiles[index].documents.map((d) => ({
            ...d,
            verified: false,
          }));
        }
      }
      localStorage.setItem(this.profilesKey, JSON.stringify(profiles));

      this.recordAuditLog(
        status === 'approved' ? 'PROFILE_APPROVED' : status === 'rejected' ? 'PROFILE_REJECTED' : 'PROFILE_SUSPENDED',
        reviewerEmail,
        profileId,
        `Profile marked as ${status.toUpperCase()} by Admin based on Photo & Identity Verification. Notes: ${notes || 'Verified through standard review.'}`
      );
    }
  }
}

export const storageService = new StorageService();
