import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reimposta password"
      footer={
        <AuthFooterLink
          text="Torna al"
          linkText="login"
          href="/auth/login"
        />
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
