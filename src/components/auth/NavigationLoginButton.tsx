'use client';

import { useAuth } from '../../providers/AuthProvider';
import { Link } from '../../navigation';
import { useTranslations } from 'next-intl';

import UserMenuDropdown from './UserMenuDropdown';

export default function NavigationLoginButton() {
  const { user, loading } = useAuth();
  const t = useTranslations('Common');

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (user) {
    return <UserMenuDropdown />;
  }

  return (
    <Link
      href="/login"
      className="text-xs font-medium text-gray-300 hover:text-white transition-colors"
    >
      {t('logIn')}
    </Link>
  );
}
