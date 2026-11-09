import assert from "node:assert/strict";
import {
  before,
  after,
  beforeEach,
  test
} from "node:test";

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from "@firebase/rules-unit-testing";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getBytes
} from "firebase/storage";

let testEnv;

const projectId = "nikah-pakka";

const documentMetadata = {
  id: "doc-1",
  type: "Aadhaar Card",
  fileName: "identity.pdf",
  storagePath: "identityDocuments/member1/identity.pdf",
  maskedId: "XXXX-XXXX-1234",
  uploadedAt: "2026-11-09T00:00:00.000Z",
  verified: false,
  isRestricted: true
};

const validRegistration = (uid) => ({
  userId: uid,
  candidateName: "Test Member",
  age: 25,
  candidateConsentConfirmed: true,
  candidateConsentAt: "2026-11-09T00:00:00.000Z",
  gender: "groom",
  maritalStatus: "Never Married",
  documents: [{ ...documentMetadata,
    storagePath: `identityDocuments/${uid}/identity.pdf`
  }],
  approvalStatus: "pending",
  isVerified: false
});

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: (await import("node:fs")).readFileSync("firestore.rules", "utf8")
    },
    storage: {
      host: "127.0.0.1",
      port: 9199,
      rules: (await import("node:fs")).readFileSync("storage.rules", "utf8")
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

after(async () => {
  await testEnv?.cleanup();
});

test("Unauthenticated users cannot read private registrations", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "registrations/member1"),
      validRegistration("member1")
    );
  });

  await assertFails(
    getDoc(doc(db, "registrations/member1"))
  );
});

test("Members can read their own registration but not another member's", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "registrations/member1"),
      validRegistration("member1")
    );
  });

  const ownerDb = testEnv.authenticatedContext("member1").firestore();
  const otherDb = testEnv.authenticatedContext("member2").firestore();

  await assertSucceeds(
    getDoc(doc(ownerDb, "registrations/member1"))
  );

  await assertFails(
    getDoc(doc(otherDb, "registrations/member1"))
  );
});

test("A member can create a valid registration", async () => {
  const db = testEnv.authenticatedContext("member1").firestore();

  await assertSucceeds(
    setDoc(
      doc(db, "registrations/member1"),
      validRegistration("member1")
    )
  );
});

test("A member cannot mark their government ID as verified", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "registrations/member1"),
      validRegistration("member1")
    );
  });

  const db = testEnv.authenticatedContext("member1").firestore();

  await assertFails(
    updateDoc(doc(db, "registrations/member1"), {
      documents: [{
        ...documentMetadata,
        storagePath: "identityDocuments/member1/identity.pdf",
        verified: true
      }]
    })
  );
});

test("An administrator can verify a government ID", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "registrations/member1"),
      validRegistration("member1")
    );
  });

  const adminDb = testEnv.authenticatedContext(
    "admin1",
    { admin: true, email: "admin@example.com" }
  ).firestore();

  await assertSucceeds(
    updateDoc(doc(adminDb, "registrations/member1"), {
      documents: [{
        ...documentMetadata,
        storagePath: "identityDocuments/member1/identity.pdf",
        verified: true,
        verifiedBy: "admin@example.com"
      }]
    })
  );
});

test("An administrator cannot add unexpected identity-document fields", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "registrations/member1"),
      validRegistration("member1")
    );
  });

  const adminDb = testEnv.authenticatedContext(
    "admin1",
    { admin: true, email: "admin@example.com" }
  ).firestore();

  await assertFails(
    updateDoc(doc(adminDb, "registrations/member1"), {
      documents: [{
        ...documentMetadata,
        storagePath: "identityDocuments/member1/identity.pdf",
        verified: true,
        verifiedBy: "admin@example.com",
        unexpectedPrivateField: "must be rejected"
      }]
    })
  );
});

test("An administrator can create an audit log", async () => {
  const adminDb = testEnv.authenticatedContext(
    "admin1",
    { admin: true, email: "admin@example.com" }
  ).firestore();

  await assertSucceeds(
    setDoc(doc(adminDb, "auditLogs/test-log"), {
      performedBy: "admin@example.com",
      targetId: "member1",
      action: "DOCUMENT_VERIFIED",
      details: "Test verification"
    })
  );
});

test("A member can upload and read their own identity document", async () => {
  const storage = testEnv.authenticatedContext("member1").storage();
  const file = ref(storage, "identityDocuments/member1/identity.pdf");

  await assertSucceeds(
    uploadBytes(file, new Uint8Array([1, 2, 3]), {
      contentType: "application/pdf"
    })
  );

  await assertSucceeds(getBytes(file));
});

test("Another member cannot read a private identity document", async () => {
  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  const otherStorage = testEnv.authenticatedContext("member2").storage();

  await uploadBytes(
    ref(ownerStorage, "identityDocuments/member1/identity.pdf"),
    new Uint8Array([1, 2, 3]),
    { contentType: "application/pdf" }
  );

  await assertFails(
    getBytes(
      ref(otherStorage, "identityDocuments/member1/identity.pdf")
    )
  );
});

test("An administrator can read a member's identity document", async () => {
  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  const adminStorage = testEnv.authenticatedContext(
    "admin1",
    { admin: true }
  ).storage();

  await uploadBytes(
    ref(ownerStorage, "identityDocuments/member1/identity.pdf"),
    new Uint8Array([1, 2, 3]),
    { contentType: "application/pdf" }
  );

  await assertSucceeds(
    getBytes(
      ref(adminStorage, "identityDocuments/member1/identity.pdf")
    )
  );
});

test("Other members cannot read private profile photos", async () => {
  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  const otherStorage = testEnv.authenticatedContext("member2").storage();

  await uploadBytes(
    ref(ownerStorage, "profilePhotos/member1/photo.png"),
    new Uint8Array([1, 2, 3]),
    { contentType: "image/png" }
  );

  await assertFails(
    getBytes(
      ref(otherStorage, "profilePhotos/member1/photo.png")
    )
  );
});

test("Other members can read approved and visible profile photos", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "publicProfiles/member1"),
      {
        approvalStatus: "approved",
        isVerified: true,
        photoPrivacy: "visible"
      }
    );
  });

  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  const otherStorage = testEnv.authenticatedContext("member2").storage();

  await uploadBytes(
    ref(ownerStorage, "profilePhotos/member1/photo.png"),
    new Uint8Array([1, 2, 3]),
    { contentType: "image/png" }
  );

  await assertSucceeds(
    getBytes(
      ref(otherStorage, "profilePhotos/member1/photo.png")
    )
  );
});

test("Users cannot upload oversized profile photos", async () => {
  const storage = testEnv.authenticatedContext("member1").storage();

  await assertFails(
    uploadBytes(
      ref(storage, "profilePhotos/member1/large.png"),
      new Uint8Array(5 * 1024 * 1024 + 1),
      { contentType: "image/png" }
    )
  );
});

