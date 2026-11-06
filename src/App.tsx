import React, { useState, useEffect } from 'react';
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

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return storageService.getCurrentUser();
  });

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
      // fallback
    }
    return new Set<string>();
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[language];

  // Save language preference
  useEffect(() => {
    try {
      localStorage.setItem('nikah_godavari_language', language);
    } catch {
      // ignore
    }
  }, [language]);

  // Sync interests
  useEffect(() => {
    try {
      localStorage.setItem('nikah_pakka_interests', JSON.stringify(Array.from(userInterests)));
    } catch (e) {
      console.error('Failed to save interests', e);
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
    showToast(nextLang === 'te' ? 'భాష తెలుగులోకి మార్చబడింది' : 'Language set to English');
  };

  const refreshProfiles = () => {
    setProfiles(storageService.getApprovedProfiles());
  };

  const handleProfileCreated = (matrimonyProf: MatrimonyProfile) => {
    // Adapt to full UserProfile and persist in storageService
    const adaptedProfile: UserProfile = {
      id: matrimonyProf.id,
      userId: currentUser?.id || `usr-${Date.now()}`,
      candidateName: matrimonyProf.candidateName,
      gender: matrimonyProf.gender,
      dob: '2000-01-01',
      age: matrimonyProf.age,
      height: matrimonyProf.height,
      maritalStatus: matrimonyProf.maritalStatus as any,
      religion: {
        sect: matrimonyProf.sect,
        salah: matrimonyProf.religiousPractice.salah as any,
        hijabOrBeard: matrimonyProf.religiousPractice.hijabOrBeard as any,
        quranRecitation: 'Daily',
        fastingRamadan: true,
        halalDiet: true,
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
        familyStatus: 'Upper Middle Class',
        familyValues: matrimonyProf.familyDetails.familyValues as any,
      },
      partnerPreferences: {
        minAge: matrimonyProf.partnerPreferences.minAge,
        maxAge: matrimonyProf.partnerPreferences.maxAge,
        preferredDistricts: [(matrimonyProf.city as DistrictAP) || 'Kakinada District'],
        educationPreference: matrimonyProf.partnerPreferences.educationPreference || 'Graduate',
        maritalStatusPreference: matrimonyProf.partnerPreferences.maritalStatusPreference,
        religiosityPreference: matrimonyProf.partnerPreferences.religiosityPreference || 'Practicing',
      },
      mustHaves: [
        'Observes 5 daily Salah',
        'Halal livelihood & clean habits',
        'Respectful of parents and elders',
      ],
      dealBreakers: [
        'Demand for dowry / Jahez',
        'Smoking, tobacco, or alcohol',
        'Lack of prayer or casual Deen attitude',
      ],
      aboutCandidate: matrimonyProf.aboutCandidate,
      guardianWaliContact: {
        name: matrimonyProf.guardianWaliContact.name,
        relationship: matrimonyProf.guardianWaliContact.relationship,
        phone: matrimonyProf.guardianWaliContact.phone,
        preferredCallTime: matrimonyProf.guardianWaliContact.preferredCallTime,
        includeInMessaging: true,
        visibility: 'verified_families_only',
      },
      photos:
        matrimonyProf.photos && matrimonyProf.photos.length > 0
          ? matrimonyProf.photos
          : matrimonyProf.photoUrl
          ? [matrimonyProf.photoUrl]
          : [],
      photoPrivacy: matrimonyProf.photoPrivacy || 'blurred_until_request',
      avatarInitials: matrimonyProf.avatarInitials,
      avatarBgColor: matrimonyProf.avatarBgColor,
      documents: matrimonyProf.documents && matrimonyProf.documents.length > 0
        ? (matrimonyProf.documents as any)
        : [
            {
              id: `doc-${Date.now()}`,
              type: 'Aadhaar Card',
              fileName: 'Aadhaar_Masked.pdf',
              maskedId: 'XXXX-XXXX-7860',
              uploadedAt: new Date().toISOString().split('T')[0],
              verified: false,
              isRestricted: true,
            },
          ],
      isVerified: false,
      approvalStatus: 'pending',
      approvalNotes: 'Awaiting Admin review of candidate photos & identity document proof.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favoritesCount: 0,
      interestsReceivedCount: 0,
    };

    storageService.saveProfile(adaptedProfile);
    refreshProfiles();
    showToast(
      language === 'te'
        ? `అల్హందులిల్లాహ్! ${adaptedProfile.candidateName} ప్రొఫైల్ నమోదైంది. అడ్మిన్ ఆమోదం కోసం సమర్పించబడింది.`
        : `Alhamdulillah! Profile for ${adaptedProfile.candidateName} registered. Submitted for Admin Photo & Identity review.`
    );

    setActiveTab('matches');
  };

  const handleExpressInterest = (profileId: string) => {
    setUserInterests((prev) => {
      const next = new Set(prev);
      const isCurrentlyInterested = next.has(profileId);
      if (isCurrentlyInterested) {
        next.delete(profileId);
        showToast(language === 'te' ? 'ఆసక్తి తొలగించబడింది.' : 'Proposal interest removed.');
      } else {
        next.add(profileId);
        showToast(
          language === 'te'
            ? 'అల్హందులిల్లాహ్! కుటుంబానికి ఆసక్తి సందేశం (ఖబర్) పంపబడింది.'
            : 'Proposal interest (Khabar) recorded for guardian communication. May Allah bless it!'
        );
      }
      return next;
    });
  };

  const handleStartChatWithProfile = (targetProfile: UserProfile) => {
    if (!currentUser) {
      showToast(language === 'te' ? 'దయచేసి మొదట లాగిన్ అవ్వండి.' : 'Please sign in to start family chat.');
      setIsAuthOpen(true);
      return;
    }

    const myProfile = storageService.getMyProfile(currentUser.id) || profiles[0];
    const conversation = storageService.createOrGetConversation(
      currentUser.id,
      targetProfile.userId || `usr-${targetProfile.id}`,
      myProfile,
      targetProfile
    );

    setMessagingTargetConvId(conversation.id);
    setIsMessagingOpen(true);
  };

  const handleSignOut = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    showToast(language === 'te' ? 'విజయవంతంగా లాగౌట్ అయ్యారు.' : 'Signed out successfully.');
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
    if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
    if (filters.city !== 'All Cities' && p.district !== filters.city && p.mandalCity !== filters.city) return false;
    if (filters.sect !== 'All Sects' && p.religion.sect !== filters.sect) return false;
    if (p.age > filters.maxAge) return false;
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

  // Calculate unread messages
  const unreadMessagesCount = currentUser
    ? storageService.getConversations(currentUser.id).reduce((acc, c) => acc + (c.unreadCount || 0), 0)
    : 0;

  const handleTabChange = (tab: AndroidTab) => {
    if (tab === 'messages') {
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
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenShare={handleOpenShare}
        onSignOut={handleSignOut}
      />

      {/* Main Dynamic View Area based on Android Tab */}
      <main className="flex-1">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div>
            {/* Top notification pill */}
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

            {/* Hero Section */}
            <HeroSection
              language={language}
              filters={filters}
              setFilters={setFilters}
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenShare={handleOpenShare}
              onSearchClick={handleSearchClick}
            />

            {/* Mission Banner: The problem with expensive matrimony & our community solution */}
            <div id="mission-section">
              <MissionBanner onOpenRegister={() => setIsRegisterOpen(true)} />
            </div>

            {/* Profiles Matchmaking Directory preview */}
            <div id="matches-section">
              <ProfilesList
                profiles={filteredProfiles}
                filters={filters}
                setFilters={setFilters}
                onSelectProfile={(p) => setSelectedProfile(p)}
                onExpressInterest={handleExpressInterest}
                userInterests={userInterests}
                language={language}
                onStartChat={handleStartChatWithProfile}
              />
            </div>

            {/* FAQ Section */}
            <div id="faqs-section">
              <FAQSection language={language} onOpenRegister={() => setIsRegisterOpen(true)} />
            </div>

            {/* The 3-Step Request & Share Campaign */}
            <div id="share-section">
              <ShareCampaignSection onOpenRegister={() => setIsRegisterOpen(true)} />
            </div>

            {/* Du'as & Sunnah guidance */}
            <div id="duas-section">
              <DuaSection />
            </div>

            {/* Footer */}
            <Footer
              onOpenRegister={() => setIsRegisterOpen(true)}
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
              onSelectProfile={(p) => setSelectedProfile(p)}
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
            onSelectProfile={(p) => setSelectedProfile(p)}
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
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenProfileEdit={() => setIsProfileEditOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenShare={handleOpenShare}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Android Floating Action Button (1-Tap Registration) */}
      <AndroidFab
        onClick={() => setIsRegisterOpen(true)}
        language={language}
      />

      {/* Android Material 3 Bottom Navigation Bar */}
      <AndroidBottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        language={language}
        unreadMessagesCount={unreadMessagesCount}
        interestsCount={userInterests.size}
      />

      {/* Profile Detail Biodata Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onExpressInterest={handleExpressInterest}
        isInterested={selectedProfile ? userInterests.has(selectedProfile.id) : false}
        language={language}
        onStartChat={handleStartChatWithProfile}
      />

      {/* Candidate Registration Wizard */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onProfileCreated={handleProfileCreated}
      />

      {/* Authentication Modal (Google Sign-In, Email, Phone 6-Digit OTP) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user: UserAccount) => {
          setCurrentUser(user);
          showToast(`Assalamu Alaikum, ${user.name}!`);
        }}
        language={language}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={refreshProfiles}
      />

      {/* Administrator Dashboard & Verification Console */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onProfileStatusChanged={refreshProfiles}
      />

      {/* Secure In-App Messaging Modal with Family Chaperone */}
      <MessagingModal
        isOpen={isMessagingOpen}
        onClose={() => {
          setIsMessagingOpen(false);
          setMessagingTargetConvId(undefined);
        }}
        currentUser={
          currentUser || {
            id: 'guest-user',
            name: 'Interested Family',
            email: 'guest@nikahpakka.in',
            phone: '+91 98480 00000',
            role: 'member',
            emailVerified: true,
            phoneVerified: true,
            authProvider: 'phone',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            status: 'active',
          }
        }
        targetConversationId={messagingTargetConvId}
        language={language}
      />

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
