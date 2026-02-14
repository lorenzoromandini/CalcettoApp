"use client";

import * as React from "react";
import type { Metadata } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (resetError) {
        setError("Si è verificato un errore. Riprova più tardi.");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthCard
        title="Email inviata"
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
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            Se esiste un account associato a questa email, riceverai un link per
            reimpostare la password.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/login")}
          >
            Torna al login
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Password dimenticata"
      description="Inserisci la tua email per ricevere il link di reset"
      footer={
        <AuthFooterLink
          text="Torna al"
          linkText="login"
          href="/auth/login"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nome@esempio.it"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Invio in corso..." : "Invia link di reset"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
