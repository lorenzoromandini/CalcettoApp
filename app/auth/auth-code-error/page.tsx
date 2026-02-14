import type { Metadata } from "next";
import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Errore Autenticazione - Calcetto Manager",
  description: "Si è verificato un errore durante l'autenticazione",
};

interface AuthCodeErrorPageProps {
  searchParams: Promise<{ error?: string; error_code?: string; error_description?: string }>;
}

export default async function AuthCodeErrorPage({
  searchParams,
}: AuthCodeErrorPageProps) {
  const params = await searchParams;
  const errorDescription = params.error_description;

  return (
    <AuthCard
      title="Errore di autenticazione"
      footer={
        <AuthFooterLink
          text="Torna al"
          linkText="login"
          href="/auth/login"
        />
      }
    >
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">
          {errorDescription ||
            "Si è verificato un errore durante l'autenticazione. Riprova o contatta il supporto se il problema persiste."}
        </p>
      </div>
    </AuthCard>
  );
}
