'use client';

import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { Link } from '../../navigation';
import { useTranslations } from 'next-intl';

export default function NavigationLoginButton() {
  const { user, loading } = useAuth();
  const t = useTranslations('Common');

  async function handleSignOut() {
    await signOut(auth);
  }

  if (loading) {
    return (
      <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full border border-white/20"
            referrerPolicy="no-referrer"
          />
        )}
        <button
          onClick={handleSignOut}
          className="text-xs font-medium text-gray-300 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-xs font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
    >
      {t('logIn')}
    </Link>
  );
}
