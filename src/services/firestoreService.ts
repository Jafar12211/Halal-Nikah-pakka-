
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getIdTokenResult,
  type User,
} from 'firebase/auth';

import { db, auth } from './firebase';
import type { UserAccount, UserProfile } from '../types/database';
import { VALID_GOVT_DOC_TYPES } from '../utils/matrimony';

// --------------------------------------------------
// REMOVE UNDEFINED VALUES RECURSIVELY
// --------------------------------------------------

function removeUndefined(value: any): any {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefined(item));
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const cleaned: Record<string, any> = {};

    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined) {
        cleaned[key] = removeUndefined(item);
      }
    }

    return cleaned;
  }

  return value;
}

// --------------------------------------------------
// AUTHENTICATION HELPERS
// --------------------------------------------------

async function getIsAdmin(user: User): Promise<boolean> {
  const token = await getIdTokenResult(user, true);
  return token.claims.admin === true;
}

function createUserAccount(
  user: User,
  isAdmin: boolean,
): UserAccount {
  return {
    id: user.uid,
    email: user.email || '',
    phone: user.phoneNumber || '',
    name: user.displayName || '',
    role: isAdmin ? 'admin' : 'member',
    emailVerified: user.emailVerified,
    phoneVerified: Boolean(user.phoneNumber),
    authProvider:
      user.providerData[0]?.providerId === 'google.com'
        ? 'google'
        : 'email',
    createdAt:
      user.metadata.creationTime || new Date().toISOString(),
    lastLoginAt:
      user.metadata.lastSignInTime || new Date().toISOString(),
    status: 'active',
  } as UserAccount;
}

// --------------------------------------------------
// GOOGLE SIGN-IN
// --------------------------------------------------

export async function signInWithGoogleAccount(): Promise<UserAccount> {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const isAdmin = await getIsAdmin(result.user);

  return createUserAccount(result.user, isAdmin);
}

// --------------------------------------------------
// EMAIL AND PASSWORD AUTHENTICATION
// --------------------------------------------------

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<UserAccount> {
  const result = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  const isAdmin = await getIsAdmin(result.user);

  return createUserAccount(result.user, isAdmin);
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
): Promise<UserAccount> {
  const result = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  const isAdmin = await getIsAdmin(result.user);

  return createUserAccount(result.user, isAdmin);
}

export async function sendPasswordReset(
  email: string,
): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

// --------------------------------------------------
// AUTHORIZATION
// --------------------------------------------------

async function requireSignedInUser(): Promise<User> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      'Please sign in before performing this action.',
    );
  }

  return user;
}

async function requireAdmin(): Promise<User> {
  const user = await requireSignedInUser();

  if (!(await getIsAdmin(user))) {
    throw new Error(
      'Administrator permission is required.',
    );
  }

  return user;
}

// --------------------------------------------------
// SAVE A PRIVATE USER REGISTRATION
// --------------------------------------------------

export async function saveProfileToFirestore(
  profile: UserProfile,
): Promise<void> {
  const user = await requireSignedInUser();

  if (!profile.userId || profile.userId !== user.uid) {
    throw new Error(
      'You can only save your own profile.',
    );
  }

  const registrationRef = doc(
    db,
    'registrations',
    user.uid,
  );

  const existing = await getDoc(registrationRef);

  // Members cannot set their own approval or verification status.
  const {
    id,
    approvalStatus,
    approvalNotes,
    isVerified,
    documents,
    ...memberFields
  } = profile as UserProfile & {
    approvalNotes?: string;
    documents?: unknown;
  };

  const safeData = removeUndefined({
    ...memberFields,
    userId: user.uid,
    updatedAt: serverTimestamp(),
  });

  if (!existing.exists()) {
    await setDoc(registrationRef, {
      ...safeData,
      approvalStatus: 'pending',
      isVerified: false,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(registrationRef, safeData);
  }
}

// --------------------------------------------------
// ADMIN: FETCH PRIVATE REGISTRATIONS
// --------------------------------------------------

export async function fetchAllRegistrations(): Promise<UserProfile[]> {
  await requireAdmin();

  const snapshot = await getDocs(
    collection(db, 'registrations'),
  );

  return snapshot.docs.map((registration) => {
    const data = registration.data();

    return {
      ...data,
      id: registration.id,
      userId: registration.id,
    } as UserProfile;
  });
}

// --------------------------------------------------
// ADMIN: APPROVE, REJECT OR SUSPEND PROFILE
// --------------------------------------------------

export async function updateProfileApprovalStatusFirestore(
  profileId: string,
  userId: string,
  status: 'pending' | 'approved' | 'rejected' | 'suspended',
  reviewerEmail?: string,
  notes?: string,
): Promise<void> {
  await requireAdmin();

  if (!userId || userId.length > 128) {
    throw new Error('Invalid user account ID.');
  }

  const registrationRef = doc(
    db,
    'registrations',
    userId,
  );

  const publicProfileRef = doc(
    db,
    'publicProfiles',
    userId,
  );

  const registration = await getDoc(registrationRef);

  if (!registration.exists()) {
    throw new Error('Registration not found.');
  }

  const data = registration.data();

  if (data.userId !== userId) {
    throw new Error(
      'Registration ownership check failed.',
    );
  }

  if (status === 'approved') {
    const hasAdultAge = Number.isInteger(data.age) && data.age >= 18 && data.age <= 100;
    const hasCandidatePhoto =
      Array.isArray(data.photos) &&
      data.photos.some((photo: unknown) => typeof photo === 'string' && /^https:\/\//i.test(photo));
    const hasVerifiedGovernmentId =
      Array.isArray(data.documents) &&
      data.documents.some((document: any) =>
        VALID_GOVT_DOC_TYPES.includes(document?.type) &&
        document?.verified === true &&
        document?.isRestricted === true &&
        typeof document?.fileName === 'string' &&
        document.fileName.trim().length > 0 &&
        typeof document?.maskedId === 'string' &&
        document.maskedId.trim().length > 0
      );

    if (!hasAdultAge || !hasCandidatePhoto || !hasVerifiedGovernmentId) {
      throw new Error(
        'Approval blocked. The candidate must be 18+, have a valid HTTPS photograph, and have an accepted government ID that an administrator has actually verified.'
      );
    }
  }

  // Keep approval and publishing changes together.
  const batch = writeBatch(db);

  batch.update(registrationRef, {
    approvalStatus: status,
    isVerified: status === 'approved',
    approvalNotes: notes || '',
    updatedAt: serverTimestamp(),
  });

  if (status === 'approved') {
    // Publish only the fields needed for the candidate listing.
    // Private guardian and identity-document information is excluded.
    const publicProfile = removeUndefined({
      userId,
      candidateName: data.candidateName || '',
      gender: data.gender || '',
      age: data.age || 0,
      height: data.height || '',
      maritalStatus: data.maritalStatus || '',
      religion: data.religion || {},
      education: data.education || '',
      profession: data.profession || '',
      employedIn: data.employedIn || '',
      annualIncomeRange: data.annualIncomeRange || '',
      district: data.district || '',
      mandalCity: data.mandalCity || '',
      motherTongue: data.motherTongue || '',
      partnerPreferences: data.partnerPreferences || {},
      mustHaves: data.mustHaves || [],
      dealBreakers: data.dealBreakers || [],
      aboutCandidate: data.aboutCandidate || '',
      // Do not expose photos unless the candidate explicitly chose public visibility.
      photos: data.photoPrivacy === 'visible' && Array.isArray(data.photos)
        ? data.photos.filter((photo: unknown) => typeof photo === 'string' && /^https:\/\//i.test(photo))
        : [],
      photoPrivacy: data.photoPrivacy === 'visible' ? 'visible' : 'avatar_only',
      avatarInitials: data.avatarInitials || '',
      avatarBgColor: data.avatarBgColor || '#047857',
      documents: [],
      isVerified: true,
      approvalStatus: 'approved',
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      favoritesCount: 0,
      interestsReceivedCount: 0,
    });

    batch.set(publicProfileRef, publicProfile);
  } else {
    // Unpublish profiles that are not approved.
    batch.delete(publicProfileRef);
  }

  await batch.commit();
}
