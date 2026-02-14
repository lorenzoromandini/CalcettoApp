import type { Metadata } from "next";
import { AuthCard, AuthFooterLink, AuthDivider } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/social-buttons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accedi - Calcetto Manager",
  description: "Accedi al tuo account Calcetto Manager",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Bentornato"
      description="Inserisci le tue credenziali per accedere"
      footer={
        <AuthFooterLink
          text="Non hai un account?"
          linkText="Registrati"
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
            Password dimenticata?
          </Link>
        </div>
        
        <AuthDivider />
        
        <GoogleSignInButton />
      </div>
    </AuthCard>
  );
}
