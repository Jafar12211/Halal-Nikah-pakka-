import React from 'react';
import { Home, Users, MessageSquare, Heart, User } from 'lucide-react';
import { LanguageCode } from '../../types/database';

export type AndroidTab = 'home' | 'matches' | 'messages' | 'interests' | 'profile';

interface AndroidBottomNavProps {
  activeTab: AndroidTab;
  onChangeTab: (tab: AndroidTab) => void;
  language: LanguageCode;
  unreadMessagesCount: number;
  interestsCount: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onChangeTab,
  language,
  unreadMessagesCount,
  interestsCount,
}) => {
  const isTelugu = language === 'te';

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(8);
    }
  };

  const navItems: { id: AndroidTab; labelEn: string; labelTe: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      labelEn: 'Home',
      labelTe: 'హోమ్',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'matches',
      labelEn: 'Matches',
      labelTe: 'సంబంధాలు',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'messages',
      labelEn: 'Chat',
      labelTe: 'చాట్',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'interests',
      labelEn: 'Interests',
      labelTe: 'ఆసక్తి',
      icon: <Heart className="w-5 h-5" />,
      badge: interestsCount > 0 ? interestsCount : undefined,
    },
    {
      id: 'profile',
      labelEn: 'Profile',
      labelTe: 'ప్రొఫైల్',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none pb-[env(safe-area-inset-bottom)]"
      aria-label="Android Bottom Navigation"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const label = isTelugu ? item.labelTe : item.labelEn;

          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic();
                onChangeTab(item.id);
              }}
              className="flex-1 flex flex-col items-center justify-center py-1 group relative transition-transform active:scale-95"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Material 3 active pill indicator */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-800 text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.icon}

                {/* Badge indicator */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-emerald-950 font-bold' : 'text-stone-500'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
