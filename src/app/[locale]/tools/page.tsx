import { Suspense } from 'react';
import App from '../../../App';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">Loading...</div>}>
      <App />
    </Suspense>
  );
}
