import { Suspense } from 'react';
import App from '../../App';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
