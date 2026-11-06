import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query,
  serverTimestamp
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { UserProfile, UserAccount } from '../types/database';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const DEFAULT_ADMIN_EMAIL = 'jafarmd0007@gmail.com';

export async function signInWithGoogleAccount(): Promise<UserAccount> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    const email = firebaseUser.email || 'candidate@nikahpakka.org';
    const isAdmin = email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();

    const userAccount: UserAccount = {
      id: firebaseUser.uid,
      email,
      phone: firebaseUser.phoneNumber || '+91 98490 00000',
      name: firebaseUser.displayName || email.split('@')[0],
      role: isAdmin ? 'admin' : 'member',
      emailVerified: firebaseUser.emailVerified,
      phoneVerified: true,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };

    return userAccount;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'auth');
    throw error;
  }
}

export async function logoutFirebaseUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'auth');
  }
}

export async function saveProfileToFirestore(profile: UserProfile): Promise<void> {
  const userId = auth.currentUser?.uid || profile.userId;
  if (!userId) {
    throw new Error('User not authenticated with Firebase.');
  }

  const path = `registrations/${userId}`;
  try {
    const docRef = doc(db, 'registrations', userId);
    const existingSnap = await getDoc(docRef);
    const now = new Date().toISOString();

    const payload = {
      ...profile,
      userId,
      verificationStatus: profile.approvalStatus || 'pending',
      updatedAt: now,
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt || now) : now,
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function fetchAllRegistrations(): Promise<UserProfile[]> {
  const path = 'registrations';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const list: UserProfile[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as UserProfile);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updateProfileApprovalStatusFirestore(
  profileId: string,
  userId: string,
  status: 'approved' | 'rejected' | 'suspended',
  reviewerEmail: string,
  notes?: string
): Promise<void> {
  const path = `registrations/${userId}`;
  try {
    const docRef = doc(db, 'registrations', userId);
    await updateDoc(docRef, {
      approvalStatus: status,
      verificationStatus: status,
      approvalNotes: notes || '',
      isVerified: status === 'approved',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}
