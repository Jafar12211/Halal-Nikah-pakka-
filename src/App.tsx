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
        // Read the trusted administrator custom claim before loading profile data.
        // A profile-read failure must never erase a valid authenticated admin session.
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

        // Keep the authenticated account available even if its profile document
        // is missing or temporarily inaccessible.
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

