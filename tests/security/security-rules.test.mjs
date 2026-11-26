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
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getBytes
} from "firebase/storage";

let testEnv;

const projectId = process.env.GCLOUD_PROJECT || "nikah-pakka-staging";

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

const seedActiveMembership = async (uid) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `memberships/${uid}`), {
      userId: uid,
      planId: 'monthly',
      amountINR: 500,
      status: 'active',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  });
};

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

test("A member cannot add unapproved fields to identity-document metadata", async () => {
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
        extraField: "not allowed"
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

const validPublicProfile = (uid) => ({
  userId: uid,
  candidateName: "Approved Test Member",
  gender: "groom",
  age: 25,
  height: "5'8",
  maritalStatus: "Never Married",
  religion: {},
  education: "Graduate",
  profession: "Engineer",
  employedIn: "Private Sector",
  annualIncomeRange: "Not specified",
  district: "Yanam (Puducherry)",
  mandalCity: "Yanam",
  motherTongue: "Urdu",
  partnerPreferences: {},
  mustHaves: [],
  dealBreakers: [],
  aboutCandidate: "Test profile",
  photos: [],
  photoPrivacy: "avatar_only",
  avatarInitials: "TM",
  avatarBgColor: "#047857",
  documents: [],
  isVerified: true,
  approvalStatus: "approved",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  favoritesCount: 0,
  interestsReceivedCount: 0
});

test("Non-admin members cannot publish public profiles", async () => {
  const db = testEnv.authenticatedContext("member1").firestore();
  await assertFails(setDoc(
    doc(db, "publicProfiles/member1"),
    validPublicProfile("member1")
  ));
});

test("Signed-out visitors cannot read approved public profiles", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/member1"), validPublicProfile("member1"));
  });
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "publicProfiles/member1")));
});

test("Unverified accounts cannot read approved public profiles", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/member1"), validPublicProfile("member1"));
  });
  const db = testEnv.authenticatedContext("member2", { email_verified: false }).firestore();
  await assertFails(getDoc(doc(db, "publicProfiles/member1")));
});

test("Verified members can list only approved, verified public profiles", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/approved1"), validPublicProfile("approved1"));
    await setDoc(doc(context.firestore(), "publicProfiles/pending1"), {
      ...validPublicProfile("pending1"),
      approvalStatus: "pending",
      isVerified: false
    });
  });
  await seedActiveMembership("member2");
  const db = testEnv.authenticatedContext("member2", { email_verified: true }).firestore();
  const approvedQuery = query(
    collection(db, "publicProfiles"),
    where("approvalStatus", "==", "approved"),
    where("isVerified", "==", true)
  );
  const snapshot = await assertSucceeds(getDocs(approvedQuery));
  assert.equal(snapshot.size, 1);
  assert.equal(snapshot.docs[0].id, "approved1");
});


test("Signed-in unpaid users can read only minimal approved profile previews", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "profilePreviews/candidate1"), {
      gender: "bride",
      ageBand: "25-29",
      district: "Yanam (Puducherry)",
      approvalStatus: "approved",
      isVerified: true,
      updatedAt: new Date()
    });
    await setDoc(doc(context.firestore(), "publicProfiles/candidate1"), validPublicProfile("candidate1"));
  });
  const db = testEnv.authenticatedContext("unpaid1", { email_verified: true }).firestore();
  await assertSucceeds(getDoc(doc(db, "profilePreviews/candidate1")));
  await assertFails(getDoc(doc(db, "publicProfiles/candidate1")));
});

test("Unpaid users cannot read full biodata even when email verified", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/candidate1"), validPublicProfile("candidate1"));
  });
  const db = testEnv.authenticatedContext("unpaid1", { email_verified: true }).firestore();
  await assertFails(getDoc(doc(db, "publicProfiles/candidate1")));
});

test("Expired memberships cannot read full biodata", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/member1"), {
      userId: "member1", planId: "monthly", amountINR: 500, status: "active",
      expiresAt: new Date(Date.now() - 60_000)
    });
    await setDoc(doc(context.firestore(), "publicProfiles/candidate1"), validPublicProfile("candidate1"));
  });
  const db = testEnv.authenticatedContext("member1", { email_verified: true }).firestore();
  await assertFails(getDoc(doc(db, "publicProfiles/candidate1")));
});

test("Members cannot create or alter their own profile previews", async () => {
  const db = testEnv.authenticatedContext("member1", { email_verified: true }).firestore();
  await assertFails(setDoc(doc(db, "profilePreviews/member1"), {
    gender: "groom", ageBand: "25-29", district: "Yanam",
    approvalStatus: "approved", isVerified: true, updatedAt: serverTimestamp()
  }));
});

test("Administrators can publish only allowlisted public profile fields", async () => {
  const adminDb = testEnv.authenticatedContext(
    "admin1",
    { admin: true, email: "admin@example.com" }
  ).firestore();
  await assertSucceeds(setDoc(
    doc(adminDb, "publicProfiles/member1"),
    validPublicProfile("member1")
  ));
});

test("Administrators cannot publish private guardian or family fields", async () => {
  const adminDb = testEnv.authenticatedContext(
    "admin1",
    { admin: true, email: "admin@example.com" }
  ).firestore();
  await assertFails(setDoc(
    doc(adminDb, "publicProfiles/member1"),
    {
      ...validPublicProfile("member1"),
      guardianWaliContact: { phone: "+910000000000" }
    }
  ));
});

test("A member can save an approved public profile to their own account", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/profile1"), {
      approvalStatus: "approved",
      isVerified: true
    });
  });

  await seedActiveMembership("member1");
  const db = testEnv.authenticatedContext("member1", { email_verified: true }).firestore();

  await assertSucceeds(
    setDoc(doc(db, "users/member1/savedProfiles/profile1"), {
      profileId: "profile1",
      createdAt: serverTimestamp()
    })
  );
});

test("A member cannot save a pending or unverified profile", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/profile1"), {
      approvalStatus: "pending",
      isVerified: false
    });
  });

  const db = testEnv.authenticatedContext("member1").firestore();

  await assertFails(
    setDoc(doc(db, "users/member1/savedProfiles/profile1"), {
      profileId: "profile1",
      createdAt: serverTimestamp()
    })
  );
});

test("A member cannot read another member's saved profiles", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users/member1/savedProfiles/profile1"), {
      profileId: "profile1",
      createdAt: new Date()
    });
  });

  const otherDb = testEnv.authenticatedContext("member2").firestore();

  await assertFails(
    getDoc(doc(otherDb, "users/member1/savedProfiles/profile1"))
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

test("A verified admin email without the admin custom claim cannot create audit logs", async () => {
  const emailOnlyDb = testEnv.authenticatedContext(
    "email-only-user",
    { email_verified: true, email: "jafarmd0007@gmail.com" }
  ).firestore();

  await assertFails(
    setDoc(doc(emailOnlyDb, "auditLogs/email-only-attempt"), {
      performedBy: "jafarmd0007@gmail.com",
      targetId: "member1",
      action: "DOCUMENT_VERIFIED",
      details: "Must be denied without the admin custom claim"
    })
  );
});

test("An administrator cannot forge another audit identity", async () => {
  const adminDb = testEnv.authenticatedContext(
    "admin1",
    { admin: true, email: "admin@example.com" }
  ).firestore();

  await assertFails(
    setDoc(doc(adminDb, "auditLogs/forged-log"), {
      performedBy: "someone-else@example.com",
      targetId: "member1",
      action: "DOCUMENT_VERIFIED",
      details: "Forged audit record"
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

test("A verified admin email without the admin custom claim cannot read identity documents", async () => {
  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  const emailOnlyStorage = testEnv.authenticatedContext(
    "email-only-user",
    { email_verified: true, email: "jafarmd0007@gmail.com" }
  ).storage();

  await uploadBytes(
    ref(ownerStorage, "identityDocuments/member1/identity.pdf"),
    new Uint8Array([1, 2, 3]),
    { contentType: "application/pdf" }
  );

  await assertFails(
    getBytes(ref(emailOnlyStorage, "identityDocuments/member1/identity.pdf"))
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


test("Unpaid members cannot read photos even when a profile marks them visible", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/member1"), {
      approvalStatus: "approved", isVerified: true, photoPrivacy: "visible",
      photos: ["profilePhotos/member1/photo.webp"]
    });
  });
  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  const unpaidStorage = testEnv.authenticatedContext("member2", { email_verified: true }).storage();
  await uploadBytes(ref(ownerStorage, "profilePhotos/member1/photo.webp"), new Uint8Array([1, 2, 3]), {
    contentType: "image/png"
  });
  await assertFails(getBytes(ref(unpaidStorage, "profilePhotos/member1/photo.webp")));
});

test("Other members can read approved and visible profile photos", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "publicProfiles/member1"),
      {
        approvalStatus: "approved",
        isVerified: true,
        photoPrivacy: "visible",
        photos: ["profilePhotos/member1/photo.png"]
      }
    );
  });

  const ownerStorage = testEnv.authenticatedContext("member1").storage();
  await seedActiveMembership("member2");
  const otherStorage = testEnv.authenticatedContext("member2", { email_verified: true }).storage();

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

test("A member can create and read their own compressed Firestore profile photo", async () => {
  const db = testEnv.authenticatedContext("member1").firestore();
  const photo = doc(db, "profilePhotos/member1/items/photo.webp");
  await assertSucceeds(setDoc(photo, {
    ownerUid: "member1",
    dataUrl: "data:image/webp;base64,AQID",
    contentType: "image/webp",
    byteSize: 3,
    createdAt: serverTimestamp()
  }));
  await assertSucceeds(getDoc(photo));
});

test("Other members cannot read an unapproved Firestore profile photo", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "profilePhotos/member1/items/photo.webp"), {
      ownerUid: "member1",
      dataUrl: "data:image/webp;base64,AQID",
      contentType: "image/webp",
      byteSize: 3,
      createdAt: new Date()
    });
  });
  const otherDb = testEnv.authenticatedContext("member2").firestore();
  await assertFails(getDoc(doc(otherDb, "profilePhotos/member1/items/photo.webp")));
});

test("Other members can read only published photos on approved visible profiles", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/member1"), {
      approvalStatus: "approved",
      isVerified: true,
      photoPrivacy: "visible",
      photos: ["profilePhotos/member1/photo.webp"]
    });
    await setDoc(doc(context.firestore(), "profilePhotos/member1/items/photo.webp"), {
      ownerUid: "member1",
      dataUrl: "data:image/webp;base64,AQID",
      contentType: "image/webp",
      byteSize: 3,
      createdAt: new Date()
    });
    await setDoc(doc(context.firestore(), "profilePhotos/member1/items/unpublished.webp"), {
      ownerUid: "member1",
      dataUrl: "data:image/webp;base64,AQID",
      contentType: "image/webp",
      byteSize: 3,
      createdAt: new Date()
    });
  });
  await seedActiveMembership("member2");
  const otherDb = testEnv.authenticatedContext("member2", { email_verified: true }).firestore();
  await assertSucceeds(getDoc(doc(otherDb, "profilePhotos/member1/items/photo.webp")));
  await assertFails(getDoc(doc(otherDb, "profilePhotos/member1/items/unpublished.webp")));
});

test("A member cannot create a Firestore profile photo for another account", async () => {
  const db = testEnv.authenticatedContext("member2").firestore();
  await assertFails(setDoc(doc(db, "profilePhotos/member1/items/forged.webp"), {
    ownerUid: "member1",
    dataUrl: "data:image/webp;base64,AQID",
    contentType: "image/webp",
    byteSize: 3,
    createdAt: serverTimestamp()
  }));
});

test("Firestore profile photo documents reject images over the compressed size limit", async () => {
  const db = testEnv.authenticatedContext("member1").firestore();
  await assertFails(setDoc(doc(db, "profilePhotos/member1/items/oversized.webp"), {
    ownerUid: "member1",
    dataUrl: `data:image/webp;base64,${"A".repeat(850001)}`,
    contentType: "image/webp",
    byteSize: 614401,
    createdAt: serverTimestamp()
  }));
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



const seedApprovedProfiles = async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    for (const uid of ["sender1", "receiver1"]) {
      await setDoc(doc(context.firestore(), `publicProfiles/${uid}`), {
        userId: uid,
        approvalStatus: "approved",
        isVerified: true
      });
    }
  });
};

test("An approved member can send a private interest request to another approved member", async () => {
  await seedApprovedProfiles();
  await seedActiveMembership("sender1");
  const db = testEnv.authenticatedContext("sender1", { email_verified: true }).firestore();

  await assertSucceeds(setDoc(doc(db, "interestRequests/request1"), {
    senderUserId: "sender1",
    receiverUserId: "receiver1",
    status: "pending",
    message: "Assalamu Alaikum. Our family would like to learn more.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }));
});

test("A member cannot send an interest request before their profile is approved", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "publicProfiles/receiver1"), {
      userId: "receiver1",
      approvalStatus: "approved",
      isVerified: true
    });
  });
  const db = testEnv.authenticatedContext("sender1").firestore();

  await assertFails(setDoc(doc(db, "interestRequests/request1"), {
    senderUserId: "sender1",
    receiverUserId: "receiver1",
    status: "pending",
    message: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }));
});

test("Only the sender and recipient can read an interest request", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "interestRequests/request1"), {
      senderUserId: "sender1",
      receiverUserId: "receiver1",
      status: "pending",
      message: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  const senderDb = testEnv.authenticatedContext("sender1").firestore();
  const receiverDb = testEnv.authenticatedContext("receiver1").firestore();
  const outsiderDb = testEnv.authenticatedContext("outsider1").firestore();

  await assertSucceeds(getDoc(doc(senderDb, "interestRequests/request1")));
  await assertSucceeds(getDoc(doc(receiverDb, "interestRequests/request1")));
  await assertFails(getDoc(doc(outsiderDb, "interestRequests/request1")));
});

test("Only the recipient can accept or decline a pending interest request", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "interestRequests/request1"), {
      senderUserId: "sender1",
      receiverUserId: "receiver1",
      status: "pending",
      message: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  const senderDb = testEnv.authenticatedContext("sender1").firestore();
  const receiverDb = testEnv.authenticatedContext("receiver1").firestore();

  await assertFails(updateDoc(doc(senderDb, "interestRequests/request1"), {
    status: "accepted",
    updatedAt: serverTimestamp()
  }));
  await assertSucceeds(updateDoc(doc(receiverDb, "interestRequests/request1"), {
    status: "accepted",
    updatedAt: serverTimestamp()
  }));
});

test("A member cannot forge an interest request for another sender", async () => {
  await seedApprovedProfiles();
  const db = testEnv.authenticatedContext("outsider1").firestore();

  await assertFails(setDoc(doc(db, "interestRequests/request1"), {
    senderUserId: "sender1",
    receiverUserId: "receiver1",
    status: "pending",
    message: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }));
});


test("A participant can remove an interest request during account cleanup", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "interestRequests/request1"), {
      senderUserId: "sender1",
      receiverUserId: "receiver1",
      status: "pending",
      message: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  const senderDb = testEnv.authenticatedContext("sender1").firestore();
  await assertSucceeds(
    (await import("firebase/firestore")).deleteDoc(doc(senderDb, "interestRequests/request1"))
  );
});

test("An unrelated member cannot delete an interest request", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "interestRequests/request1"), {
      senderUserId: "sender1",
      receiverUserId: "receiver1",
      status: "pending",
      message: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  const outsiderDb = testEnv.authenticatedContext("outsider1").firestore();
  await assertFails(
    (await import("firebase/firestore")).deleteDoc(doc(outsiderDb, "interestRequests/request1"))
  );
});
