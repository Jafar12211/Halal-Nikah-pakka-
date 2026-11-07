
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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

// --------------------------------------------------
// AUTHENTICATION HELPERS
// --------------------------------------------------

async function getIsAdmin(user: User): Promise<boolean> {
  const token = await getIdTokenResult(user, true);
  return token.claims.admin === true;
}

function createUserAccount(user: User, isAdmin: boolean): UserAccount {
  return {
    id: user.uid,
    email: user.email || '',
    phone: user.phoneNumber || '',
    name: user.displayName || '',
    role: isAdmin ? 'admin' : 'member',
    emailVerified: user.emailVerified,
    phoneVerified: Boolean(user.phoneNumber),
    authProvider: user.providerData[0]?.providerId === 'google.com'
      ? 'google'
      : 'email',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
    status: 'active',
  } as UserAccount;
}

// --------------------------------------------------
// GOOGLE SIGN-IN
// --------------------------------------------------

export async function signInWithGoogleAccount(): Promise<UserAccount> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

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

export async function sendPasswordReset(email: string): Promise<void> {
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
    throw new Error('Please sign in before performing this action.');
  }

  return user;
}

async function requireAdmin(): Promise<User> {
  const user = await requireSignedInUser();

  if (!(await getIsAdmin(user))) {
    throw new Error('Administrator permission is required.');
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
    throw new Error('You can only save your own profile.');
  }

  const registrationRef = doc(db, 'registrations', user.uid);
  const existing = await getDoc(registrationRef);

  // Never accept approval or verification status from a member.
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

  const safeData = {
    ...memberFields,
    userId: user.uid,
    updatedAt: serverTimestamp(),
  };

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

  const snapshot = await getDocs(collection(db, 'registrations'));

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
// ADMIN: UPDATE PROFILE APPROVAL
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

  const registrationRef = doc(db, 'registrations', userId);
  const registration = await getDoc(registrationRef);

  if (!registration.exists()) {
    throw new Error('Registration not found.');
  }

  // The document ID is the Firebase Auth UID.
  if (registration.data().userId !== userId) {
    throw new Error('Registration ownership check failed.');
  }

  await updateDoc(registrationRef, {
    approvalStatus: status,
    approvalNotes: notes || '',
    updatedAt: serverTimestamp(),
  });
}
