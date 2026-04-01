import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';

export default async function PrivacyPage() {
  const tCommon = await getTranslations('Common');
  
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#d4ff33] hover:underline mb-8 inline-block">
          ← {tCommon('home')}
        </Link>
        <h1 className="text-4xl font-bold mb-8">{tCommon('privacyNotice')}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-4">Last updated: April 1, 2026</p>
          <p className="text-gray-300 leading-relaxed mb-6">
            At Refindocs, we take your privacy seriously. This Privacy Notice explains how we collect, use, and protect your personal information when you use our services.
          </p>
          <h2 className="text-2xl font-bold mb-4 text-white">1. Data Collection</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We collect minimal data necessary to provide our services. Files uploaded for processing are automatically deleted after 2 hours.
          </p>
          <h2 className="text-2xl font-bold mb-4 text-white">2. Data Security</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We use industry-standard encryption to protect your data during transfer and processing.
          </p>
        </div>
      </div>
    </div>
  );
}
