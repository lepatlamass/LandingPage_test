import App from '../../App';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <App />;
}
