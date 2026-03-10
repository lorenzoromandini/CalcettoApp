"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ClubMemberWithRolePriority } from "@/types/formations";
import type { FormationRole } from "@/lib/formations/formations-config";
import { getRoleDisplayName } from "@/lib/formations/formations-config";
import { PlayerCard } from "@/components/players/fut-player-card";
import type { ClubMember } from "@/types/database";
import { PlayerRole } from "@prisma/client";

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ClubMemberWithRolePriority[];
  targetRole?: FormationRole;
  selectedPlayerId: string | null;
  selectedIsGuest: boolean;
  excludeIds: string[];
  onSelect: (clubMemberId: string, isGuest: boolean) => void;
  onRemove: () => void;
  clubImage?: string | null;
  clubId: string;
}

export function PlayerSelectionModal({
  isOpen,
  onClose,
  members,
  targetRole,
  selectedPlayerId,
  selectedIsGuest,
  excludeIds,
  onSelect,
  onRemove,
  clubImage,
  clubId,
}: PlayerSelectionModalProps) {
  const t = useTranslations("formations");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestJerseyNumber, setGuestJerseyNumber] = useState(99);

  // Handle adding guest player - adds immediately with fixed ID
  const handleAddGuest = () => {
    onSelect('guest', true);
  };
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
      setGuestJerseyNumber(99);
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

  // Raggruppa per priorità ruolo - ORDINE CORRETTO:
  // 1. Giocatori con ruolo PRIMARIO = targetRole
  // 2. Giocatori con ruolo SECONDARIO = targetRole  
  // 3. Tutti gli altri giocatori
  const groupedMembers = useMemo(() => {
    // Se non c'è un targetRole, mostra tutti i giocatori in una sezione
    if (!targetRole) {
      return {
        primary: [] as ClubMemberWithRolePriority[],
        secondary: [] as ClubMemberWithRolePriority[],
        others: filteredMembers,
      };
    }

    const normalizedTargetRole = targetRole.toUpperCase().trim() as FormationRole;
    
    const primary: ClubMemberWithRolePriority[] = [];
    const secondary: ClubMemberWithRolePriority[] = [];
    const others: ClubMemberWithRolePriority[] = [];

    filteredMembers.forEach((member) => {
      const memberPrimaryRole = (member.primaryRole || '').toUpperCase().trim();
      const memberSecondaryRoles = (member.secondaryRoles || []).map(r => r.toUpperCase().trim());
      
      if (memberPrimaryRole === normalizedTargetRole) {
        primary.push(member);
      } else if (memberSecondaryRoles.includes(normalizedTargetRole)) {
        secondary.push(member);
      } else {
        others.push(member);
      }
    });

    // Ordina ogni gruppo per numero di maglia
    const sortByJersey = (a: ClubMemberWithRolePriority, b: ClubMemberWithRolePriority) => 
      a.jerseyNumber - b.jerseyNumber;

    return {
      primary: primary.sort(sortByJersey),
      secondary: secondary.sort(sortByJersey),
      others: others.sort(sortByJersey),
    };
  }, [filteredMembers, targetRole]);

  // Convert member to ClubMember format for PlayerCard
  const convertToClubMember = (member: ClubMemberWithRolePriority): ClubMember => {
    return {
      id: member.id,
      clubId: clubId,
      userId: member.userId,
      privileges: 'MEMBER' as const,
      joinedAt: new Date().toISOString(),
      primaryRole: member.primaryRole,
      secondaryRoles: member.secondaryRoles,
      jerseyNumber: member.jerseyNumber,
      symbol: null,
      user: {
        firstName: member.firstName,
        lastName: member.lastName,
        nickname: member.nickname || null,
        image: member.image || null,
      },
      club: {
        image: clubImage || null,
      },
    } as ClubMember;
  };

  const renderMemberCard = (member: ClubMemberWithRolePriority) => {
    const isSelected = selectedPlayerId === member.id && !selectedIsGuest;

    return (
      <div
        key={member.id}
        onClick={() => onSelect(member.id, false)}
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected ? "scale-105" : "hover:scale-105"
        )}
      >
        <PlayerCard
          member={convertToClubMember(member)}
          clubId={clubId}
          className={cn(
            isSelected && "ring-4 ring-primary ring-offset-2"
          )}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  // Render guest player card
  const renderGuestCard = () => {
    const guestId = `guest-${guestJerseyNumber}`;
    const isSelected = selectedPlayerId === guestId && selectedIsGuest;

    // Create a mock guest member
    const guestMember = {
      id: guestId,
      clubId: clubId,
      userId: 'guest',
      joinedAt: new Date().toISOString(),
      jerseyNumber: guestJerseyNumber,
      primaryRole: PlayerRole.ATT,
      secondaryRoles: [],
      symbol: null,
      privileges: 'MEMBER' as const,
      user: {
        firstName: 'Ospite',
        lastName: `#${guestJerseyNumber}`,
        nickname: null,
        image: null,
      },
      club: {
        image: clubImage || null,
      },
    } as ClubMember & { user: { firstName: string; lastName: string; nickname: string | null; image: string | null }; club: { image: string | null } };

    return (
      <div
        key={guestId}
        onClick={() => onSelect(guestId, true)}
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected ? "scale-105" : "hover:scale-105"
        )}
      >
        <PlayerCard
          member={guestMember}
          clubId={clubId}
          className={cn(
            isSelected && "ring-4 ring-primary ring-offset-2"
          )}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, membersList: ClubMemberWithRolePriority[], showRoleLabel?: boolean) => {
    if (membersList.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          {title}
          {showRoleLabel && targetRole && (
            <span className="text-xs text-muted-foreground">({getRoleDisplayName(targetRole)})</span>
          )}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {membersList.map(renderMemberCard)}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("selectPlayer")}</DialogTitle>
        </DialogHeader>

        {/* Barra ricerca + Aggiungi Ospite */}
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlayer")}
              className="pl-10 h-11"
              autoFocus
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddGuest}
            className="h-11 w-11 shrink-0"
            title="Aggiungi ospite"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>

        {/* Lista giocatori - Carte */}
        <div className="flex-1 mt-4 -mx-6 px-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="py-2 pb-20">
            {/* Sezione ruolo primario */}
            {renderSection(t("primaryRole"), groupedMembers.primary, true)}

            {/* Sezione ruolo secondario */}
            {renderSection(t("secondaryRole"), groupedMembers.secondary, true)}

            {/* Sezione altri giocatori */}
            {renderSection(t("otherPlayers"), groupedMembers.others)}

            {/* Nessun risultato */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {debouncedQuery
                  ? `Nessun giocatore trovato per "${debouncedQuery}"`
                  : "Nessun giocatore disponibile"}
              </div>
            )}
          </div>
        </div>

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
