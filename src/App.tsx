
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

import { HeroSection } from './components/HeroSection';
import { MissionBanner } from './components/MissionBanner';
import { ProfilesList } from './components/ProfilesList';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { AuthModal } from './components/AuthModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { MessagingModal } from './components/MessagingModal';
import { FAQSection } from './components/FAQSection';
import { ShareCampaignSection } from './components/ShareCampaignSection';
import { DuaSection } from './components/DuaSection';
import { Footer } from './components/Footer';

import { AndroidTopBar } from './components/android/AndroidTopBar';
import { AndroidBottomNav, AndroidTab } from './components/android/AndroidBottomNav';
import { AndroidDrawer } from './components/android/AndroidDrawer';
import { AndroidFab } from './components/android/AndroidFab';
import { InterestsScreen } from './components/android/InterestsScreen';
import { ProfileScreen } from './components/android/ProfileScreen';

import {
  UserProfile,
  UserAccount,
  LanguageCode,
  DistrictAP,
  InterestRequestLists,
} from './types/database';

import { FilterState, MatrimonyProfile } from './types/matrimony';

import { auth, db } from './services/firebase';

import {
  logoutFirebaseUser,
  deleteOwnAccount,
  saveProfileToFirestore,
  fetchSavedProfileIds,
  saveProfileBookmark,
  removeProfileBookmark,
  createInterestRequest,
  fetchInterestRequests,
  respondToInterestRequest,
  cancelInterestRequest,
} from './services/firestoreService';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { translations } from './utils/translations';
import { CheckCircle2 } from 'lucide-react';
import { isAdminUser } from './utils/admin';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('nikah_godavari_language');
      return saved === 'te' ? 'te' : 'en';
    } catch {
      return 'en';
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    gender: 'all',
    city: 'All Cities',
    sect: 'All Sects',
    maritalStatus: 'All',
    minAge: 18,
    maxAge: 60,
    education: 'All',
    searchQuery: '',
    userCity: 'All Cities',
    radiusKm: 0,
  });

  const [activeTab, setActiveTab] = useState<AndroidTab>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messagingTargetConvId, setMessagingTargetConvId] = useState<string | undefined>();

  const [userInterests, setUserInterests] = useState<Set<string>>(() => new Set<string>());
  const [interestRequests, setInterestRequests] = useState<InterestRequestLists>({ incoming: [], outgoing: [] });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const t = translations[language];

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setMyProfile(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);

      try {
        const token = await getIdTokenResult(firebaseUser, true);
        const isAdmin = token.claims.admin === true;

        const user: UserAccount = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          name: firebaseUser.displayName || '',
          role: isAdmin ? 'admin' : 'member',
          emailVerified: firebaseUser.emailVerified,
          phoneVerified: Boolean(firebaseUser.phoneNumber),
          authProvider:
            firebaseUser.providerData[0]?.providerId === 'google.com'
              ? 'google'
              : 'email',
          createdAt:
            firebaseUser.metadata.creationTime || new Date().toISOString(),
          lastLoginAt:
            firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          status: 'active',
        };

        // Preserve the authenticated session even if profile loading fails.
        setCurrentUser(user);

        try {
          const profileSnapshot = await getDoc(
            doc(db, 'registrations', firebaseUser.uid)
          );

          if (profileSnapshot.exists()) {
            const data = profileSnapshot.data() as UserProfile;
            setMyProfile({
              ...data,
              id: firebaseUser.uid,
              userId: firebaseUser.uid,
            });
          } else {
            setMyProfile(null);
          }
        } catch (profileError) {
          console.error('Firebase profile load error:', profileError);
          setMyProfile(null);
        }
      } catch (error) {
        console.error('Firebase authentication session error:', error);
        setCurrentUser(null);
        setMyProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Save language preference
  useEffect(() => {
    try {
      localStorage.setItem('nikah_godavari_language', language);
    } catch {
      // Ignore storage errors
    }
  }, [language]);

  // Load this account's saved profiles from Firestore (shared across signed-in devices).
  useEffect(() => {
    let cancelled = false;
    setUserInterests(new Set<string>());

    if (!currentUser) return;

    void (async () => {
      const legacyKey = `nikah_pakka_interests_${currentUser.id}`;
      let legacyIds: string[] = [];

      // Migrate the previous device-only shortlist when its entries still point
      // to approved public profiles. Keep failed entries locally for a later retry.
      try {
        const raw = localStorage.getItem(legacyKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          legacyIds = parsed.filter((value): value is string => typeof value === 'string');
        }
      } catch (error) {
        console.warn('Could not read the legacy local shortlist:', error);
      }

      const migrationResults = await Promise.allSettled(
        legacyIds.map((profileId) => saveProfileBookmark(currentUser.id, profileId))
      );
      const failedLegacyIds = legacyIds.filter(
        (_profileId, index) => migrationResults[index]?.status === 'rejected'
      );

      try {
        if (failedLegacyIds.length) {
          localStorage.setItem(legacyKey, JSON.stringify(failedLegacyIds));
        } else {
          localStorage.removeItem(legacyKey);
        }
      } catch (error) {
        console.warn('Could not update the legacy local shortlist after migration:', error);
      }

      const profileIds = await fetchSavedProfileIds(currentUser.id);
      if (!cancelled) setUserInterests(new Set(profileIds));
    })().catch((error) => {
      console.error('Failed to load saved profiles from Firestore:', error);
      if (!cancelled) setUserInterests(new Set<string>());
    });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3800);
  };

  const refreshInterestRequests = async () => {
    if (!currentUser) {
      setInterestRequests({ incoming: [], outgoing: [] });
      return;
    }
    try {
      const requests = await fetchInterestRequests(currentUser.id);
      setInterestRequests(requests);
    } catch (error) {
      console.error('Could not load interest requests:', error);
      showToast('Unable to load interest requests. Please try again.');
    }
  };

  useEffect(() => {
    void refreshInterestRequests();
  }, [currentUser?.id]);

  const handleToggleLanguage = () => {
    const nextLang: LanguageCode = language === 'en' ? 'te' : 'en';
    setLanguage(nextLang);

    showToast(
      nextLang === 'te'
        ? 'భాష తెలుగులోకి మార్చబడింది'
        : 'Language set to English'
    );
  };

  // Load approved public profiles from Firestore
  const refreshProfiles = async () => {
    try {
      const profilesQuery = query(
        collection(db, 'publicProfiles'),
        where('approvalStatus', '==', 'approved'),
        where('isVerified', '==', true)
      );

      const snapshot = await getDocs(profilesQuery);

      const loadedProfiles = snapshot.docs.map((profileDoc) => {
        const data = profileDoc.data() as UserProfile;

        return {
          ...data,
          id: profileDoc.id,
          userId: profileDoc.id,
        };
      });

      setProfiles(loadedProfiles);
    } catch (error) {
      console.error('Failed to load public profiles:', error);
      setProfiles([]);
    }
  };

  useEffect(() => {
    // Approved public profiles are browseable without requiring an account.
    void refreshProfiles();
  }, [currentUser?.id]);

  // Load the signed-in user's profile
  const refreshMyProfile = async () => {
    if (!auth.currentUser) {
      setMyProfile(null);
      return;
    }

    try {
      const snapshot = await getDoc(
        doc(db, 'registrations', auth.currentUser.uid)
      );

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;

        setMyProfile({
          ...data,
          id: auth.currentUser.uid,
          userId: auth.currentUser.uid,
        });
      } else {
        setMyProfile(null);
      }
    } catch (error) {
      console.error('Failed to load your profile:', error);
    }
  };

  // Create and save a profile
  const handleProfileCreated = async (matrimonyProf: MatrimonyProfile) => {
    if (!currentUser || !auth.currentUser) {
      showToast('Please sign in before registering a profile.');
      setIsAuthOpen(true);
      return;
    }

    const adaptedProfile: UserProfile = {
      id: currentUser.id,
      userId: currentUser.id,
      candidateName: matrimonyProf.candidateName,
      candidateConsentConfirmed: matrimonyProf.candidateConsentConfirmed === true,
      candidateConsentAt: matrimonyProf.candidateConsentAt || new Date().toISOString(),
      gender: matrimonyProf.gender,
      dob: '',
      age: matrimonyProf.age,
      height: matrimonyProf.height,
      maritalStatus: matrimonyProf.maritalStatus as any,

      religion: {
        sect: matrimonyProf.sect,
        salah: (matrimonyProf.religiousPractice.salah || 'Not specified') as any,
        hijabOrBeard: (matrimonyProf.religiousPractice.hijabOrBeard || 'Not specified') as any,
        quranRecitation: 'Not specified',
        fastingRamadan: false,
        halalDiet: false,
      },

      education: matrimonyProf.education,
      profession: matrimonyProf.profession,
      employedIn: (matrimonyProf.employedIn || 'Not specified') as any,
      annualIncomeRange: matrimonyProf.annualIncomeRange,

      district: (matrimonyProf.city as DistrictAP) || 'Kakinada District',
      mandalCity: matrimonyProf.city,
      motherTongue: matrimonyProf.motherTongue,

      familyDetails: {
        fatherNameAndOcc: matrimonyProf.familyDetails.fatherNameAndOcc,
        motherNameAndOcc: matrimonyProf.familyDetails.motherNameAndOcc,
        brothersCount: matrimonyProf.familyDetails.brothersCount,
        brothersMarried: matrimonyProf.familyDetails.brothersMarried,
        sistersCount: matrimonyProf.familyDetails.sistersCount,
        sistersMarried: matrimonyProf.familyDetails.sistersMarried,
        nativePlace: matrimonyProf.familyDetails.nativePlace,
        familyStatus: 'Not specified',
        familyValues: (matrimonyProf.familyDetails.familyValues || 'Not specified') as any,
      },

      partnerPreferences: {
        minAge: matrimonyProf.partnerPreferences.minAge,
        maxAge: matrimonyProf.partnerPreferences.maxAge,
        preferredDistricts: [
          (matrimonyProf.city as DistrictAP) || 'Kakinada District',
        ],
        educationPreference:
          matrimonyProf.partnerPreferences.educationPreference || '',
        maritalStatusPreference:
          matrimonyProf.partnerPreferences.maritalStatusPreference,
        religiosityPreference:
          matrimonyProf.partnerPreferences.religiosityPreference || '',
      },

      mustHaves: [],
      dealBreakers: [],
      aboutCandidate: matrimonyProf.aboutCandidate,

      guardianWaliContact: {
        name: matrimonyProf.guardianWaliContact.name,
        relationship: matrimonyProf.guardianWaliContact.relationship,
        phone: matrimonyProf.guardianWaliContact.phone,
        preferredCallTime: matrimonyProf.guardianWaliContact.preferredCallTime,
        includeInMessaging: true,
        visibility: 'verified_families_only',
      },

      photos: (matrimonyProf.photos || []).filter(
        (photo) => typeof photo === 'string' && !photo.startsWith('data:')
      ),

      photoPrivacy: matrimonyProf.photoPrivacy || 'blurred_until_request',
      avatarInitials: matrimonyProf.avatarInitials,
      avatarBgColor: matrimonyProf.avatarBgColor,
      documents: [],
      isVerified: false,
      approvalStatus: 'pending',
      approvalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favoritesCount: 0,
      interestsReceivedCount: 0,
    };

    try {
      await saveProfileToFirestore(adaptedProfile);
      setMyProfile(adaptedProfile);

      showToast(
        language === 'te'
          ? 'మీ ప్రొఫైల్ అడ్మిన్ సమీక్ష కోసం సమర్పించబడింది.'
          : 'Your profile has been submitted for admin review.'
      );

      setActiveTab('profile');
    } catch (error) {
      console.error('Profile submission failed:', error);
      // Let RegistrationModal display the failure and keep the entered form data.
      throw error;
    }
  };

  // Save or remove a profile bookmark in the signed-in member's Firestore account.
  const handleExpressInterest = async (profileId: string) => {
    if (!currentUser) {
      showToast('Please sign in to save a profile.');
      setIsAuthOpen(true);
      return;
    }

    const alreadySaved = userInterests.has(profileId);
    try {
      if (alreadySaved) {
        await removeProfileBookmark(currentUser.id, profileId);
        setUserInterests((previous) => {
          const next = new Set(previous);
          next.delete(profileId);
          return next;
        });
        showToast('Profile removed from your saved list.');
      } else {
        await saveProfileBookmark(currentUser.id, profileId);
        setUserInterests((previous) => new Set(previous).add(profileId));
        showToast('Profile saved to your account. This does not notify the other family.');
      }
    } catch (error) {
      console.error('Could not update saved profile:', error);
      showToast(error instanceof Error ? error.message : 'Unable to update your saved profiles.');
    }
  };

  const handleSendInterestRequest = async (profileId: string) => {
    if (!currentUser) {
      showToast('Please sign in to send an interest request.');
      setIsAuthOpen(true);
      return;
    }
    try {
      await createInterestRequest(profileId);
      await refreshInterestRequests();
      showToast('Your interest request was sent to the candidate’s account.');
    } catch (error) {
      console.error('Could not send interest request:', error);
      showToast(error instanceof Error ? error.message : 'Unable to send the interest request.');
    }
  };

  const handleRespondToInterestRequest = async (
    requestId: string,
    status: 'accepted' | 'declined',
  ) => {
    try {
      await respondToInterestRequest(requestId, status);
      await refreshInterestRequests();
      showToast(status === 'accepted' ? 'Interest request accepted.' : 'Interest request declined.');
    } catch (error) {
      console.error('Could not update interest request:', error);
      showToast(error instanceof Error ? error.message : 'Unable to update this request.');
    }
  };

  const handleCancelInterestRequest = async (requestId: string) => {
    try {
      await cancelInterestRequest(requestId);
      await refreshInterestRequests();
      showToast('Interest request removed.');
    } catch (error) {
      console.error('Could not cancel interest request:', error);
      showToast(error instanceof Error ? error.message : 'Unable to remove this request.');
    }
  };

  // Start a conversation only when both profiles are available
  const handleStartChatWithProfile = (_targetProfile: UserProfile) => {
    if (!currentUser) {
      showToast('Please sign in to continue.');
      setIsAuthOpen(true);
      return;
    }

    showToast('Family messaging is not available yet. No message has been sent.');
  };

  const handleSignOut = async () => {
    try {
      await logoutFirebaseUser();

      setCurrentUser(null);
      setMyProfile(null);
      setIsMessagingOpen(false);
      setIsAdminOpen(false);

      showToast('Signed out successfully.');
    } catch (error) {
      console.error('Sign-out failed:', error);
      showToast('Unable to sign out. Please try again.');
    }
  };

  const handleDeleteAccount = async (password?: string) => {
    await deleteOwnAccount(password);
    setCurrentUser(null);
    setMyProfile(null);
    setProfiles([]);
    try {
      localStorage.removeItem(`nikah_pakka_interests_${currentUser?.id || ''}`);
    } catch (error) {
      console.error('Could not clear the legacy local shortlist after account deletion:', error);
    }
    setUserInterests(new Set<string>());
    setIsMessagingOpen(false);
    setIsAdminOpen(false);
    setSelectedProfile(null);
    showToast('Your account and profile records have been deleted.');
  };

  const handleOpenShare = () => {
    setActiveTab('home');

    window.setTimeout(() => {
      document.getElementById('share-section')?.scrollIntoView({
        behavior: 'smooth',
      });
    }, 100);
  };

  const handleSearchClick = () => {
    setActiveTab('matches');
  };

  // Filter available public profiles
  const filteredProfiles = profiles.filter((profile) => {
    if (filters.gender !== 'all' && profile.gender !== filters.gender) {
      return false;
    }

    if (
      filters.city !== 'All Cities' &&
      profile.district !== filters.city &&
      profile.mandalCity !== filters.city
    ) {
      return false;
    }

    if (
      filters.sect !== 'All Sects' &&
      profile.religion?.sect !== filters.sect
    ) {
      return false;
    }

    if (profile.age > filters.maxAge || profile.age < filters.minAge) {
      return false;
    }

    if (filters.searchQuery.trim()) {
      const search = filters.searchQuery.toLowerCase();

      const match =
        profile.candidateName?.toLowerCase().includes(search) ||
        profile.profession?.toLowerCase().includes(search) ||
        profile.education?.toLowerCase().includes(search) ||
        profile.district?.toLowerCase().includes(search) ||
        profile.mandalCity?.toLowerCase().includes(search);

      if (!match) return false;
    }

    return true;
  });

  // Messaging is not enabled; do not read legacy local demo conversations.
  const unreadMessagesCount = 0;

  const handleTabChange = (tab: AndroidTab) => {
    if (tab === 'messages') {
      if (!currentUser) {
        setIsAuthOpen(true);
        showToast('Please sign in to access messages.');
        return;
      }

      showToast('Family messaging is not available yet. No message has been sent.');
      return;
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700 mx-auto mb-4" />
          <p className="text-sm text-stone-600">Loading Nikah Pakka...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans pb-16">

      <AndroidTopBar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        currentUser={currentUser}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAdmin={() => {
          if (isAdminUser(currentUser)) setIsAdminOpen(true);
          else showToast('Administrator access is required.');
        }}
        activeScreen={activeTab}
        onNavigateHome={() => handleTabChange('home')}
      />

      <AndroidDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser}
        language={language}
        onNavigateTab={(tab) => handleTabChange(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRegister={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setIsRegisterOpen(true);
          }
        }}
        onOpenShare={handleOpenShare}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <div className="bg-emerald-950 text-white py-2 px-4 text-center text-xs font-medium border-b border-emerald-900/60">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                <span>
                  {language === 'te'
                    ? '🌙 అస్సలాము అలైకుమ్! నికాహ్ పక్కా – యానాం & గోదావరి ముస్లిం మ్యాట్రిమోనీ'
                    : '🌙 Assalamu Alaikum! Welcome to Nikah Pakka – Yanam & Godavari Muslim Matrimony'}
                </span>
                <span aria-hidden="true" className="hidden sm:inline text-emerald-600">·</span>
                <span className="hidden sm:inline text-amber-300">
                  {language === 'te'
                    ? 'ఖరీదైన సబ్‌స్క్రిప్షన్ల భారం లేదు · నేరుగా కుటుంబ పెద్దలతో సంప్రదింపులు'
                    : 'No paid subscription required · Family-led introductions'}
                </span>
              </div>
            </div>

            <HeroSection
              language={language}
              filters={filters}
              setFilters={setFilters}
              onOpenRegister={() => {
                if (!currentUser) setIsAuthOpen(true);
                else setIsRegisterOpen(true);
              }}
              onOpenShare={handleOpenShare}
              onSearchClick={handleSearchClick}
            />

            <div id="mission-section">
              <MissionBanner
                onOpenRegister={() => {
                  if (!currentUser) setIsAuthOpen(true);
                  else setIsRegisterOpen(true);
                }}
              />
            </div>

            <div id="matches-section">
              <ProfilesList
                profiles={filteredProfiles}
                filters={filters}
                setFilters={setFilters}
                onSelectProfile={setSelectedProfile}
                onExpressInterest={handleExpressInterest}
                userInterests={userInterests}
                language={language}
                onStartChat={handleStartChatWithProfile}
              />
            </div>

            <div id="faqs-section">
              <FAQSection
                language={language}
                onOpenRegister={() => {
                  if (!currentUser) setIsAuthOpen(true);
                  else setIsRegisterOpen(true);
                }}
              />
            </div>

            <div id="share-section">
              <ShareCampaignSection
                onOpenRegister={() => {
                  if (!currentUser) setIsAuthOpen(true);
                  else setIsRegisterOpen(true);
                }}
              />
            </div>

            <div id="duas-section">
              <DuaSection />
            </div>

            <Footer
              onOpenRegister={() => {
                if (!currentUser) setIsAuthOpen(true);
                else setIsRegisterOpen(true);
              }}
              onOpenShare={handleOpenShare}
            />
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="py-2">
            <ProfilesList
              profiles={filteredProfiles}
              filters={filters}
              setFilters={setFilters}
              onSelectProfile={setSelectedProfile}
              onExpressInterest={handleExpressInterest}
              userInterests={userInterests}
              language={language}
              onStartChat={handleStartChatWithProfile}
            />
          </div>
        )}

        {activeTab === 'interests' && (
          <InterestsScreen
            language={language}
            allProfiles={profiles}
            userInterests={userInterests}
            incomingRequests={interestRequests.incoming}
            outgoingRequests={interestRequests.outgoing}
            onRespondToRequest={handleRespondToInterestRequest}
            onCancelRequest={handleCancelInterestRequest}
            onSelectProfile={setSelectedProfile}
            onRemoveInterest={handleExpressInterest}
            onStartChat={handleStartChatWithProfile}
            onNavigateToMatches={() => setActiveTab('matches')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            myProfile={myProfile}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenRegister={() => {
              if (!currentUser) setIsAuthOpen(true);
              else setIsRegisterOpen(true);
            }}
            onOpenProfileEdit={() => {
              if (!currentUser) setIsAuthOpen(true);
              else if (!myProfile) setIsRegisterOpen(true);
              else setIsProfileEditOpen(true);
            }}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenShare={handleOpenShare}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      <AndroidFab
        onClick={() => {
          if (!currentUser) setIsAuthOpen(true);
          else setIsRegisterOpen(true);
        }}
        language={language}
      />

      <AndroidBottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        language={language}
        unreadMessagesCount={unreadMessagesCount}
        interestsCount={userInterests.size}
      />

      <ProfileDetailModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onExpressInterest={handleExpressInterest}
        onSendInterest={handleSendInterestRequest}
        hasPendingInterest={Boolean(selectedProfile && interestRequests.outgoing.some((request) => request.receiverUserId === selectedProfile.id && request.status === 'pending'))}
        isInterested={
          selectedProfile ? userInterests.has(selectedProfile.id) : false
        }
        language={language}
        onStartChat={handleStartChatWithProfile}
      />

      <RegistrationModal
        isOpen={isRegisterOpen && Boolean(currentUser)}
        onClose={() => setIsRegisterOpen(false)}
        onProfileCreated={handleProfileCreated}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user: UserAccount) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          showToast(`Assalamu Alaikum, ${user.name}!`);
          void refreshMyProfile();
        }}
        language={language}
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen && Boolean(currentUser)}
        onClose={() => setIsProfileEditOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={() => {
          void refreshMyProfile();
          void refreshProfiles();
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen && isAdminUser(currentUser)}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onProfileStatusChanged={() => {
          void refreshProfiles();
          void refreshMyProfile();
        }}
      />

      {currentUser && (
        <MessagingModal
          isOpen={isMessagingOpen}
          onClose={() => {
            setIsMessagingOpen(false);
            setMessagingTargetConvId(undefined);
          }}
          currentUser={currentUser}
          targetConversationId={messagingTargetConvId}
          language={language}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-stone-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl border border-stone-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
