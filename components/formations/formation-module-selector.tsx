"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormationModuleCard } from "./formation-module-card";
import type { MatchMode } from "@/lib/formations/formations-config";
import { getFormationsByMode } from "@/lib/formations/formations-config";

interface FormationModuleSelectorProps {
  mode: MatchMode;
  selectedModuleId: string | null;
  onSelect: (moduleId: string) => void;
  onContinue: () => void;
  disabled?: boolean;
}

export function FormationModuleSelector({
  mode,
  selectedModuleId,
  onSelect,
  onContinue,
  disabled = false,
}: FormationModuleSelectorProps) {
  const t = useTranslations("formations");
  
  const formations = getFormationsByMode(mode);
  const modeLabel = mode === "FIVE_V_FIVE" ? "5v5" : mode === "EIGHT_V_EIGHT" ? "8v8" : "11v11";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t("selectModule")}</h2>
        <p className="text-muted-foreground">
          {t("selectModuleDescription", { mode: modeLabel })}
        </p>
      </div>

      {/* Griglia moduli */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {formations.map((formation) => (
          <FormationModuleCard
            key={formation.id}
            module={formation}
            isSelected={selectedModuleId === formation.id}
            onSelect={() => onSelect(formation.id)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Pulsante continua */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <Button
          onClick={onContinue}
          disabled={!selectedModuleId || disabled}
          className="w-full h-12 text-base"
          size="lg"
        >
          {selectedModuleId ? (
            <>
              {t("continueToTeam1")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            t("selectModuleFirst")
          )}
        </Button>
      </div>
    </div>
  );
}
