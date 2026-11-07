
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

// Android App Shell Components
import { AndroidTopBar } from './components/android/AndroidTopBar';
import { AndroidBottomNav, AndroidTab } from './components/android/AndroidBottomNav';
import { AndroidDrawer } from './components/android/AndroidDrawer';
import { AndroidFab } from './components/android/AndroidFab';
import { InterestsScreen } from './components/android/InterestsScreen';
import { ProfileScreen } from './components/android/ProfileScreen';

import { UserProfile, UserAccount, LanguageCode, DistrictAP } from './types/database';
import { FilterState, MatrimonyProfile } from './types/matrimony';

import { storageService } from './services/storageService';
import { auth } from './services/firebase';
import {
  logoutFirebaseUser,
  saveProfileToFirestore,
  fetchAllRegistrations,
} from './services/firestoreService';

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

  // Firebase authentication session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    return storageService.getApprovedProfiles();
  });

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

  // Modal open states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messagingTargetConvId, setMessagingTargetConvId] = useState<string | undefined>(undefined);

  const [userInterests, setUserInterests] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nikah_pakka_interests');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set<string>();
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[language];

  // Listen for Firebase login/logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        return;
      }

      void (async () => {
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

          setCurrentUser(user);
        } catch (error) {
          console.error('Firebase session error:', error);
          setCurrentUser(null);
        }
      })();
    });

    return unsubscribe;
  }, []);

  // Save language preference
  useEffect(() => {
    try {
      localStorage.setItem('nikah_godavari_language', language);
    } catch {
      // Ignore
    }
  }, [language]);

  // Sync interests locally (Firestore migration will follow)
  useEffect(() => {
    try {
      localStorage.setItem(
        'nikah_pakka_interests',
        JSON.stringify(Array.from(userInterests))
      );
    } catch (error) {
      console.error('Failed to save interests', error);
    }
  }, [userInterests]);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
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

  const refreshProfiles = () => {
    // Temporary local profile loading.
    // Firestore profile discovery will be connected in the next migration step.
    setProfiles(storageService.getApprovedProfiles());
  };

  // Create profile
  const handleProfileCreated = async (matrimonyProf: MatrimonyProfile) => {
    if (!currentUser) {
      showToast(
        language === 'te'
          ? 'దయచేసి మొదట లాగిన్ అవ్వండి.'
          : 'Please sign in before registering a profile.'
      );

      setIsAuthOpen(true);
      return;
    }

    const adaptedProfile: UserProfile = {
      id: matrimonyProf.id,
      userId: currentUser.id,
      candidateName: matrimonyProf.candidateName,
      gender: matrimonyProf.gender,

      // These fields are retained from the existing application model.
      // They should be collected from the user rather than fabricated.
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

      // Firebase Storage is not enabled on the current Spark plan.
      // Do not save Base64 images or identity documents in Firestore.
      photos: (matrimonyProf.photos || []).filter(
        (photo) => typeof photo === 'string' && !photo.startsWith('data:')
      ),

      photoPrivacy: matrimonyProf.photoPrivacy || 'blurred_until_request',
      avatarInitials: matrimonyProf.avatarInitials,
      avatarBgColor: matrimonyProf.avatarBgColor,

      // Do not fabricate identity documents.
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

      showToast(
        language === 'te'
          ? `అల్హందులిల్లాహ్! ${adaptedProfile.candidateName} ప్రొఫైల్ సమర్పించబడింది.`
          : `Alhamdulillah! Profile for ${adaptedProfile.candidateName} submitted for admin review.`
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

  // Express interest (still local until interests are migrated)
  const handleExpressInterest = (profileId: string) => {
    if (!currentUser) {
      showToast(
        language === 'te'
          ? 'దయచేసి మొదట లాగిన్ అవ్వండి.'
          : 'Please sign in to express interest.'
      );

      setIsAuthOpen(true);
      return;
    }

    setUserInterests((prev) => {
      const next = new Set(prev);
      const isCurrentlyInterested = next.has(profileId);

      if (isCurrentlyInterested) {
        next.delete(profileId);

        showToast(
          language === 'te'
            ? 'ఆసక్తి తొలగించబడింది.'
            : 'Proposal interest removed.'
        );
      } else {
        next.add(profileId);

        showToast(
          language === 'te'
            ? 'ఆసక్తి సందేశం నమోదు చేయబడింది.'
            : 'Your proposal interest has been recorded.'
        );
      }

      return next;
    });
  };

  const handleStartChatWithProfile = (targetProfile: UserProfile) => {
    if (!currentUser) {
      showToast(
        language === 'te'
          ? 'దయచేసి మొదట లాగిన్ అవ్వండి.'
          : 'Please sign in to start family chat.'
      );

      setIsAuthOpen(true);
      return;
    }

    const myProfile = storageService.getMyProfile(currentUser.id);

    if (!myProfile) {
      showToast(
        'Please complete your profile before starting a conversation.'
      );
      setIsRegisterOpen(true);
      return;
    }

    const conversation = storageService.createOrGetConversation(
      currentUser.id,
      targetProfile.userId,
      myProfile,
      targetProfile
    );

    setMessagingTargetConvId(conversation.id);
    setIsMessagingOpen(true);
  };

  // Firebase sign-out
  const handleSignOut = async () => {
    try {
      await logoutFirebaseUser();

      setCurrentUser(null);
      setIsMessagingOpen(false);
      setIsAdminOpen(false);

      showToast(
        language === 'te'
          ? 'విజయవంతంగా లాగౌట్ అయ్యారు.'
          : 'Signed out successfully.'
      );
    } catch (error) {
      console.error('Sign-out failed:', error);
      showToast('Unable to sign out. Please try again.');
    }
  };

  const handleOpenShare = () => {
    setActiveTab('home');

    setTimeout(() => {
      const el = document.getElementById('share-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSearchClick = () => {
    setActiveTab('matches');
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    if (filters.gender !== 'all' && p.gender !== filters.gender) {
      return false;
    }

    if (
      filters.city !== 'All Cities' &&
      p.district !== filters.city &&
      p.mandalCity !== filters.city
    ) {
      return false;
    }

    if (filters.sect !== 'All Sects' && p.religion.sect !== filters.sect) {
      return false;
    }

    if (p.age > filters.maxAge || p.age < filters.minAge) {
      return false;
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();

      const match =
        p.candidateName.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.education.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.mandalCity.toLowerCase().includes(q);

      if (!match) return false;
    }

    return true;
  });

  // Unread message count
  // Messaging is still using the existing local service at this stage.
  const unreadMessagesCount = currentUser
    ? storageService
        .getConversations(currentUser.id)
        .reduce((acc, conversation) => {
          return acc + (conversation.unreadCount || 0);
        }, 0)
    : 0;

  const handleTabChange = (tab: AndroidTab) => {
    if (tab === 'messages') {
      if (!currentUser) {
        setIsAuthOpen(true);
        showToast('Please sign in to access messages.');
        return;
      }

      setIsMessagingOpen(true);
    } else {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans pb-16">

      {/* Android Material 3 Top App Bar */}
      <AndroidTopBar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        currentUser={currentUser}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeScreen={activeTab}
        onNavigateHome={() => handleTabChange('home')}
      />

      {/* Android Sliding Navigation Drawer */}
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

      {/* Main Dynamic View Area */}
      <main className="flex-1">

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div>
            <div className="bg-emerald-950 text-white py-2 px-4 text-center text-xs font-medium border-b border-emerald-900/60">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                <span>
                  {language === 'te'
                    ? '🌙 అస్సలాము అలైకుమ్! నికాహ్ పక్కా – యానాం & గోదావరి ముస్లిం మ్యాట్రిమోనీ'
                    : '🌙 Assalamu Alaikum! Welcome to Nikah Pakka – Yanam & Godavari Muslim Matrimony'}
                </span>

                <span
                  aria-hidden="true"
                  className="hidden sm:inline text-emerald-600"
                >
                  ·
                </span>

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
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setIsRegisterOpen(true);
                }
              }}
              onOpenShare={handleOpenShare}
              onSearchClick={handleSearchClick}
            />

            <div id="mission-section">
              <MissionBanner
                onOpenRegister={() => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                  } else {
                    setIsRegisterOpen(true);
                  }
                }}
              />
            </div>

            <div id="matches-section">
              <ProfilesList
                profiles={filteredProfiles}
                filters={filters}
                setFilters={setFilters}
                onSelectProfile={(profile) => setSelectedProfile(profile)}
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
                  if (!currentUser) {
                    setIsAuthOpen(true);
                  } else {
                    setIsRegisterOpen(true);
                  }
                }}
              />
            </div>

            <div id="share-section">
              <ShareCampaignSection
                onOpenRegister={() => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                  } else {
                    setIsRegisterOpen(true);
                  }
                }}
              />
            </div>

            <div id="duas-section">
              <DuaSection />
            </div>

            <Footer
              onOpenRegister={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setIsRegisterOpen(true);
                }
              }}
              onOpenShare={handleOpenShare}
            />
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="py-2">
            <ProfilesList
              profiles={filteredProfiles}
              filters={filters}
              setFilters={setFilters}
              onSelectProfile={(profile) => setSelectedProfile(profile)}
              onExpressInterest={handleExpressInterest}
              userInterests={userInterests}
              language={language}
              onStartChat={handleStartChatWithProfile}
            />
          </div>
        )}

        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <InterestsScreen
            language={language}
            allProfiles={profiles}
            userInterests={userInterests}
            onSelectProfile={(profile) => setSelectedProfile(profile)}
            onRemoveInterest={handleExpressInterest}
            onStartChat={handleStartChatWithProfile}
            onNavigateToMatches={() => setActiveTab('matches')}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenRegister={() => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                setIsRegisterOpen(true);
              }
            }}
            onOpenProfileEdit={() => setIsProfileEditOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenShare={handleOpenShare}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Android Floating Action Button */}
      <AndroidFab
        onClick={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setIsRegisterOpen(true);
          }
        }}
        language={language}
      />

      {/* Android Bottom Navigation */}
      <AndroidBottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        language={language}
        unreadMessagesCount={unreadMessagesCount}
        interestsCount={userInterests.size}
      />

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onExpressInterest={handleExpressInterest}
        isInterested={
          selectedProfile
            ? userInterests.has(selectedProfile.id)
            : false
        }
        language={language}
        onStartChat={handleStartChatWithProfile}
      />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen && Boolean(currentUser)}
        onClose={() => setIsRegisterOpen(false)}
        onProfileCreated={handleProfileCreated}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user: UserAccount) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          showToast(`Assalamu Alaikum, ${user.name}!`);
        }}
        language={language}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen && Boolean(currentUser)}
        onClose={() => setIsProfileEditOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={refreshProfiles}
      />

      {/* Admin Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminOpen && currentUser?.role === 'admin'}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onProfileStatusChanged={refreshProfiles}
      />

      {/* Messaging Modal */}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-stone-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl border border-stone-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
