import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
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
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
