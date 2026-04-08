'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from '../../navigation';
import { useTranslations } from 'next-intl';
import { User, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

export default function UserMenuDropdown() {
  const t = useTranslations('UserMenu');
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key to close the dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut(auth);
    router.replace('/');
  };

  if (!user) return null;

  // Extract initials
  // Fallback to email initials if displayName is missing
  const nameToUse = user.displayName || user.email || 'User';
  let initials = '?';
  
  if (nameToUse) {
    const parts = nameToUse.split(/[ -]/);
    if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
      initials = `${parts[0][0]}${parts[1][0]}`;
    } else {
      initials = nameToUse.substring(0, 2);
    }
  }
  initials = initials.toUpperCase();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER ELEMENT */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="w-10 h-10 rounded-full bg-[#1a1c21] border border-white/10 flex items-center justify-center transition-all duration-150 ease-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#d4ff33]/50 overflow-hidden"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || 'User Avatar'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-white text-sm font-bold">{initials}</span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[280px] z-50 bg-[#111111] border border-white/10 rounded-xl shadow-xl shadow-black/40 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* USER INFO SECTION */}
          <div className="flex items-center gap-3 px-4 py-3 mb-1 border-b border-white/5">
            <div className="w-12 h-12 rounded-full shrink-0 bg-[#1a1c21] border border-white/10 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white text-lg font-bold">{initials}</span>
              )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-gray-100 font-bold text-base truncate">
                {user.displayName || 'Refindocs User'}
              </span>
              <span className="text-gray-400 text-sm truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* MENU ITEMS */}
          <div className="flex flex-col py-1">
            <button
              onClick={() => handleNavigation('/account')}
              className="flex items-center w-full px-4 py-3 hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/5 group"
              role="menuitem"
            >
              <User className="w-5 h-5 text-gray-400 mr-3 shrink-0 group-hover:text-gray-200 transition-colors" />
              <span className="text-[15px] text-gray-200 flex-1 text-left font-medium">{t('account')}</span>
              <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-gray-400 transition-colors" />
            </button>

            <button
              onClick={() => handleNavigation('/#faq')}
              className="flex items-center w-full px-4 py-3 hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/5 group"
              role="menuitem"
            >
              <HelpCircle className="w-5 h-5 text-gray-400 mr-3 shrink-0 group-hover:text-gray-200 transition-colors" />
              <span className="text-[15px] text-gray-200 flex-1 text-left font-medium">{t('help')}</span>
              <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-gray-400 transition-colors" />
            </button>
            
            <div className="h-px bg-white/5 my-1 mx-4" />

            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/5 group"
              role="menuitem"
            >
              <LogOut className="w-5 h-5 text-gray-400 mr-3 shrink-0 group-hover:text-gray-200 transition-colors" />
              <span className="text-[15px] text-gray-200 flex-1 text-left font-medium">{t('logout')}</span>
              <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-gray-400 transition-colors" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
