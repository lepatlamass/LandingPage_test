import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';
import { CheckCircle2, Cloud, Headphones, Zap } from 'lucide-react';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import NavigationLoginButton from '../../../components/auth/NavigationLoginButton';
import GoogleSignInButton from '../../../components/auth/GoogleSignInButton';
import AuthRedirect from '../login/AuthRedirect';

export default async function SignupPage() {
  const tCommon = await getTranslations('Common');

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-[#d4ff33] selection:text-black flex flex-col">
      <AuthRedirect />

      {/* Navigation */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1115] sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-lg">
              R
            </div>
            <span className="font-bold text-lg tracking-tight">Refinedocs</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              {tCommon('home')}
            </Link>
            <Link href="/tools" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              {tCommon('tools')}
            </Link>
            <a href="/#faq" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Faq
            </a>
            <a href="/#price" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Price
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <NavigationLoginButton />
          <Link
            href="/#price"
            className="px-4 py-1.5 bg-[#d4ff33] text-black text-xs font-bold rounded hover:bg-[#bce622] transition-colors"
          >
            {tCommon('getPro')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex items-center pt-8 pb-16">
        <div className="w-full grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Auth Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-[#16181e] border border-white/5 shadow-2xl rounded-3xl p-10 relative overflow-hidden">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Sign up for Refinedocs
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                Already have an account?{' '}
                <Link href="/login" className="text-[#d4ff33] font-semibold hover:underline">
                  Log in
                </Link>
              </p>

              <GoogleSignInButton />

              <p className="mt-8 text-center text-[10px] text-gray-500 max-w-[240px] mx-auto leading-relaxed">
                By continuing, you agree to Refinedocs&#39;{' '}
                <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          {/* Right Column - PRO Features */}
          <div className="w-full max-w-lg mx-auto lg:mx-0 lg:mr-auto pl-0 lg:pl-10">
            <div className="mb-8 hidden lg:block">
              <div className="inline-flex items-center gap-2 bg-[#d4ff33]/10 border border-[#d4ff33]/20 px-3 py-1 rounded-full mb-6 text-xs font-bold text-[#d4ff33]">
                <span>★</span> PRO FEATURES
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-10 text-white tracking-tight">
                With Refinedocs Pro,<br />you get:
              </h2>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-medium text-gray-300 mb-12">
                {[
                  "Unlimited downloads",
                  "Background Remover",
                  "Watermark",
                  "Watermark Remover",
                  "Image to Text",
                  "Resize",
                  "Compress",
                  "Convert",
                  "PDF to CSV",
                  "PDF to Excel",
                  "Excel / CSV",
                  "PDF to Word"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#d4ff33] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#16181e] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2a2d39] flex items-center justify-center text-[#d4ff33]">
                    <Zap size={16} />
                  </div>
                  <span className="text-xs font-bold leading-tight">High-speed<br/>processing</span>
                </div>
                <div className="bg-[#16181e] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2a2d39] flex items-center justify-center text-[#d4ff33]">
                    <Cloud size={16} />
                  </div>
                  <span className="text-xs font-bold leading-tight">Secure Cloud<br/>Storage</span>
                </div>
                <div className="bg-[#16181e] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2a2d39] flex items-center justify-center text-[#d4ff33]">
                    <Headphones size={16} />
                  </div>
                  <span className="text-xs font-bold leading-tight">24/7 Priority<br/>Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
