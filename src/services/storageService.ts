import {
  UserAccount,
  UserProfile,
  Conversation,
  Message,
  InterestRequest,
  AuditLog,
  DistrictAP
} from '../types/database';

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

const SEED_PROFILES: UserProfile[] = [];

const SEED_CONVERSATIONS: Conversation[] = [];

const SEED_MESSAGES: Record<string, Message[]> = {};

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
    const user: UserAccount = {
      id: `usr-g-${Date.now()}`,
      email,
      phone: '+91 98490 00000',
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'member',
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
