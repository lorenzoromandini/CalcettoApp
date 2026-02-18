import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations();

  return (
    <AuthCard
      title={t('auth.forgotPassword')}
      description={t('auth.forgotPasswordDescription')}
      footer={
        <AuthFooterLink
          text={t('auth.backTo')}
          linkText={t('auth.signIn')}
          href="/auth/login"
        />
      }
    >
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.forgotPasswordInstructions')}
        </p>
      </div>
    </AuthCard>
  );
}
