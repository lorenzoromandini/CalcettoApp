import { AuthCard, AuthFooterLink, AuthDivider } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/social-buttons";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('auth');
  return {
    title: `${t('signIn')} - Calcetto Manager`,
    description: t('signIn'),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations();

  return (
    <AuthCard
      title={t('auth.welcomeBack')}
      footer={
        <AuthFooterLink
          linkText={t('auth.signUp')}
          href="/auth/signup"
        />
      }
    >
      <LoginForm />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        
        <AuthDivider text={t('auth.orContinueWith')} />
        
        <GoogleSignInButton />
      </div>
    </AuthCard>
  );
}
