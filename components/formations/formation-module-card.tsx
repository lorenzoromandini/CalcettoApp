"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { FormationModule } from "@/lib/formations/formations-config";
import { ROLE_COLORS } from "@/lib/formations/formations-config";
import { Check } from "lucide-react";

interface FormationModuleCardProps {
  module: FormationModule;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function FormationModuleCard({
  module,
  isSelected,
  onSelect,
  disabled = false,
}: FormationModuleCardProps) {
  const t = useTranslations("formations");

  // Calcola statistiche modulo
  const difCount = module.positions.filter((p) => p.role === "DIF").length;
  const cenCount = module.positions.filter((p) => p.role === "CEN").length;
  const attCount = module.positions.filter((p) => p.role === "ATT").length;

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed hover:border-border hover:shadow-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">{module.name}</h3>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Mini campo */}
      <div className="relative aspect-[3/4] bg-green-600 rounded-lg overflow-hidden mb-3 border border-green-700">
        {/* Linee campo */}
        <div className="absolute inset-0">
          {/* Linea centrale */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
          {/* Cerchio centrale */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full" />
          {/* Area portiere alto */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b border-x border-white/30 bg-white/5" />
          {/* Area portiere basso */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t border-x border-white/30 bg-white/5" />
        </div>

        {/* Posizioni */}
        {module.positions.map((pos, idx) => {
          const colors = ROLE_COLORS[pos.role];
          return (
            <div
              key={idx}
              className={cn(
                "absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center text-[8px] font-bold",
                colors.bg,
                colors.border,
                colors.text
              )}
              style={{
                left: `${(pos.x / 8) * 100}%`,
                top: `${(pos.y / 6) * 100}%`,
              }}
            >
              {pos.label}
            </div>
          );
        })}
      </div>

      {/* Descrizione */}
      <p className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">
        {module.description}
      </p>

      {/* Statistiche ruoli */}
      <div className="flex justify-center gap-2 text-[10px]">
        {difCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 border border-blue-500/30">
            {difCount} DIF
          </span>
        )}
        {cenCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 border border-green-500/30">
            {cenCount} CEN
          </span>
        )}
        {attCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-700 border border-red-500/30">
            {attCount} ATT
          </span>
        )}
      </div>
    </button>
  );
}
