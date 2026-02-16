/**
 * RSVP Button Component
 * 
 * Three-state segmented button for match RSVP responses.
 * Supports IN/OUT/Maybe with color-coded visual feedback.
 * Optimized for mobile with large touch targets.
 */

"use client";

import { useTranslations } from "next-intl";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RSVPStatus } from "@/lib/db/schema";

interface RSVPButtonProps {
  currentStatus: RSVPStatus | null;
  onChange: (status: RSVPStatus) => void;
  disabled?: boolean;
  isPending?: boolean;
}

export function RSVPButton({
  currentStatus,
  onChange,
  disabled = false,
  isPending = false,
}: RSVPButtonProps) {
  const t = useTranslations("matches");

  const handleClick = (status: RSVPStatus) => {
    if (!disabled && !isPending) {
      onChange(status);
    }
  };

  return (
    <div className="flex w-full gap-1 p-1 bg-muted rounded-lg">
      {/* IN Button - Green */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => handleClick("in")}
        disabled={disabled || isPending}
        className={cn(
          "flex-1 min-h-[48px] gap-2 font-medium transition-all duration-200",
          currentStatus === "in"
            ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
            : "hover:bg-green-100 dark:hover:bg-green-900/20"
        )}
      >
        {isPending && currentStatus === "in" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{t("rsvp.in")}</span>
        <span className="sm:hidden">{t("rsvp.inShort")}</span>
      </Button>

      {/* MAYBE Button - Yellow */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => handleClick("maybe")}
        disabled={disabled || isPending}
        className={cn(
          "flex-1 min-h-[48px] gap-2 font-medium transition-all duration-200",
          currentStatus === "maybe"
            ? "bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white"
            : "hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
        )}
      >
        {isPending && currentStatus === "maybe" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <HelpCircle className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{t("rsvp.maybe")}</span>
        <span className="sm:hidden">{t("rsvp.maybeShort")}</span>
      </Button>

      {/* OUT Button - Red */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => handleClick("out")}
        disabled={disabled || isPending}
        className={cn(
          "flex-1 min-h-[48px] gap-2 font-medium transition-all duration-200",
          currentStatus === "out"
            ? "bg-red-600 text-white hover:bg-red-700 hover:text-white"
            : "hover:bg-red-100 dark:hover:bg-red-900/20"
        )}
      >
        {isPending && currentStatus === "out" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{t("rsvp.out")}</span>
        <span className="sm:hidden">{t("rsvp.outShort")}</span>
      </Button>
    </div>
  );
}
