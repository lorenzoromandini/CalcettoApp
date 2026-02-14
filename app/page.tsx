import { redirect } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';

// Redirect root path to default locale
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
