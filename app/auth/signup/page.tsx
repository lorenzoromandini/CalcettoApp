import type { Metadata } from "next";
import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Registrati - Calcetto Manager",
  description: "Crea un nuovo account su Calcetto Manager",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Crea un account"
      description="Inserisci i tuoi dati per registrarti"
      footer={
        <AuthFooterLink
          text="Hai già un account?"
          linkText="Accedi"
          href="/auth/login"
        />
      }
    >
      <SignupForm />
      
      <p className="text-xs text-center text-muted-foreground">
        Cliccando su &quot;Registrati&quot;, accetti i nostri{" "}
        <a href="#" className="underline hover:text-primary">
          Termini di servizio
        </a>{" "}
        e la{" "}
        <a href="#" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </AuthCard>
  );
}
