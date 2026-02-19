import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { SettingsForm } from './settings-form';

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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                <CardTitle>Impostazioni</CardTitle>
              </div>
              <CardDescription>
                Gestisci le preferenze dell&apos;applicazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm email={session.user.email || ''} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
