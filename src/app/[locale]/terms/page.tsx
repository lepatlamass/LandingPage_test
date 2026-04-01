import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';

export default async function TermsPage() {
  const tCommon = await getTranslations('Common');
  
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/home" className="text-[#d4ff33] hover:underline mb-8 inline-block">
          ← {tCommon('home')}
        </Link>
        <h1 className="text-4xl font-bold mb-8">{tCommon('termsConditions')}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-4">Last updated: April 1, 2026</p>
          <p className="text-gray-300 leading-relaxed mb-6">
            By using Refindocs, you agree to the following terms and conditions.
          </p>
          <h2 className="text-2xl font-bold mb-4 text-white">1. Use of Service</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Refindocs provides tools for PDF, image, and media processing. You are responsible for the content you upload.
          </p>
          <h2 className="text-2xl font-bold mb-4 text-white">2. Intellectual Property</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            All content and software on Refindocs are the property of Refindocs or its licensors.
          </p>
        </div>
      </div>
    </div>
  );
}
