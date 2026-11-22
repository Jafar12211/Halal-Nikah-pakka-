import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  deleteObject,
  getBlob,
  listAll,
  ref,
  uploadBytes,
  type StorageReference,
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_COMPRESSED_PHOTO_BYTES = 600 * 1024;
const MAX_ID_DOCUMENT_BYTES = 5 * 1024 * 1024;
const MAX_COMPRESSED_ID_BYTES = 600 * 1024;

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

function safeExtension(file: File): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const extension = extensions[file.type];
  if (!extension) throw new Error('Unsupported file type. Use JPG, PNG, WEBP or PDF as permitted.');
  return extension;
}

function createFileName(extension: string): string {
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

function assertImage(file: File, maxBytes: number): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please select a JPG, PNG or WEBP image.');
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error('Each photograph must be 5 MB or smaller.');
  }
}

function assertIdentityDocument(file: File): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('For secure no-billing uploads, identity documents must be clear JPG, PNG or WEBP images.');
  }
  if (file.size <= 0 || file.size > MAX_ID_DOCUMENT_BYTES) {
    throw new Error('The identity document image must be 5 MB or smaller.');
  }
}

async function compressProfilePhoto(file: File): Promise<{ dataUrl: string; byteSize: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    let width = bitmap.width;
    let height = bitmap.height;
    const longestSide = Math.max(width, height);
    if (longestSide > 1280) {
      const scale = 1280 / longestSide;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this photograph.');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(bitmap, 0, 0, width, height);

    let quality = 0.82;
    let blob: Blob | null = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_COMPRESSED_PHOTO_BYTES) break;
      quality = Math.max(0.35, quality - 0.08);
      if (attempt === 3 || attempt === 5) {
        canvas.width = Math.max(1, Math.round(canvas.width * 0.8));
        canvas.height = Math.max(1, Math.round(canvas.height * 0.8));
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }
    }

    const compressedBlob = blob;
    if (!compressedBlob || compressedBlob.size > MAX_COMPRESSED_PHOTO_BYTES) {
      throw new Error('This photograph could not be compressed enough. Please choose a smaller image.');
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read compressed photograph.'));
      reader.onerror = () => reject(new Error('Could not read compressed photograph.'));
      reader.readAsDataURL(compressedBlob);
    });
    return { dataUrl, byteSize: compressedBlob.size };
  } finally {
    bitmap.close();
  }
}

/**
 * Stores a compressed photo in its own Firestore document. This avoids Cloud
 * Storage and its hosted Blaze-plan requirement. Each encoded image is kept
 * below 600 KiB so its Firestore document remains below the 1 MiB limit.
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  requireOwner(uid);
  assertImage(file, MAX_PROFILE_PHOTO_BYTES);

  const { dataUrl, byteSize } = await compressProfilePhoto(file);
  const fileName = createFileName('webp');
  const photoRef = doc(db, 'profilePhotos', uid, 'items', fileName);
  await setDoc(photoRef, {
    ownerUid: uid,
    dataUrl,
    contentType: 'image/webp',
    byteSize,
    createdAt: serverTimestamp(),
  });

  return `profilePhotos/${uid}/${fileName}`;
}

/**
 * Stores a compressed identity image in a private Firestore document. This
 * keeps hosted staging on the Firebase Spark plan without exposing files publicly.
 * The image is never marked verified by the upload operation.
 */
async function compressIdentityImage(file: File): Promise<{ dataUrl: string; byteSize: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    let width = bitmap.width;
    let height = bitmap.height;
    const longestSide = Math.max(width, height);
    if (longestSide > 1800) {
      const scale = 1800 / longestSide;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this ID image.');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(bitmap, 0, 0, width, height);
    let quality = 0.94;
    let blob: Blob | null = null;
    for (let attempt = 0; attempt < 7; attempt += 1) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_COMPRESSED_ID_BYTES) break;
      quality = Math.max(0.72, quality - 0.035);
      if (attempt === 3) {
        canvas.width = Math.max(1, Math.round(canvas.width * 0.9));
        canvas.height = Math.max(1, Math.round(canvas.height * 0.9));
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }
    }
    if (!blob || blob.size > MAX_COMPRESSED_ID_BYTES) {
      throw new Error('This ID image is too large to store securely on the free plan. Please take a clear, closer photo and try again.');
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the ID image.'));
      reader.onerror = () => reject(new Error('Could not read the ID image.'));
      reader.readAsDataURL(blob as Blob);
    });
    return { dataUrl, byteSize: blob.size };
  } finally {
    bitmap.close();
  }
}

/** Uploads a private ID image to Firestore; admin review is a separate action. */
export async function uploadGovernmentId(
  uid: string,
  file: File,
  documentType: GovernmentDocumentType,
): Promise<UploadedIdentityDocument> {
  requireOwner(uid);
  assertIdentityDocument(file);
  const { dataUrl, byteSize } = await compressIdentityImage(file);
  const fileName = createFileName('webp');
  const storagePath = `identityDocuments/${uid}/${fileName}`;
  await setDoc(doc(db, 'identityDocuments', uid, 'items', fileName), {
    ownerUid: uid,
    dataUrl,
    contentType: 'image/webp',
    byteSize,
    documentType,
    createdAt: serverTimestamp(),
  });
  return { storagePath, fileName, type: documentType, verified: false, isRestricted: true };
}

/** Reads a photo through Firestore rules or an ID file through Storage rules. */
export async function getStorageFileBlob(storagePath: string): Promise<Blob> {
  const photoMatch = /^profilePhotos\/([^/]+)\/([^/]+)$/.exec(storagePath);
  if (photoMatch) {
    const [, uid, fileName] = photoMatch;
    const snapshot = await getDoc(doc(db, 'profilePhotos', uid, 'items', fileName));
    if (!snapshot.exists()) throw new Error('This photograph is no longer available.');
    const data = snapshot.data();
    if (typeof data.dataUrl !== 'string' || data.contentType !== 'image/webp') {
      throw new Error('The stored photograph is invalid.');
    }
    const response = await fetch(data.dataUrl);
    if (!response.ok) throw new Error('Could not read the stored photograph.');
    return response.blob();
  }

  const identityMatch = /^identityDocuments\/([^/]+)\/([^/]+)$/.exec(storagePath);
  if (!identityMatch) throw new Error('Invalid private file path.');
  const [, uid, fileName] = identityMatch;
  const snapshot = await getDoc(doc(db, 'identityDocuments', uid, 'items', fileName));
  if (!snapshot.exists()) throw new Error('This identity document is no longer available.');
  const data = snapshot.data();
  if (typeof data.dataUrl !== 'string' || data.contentType !== 'image/webp') throw new Error('The stored identity document is invalid.');
  const response = await fetch(data.dataUrl);
  if (!response.ok) throw new Error('Could not read the stored identity document.');
  return response.blob();
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const photoMatch = /^profilePhotos\/([^/]+)\/([^/]+)$/.exec(storagePath);
  if (photoMatch) {
    const [, uid, fileName] = photoMatch;
    requireOwner(uid);
    await deleteDoc(doc(db, 'profilePhotos', uid, 'items', fileName));
    return;
  }
  const identityMatch = /^identityDocuments\/([^/]+)\/([^/]+)$/.exec(storagePath);
  if (!identityMatch) throw new Error('Invalid private file path.');
  const [, uid, fileName] = identityMatch;
  requireOwner(uid);
  await deleteDoc(doc(db, 'identityDocuments', uid, 'items', fileName));
}

async function deleteFolderContents(folderRef: StorageReference): Promise<void> {
  const result = await listAll(folderRef);
  await Promise.all(result.items.map((item) => deleteObject(item)));
  await Promise.all(result.prefixes.map((prefix) => deleteFolderContents(prefix)));
}

/** Removes the account's Firestore photos and private ID files before deletion. */
export async function deleteUserStorageObjects(uid: string): Promise<void> {
  requireOwner(uid);
  const photoDocs = await getDocs(collection(db, 'profilePhotos', uid, 'items'));
  await Promise.all(photoDocs.docs.map((entry) => deleteDoc(entry.ref)));
  const identityDocs = await getDocs(collection(db, 'identityDocuments', uid, 'items'));
  await Promise.all(identityDocs.docs.map((entry) => deleteDoc(entry.ref)));
}
