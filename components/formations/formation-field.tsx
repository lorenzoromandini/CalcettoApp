"use client";

import { useTranslations } from "next-intl";
import { FormationPosition } from "./formation-position";
import type { FormationModule } from "@/lib/formations/formations-config";
import type { PlayerAssignment } from "@/types/formations";

interface FormationFieldProps {
  module: FormationModule;
  assignments: PlayerAssignment[];
  players: Map<string, {
    id: string;
    name: string;
    jerseyNumber: number;
    avatarUrl?: string;
  }>;
  selectedPositionIndex: number | null;
  onPositionClick: (positionIndex: number) => void;
  disabled?: boolean;
}

export function FormationField({
  module,
  assignments,
  players,
  selectedPositionIndex,
  onPositionClick,
  disabled = false,
}: FormationFieldProps) {
  const t = useTranslations("formations");

  // Calcola assegnazioni per ogni posizione
  const getPositionAssignment = (index: number) => {
    return assignments.find(a => a.positionIndex === index);
  };

  // Calcola giocatore assegnato
  const getPositionPlayer = (index: number) => {
    const assignment = getPositionAssignment(index);
    if (assignment) {
      return players.get(assignment.clubMemberId);
    }
    return undefined;
  };

  return (
    <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
      {/* Campo calcio */}
      <div className="absolute inset-0 bg-green-600 rounded-lg overflow-hidden border-2 border-green-700 shadow-xl">
        {/* Linee campo */}
        <div className="absolute inset-0">
          {/* Linea centrale */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40" />
          
          {/* Cerchio centrale */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/40 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full" />
          
          {/* Area portiere alto */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 border-b-2 border-x-2 border-white/40 bg-white/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b-2 border-x-2 border-white/40" />
          
          {/* Area portiere basso */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 border-t-2 border-x-2 border-white/40 bg-white/5" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t-2 border-x-2 border-white/40" />
          
          {/* Angoli */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
        </div>

        {/* Posizioni */}
        {module.positions.map((pos, index) => {
          const assignment = getPositionAssignment(index);
          const player = getPositionPlayer(index);
          
          return (
            <FormationPosition
              key={index}
              index={index}
              x={pos.x}
              y={pos.y}
              role={pos.role}
              label={pos.label}
              isOccupied={!!assignment}
              player={player}
              isSelected={selectedPositionIndex === index}
              onClick={() => onPositionClick(index)}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Legenda ruoli */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500" />
          <span className="text-muted-foreground">{t("positions.POR")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
          <span className="text-muted-foreground">{t("positions.DIF")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500" />
          <span className="text-muted-foreground">{t("positions.CEN")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" />
          <span className="text-muted-foreground">{t("positions.ATT")}</span>
        </div>
      </div>
    </div>
  );
}
