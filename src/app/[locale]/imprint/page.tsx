import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';

export default async function ImprintPage() {
  const tCommon = await getTranslations('Common');
  
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#d4ff33] hover:underline mb-8 inline-block">
          ← {tCommon('home')}
        </Link>
        <h1 className="text-4xl font-bold mb-8">{tCommon('imprint')}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed mb-6">
            Refinedocs GmbH<br />
            Musterstraße 123<br />
            12345 Berlin, Germany
          </p>
          <h2 className="text-2xl font-bold mb-4 text-white">Contact</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Email: contact@refinedocs.com<br />
            Phone: +49 123 456789
          </p>
          <h2 className="text-2xl font-bold mb-4 text-white">Representation</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Managing Director: Jane Doe
          </p>
        </div>
      </div>
    </div>
  );
}
