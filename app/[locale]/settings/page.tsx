import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t('navigation.settings'),
  };
}

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Mobile header with back button and title */}
      <div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h1 className="text-lg font-bold">Impostazioni</h1>
        </div>
        <div className="w-16" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Desktop title centered at top */}
          <div className="hidden md:flex items-center justify-center gap-2 mb-6">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Impostazioni</h1>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <SettingsForm email={session.user.email || ''} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
