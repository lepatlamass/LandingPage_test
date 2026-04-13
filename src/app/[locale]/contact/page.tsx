import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';

export default async function ContactPage() {
  const tCommon = await getTranslations('Common');

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#d4ff33] hover:underline mb-8 inline-block">
          ← {tCommon('home')}
        </Link>
        <h1 className="text-4xl font-bold mb-8">{tCommon('contactUs')}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed mb-6">
            If you have any questions or feedback, please reach out to us.
          </p>
          <form className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
              <input type="text" className="w-full bg-[#1a1c21] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#d4ff33]" placeholder={tCommon('placeholder.yourName')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input type="email" className="w-full bg-[#1a1c21] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#d4ff33]" placeholder={tCommon('placeholder.yourEmail')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea className="w-full bg-[#1a1c21] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#d4ff33] h-32" placeholder={tCommon('placeholder.howCanWeHelp')}></textarea>
            </div>
            <button type="button" className="bg-[#d4ff33] text-black font-bold py-3 px-8 rounded-lg hover:bg-[#c2eb2e] transition-colors">
              {tCommon('placeholder.sendMesage')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
