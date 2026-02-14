import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Password dimenticata"
      description="Contatta l'amministratore per reimpostare la password"
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
          Per reimpostare la password, contatta l'amministratore del sistema.
        </p>
      </div>
    </AuthCard>
  );
}
