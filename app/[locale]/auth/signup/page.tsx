import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('auth');
  return {
    title: `${t('signUp')} - Calcetto Manager`,
    description: t('createAccount'),
  };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations();

  return (
    <AuthCard
      title={t('auth.createAccount')}
      description={t('auth.createAccountDescription')}
    >
      <SignupForm />
    </AuthCard>
  );
}
