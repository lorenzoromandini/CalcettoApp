"use client";

import * as React from "react";
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
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
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
        title="Password aggiornata"
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
            La tua password è stata aggiornata con successo. Ora puoi accedere
            con la nuova password.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push("/auth/login")}
          >
            Vai al login
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reimposta password"
      description="Inserisci la tua nuova password"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nuova password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conferma password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
            {isLoading ? "Aggiornamento..." : "Aggiorna password"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
