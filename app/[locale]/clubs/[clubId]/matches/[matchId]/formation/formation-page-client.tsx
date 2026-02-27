"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronRight, Check, Users, LayoutGrid, Trophy, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormationModuleSelector } from "@/components/formations/formation-module-selector";
import { fadeIn, fadeInLeft, fadeInRight, smoothTransition } from "@/lib/formations/animations";
import { FormationField } from "@/components/formations/formation-field";
import { PlayerSelectionModal } from "@/components/formations/player-selection-modal";
import { saveMatchFormationsAction, getClubMembersWithRolePriorityAction } from "@/lib/actions/formations";
import { useFormationBuilder } from "@/hooks/use-formation-builder";
import type { MatchMode } from "@/lib/formations/formations-config";
import { getFormationById } from "@/lib/formations/formations-config";
import type { ClubMemberWithRolePriority } from "@/types/formations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FormationStep = 'module' | 'team1' | 'team2' | 'recap';

interface FormationPageClientProps {
  matchId: string;
  clubId: string;
  mode: MatchMode;
  isAdmin: boolean;
}

export function FormationPageClient({
  matchId,
  clubId,
  mode,
  isAdmin,
}: FormationPageClientProps) {
  const t = useTranslations("formations");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormationStep>('module');
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [members, setMembers] = useState<ClubMemberWithRolePriority[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  
  const {
    selectedModuleId,
    team1Formation,
    team2Formation,
    isSaving,
    error,
    selectModule,
    assignPlayerToTeam1,
    assignPlayerToTeam2,
    removePlayerFromTeam1,
    removePlayerFromTeam2,
    getTeam1Assignments,
    getTeam2Assignments,
    getAssignedPlayerIds,
    isTeam1Complete,
    isTeam2Complete,
    setIsSaving,
    setError,
  } = useFormationBuilder({ matchId, clubId, mode });

  // Load club members
  useEffect(() => {
    async function loadMembers() {
      try {
        setIsLoadingMembers(true);
        const result = await getClubMembersWithRolePriorityAction(clubId);
        setMembers(result.members);
      } catch (err) {
        console.error('Failed to load members:', err);
        toast.error('Errore nel caricamento dei membri');
      } finally {
        setIsLoadingMembers(false);
      }
    }
    loadMembers();
  }, [clubId]);

  // Redirect se non admin
  useEffect(() => {
    if (!isAdmin) {
      router.push(`/clubs/${clubId}/matches/${matchId}`);
    }
  }, [isAdmin, router, clubId, matchId]);

  const selectedModule = useMemo(() => {
    return selectedModuleId ? getFormationById(selectedModuleId) : null;
  }, [selectedModuleId]);

  const steps: { id: FormationStep; label: string; icon: React.ReactNode }[] = [
    { id: 'module', label: t('selectFormation'), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'team1', label: t('team1'), icon: <Users className="w-4 h-4" /> },
    { id: 'team2', label: t('team2'), icon: <Users className="w-4 h-4" /> },
    { id: 'recap', label: 'Recap', icon: <Trophy className="w-4 h-4" /> },
  ];

  const handleContinue = () => {
    switch (currentStep) {
      case 'module':
        if (selectedModuleId) setCurrentStep('team1');
        break;
      case 'team1':
        if (isTeam1Complete) setCurrentStep('team2');
        break;
      case 'team2':
        if (isTeam2Complete) setCurrentStep('recap');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'team1':
        setCurrentStep('module');
        break;
      case 'team2':
        setCurrentStep('team1');
        break;
      case 'recap':
        setCurrentStep('team2');
        break;
    }
  };

  const handlePositionClick = (positionIndex: number) => {
    setSelectedPositionIndex(positionIndex);
    setIsPlayerModalOpen(true);
  };

  const handlePlayerSelect = (clubMemberId: string) => {
    if (selectedPositionIndex === null) return;
    
    if (currentStep === 'team1') {
      assignPlayerToTeam1(selectedPositionIndex, clubMemberId);
    } else if (currentStep === 'team2') {
      assignPlayerToTeam2(selectedPositionIndex, clubMemberId);
    }
    
    setIsPlayerModalOpen(false);
    setSelectedPositionIndex(null);
  };

  const handlePlayerRemove = () => {
    if (selectedPositionIndex === null) return;
    
    if (currentStep === 'team1') {
      removePlayerFromTeam1(selectedPositionIndex);
    } else if (currentStep === 'team2') {
      removePlayerFromTeam2(selectedPositionIndex);
    }
    
    setIsPlayerModalOpen(false);
    setSelectedPositionIndex(null);
  };

  const handleSave = async () => {
    if (!selectedModule || !team1Formation || !team2Formation) return;
    
    try {
      setIsSaving(true);
      
      const payload = {
        matchId,
        clubId,
        team1: {
          matchId,
          isHome: true,
          moduleId: selectedModule.id,
          assignments: getTeam1Assignments.map(a => ({
            positionIndex: a.positionIndex,
            clubMemberId: a.clubMemberId,
            positionX: selectedModule.positions[a.positionIndex].x,
            positionY: selectedModule.positions[a.positionIndex].y,
            positionLabel: selectedModule.positions[a.positionIndex].label,
          })),
        },
        team2: {
          matchId,
          isHome: false,
          moduleId: selectedModule.id,
          assignments: getTeam2Assignments.map(a => ({
            positionIndex: a.positionIndex,
            clubMemberId: a.clubMemberId,
            positionX: selectedModule.positions[a.positionIndex].x,
            positionY: selectedModule.positions[a.positionIndex].y,
            positionLabel: selectedModule.positions[a.positionIndex].label,
          })),
        },
      };
      
      await saveMatchFormationsAction(payload);
      toast.success('Formazioni salvate con successo!');
      router.push(`/clubs/${clubId}/matches/${matchId}`);
    } catch (err) {
      console.error('Failed to save formations:', err);
      toast.error('Errore nel salvare le formazioni');
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsSaving(false);
    }
  };

  // Create players map for FormationField
  const playersMap = useMemo(() => {
    const map = new Map();
    members.forEach(member => {
      map.set(member.id, {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        jerseyNumber: member.jerseyNumber,
        avatarUrl: undefined,
      });
    });
    return map;
  }, [members]);

  // Get target role for selected position
  const targetRole = useMemo(() => {
    if (selectedPositionIndex === null || !selectedModule) return undefined;
    return selectedModule.positions[selectedPositionIndex]?.role;
  }, [selectedPositionIndex, selectedModule]);

  // Get selected player ID for modal
  const selectedPlayerId = useMemo(() => {
    if (selectedPositionIndex === null) return null;
    
    const assignments = currentStep === 'team1' ? getTeam1Assignments : getTeam2Assignments;
    const assignment = assignments.find(a => a.positionIndex === selectedPositionIndex);
    return assignment?.clubMemberId || null;
  }, [selectedPositionIndex, currentStep, getTeam1Assignments, getTeam2Assignments]);

  // Get assignments for current team
  const currentAssignments = currentStep === 'team1' ? getTeam1Assignments : getTeam2Assignments;
  const excludeIds = useMemo(() => {
    return currentStep === 'team1' 
      ? getTeam2Assignments.map(a => a.clubMemberId)
      : getTeam1Assignments.map(a => a.clubMemberId);
  }, [currentStep, getTeam1Assignments, getTeam2Assignments]);

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header con back button */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push(`/clubs/${clubId}/matches/${matchId}`)}
          className="pl-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToMatch')}
        </Button>
      </div>

      {/* Stepper */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  currentStep === step.id
                    ? "bg-primary-foreground text-primary"
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Content */}
      <Card className="p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 'module' && (
            <motion.div
              key="module"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <FormationModuleSelector
                mode={mode}
                selectedModuleId={selectedModuleId}
                onSelect={selectModule}
                onContinue={handleContinue}
                disabled={isLoadingMembers}
              />
            </motion.div>
          )}

          {currentStep === 'team1' && selectedModule && (
            <motion.div
              key="team1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">{t('team1')}</h2>
                <p className="text-muted-foreground mt-2">
                  Clicca sul &quot;+&quot; per assegnare i giocatori alle posizioni
                </p>
              </div>
              
              <FormationField
                module={selectedModule}
                assignments={getTeam1Assignments}
                players={playersMap}
                selectedPositionIndex={selectedPositionIndex}
                onPositionClick={handlePositionClick}
                disabled={isLoadingMembers}
              />

              {/* Popup continua */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t mt-6 -mx-6 -mb-6">
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={handleBack}>
                    Indietro
                  </Button>
                  <Button 
                    onClick={handleContinue}
                    disabled={!isTeam1Complete}
                    className="min-w-[200px]"
                  >
                    {isTeam1Complete ? (
                      <>
                        {t('continueToTeam2')}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      'Completa la formazione'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'team2' && selectedModule && (
            <motion.div
              key="team2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">{t('team2')}</h2>
                <p className="text-muted-foreground mt-2">
                  Clicca sul &quot;+&quot; per assegnare i giocatori alle posizioni
                </p>
              </div>
              
              <FormationField
                module={selectedModule}
                assignments={getTeam2Assignments}
                players={playersMap}
                selectedPositionIndex={selectedPositionIndex}
                onPositionClick={handlePositionClick}
                disabled={isLoadingMembers}
              />

              {/* Popup continua */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t mt-6 -mx-6 -mb-6">
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={handleBack}>
                    Indietro
                  </Button>
                  <Button 
                    onClick={handleContinue}
                    disabled={!isTeam2Complete}
                    className="min-w-[200px]"
                  >
                    {isTeam2Complete ? (
                      <>
                        {t('continueToRecap')}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      'Completa la formazione'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'recap' && selectedModule && (
            <motion.div
              key="recap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">Riepilogo Formazioni</h2>
                <p className="text-muted-foreground mt-2">
                  Controlla le formazioni prima di confermare
                </p>
              </div>

              {/* Formazione Team 1 */}
              <motion.div 
                className="border rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{t('team1')}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep('team1')}
                  >
                    Modifica
                  </Button>
                </div>
                <FormationField
                  module={selectedModule}
                  assignments={getTeam1Assignments}
                  players={playersMap}
                  selectedPositionIndex={null}
                  onPositionClick={() => {}}
                  disabled={true}
                />
              </motion.div>

              {/* Formazione Team 2 */}
              <motion.div 
                className="border rounded-lg p-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{t('team2')}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep('team2')}
                  >
                    Modifica
                  </Button>
                </div>
                <FormationField
                  module={selectedModule}
                  assignments={getTeam2Assignments}
                  players={playersMap}
                  selectedPositionIndex={null}
                  onPositionClick={() => {}}
                  disabled={true}
                />
              </motion.div>

              {/* Popup conferma */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t mt-6 -mx-6 -mb-6">
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={handleBack}>
                    Indietro
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[200px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        {t('confirmCreation')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Modal selezione giocatore */}
      <PlayerSelectionModal
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setSelectedPositionIndex(null);
        }}
        members={members}
        targetRole={targetRole}
        selectedPlayerId={selectedPlayerId}
        excludeIds={excludeIds}
        onSelect={handlePlayerSelect}
        onRemove={handlePlayerRemove}
      />
    </div>
  );
}
