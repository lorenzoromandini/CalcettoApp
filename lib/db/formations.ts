import { createClient } from '@/lib/supabase/client';
import type { FormationMode } from '@/lib/formations';

export interface FormationPosition {
  x: number;
  y: number;
  label: string;
  playerId?: string;
}

export interface FormationData {
  formation: string; // preset ID like "5-1-2-1"
  positions: FormationPosition[];
}

export async function getFormation(matchId: string): Promise<FormationData | null> {
  const supabase = createClient();
  
  // Get formation
  const { data: formation, error: formationError } = await supabase
    .from('formations')
    .select('*')
    .eq('match_id', matchId)
    .single();
  
  if (formationError || !formation) {
    if (formationError?.code === 'PGRST116') {
      // No rows returned - formation doesn't exist yet
      return null;
    }
    throw formationError;
  }
  
  // Get positions
  const { data: positions, error: positionsError } = await supabase
    .from('formation_positions')
    .select('*')
    .eq('formation_id', formation.id);
  
  if (positionsError) {
    throw positionsError;
  }
  
  const teamFormation = formation.team_formation as { formation?: string } | null;
  
  return {
    formation: teamFormation?.formation || '5-1-2-1',
    positions: positions?.map(p => ({
      x: p.position_x,
      y: p.position_y,
      label: p.position_label,
      playerId: p.player_id || undefined,
    })) || [],
  };
}

export async function saveFormation(
  matchId: string, 
  data: FormationData
): Promise<void> {
  const supabase = createClient();
  
  // Upsert formation
  const { data: formation, error: formationError } = await supabase
    .from('formations')
    .upsert({
      match_id: matchId,
      team_formation: { formation: data.formation },
    }, { onConflict: 'match_id' })
    .select()
    .single();
  
  if (formationError || !formation) {
    throw formationError || new Error('Failed to save formation');
  }
  
  // Delete old positions
  const { error: deleteError } = await supabase
    .from('formation_positions')
    .delete()
    .eq('formation_id', formation.id);
  
  if (deleteError) {
    throw deleteError;
  }
  
  // Insert new positions
  if (data.positions.length > 0) {
    const { error: insertError } = await supabase
      .from('formation_positions')
      .insert(
        data.positions.map(p => ({
          formation_id: formation.id,
          player_id: p.playerId || null,
          position_x: p.x,
          position_y: p.y,
          position_label: p.label,
          is_substitute: false,
        }))
      );
    
    if (insertError) {
      throw insertError;
    }
  }
}

export async function deleteFormation(matchId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('formations')
    .delete()
    .eq('match_id', matchId);
  
  if (error) {
    throw error;
  }
}
