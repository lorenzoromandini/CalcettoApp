"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { X, Search, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ClubMemberWithRolePriority } from "@/types/formations";
import type { FormationRole } from "@/lib/formations/formations-config";
import { ROLE_COLORS, getRoleDisplayName } from "@/lib/formations/formations-config";

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ClubMemberWithRolePriority[];
  targetRole?: FormationRole;
  selectedPlayerId: string | null;
  excludeIds: string[];
  onSelect: (clubMemberId: string) => void;
  onRemove: () => void;
}

export function PlayerSelectionModal({
  isOpen,
  onClose,
  members,
  targetRole,
  selectedPlayerId,
  excludeIds,
  onSelect,
  onRemove,
}: PlayerSelectionModalProps) {
  const t = useTranslations("formations");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  // Filtra membri esclusi
  const availableMembers = useMemo(() => {
    return members.filter((m) => !excludeIds.includes(m.id));
  }, [members, excludeIds]);

  // Filtra per ricerca
  const filteredMembers = useMemo(() => {
    if (!debouncedQuery) return availableMembers;
    
    const query = debouncedQuery.toLowerCase();
    return availableMembers.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const nickname = (member.nickname || "").toLowerCase();
      const jerseyNumber = member.jerseyNumber.toString();
      
      return (
        fullName.includes(query) ||
        nickname.includes(query) ||
        jerseyNumber.includes(query)
      );
    });
  }, [availableMembers, debouncedQuery]);

  // Raggruppa per priorità ruolo
  const groupedMembers = useMemo(() => {
    if (!targetRole) {
      return {
        primary: [] as ClubMemberWithRolePriority[],
        secondary: [] as ClubMemberWithRolePriority[],
        others: filteredMembers,
      };
    }

    return {
      primary: filteredMembers.filter((m) => m.rolePriority === 0),
      secondary: filteredMembers.filter((m) => m.rolePriority === 1),
      others: filteredMembers.filter((m) => m.rolePriority === 2),
    };
  }, [filteredMembers, targetRole]);

  const renderMemberItem = (member: ClubMemberWithRolePriority) => {
    const isSelected = selectedPlayerId === member.id;
    const colors = ROLE_COLORS[member.primaryRole];

    return (
      <button
        key={member.id}
        onClick={() => onSelect(member.id)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
          isSelected
            ? "bg-primary/10 border-2 border-primary"
            : "hover:bg-muted border-2 border-transparent"
        )}
      >
        {/* Avatar o iniziali */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
            colors.bg,
            colors.text
          )}
        >
          <User className="w-5 h-5" />
        </div>

        {/* Info giocatore */}
        <div className="flex-1 min-w-0 text-left">
          <div className="font-medium truncate">
            {member.firstName} {member.lastName}
          </div>
          {member.nickname && (
            <div className="text-xs text-muted-foreground truncate">
              {member.nickname}
            </div>
          )}
        </div>

        {/* Numero maglia */}
        <div className="flex-shrink-0 text-sm font-bold text-muted-foreground">
          #{member.jerseyNumber}
        </div>

        {/* Check se selezionato */}
        {isSelected && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t("selectPlayer")}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Barra ricerca */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlayer")}
            className="pl-10 h-11"
            autoFocus
          />
        </div>

        {/* Lista giocatori */}
        <ScrollArea className="flex-1 mt-4 -mx-6 px-6">
          <div className="space-y-4">
            {/* Sezione ruolo primario */}
            {groupedMembers.primary.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  {targetRole && getRoleDisplayName(targetRole)}
                  <span className="text-xs text-muted-foreground">- {t("primaryRole")}</span>
                </h4>
                <div className="space-y-1">
                  {groupedMembers.primary.map(renderMemberItem)}
                </div>
              </div>
            )}

            {/* Sezione ruolo secondario */}
            {groupedMembers.secondary.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  {targetRole && getRoleDisplayName(targetRole)}
                  <span className="text-xs">- {t("secondaryRole")}</span>
                </h4>
                <div className="space-y-1">
                  {groupedMembers.secondary.map(renderMemberItem)}
                </div>
              </div>
            )}

            {/* Sezione altri giocatori */}
            {groupedMembers.others.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  {t("otherPlayers")}
                </h4>
                <div className="space-y-1">
                  {groupedMembers.others.map(renderMemberItem)}
                </div>
              </div>
            )}

            {/* Nessun risultato */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {debouncedQuery
                  ? `Nessun giocatore trovato per "${debouncedQuery}"`
                  : "Nessun giocatore disponibile"}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex gap-2">
          {selectedPlayerId && (
            <Button variant="outline" onClick={onRemove} className="flex-1">
              Rimuovi
            </Button>
          )}
          <Button onClick={onClose} className="flex-1">
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
