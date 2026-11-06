import { MatrimonyProfile, FilterState } from '../types/matrimony';

export const OFFICIAL_REGISTRATION_URL = 'https://site-75bd7eafe06f4ebf8c6d057f860920dd.freebuff.page/profile';

export const GODAVARI_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Yanam (Puducherry)': { lat: 16.7333, lng: 82.2167 },
  'Kakinada District': { lat: 16.9891, lng: 82.2475 },
  'Kakinada': { lat: 16.9891, lng: 82.2475 },
  'Dr. B.R. Ambedkar Konaseema': { lat: 16.5795, lng: 82.0079 },
  'Amalapuram': { lat: 16.5795, lng: 82.0079 },
  'East Godavari (Rajahmundry)': { lat: 17.0005, lng: 81.8040 },
  'Rajahmundry': { lat: 17.0005, lng: 81.8040 },
  'West Godavari (Bhimavaram)': { lat: 16.5448, lng: 81.5212 },
  'Bhimavaram': { lat: 16.5448, lng: 81.5212 },
  'Eluru District': { lat: 16.7107, lng: 81.0952 },
  'Eluru': { lat: 16.7107, lng: 81.0952 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Vijayawada / Krishna': { lat: 16.5062, lng: 80.6480 },
  'Guntur': { lat: 16.3067, lng: 80.4365 },
  'Hyderabad (Telangana)': { lat: 17.3850, lng: 78.4867 },
  'Gulf / Overseas NRI (Godavari Roots)': { lat: 25.2769, lng: 55.2962 },
};

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getProfileDistanceKm(profileDistrict: string, userCity: string): number {
  const loc1 = GODAVARI_COORDINATES[profileDistrict] || GODAVARI_COORDINATES['Kakinada District'];
  const loc2 = GODAVARI_COORDINATES[userCity] || GODAVARI_COORDINATES['Yanam (Puducherry)'];
  return Math.round(calculateDistanceKm(loc1.lat, loc1.lng, loc2.lat, loc2.lng));
}

/**
 * Filters a list of matrimony profiles based on user criteria.
 */
export function filterProfiles(profiles: MatrimonyProfile[], filters: FilterState): MatrimonyProfile[] {
  return profiles.filter((profile) => {
    // Gender filter
    if (filters.gender !== 'all' && profile.gender !== filters.gender) {
      return false;
    }

    // Age range
    if (profile.age < filters.minAge || profile.age > filters.maxAge) {
      return false;
    }

    // City filter
    if (filters.city && filters.city !== 'All Cities') {
      if (!profile.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }
    }

    // Radius / Distance filter
    if (filters.radiusKm && filters.radiusKm > 0 && filters.userCity && filters.userCity !== 'All Cities') {
      const distance = getProfileDistanceKm(profile.city, filters.userCity);
      if (distance > filters.radiusKm) {
        return false;
      }
    }

    // Sect filter
    if (filters.sect && filters.sect !== 'All Sects') {
      if (!profile.sect.toLowerCase().includes(filters.sect.toLowerCase())) {
        return false;
      }
    }

    // Marital Status
    if (filters.maritalStatus && filters.maritalStatus !== 'All') {
      if (profile.maritalStatus !== filters.maritalStatus) {
        return false;
      }
    }

    // Education filter
    if (filters.education && filters.education !== 'All') {
      if (!profile.education.toLowerCase().includes(filters.education.toLowerCase())) {
        return false;
      }
    }

    // Free text search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        profile.candidateName.toLowerCase().includes(q) ||
        profile.profession.toLowerCase().includes(q) ||
        profile.education.toLowerCase().includes(q) ||
        profile.city.toLowerCase().includes(q) ||
        profile.motherTongue.toLowerCase().includes(q) ||
        profile.aboutCandidate.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Calculates a religious and lifestyle compatibility percentage between two candidates or preferences.
 */
export function calculateCompatibilityScore(
  candidate: MatrimonyProfile,
  preferences?: Partial<MatrimonyProfile['partnerPreferences']>
): { score: number; highlights: string[] } {
  const highlights: string[] = [];
  let score = 70; // baseline community alignment

  if (candidate.isVerified) {
    score += 10;
    highlights.push('Manually verified family background');
  }

  if (candidate.religiousPractice.salah === '5 times daily') {
    score += 10;
    highlights.push('Punctual with 5 daily Salah');
  } else if (candidate.religiousPractice.salah === 'Regularly') {
    score += 5;
    highlights.push('Regular Salah practitioner');
  }

  if (candidate.religiousPractice.halalDiet) {
    score += 5;
    highlights.push('Strict Halal lifestyle');
  }

  if (candidate.guardianWaliContact.name && candidate.guardianWaliContact.phone) {
    score += 5;
    highlights.push('Family / Wali actively involved');
  }

  if (preferences?.minAge && preferences?.maxAge) {
    if (candidate.age >= preferences.minAge && candidate.age <= preferences.maxAge) {
      highlights.push('Within preferred age range');
    }
  }

  // Cap between 0 and 100
  const finalScore = Math.min(100, Math.max(50, score));
  return { score: finalScore, highlights };
}

/**
 * Supported government identity documents strictly limited to Aadhaar, PAN, Passport, and Driving Licence.
 */
export const VALID_GOVT_DOC_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving Licence',
] as const;

export type ValidGovtDoc = (typeof VALID_GOVT_DOC_TYPES)[number];

export function isValidGovtDocType(type: string): boolean {
  return VALID_GOVT_DOC_TYPES.includes(type as ValidGovtDoc);
}

/**
 * Validates registration input data.
 */
export interface RegistrationInput {
  registeredBy: string;
  registrantName: string;
  candidateName: string;
  gender: string;
  age: number | string;
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
  photoFile?: string;
  photos?: string[];
  photoPrivacy?: 'blurred_until_request' | 'visible' | 'avatar_only';
  govtIdType?: ValidGovtDoc | string;
  govtIdNumber?: string;
  govtIdFileName?: string;
  govtIdFile?: string;
}

/**
 * Mask government ID number to protect UIDAI and identity privacy (e.g. XXXX-XXXX-7860)
 * strictly supporting Aadhaar Card, PAN Card, Passport, Driving Licence
 */
export function maskGovtIdNumber(rawId: string, idType: string = 'Aadhaar Card'): string {
  const clean = rawId.replace(/[\s\-]/g, '');
  if (!clean) return 'XXXX-XXXX-7860';

  const typeLower = idType.toLowerCase();

  if (typeLower.includes('aadhaar') || typeLower.includes('aadhar')) {
    const last4 = clean.slice(-4) || '7860';
    return `XXXX-XXXX-${last4}`;
  }

  if (typeLower.includes('pan')) {
    const last4 = clean.slice(-4) || '1234';
    return `XXXX-XX-${last4.toUpperCase()}`;
  }

  if (typeLower.includes('passport')) {
    const last4 = clean.slice(-4) || '9876';
    return `PASS-XXXX-${last4.toUpperCase()}`;
  }

  if (typeLower.includes('driving') || typeLower.includes('license') || typeLower.includes('licence')) {
    const last4 = clean.slice(-4) || '5432';
    return `DL-XXXX-${last4.toUpperCase()}`;
  }

  if (clean.length > 4) {
    const last4 = clean.slice(-4);
    const maskedPrefix = 'X'.repeat(Math.max(4, clean.length - 4));
    return `${maskedPrefix}-${last4}`;
  }

  return `XXXX-${clean}`;
}

export function validateRegistrationForm(data: RegistrationInput): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.candidateName?.trim()) {
    errors.candidateName = 'Candidate name is required.';
  }

  if (!data.gender || !['groom', 'bride'].includes(data.gender)) {
    errors.gender = 'Please select Groom or Bride.';
  }

  const ageNum = Number(data.age);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 80) {
    errors.age = 'Age must be between 18 and 80.';
  }

  if (!data.city?.trim()) {
    errors.city = 'City / Location is required.';
  }

  if (!data.education?.trim()) {
    errors.education = 'Education qualification is required.';
  }

  if (!data.profession?.trim()) {
    errors.profession = 'Occupation / Profession is required.';
  }

  if (!data.guardianName?.trim()) {
    errors.guardianName = 'Parent or Guardian (Wali) name is required for genuine matchmaking.';
  }

  if (!data.guardianPhone?.trim()) {
    errors.guardianPhone = 'Guardian phone number is required.';
  } else {
    // Basic phone validation (allowing international formats and Indian 10-digit)
    const cleanPhone = data.guardianPhone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      errors.guardianPhone = 'Please provide a valid 10-15 digit phone number.';
    }
  }

  if (!data.consentConfirmed) {
    errors.consentConfirmed = 'Confirmation of candidate consent and genuine intentions is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates formatted WhatsApp share message for community outreach.
 */
export function generateWhatsAppShareMessage(targetProfileName?: string): string {
  if (targetProfileName) {
    return encodeURIComponent(
      `🌙 Assalamu Alaikum! Found a verified profile on Nikah Pakka for *${targetProfileName}*. A genuine Muslim matrimony platform with family involvement and zero expensive subscriptions. Check details here: ${OFFICIAL_REGISTRATION_URL} ❤️`
    );
  }

  return encodeURIComponent(
    `🌙 Assalamu Alaikum! ❤️\n\nIntroducing *NIKAH PAKKA* – A New Beginning for Genuine Muslim Matrimony!\n\nFinding a life partner should not put financial pressure on families through expensive subscriptions.\n\n✨ Easy registration\n✨ Affordable matchmaking\n✨ Local Muslim community connections\n✨ Family-assisted registration (Wali involvement)\n✨ Manual profile verification\n\n🤝 *Our Small Request:*\n1. Register if searching for a partner.\n2. Help an unmarried brother, sister or relative register.\n3. Share Nikah Pakka with 3 friends or families.\n\nYour one share could help someone find their life partner! 🤲\n\n🔗 Register here: ${OFFICIAL_REGISTRATION_URL}\n\nNikah Pakka ❤️ Your Community. Your Connection. Your Nikah.`
  );
}

/**
 * Generates clean text biodata to copy for family circulation.
 */
export function generateBiodataText(profile: MatrimonyProfile): string {
  return `
بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
*NIKAH PAKKA - VERIFIED MATRIMONIAL BIODATA*
Ref ID: #${profile.id.toUpperCase()}
------------------------------------
Candidate: ${profile.candidateName} (${profile.gender === 'bride' ? 'Bride' : 'Groom'})
Age & Height: ${profile.age} Years · ${profile.height}
Marital Status: ${profile.maritalStatus}
Location: ${profile.city}, ${profile.stateCountry}
Mother Tongue: ${profile.motherTongue}
Sect/Maslak: ${profile.sect}

DEEN & LIFESTYLE:
· Salah: ${profile.religiousPractice.salah}
· Dress / Appearance: ${profile.religiousPractice.hijabOrBeard}
· Halal Diet: ${profile.religiousPractice.halalDiet ? 'Strict Halal' : 'Halal'}

EDUCATION & CAREER:
· Qualification: ${profile.education}
· Profession: ${profile.profession} (${profile.employedIn})
· Annual Package: ${profile.annualIncomeRange}

FAMILY BACKGROUND:
· Father: ${profile.familyDetails.fatherNameAndOcc}
· Mother: ${profile.familyDetails.motherNameAndOcc}
· Siblings: ${profile.familyDetails.brothersCount} Brothers (${profile.familyDetails.brothersMarried} Married) · ${profile.familyDetails.sistersCount} Sisters (${profile.familyDetails.sistersMarried} Married)
· Native Place: ${profile.familyDetails.nativePlace}
· Family Values: ${profile.familyDetails.familyValues}

PARTNER PREFERENCES:
· Age Range: ${profile.partnerPreferences.minAge} - ${profile.partnerPreferences.maxAge} Years
· Education: ${profile.partnerPreferences.educationPreference || 'Graduate or equivalent'}
· Location: ${profile.partnerPreferences.locationPreference.join(', ')}

GUARDIAN (WALI) CONTACT:
· Contact Person: ${profile.guardianWaliContact.name} (${profile.guardianWaliContact.relationship})
· Phone: ${profile.guardianWaliContact.phone}
· Preferred Time: ${profile.guardianWaliContact.preferredCallTime}

Verified by Nikah Pakka Community Registry
Registration Portal: ${OFFICIAL_REGISTRATION_URL}
  `.trim();
}
