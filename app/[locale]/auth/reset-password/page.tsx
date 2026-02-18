import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";

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
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Per reimpostare la password, contatta l&apos;amministratore del sistema.
        </p>
      </div>
    </AuthCard>
  );
}
