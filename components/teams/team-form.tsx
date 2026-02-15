"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

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
import { createTeamSchema, type CreateTeamInput } from "@/lib/validations/team";
import { AlertCircle, Users } from "lucide-react";

interface TeamFormProps {
  onSubmit: (data: CreateTeamInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TeamForm({ onSubmit, isLoading = false, submitLabel }: TeamFormProps) {
  const t = useTranslations("teams.form");
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      team_mode: "5-a-side" as const,
    },
  });

  async function handleSubmit(data: CreateTeamInput) {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  const teamModes = [
    { value: "5-a-side", label: t("teamMode.5a-side"), icon: "5" },
    { value: "8-a-side", label: t("teamMode.8a-side"), icon: "8" },
    { value: "11-a-side", label: t("teamMode.11a-side"), icon: "11" },
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("namePlaceholder")}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("descriptionPlaceholder")}
                  disabled={isLoading}
                  className="h-12"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="team_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("teamMode.label")}</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-3">
                  {teamModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => field.onChange(mode.value)}
                      disabled={isLoading}
                      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        field.value === mode.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } disabled:opacity-50`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {mode.icon}
                      </div>
                      <span className="text-sm font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
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
          {isLoading ? (
            <>
              <Users className="mr-2 h-4 w-4 animate-spin" />
              {t("creating")}
            </>
          ) : (
            submitLabel || t("submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
