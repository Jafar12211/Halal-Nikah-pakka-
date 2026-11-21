import {
  deleteObject,
  getBlob,
  listAll,
  ref,
  uploadBytes,
  type StorageReference,
} from 'firebase/storage';
import { auth, storage } from './firebase';
import { isFirebaseStorageEmulatorEnabled } from '../utils/featureFlags';

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_ID_DOCUMENT_BYTES = 10 * 1024 * 1024;

export type GovernmentDocumentType =
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'voter_id'
  | 'driving_license'
  | 'other';

export interface UploadedIdentityDocument {
  storagePath: string;
  fileName: string;
  type: GovernmentDocumentType;
  verified: false;
  isRestricted: true;
}

function requireOwner(uid: string): void {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('You can upload or manage files only for your own account.');
  }
}

function requireLocalStorageEmulator(): void {
  if (!isFirebaseStorageEmulatorEnabled()) {
    throw new Error(
      'File uploads are disabled on hosted staging to prevent Firebase Storage charges. Use the local Firebase Storage Emulator for upload testing.',
    );
  }
}

function safeExtension(file: File): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  const extension = extensions[file.type];
  if (!extension) {
    throw new Error('Unsupported file type. Use JPG, PNG, WEBP or PDF as permitted.');
  }
  return extension;
}

function createFileName(file: File): string {
  const extension = safeExtension(file);
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

function assertImage(file: File, maxBytes: number): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please select a JPG, PNG or WEBP image.');
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`The selected image must be smaller than ${Math.floor(maxBytes / 1024 / 1024)} MB.`);
  }
}

function assertIdentityDocument(file: File): void {
  if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Identity documents must be PDF, JPG, PNG or WEBP files.');
  }
  if (file.size <= 0 || file.size > MAX_ID_DOCUMENT_BYTES) {
    throw new Error('The identity document must be smaller than 10 MB.');
  }
}

/** Uploads a candidate photo without creating a public download-token URL. */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  requireOwner(uid);
  requireLocalStorageEmulator();
  assertImage(file, MAX_PROFILE_PHOTO_BYTES);

  const fileName = createFileName(file);
  const storagePath = `profilePhotos/${uid}/${fileName}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: { ownerUid: uid, purpose: 'profile-photo' },
  });

  return storagePath;
}

/** Uploads an ID file into a restricted path; upload never marks it verified. */
export async function uploadGovernmentId(
  uid: string,
  file: File,
  documentType: GovernmentDocumentType,
): Promise<UploadedIdentityDocument> {
  requireOwner(uid);
  requireLocalStorageEmulator();
  assertIdentityDocument(file);

  const fileName = createFileName(file);
  const storagePath = `identityDocuments/${uid}/${fileName}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      ownerUid: uid,
      purpose: 'identity-document',
      documentType,
    },
  });

  return {
    storagePath,
    fileName,
    type: documentType,
    verified: false,
    isRestricted: true,
  };
}

/** Reads a file through Firebase Storage rules; never returns a bearer URL. */
export async function getStorageFileBlob(storagePath: string): Promise<Blob> {
  if (
    !storagePath.startsWith('profilePhotos/') &&
    !storagePath.startsWith('identityDocuments/')
  ) {
    throw new Error('Invalid private storage path.');
  }
  return getBlob(ref(storage, storagePath));
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (
    !storagePath.startsWith('profilePhotos/') &&
    !storagePath.startsWith('identityDocuments/')
  ) {
    throw new Error('Invalid private storage path.');
  }
  await deleteObject(ref(storage, storagePath));
}

async function deleteFolderContents(folderRef: StorageReference): Promise<void> {
  const result = await listAll(folderRef);
  await Promise.all(result.items.map((item) => deleteObject(item)));
  await Promise.all(result.prefixes.map((prefix) => deleteFolderContents(prefix)));
}

/** Removes both photo and ID folders before the Firebase Auth account is deleted. */
export async function deleteUserStorageObjects(uid: string): Promise<void> {
  requireOwner(uid);
  await Promise.all([
    deleteFolderContents(ref(storage, `profilePhotos/${uid}`)),
    deleteFolderContents(ref(storage, `identityDocuments/${uid}`)),
  ]);
}
