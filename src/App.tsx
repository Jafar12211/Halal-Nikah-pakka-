
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
} from './types/database';

import { FilterState, MatrimonyProfile } from './types/matrimony';

import { storageService } from './services/storageService';
import { auth, db } from './services/firebase';

import {
  logoutFirebaseUser,
  saveProfileToFirestore,
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

  const [userInterests, setUserInterests] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nikah_pakka_interests');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

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

  // Save interests locally temporarily
  useEffect(() => {
    try {
      localStorage.setItem(
        'nikah_pakka_interests',
        JSON.stringify(Array.from(userInterests))
      );
    } catch (error) {
      console.error('Failed to save interests:', error);
    }
  }, [userInterests]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3800);
  };

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
        where('approvalStatus', '==', 'approved')
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
    void refreshProfiles();
  }, []);

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
      gender: matrimonyProf.gender,
      dob: '',
      age: matrimonyProf.age,
      height: matrimonyProf.height,
      maritalStatus: matrimonyProf.maritalStatus as any,

      religion: {
        sect: matrimonyProf.sect,
        salah: matrimonyProf.religiousPractice.salah as any,
        hijabOrBeard: matrimonyProf.religiousPractice.hijabOrBeard as any,
        quranRecitation: '',
        fastingRamadan: false,
        halalDiet: false,
      },

      education: matrimonyProf.education,
      profession: matrimonyProf.profession,
      employedIn: matrimonyProf.employedIn as any,
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
        familyStatus: '',
        familyValues: matrimonyProf.familyDetails.familyValues as any,
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

      setIsRegisterOpen(false);
      setActiveTab('profile');
    } catch (error) {
      console.error('Profile submission failed:', error);
      showToast(
        error instanceof Error
          ? error.message
          : 'Unable to submit your profile. Please try again.'
      );
    }
  };

  // Express interest (temporary local implementation)
  const handleExpressInterest = (profileId: string) => {
    if (!currentUser) {
      showToast('Please sign in to express interest.');
      setIsAuthOpen(true);
      return;
    }

    setUserInterests((previous) => {
      const next = new Set(previous);

      if (next.has(profileId)) {
        next.delete(profileId);
        showToast('Proposal interest removed.');
      } else {
        next.add(profileId);
        showToast('Your proposal interest has been recorded.');
      }

      return next;
    });
  };

  // Start a conversation only when both profiles are available
  const handleStartChatWithProfile = (targetProfile: UserProfile) => {
    if (!currentUser) {
      showToast('Please sign in to start a family conversation.');
      setIsAuthOpen(true);
      return;
    }

    if (!myProfile) {
      showToast('Please complete your profile before starting a conversation.');
      setIsRegisterOpen(true);
      return;
    }

    showToast(
      'Family messaging migration is not complete yet. Please try again later.'
    );
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

  // Local messaging data is retained temporarily for unread count only
  const unreadMessagesCount = currentUser
    ? storageService
        .getConversations(currentUser.id)
        .reduce(
          (total, conversation) =>
            total + (conversation.unreadCount || 0),
          0
        )
    : 0;

  const handleTabChange = (tab: AndroidTab) => {
    if (tab === 'messages') {
      if (!currentUser) {
        setIsAuthOpen(true);
        showToast('Please sign in to access messages.');
        return;
      }

      showToast('Messaging migration is not complete yet.');
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
          if (currentUser?.role === 'admin') setIsAdminOpen(true);
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
                    : 'Zero expensive subscriptions · Direct guardian communication'}
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
            onSelectProfile={setSelectedProfile}
            onRemoveInterest={handleExpressInterest}
            onStartChat={handleStartChatWithProfile}
            onNavigateToMatches={() => setActiveTab('matches')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
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
        isOpen={isAdminOpen && currentUser?.role === 'admin'}
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
