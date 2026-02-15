/**
 * Team Database Operations
 * 
 * Provides CRUD operations for teams with offline-first support.
 * Integrates with Supabase for server sync and IndexedDB for local caching.
 * 
 * @see RESEARCH.md Pattern 2 for offline-first architecture
 */

import { getDB } from './index';
import { queueOfflineAction } from './actions';
import type { Team, TeamMember, SyncStatus } from './schema';
import type { CreateTeamInput, UpdateTeamInput } from '@/lib/validations/team';
import type { Tables } from '@/types/database';

// ============================================================================
// Supabase Client (Dynamic Import for SSR compatibility)
// ============================================================================

async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/client');
  return createClient();
}

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Convert Supabase Team type to IndexedDB Team type
 */
function toLocalTeam(dbTeam: Tables<'teams'>): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description ?? undefined,
    team_mode: dbTeam.team_mode ?? '5-a-side',
    created_by: dbTeam.created_by,
    created_at: dbTeam.created_at,
    updated_at: dbTeam.updated_at,
    deleted_at: dbTeam.deleted_at ?? undefined,
    sync_status: 'synced',
  };
}

/**
 * Convert Supabase TeamMember type to IndexedDB TeamMember type
 */
function toLocalTeamMember(dbMember: Tables<'team_members'>): TeamMember {
  return {
    id: dbMember.id,
    team_id: dbMember.team_id,
    user_id: dbMember.user_id ?? undefined,
    player_id: dbMember.player_id ?? undefined,
    role: dbMember.role,
    joined_at: dbMember.joined_at,
    sync_status: 'synced',
  };
}

// ============================================================================
// Team CRUD Operations
// ============================================================================

/**
 * Create a new team with admin role assignment
 * 
 * @param data - Team creation data (name, description, team_mode)
 * @param userId - ID of the user creating the team (becomes admin)
 * @returns The created team ID
 */
export async function createTeam(
  data: CreateTeamInput,
  userId: string
): Promise<string> {
  const teamId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Build team object for IndexedDB
  const team: Team = {
    id: teamId,
    name: data.name,
    description: data.description,
    team_mode: data.team_mode,
    created_by: userId,
    created_at: now,
    updated_at: now,
    sync_status: 'pending',
  };

  // Build team member object (creator is admin)
  const teamMember: TeamMember = {
    id: crypto.randomUUID(),
    team_id: teamId,
    user_id: userId,
    role: 'admin',
    joined_at: now,
    sync_status: 'pending',
  };

  try {
    // Try to sync with Supabase first
    const supabase = await getSupabaseClient();
    
    // Check if online by attempting a lightweight operation
    const { error: connectionError } = await supabase.from('teams').select('id').limit(1);
    
    if (!connectionError) {
      // Online - insert to Supabase
      const { error: teamError } = await supabase.from('teams').insert({
        id: teamId,
        name: data.name,
        description: data.description ?? null,
        team_mode: data.team_mode,
        created_by: userId,
        created_at: now,
        updated_at: now,
        sync_status: 'synced',
      });

      if (teamError) throw teamError;

      // Insert team member (admin)
      const { error: memberError } = await supabase.from('team_members').insert({
        id: teamMember.id,
        team_id: teamId,
        user_id: userId,
        role: 'admin',
        joined_at: now,
      });

      if (memberError) throw memberError;

      // Mark as synced in local cache
      team.sync_status = 'synced';
      teamMember.sync_status = 'synced';
      
      console.log('[TeamDB] Team created and synced:', teamId);
    } else {
      // Offline - queue for later sync
      throw new Error('Offline');
    }
  } catch (error) {
    // Offline or error - save locally and queue for sync
    console.log('[TeamDB] Creating team offline:', teamId);
    
    // Queue offline action for team creation
    await queueOfflineAction('create', 'teams', {
      id: teamId,
      name: data.name,
      description: data.description ?? null,
      team_mode: data.team_mode,
      created_by: userId,
      created_at: now,
      updated_at: now,
    });

    // Queue offline action for team member (admin)
    await queueOfflineAction('create', 'team_members', {
      id: teamMember.id,
      team_id: teamId,
      user_id: userId,
      role: 'admin',
      joined_at: now,
    });
  }

  // Save to IndexedDB (works in both online and offline cases)
  const db = await getDB();
  await db.put('teams', team);
  await db.put('team_members', teamMember);

  return teamId;
}

/**
 * Get all teams for a user (where they are a member)
 * 
 * @param userId - User ID to get teams for
 * @returns Array of teams the user is a member of
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
  const db = await getDB();

  try {
    // Try to fetch from Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        team_id,
        teams:team_id (*)
      `)
      .eq('user_id', userId)
      .is('teams.deleted_at', null);

    if (!error && data) {
      // Extract teams from nested structure and update cache
      const teams: Team[] = data
        .map((item: { teams: Tables<'teams'> }) => item.teams)
        .filter(Boolean)
        .map(toLocalTeam);

      // Update IndexedDB cache
      for (const team of teams) {
        await db.put('teams', team);
      }

      return teams;
    }
  } catch (error) {
    console.log('[TeamDB] Using cached teams for user:', userId);
  }

  // Fallback: Get from IndexedDB
  // First get all team memberships for this user
  const memberships = await db.getAllFromIndex('team_members', 'by-user-id', userId);
  const teamIds = memberships.map(m => m.team_id);

  // Then get the actual teams
  const teams: Team[] = [];
  for (const teamId of teamIds) {
    const team = await db.get('teams', teamId);
    if (team && !team.deleted_at) {
      teams.push(team);
    }
  }

  return teams.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Get a single team by ID
 * 
 * @param teamId - Team ID to fetch
 * @returns Team object or null if not found
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  const db = await getDB();

  try {
    // Try Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .is('deleted_at', null)
      .single();

    if (!error && data) {
      // Update cache
      const team = toLocalTeam(data);
      await db.put('teams', team);
      return team;
    }
  } catch (error) {
    console.log('[TeamDB] Using cached team:', teamId);
  }

  // Fallback: Get from IndexedDB
  const team = await db.get('teams', teamId);
  
  if (team && !team.deleted_at) {
    return team;
  }

  return null;
}

/**
 * Update a team
 * 
 * @param teamId - Team ID to update
 * @param data - Update data (partial team fields)
 */
export async function updateTeam(
  teamId: string,
  data: UpdateTeamInput
): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  try {
    // Try to update in Supabase first
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('teams')
      .update({
        ...data,
        updated_at: now,
      })
      .eq('id', teamId);

    if (error) throw error;

    console.log('[TeamDB] Team updated in Supabase:', teamId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[TeamDB] Queueing team update for sync:', teamId);
    
    await queueOfflineAction('update', 'teams', {
      id: teamId,
      ...data,
      updated_at: now,
    });
  }

  // Update local cache
  const existing = await db.get('teams', teamId);
  if (existing) {
    const updated: Team = {
      ...existing,
      ...data,
      updated_at: now,
      sync_status: 'pending',
    };
    await db.put('teams', updated);
  }
}

/**
 * Soft delete a team (sets deleted_at timestamp)
 * 
 * @param teamId - Team ID to delete
 */
export async function deleteTeam(teamId: string): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  try {
    // Try to soft delete in Supabase
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('teams')
      .update({ deleted_at: now })
      .eq('id', teamId);

    if (error) throw error;

    console.log('[TeamDB] Team soft-deleted in Supabase:', teamId);
  } catch (error) {
    // Offline - queue for sync
    console.log('[TeamDB] Queueing team deletion for sync:', teamId);
    
    await queueOfflineAction('update', 'teams', {
      id: teamId,
      deleted_at: now,
    });
  }

  // Update local cache
  const existing = await db.get('teams', teamId);
  if (existing) {
    existing.deleted_at = now;
    existing.sync_status = 'pending';
    await db.put('teams', existing);
  }
}

/**
 * Check if a user is an admin of a team
 * 
 * @param teamId - Team ID to check
 * @param userId - User ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const db = await getDB();

  try {
    // Try Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return data.role === 'admin';
    }
  } catch (error) {
    console.log('[TeamDB] Using cached membership data');
  }

  // Fallback: Check IndexedDB
  const memberships = await db.getAllFromIndex('team_members', 'by-team-id', teamId);
  const membership = memberships.find(m => m.user_id === userId);
  
  return membership?.role === 'admin';
}

/**
 * Get team members
 * 
 * @param teamId - Team ID to get members for
 * @returns Array of team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const db = await getDB();

  try {
    // Try Supabase first
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (!error && data) {
      // Update cache
      const members = data.map(toLocalTeamMember);
      for (const member of members) {
        await db.put('team_members', member);
      }
      return members;
    }
  } catch (error) {
    console.log('[TeamDB] Using cached team members');
  }

  // Fallback: Get from IndexedDB
  return db.getAllFromIndex('team_members', 'by-team-id', teamId);
}

// ============================================================================
// Sync Status Helpers
// ============================================================================

/**
 * Mark a team as synced (called after successful background sync)
 * 
 * @param teamId - Team ID to mark as synced
 */
export async function markTeamSynced(teamId: string): Promise<void> {
  const db = await getDB();
  const team = await db.get('teams', teamId);
  
  if (team) {
    team.sync_status = 'synced' as SyncStatus;
    team.updated_at = new Date().toISOString();
    await db.put('teams', team);
    console.log('[TeamDB] Marked team as synced:', teamId);
  }
}

/**
 * Get teams by sync status (for sync UI)
 * 
 * @param status - Sync status to filter by
 * @returns Array of teams with the given sync status
 */
export async function getTeamsBySyncStatus(status: SyncStatus): Promise<Team[]> {
  const db = await getDB();
  return db.getAllFromIndex('teams', 'by-sync-status', status);
}

// ============================================================================
// Member Management Operations
// ============================================================================

/**
 * Update member role (admin only)
 * 
 * @param teamId - Team ID
 * @param memberId - Member ID to update
 * @param newRole - New role ('admin' | 'co-admin' | 'member')
 */
export async function updateMemberRole(
  teamId: string,
  memberId: string,
  newRole: 'admin' | 'co-admin' | 'member'
): Promise<void> {
  const db = await getDB();
  
  // Get from IndexedDB
  const member = await db.get('team_members', memberId);
  
  if (!member || member.team_id !== teamId) {
    throw new Error('Member not found');
  }
  
  const updated: TeamMember = {
    ...member,
    role: newRole,
    sync_status: 'pending',
  };
  
  // Update local cache
  await db.put('team_members', updated);
  
  // Try to sync with Supabase
  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', memberId);
    
    if (error) throw error;
    
    // Mark as synced
    updated.sync_status = 'synced';
    await db.put('team_members', updated);
    console.log('[TeamDB] Member role updated and synced:', memberId);
  } catch (error) {
    // Queue for offline sync
    console.log('[TeamDB] Queueing role update for sync:', memberId);
    await queueOfflineAction('update', 'team_members', {
      id: memberId,
      role: newRole,
    });
  }
}

/**
 * Remove member from team (hard delete for memberships)
 * 
 * @param teamId - Team ID
 * @param memberId - Member ID to remove
 */
export async function removeTeamMember(
  teamId: string,
  memberId: string
): Promise<void> {
  const db = await getDB();
  
  const member = await db.get('team_members', memberId);
  
  if (!member || member.team_id !== teamId) {
    throw new Error('Member not found');
  }
  
  // Cannot remove the admin directly
  if (member.role === 'admin') {
    throw new Error('Cannot remove admin. Transfer ownership first.');
  }
  
  // Delete from local cache
  await db.delete('team_members', memberId);
  
  // Try to sync with Supabase
  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
    
    if (error) throw error;
    
    console.log('[TeamDB] Member removed and synced:', memberId);
  } catch (error) {
    // Queue for offline sync
    console.log('[TeamDB] Queueing member removal for sync:', memberId);
    await queueOfflineAction('delete', 'team_members', {
      id: memberId,
      team_id: teamId,
    });
  }
}

/**
 * Transfer team ownership to another member
 * 
 * @param teamId - Team ID
 * @param currentAdminId - Current admin user ID
 * @param newAdminId - New admin user ID
 */
export async function transferOwnership(
  teamId: string,
  currentAdminId: string,
  newAdminId: string
): Promise<void> {
  const db = await getDB();
  
  // Get all members for this team
  const members = await db.getAllFromIndex('team_members', 'by-team-id', teamId);
  
  const currentAdmin = members.find(
    m => m.user_id === currentAdminId && m.role === 'admin'
  );
  const newAdmin = members.find(
    m => m.user_id === newAdminId
  );
  
  if (!currentAdmin || !newAdmin) {
    throw new Error('Members not found');
  }
  
  // Demote current admin to member
  await updateMemberRole(teamId, currentAdmin.id, 'member');
  
  // Promote new admin
  await updateMemberRole(teamId, newAdmin.id, 'admin');
  
  console.log('[TeamDB] Ownership transferred from', currentAdminId, 'to', newAdminId);
}
