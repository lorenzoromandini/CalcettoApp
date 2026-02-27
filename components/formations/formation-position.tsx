"use client";

import { useTranslations } from "next-intl";
import { Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_COLORS, FormationRole } from "@/lib/formations/formations-config";

interface FormationPositionProps {
  index: number;
  x: number;
  y: number;
  role: FormationRole;
  label: string;
  isOccupied: boolean;
  player?: {
    id: string;
    name: string;
    jerseyNumber: number;
    avatarUrl?: string;
  };
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function FormationPosition({
  index,
  x,
  y,
  role,
  label,
  isOccupied,
  player,
  isSelected,
  onClick,
  disabled = false,
}: FormationPositionProps) {
  const t = useTranslations("formations");
  const colors = ROLE_COLORS[role];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full",
        "flex flex-col items-center justify-center",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected && "ring-2 ring-primary ring-offset-2 scale-110",
        disabled && "cursor-not-allowed opacity-50",
        isOccupied
          ? cn(colors.bg, colors.border, "border-2")
          : "bg-white/90 border-2 border-dashed border-gray-400 hover:border-primary hover:bg-white"
      )}
      style={{
        left: `${(x / 8) * 100}%`,
        top: `${(y / 6) * 100}%`,
      }}
    >
      {isOccupied ? (
        <div className="flex flex-col items-center">
          {player?.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="w-6 h-6 rounded-full object-cover mb-0.5"
            />
          ) : (
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5", colors.bg, colors.text)}>
              <User className="w-3 h-3" />
            </div>
          )}
          <span className={cn("text-[8px] font-bold leading-tight", colors.text)}>
            {player?.jerseyNumber}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Plus className="w-5 h-5 text-gray-400 mb-0.5" />
          <span className="text-[8px] font-medium text-gray-500">
            {label}
          </span>
        </div>
      )}
    </button>
  );
}
