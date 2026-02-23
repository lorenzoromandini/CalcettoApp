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
import { createClubSchema, type CreateClubInput } from "@/lib/validations/club";
import { ClubImageUploader } from "./club-image-uploader";
import { AlertCircle, Users, Loader2 } from "lucide-react";

interface ClubFormProps {
  onSubmit: (data: CreateClubInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ClubForm({ onSubmit, isLoading = false, submitLabel }: ClubFormProps) {
  const t = useTranslations("clubs.form");
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      name: "",
      description: "",
      image_url: undefined,
    },
  });

  async function handleSubmit(data: CreateClubInput) {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Team Image */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("image")}</FormLabel>
              <FormControl>
                <ClubImageUploader
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
