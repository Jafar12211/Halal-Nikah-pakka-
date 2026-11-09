
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  limit,
  query,
} from 'firebase/firestore';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  getIdTokenResult,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User,
} from 'firebase/auth';

import { db, auth } from './firebase';
import { deleteUserStorageObjects } from './firebaseStorageService';
import type { AuditLog, InterestRequest, InterestRequestLists, UserAccount, UserProfile } from '../types/database';
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

  if (!result.user.emailVerified) {
    // Give existing accounts a fresh verification email so they are not locked
    // out without a recovery path. Sign out after sending the message.
    try {
      await sendEmailVerification(result.user);
    } finally {
      await signOut(auth);
    }
    const error = new Error('Your email address is not verified yet. We have sent a new verification link. Open that email, verify your address, then sign in again.') as Error & { code?: string };
    error.code = 'auth/email-not-verified';
    throw error;
  }

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

  // A newly created account is always a member. Admin privileges are granted
  // separately through a trusted Admin SDK custom claim after registration.
  return createUserAccount(result.user, false);
}

export async function sendPasswordReset(
  email: string,
): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Permanently deletes the signed-in user's Firebase account and profile records.
 * Recent authentication is required to prevent an old stolen session deleting an account.
 */
export async function deleteOwnAccount(password?: string): Promise<void> {
  const user = await requireSignedInUser();
  const providerIds = user.providerData.map((provider) => provider.providerId);

  if (providerIds.includes('password')) {
    if (!user.email || !password) {
      throw new Error('Enter your current password to confirm account deletion.');
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } else if (providerIds.includes('google.com')) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
  } else {
    throw new Error('Please sign in again using your original sign-in method, then retry account deletion.');
  }

  // Remove account-owned saved-profile bookmarks before deleting the account.
  await deleteSavedProfilesForUser(user.uid);

  // Storage rules enforce ownership. This operation is safe to retry if a later
  // cleanup step fails because deleting an already-empty folder is harmless.
  await deleteUserStorageObjects(user.uid);

  const batch = writeBatch(db);
  batch.delete(doc(db, 'registrations', user.uid));
  batch.delete(doc(db, 'publicProfiles', user.uid));
  await batch.commit();

  await deleteUser(user);
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
  // Keep only user-submitted, unverified document metadata. Admin verification
  // fields are never accepted from the profile editor.
  const safeDocuments = Array.isArray(documents)
    ? documents.map((entry: any) => ({
        id: String(entry.id || ''),
        type: entry.type,
        fileName: String(entry.fileName || ''),
        storagePath: String(entry.storagePath || ''),
        maskedId: String(entry.maskedId || ''),
        uploadedAt: String(entry.uploadedAt || ''),
        verified: false,
        isRestricted: true,
      }))
    : [];

  const safeData = removeUndefined({
    ...memberFields,
    documents: safeDocuments,
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
    // Any profile edit invalidates the previous review and removes the public listing.
    // The candidate must be reviewed again before the profile can reappear.
    const batch = writeBatch(db);
    batch.update(registrationRef, {
      ...safeData,
      approvalStatus: 'pending',
      isVerified: false,
    });
    batch.delete(doc(db, 'publicProfiles', user.uid));
    await batch.commit();
  }
}

// --------------------------------------------------
// ADMIN: VERIFY A PRIVATE GOVERNMENT DOCUMENT
// --------------------------------------------------
export async function verifyGovernmentDocumentFirestore(userId: string, documentId: string): Promise<void> {
  const adminUser = await requireAdmin();
  const performedBy = adminUser.email;
  if (!performedBy) throw new Error('Administrator account must have an email address to create an audit record.');
  if (!userId || !documentId) throw new Error('A valid candidate and document are required.');
  const registrationRef = doc(db, 'registrations', userId);
  const snapshot = await getDoc(registrationRef);
  if (!snapshot.exists()) throw new Error('Candidate registration was not found.');
  const data = snapshot.data();
  const docs = Array.isArray(data.documents) ? data.documents : [];
  const target = docs.find((item: any) => item.id === documentId);
  if (!target || typeof target.storagePath !== 'string' || !target.storagePath.startsWith(`identityDocuments/${userId}/`) || target.isRestricted !== true) {
    throw new Error('The private identity document record is invalid.');
  }
  const updatedDocuments = docs.map((item: any) => item.id === documentId
    ? { ...item, verified: true, verifiedBy: performedBy }
    : item);
  const batch = writeBatch(db);
  batch.update(registrationRef, { documents: updatedDocuments, updatedAt: serverTimestamp() });
  const auditRef = doc(collection(db, 'auditLogs'));
  batch.set(auditRef, {
    action: 'DOCUMENT_VERIFIED',
    performedBy,
    targetId: userId,
    details: `Government identity document ${target.type} (${target.maskedId}) reviewed and verified.`,
    timestamp: serverTimestamp(),
  });
  await batch.commit();
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
  status: 'approved' | 'rejected' | 'suspended',
  reviewerEmail?: string,
  notes?: string,
): Promise<void> {
  const adminUser = await requireAdmin();
  const performedBy = adminUser.email;
  if (!performedBy) throw new Error('Administrator account must have an email address to create an audit record.');

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
      data.photos.some((photo: unknown) => typeof photo === 'string' && photo.startsWith(`profilePhotos/${userId}/`));
    const hasVerifiedGovernmentId =
      Array.isArray(data.documents) &&
      data.documents.some((document: any) =>
        VALID_GOVT_DOC_TYPES.includes(document?.type) &&
        typeof document?.storagePath === 'string' &&
        document.storagePath.startsWith(`identityDocuments/${userId}/`) &&
        document?.verified === true &&
        document?.isRestricted === true &&
        typeof document?.fileName === 'string' &&
        document.fileName.trim().length > 0 &&
        typeof document?.maskedId === 'string' &&
        document.maskedId.trim().length > 0
      );

    if (!hasAdultAge || !hasCandidatePhoto || !hasVerifiedGovernmentId) {
      throw new Error(
        'Approval blocked. The candidate must be 18+, have a Firebase Storage photograph, and have an accepted government ID file in private storage that an administrator has actually reviewed.'
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
        ? data.photos.filter((photo: unknown) => typeof photo === 'string' && photo.startsWith(`profilePhotos/${userId}/`))
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

  const auditRef = doc(collection(db, 'auditLogs'));
  batch.set(auditRef, {
    action:
      status === 'approved'
        ? 'PROFILE_APPROVED'
        : status === 'rejected'
          ? 'PROFILE_REJECTED'
          : 'PROFILE_SUSPENDED',
    performedBy,
    targetId: userId,
    details: notes || `Profile status changed to ${status}.`,
    timestamp: serverTimestamp(),
  });

  await batch.commit();
}

// --------------------------------------------------
// MEMBER: FIRESTORE-BACKED INTEREST REQUESTS
// --------------------------------------------------

function toInterestRequest(snapshot: { id: string; data: () => Record<string, any> }): InterestRequest {
  const data = snapshot.data();
  const toIso = (value: any): string => {
    if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
    return typeof value === 'string' ? value : '';
  };
  return {
    id: snapshot.id,
    senderUserId: data.senderUserId,
    receiverUserId: data.receiverUserId,
    status: data.status,
    message: data.message || '',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function createInterestRequest(
  receiverUserId: string,
  message = '',
): Promise<string> {
  const sender = await requireSignedInUser();
  if (!receiverUserId || receiverUserId === sender.uid || receiverUserId.length > 128) {
    throw new Error('Choose a valid candidate to contact.');
  }
  const cleanMessage = message.trim();
  if (cleanMessage.length > 500) {
    throw new Error('Your introduction message must be 500 characters or fewer.');
  }

  const [senderProfile, receiverProfile] = await Promise.all([
    getDoc(doc(db, 'publicProfiles', sender.uid)),
    getDoc(doc(db, 'publicProfiles', receiverUserId)),
  ]);
  const isApproved = (snapshot: typeof senderProfile) =>
    snapshot.exists()
    && snapshot.data().approvalStatus === 'approved'
    && snapshot.data().isVerified === true;
  if (!isApproved(senderProfile)) {
    throw new Error('Your profile must be approved and verified before sending an interest request.');
  }
  if (!isApproved(receiverProfile)) {
    throw new Error('This candidate is no longer available for interest requests.');
  }

  const existingRequests = await getDocs(query(
    collection(db, 'interestRequests'),
    where('senderUserId', '==', sender.uid),
  ));
  const duplicate = existingRequests.docs.find((entry) =>
    entry.data().receiverUserId === receiverUserId && entry.data().status === 'pending'
  );
  if (duplicate) {
    throw new Error('You already have a pending interest request for this candidate.');
  }

  const requestRef = doc(collection(db, 'interestRequests'));
  await setDoc(requestRef, {
    senderUserId: sender.uid,
    receiverUserId,
    status: 'pending',
    message: cleanMessage,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return requestRef.id;
}

export async function fetchInterestRequests(uid: string): Promise<InterestRequestLists> {
  await requireOwnAccount(uid);
  const [incoming, outgoing] = await Promise.all([
    getDocs(query(collection(db, 'interestRequests'), where('receiverUserId', '==', uid))),
    getDocs(query(collection(db, 'interestRequests'), where('senderUserId', '==', uid))),
  ]);
  return {
    incoming: incoming.docs.map(toInterestRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    outgoing: outgoing.docs.map(toInterestRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export async function respondToInterestRequest(
  requestId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  const user = await requireSignedInUser();
  if (!requestId || requestId.length > 128) throw new Error('Invalid interest request.');
  await updateDoc(doc(db, 'interestRequests', requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelInterestRequest(requestId: string): Promise<void> {
  const user = await requireSignedInUser();
  if (!requestId || requestId.length > 128) throw new Error('Invalid interest request.');
  await deleteDoc(doc(db, 'interestRequests', requestId));
}

// --------------------------------------------------
// MEMBER: FIRESTORE-BACKED SAVED PROFILES
// --------------------------------------------------

async function requireOwnAccount(uid: string): Promise<User> {
  const user = await requireSignedInUser();
  if (!uid || user.uid !== uid) {
    throw new Error('You can manage saved profiles only for your own account.');
  }
  return user;
}

export async function fetchSavedProfileIds(uid: string): Promise<string[]> {
  await requireOwnAccount(uid);
  const snapshot = await getDocs(collection(db, 'users', uid, 'savedProfiles'));
  return snapshot.docs.map((entry) => entry.id);
}

export async function saveProfileBookmark(uid: string, profileId: string): Promise<void> {
  await requireOwnAccount(uid);
  if (!profileId || profileId === uid || profileId.length > 128) {
    throw new Error('Choose a valid profile to save.');
  }

  const publicProfile = await getDoc(doc(db, 'publicProfiles', profileId));
  if (
    !publicProfile.exists() ||
    publicProfile.data().approvalStatus !== 'approved' ||
    publicProfile.data().isVerified !== true
  ) {
    throw new Error('Only approved and verified profiles can be saved.');
  }

  const bookmarkRef = doc(db, 'users', uid, 'savedProfiles', profileId);
  const existing = await getDoc(bookmarkRef);
  if (existing.exists()) return;

  await setDoc(bookmarkRef, {
    profileId,
    createdAt: serverTimestamp(),
  });
}

export async function removeProfileBookmark(uid: string, profileId: string): Promise<void> {
  await requireOwnAccount(uid);
  if (!profileId || profileId.length > 128) {
    throw new Error('Choose a valid saved profile.');
  }
  await deleteDoc(doc(db, 'users', uid, 'savedProfiles', profileId));
}

async function deleteSavedProfilesForUser(uid: string): Promise<void> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'savedProfiles'));
  const entries = snapshot.docs;
  for (let offset = 0; offset < entries.length; offset += 450) {
    const batch = writeBatch(db);
    entries.slice(offset, offset + 450).forEach((entry) => batch.delete(entry.ref));
    await batch.commit();
  }
}

export async function fetchAdminAuditLogs(): Promise<AuditLog[]> {
  await requireAdmin();

  const snapshot = await getDocs(
    query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(100),
    ),
  );

  return snapshot.docs.map((entry) => {
    const data = entry.data();
    const timestamp =
      data.timestamp && typeof data.timestamp.toDate === 'function'
        ? data.timestamp.toDate().toISOString()
        : typeof data.timestamp === 'string'
          ? data.timestamp
          : '';

    return {
      ...data,
      id: entry.id,
      timestamp,
    } as AuditLog;
  });
}
