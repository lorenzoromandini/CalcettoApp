"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { MatchForm } from "@/components/matches/match-form";
import { WizardFormationBuilder } from "@/components/formations/wizard-formation-builder";
import { PitchGrid } from "@/components/formations/pitch-grid";
import { getFormationPreset } from "@/lib/formations";
import { createMatchSchema, type CreateMatchInput } from "@/lib/validations/match";
import { useSession } from "@/components/providers/session-provider";
import { checkIsClubAdminAction } from "@/lib/actions/clubs";
import { useClub } from "@/hooks/use-clubs";
import { useMembers } from "@/hooks/use-players";
import { useCreateMatch } from "@/hooks/use-matches";
import { saveFormationAction } from "@/lib/actions/formations";
import type { FormationData } from "@/lib/db/formations";
import type { MatchMode } from "@/types/database";
import { toast } from "sonner";

interface CreateMatchWizardProps {
  locale: string;
  clubId: string;
}

// FormationMember interface matching FormationBuilder expectations
interface FormationMember {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  image: string | null;
  primaryRole: string;
  secondaryRoles: string[];
  jerseyNumber: number;
}

export function CreateMatchWizard({ locale, clubId }: CreateMatchWizardProps) {
  const t = useTranslations("matches");
  const router = useRouter();
  const { data: session } = useSession();
  const { club } = useClub(clubId);
  const { members: clubMembers, isLoading: isMembersLoading } = useMembers(clubId);
  const { createMatch, isPending: isCreatingMatch } = useCreateMatch();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  
  // Refs to prevent infinite loops
  const hasCheckedAdmin = useRef(false);
  const isCreating = useRef(false);
  
  // Step 1: Match data
  const [matchData, setMatchData] = useState<CreateMatchInput>({
    scheduledAt: new Date().toISOString().slice(0, 16),
    location: "",
    mode: "FIVE_V_FIVE",
    notes: "",
  });
  
  // Step 2 & 3: Formation data
  const [homeFormation, setHomeFormation] = useState<FormationData | null>(null);
  const [awayFormation, setAwayFormation] = useState<FormationData | null>(null);

  // Reset formations when match mode changes
  useEffect(() => {
    setHomeFormation(null);
    setAwayFormation(null);
  }, [matchData.mode]);

  // Get IDs of members assigned to home team to exclude from away team
  const homeAssignedMemberIds = useMemo(() => {
    return homeFormation?.positions
      .map(p => p.clubMemberId)
      .filter((id): id is string => !!id) || [];
  }, [homeFormation]);

  // Transform club members to formation members - only when clubMembers changes
  const members: FormationMember[] = useMemo(() => {
    if (!clubMembers || clubMembers.length === 0) return [];
    return clubMembers.map((member) => ({
      id: member.id,
      firstName: member.user?.firstName || "",
      lastName: member.user?.lastName || "",
      nickname: member.user?.nickname || null,
      image: member.user?.image || null,
      primaryRole: member.primaryRole || "CEN",
      secondaryRoles: member.secondaryRoles || [],
      jerseyNumber: member.jerseyNumber || 0,
    }));
  }, [clubMembers]);

  const steps = [
    { id: 1, label: "Dati Partita", description: "Data, luogo e modalità" },
    { id: 2, label: "Formazione Casa", description: "Seleziona modulo e giocatori" },
    { id: 3, label: "Formazione Trasferta", description: "Seleziona modulo e giocatori" },
    { id: 4, label: "Riepilogo Formazioni", description: "Conferma e salva" },
  ];

  // Check admin only once on mount
  useEffect(() => {
    if (hasCheckedAdmin.current) return;
    
    async function checkAdmin() {
      if (!session?.user?.id) {
        hasCheckedAdmin.current = true;
        return;
      }
      
      try {
        const isAdmin = await checkIsClubAdminAction(clubId);
        setIsOwner(isAdmin);
      } catch (error) {
        console.error("Failed to check admin:", error);
      }
      hasCheckedAdmin.current = true;
    }
    
    checkAdmin();
  }, [clubId]); // Only depend on clubId, not session

  const handleMatchDataSubmitted = async (data: CreateMatchInput) => {
    // Salva i dati della partita ma non crea ancora il match
    setMatchData(data);
    setCurrentStep(2);
  };

  const handleFormationComplete = (formation: FormationData, isHome: boolean) => {
    if (isHome) {
      setHomeFormation(formation);
      setCurrentStep(3);
    } else {
      setAwayFormation(formation);
      setCurrentStep(4);
    }
  };

  const handleSaveAll = async () => {
    if (!homeFormation || !awayFormation) return;
    
    // Prevent double submission
    if (isCreating.current || isCreatingMatch) return;
    isCreating.current = true;
    
    setIsLoading(true);
    try {
      // Step 1: Create the match first
      const newMatchId = await createMatch(matchData, clubId);
      
      if (!newMatchId) {
        throw new Error('Failed to create match');
      }
      
      // Step 2: Save both formations
      await Promise.all([
        saveFormationAction(newMatchId, homeFormation),
        saveFormationAction(newMatchId, awayFormation),
      ]);
      
      // Show success toast
      toast.success("Match creato correttamente", {
        description: "La partita è stata salvata con successo",
      });
      
      // Redirect to dashboard
      router.push(`/dashboard`);
    } catch (error) {
      console.error("Error saving match and formations:", error);
      toast.error("Errore", {
        description: "Si è verificato un errore durante il salvataggio della partita",
      });
      setIsLoading(false);
      isCreating.current = false;
    }
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Non hai i permessi per creare partite</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Progress Header */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{steps[currentStep - 1].label}</CardTitle>
              <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
            </div>
            {currentStep === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-8 px-2"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Dashboard
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 ${
                    index + 1 <= currentStep ? "text-primary" : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index + 1 < currentStep
                        ? "bg-primary text-primary-foreground"
                        : index + 1 === currentStep
                        ? "border-2 border-primary text-primary"
                        : "border-2 border-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1 < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <MatchForm
              clubId={clubId}
              onSubmit={handleMatchDataSubmitted}
              isLoading={isLoading}
              submitLabel="Continua"
            />
          )}

          {currentStep === 2 && (
            <WizardFormationBuilder
              clubId={clubId}
              mode={matchData.mode}
              members={members}
              isHome={true}
              initialFormation={homeFormation}
              onChange={setHomeFormation}
              onComplete={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <WizardFormationBuilder
              clubId={clubId}
              mode={matchData.mode}
              members={members.filter(m => !homeAssignedMemberIds.includes(m.id))}
              isHome={false}
              initialFormation={awayFormation}
              onChange={setAwayFormation}
              onComplete={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && homeFormation && awayFormation && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Formazione Casa */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Formazione Casa</h3>
                      <p className="text-sm text-muted-foreground">{homeFormation.formation}</p>
                    </div>
                    <PitchGrid
                      mode={matchData.mode}
                      positions={homeFormation.positions}
                      members={members.filter(m => 
                        homeFormation.positions.some(p => p.clubMemberId === m.id)
                      ).map(m => ({
                        id: m.id,
                        name: `${m.firstName} ${m.lastName}`.trim(),
                        avatar: m.image || undefined,
                        jerseyNumber: m.jerseyNumber,
                        primaryRole: m.primaryRole,
                        secondaryRoles: m.secondaryRoles,
                        firstName: m.firstName,
                        lastName: m.lastName,
                        nickname: m.nickname,
                        image: m.image,
                        clubImage: undefined,
                      }))}
                      selectedMemberId={null}
                      onDrop={() => {}}
                      onTapPosition={() => {}}
                      clubId={clubId}
                    />
                  </CardContent>
                </Card>

                {/* Formazione Trasferta */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Formazione Trasferta</h3>
                      <p className="text-sm text-muted-foreground">{awayFormation.formation}</p>
                    </div>
                    <PitchGrid
                      mode={matchData.mode}
                      positions={awayFormation.positions}
                      members={members.filter(m => 
                        awayFormation.positions.some(p => p.clubMemberId === m.id)
                      ).map(m => ({
                        id: m.id,
                        name: `${m.firstName} ${m.lastName}`.trim(),
                        avatar: m.image || undefined,
                        jerseyNumber: m.jerseyNumber,
                        primaryRole: m.primaryRole,
                        secondaryRoles: m.secondaryRoles,
                        firstName: m.firstName,
                        lastName: m.lastName,
                        nickname: m.nickname,
                        image: m.image,
                        clubImage: undefined,
                      }))}
                      selectedMemberId={null}
                      onDrop={() => {}}
                      onTapPosition={() => {}}
                      clubId={clubId}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
                <Button onClick={handleSaveAll} disabled={isLoading}>
                  {isLoading ? "Salvataggio..." : "Conferma e Salva"}
                  {!isLoading && <Check className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
