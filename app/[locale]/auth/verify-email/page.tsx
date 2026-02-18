import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AuthCard } from '@/components/auth/auth-card';
import { XCircle } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';

export const metadata: Metadata = {
  title: 'Verifica Email - Calcetto Manager',
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Errore" description="Token non valido">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-muted-foreground">
            Il link di verifica non è valido.
          </p>
          <Link 
            href="/auth/login" 
            className="mt-4 inline-block text-primary hover:underline"
          >
            Torna al login
          </Link>
        </div>
      </AuthCard>
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
    },
  });

  if (!user) {
    return (
      <AuthCard title="Errore" description="Token non valido">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-muted-foreground">
            Il link di verifica non è valido o è scaduto.
          </p>
          <Link 
            href="/auth/login" 
            className="mt-4 inline-block text-primary hover:underline"
          >
            Torna al login
          </Link>
        </div>
      </AuthCard>
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
    },
  });

  redirect('/auth/login?verified=true');
}
