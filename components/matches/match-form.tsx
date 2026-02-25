"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createMatchSchema, type CreateMatchInput } from "@/lib/validations/match";
import { AlertCircle, Calendar, MapPin, FileText, Loader2 } from "lucide-react";

interface MatchFormProps {
  clubId: string;
  initialData?: Partial<CreateMatchInput>;
  onSuccess?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  onSubmit: (data: CreateMatchInput) => Promise<void>;
}

export function MatchForm({ 
  clubId, 
  initialData, 
  onSuccess, 
  submitLabel,
  isLoading = false,
  onSubmit 
}: MatchFormProps) {
  const t = useTranslations("matches.form");
  const [error, setError] = React.useState<string | null>(null);

  // Get current datetime in local ISO format for min attribute
  const getMinDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const form = useForm<CreateMatchInput>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      scheduled_at: initialData?.scheduledAt || "",
      location: initialData?.location || "",
      mode: initialData?.mode || "5vs5",
      notes: initialData?.notes || "",
    },
  });

  async function handleSubmit(data: CreateMatchInput) {
    setError(null);
    try {
      await onSubmit(data);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  const matchModes = [
    { value: "5vs5" as const, label: t("mode.5vs5"), players: "5" },
    { value: "8vs8" as const, label: t("mode.8vs8"), players: "8" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Date & Time */}
        <FormField
          control={form.control}
          name="scheduled_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("scheduledAt")}
              </FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  min={getMinDatetime()}
                  disabled={isLoading}
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("location")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("locationPlaceholder")}
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

        {/* Match Mode */}
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mode.label")}</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3">
                  {matchModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => field.onChange(mode.value)}
                      disabled={isLoading}
                      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all min-h-[72px] ${
                        field.value === mode.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } disabled:opacity-50`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {mode.players}
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

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("notes")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("notesPlaceholder")}
                  disabled={isLoading}
                  className="min-h-[120px] resize-none"
                  {...field}
                  value={field.value || ""}
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            submitLabel || t("submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
