import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shirt } from 'lucide-react';
import { SettingsForm } from './settings-form';
import { JerseyNumberSettings } from './jersey-number-settings';

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
        <div className="max-w-2xl mx-auto space-y-6">
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
              <SettingsForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shirt className="h-6 w-6" />
                <CardTitle>Numeri Maglia</CardTitle>
              </div>
              <CardDescription>
                Gestisci i tuoi numeri di maglia per ogni squadra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JerseyNumberSettings />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
