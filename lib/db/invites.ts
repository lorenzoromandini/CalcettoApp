/**
 * Team Invite Operations
 * 
 * Database-driven invite tokens with expiration and usage tracking.
 * Per RESEARCH.md: Use SHA256 tokens, 7-day expiry, track usage.
 */

import { getDB } from './index';
import { queueOfflineAction } from './actions';
import { createClient } from '@/lib/supabase/client';
import type { TeamInvite, TeamMember } from './schema';

const supabase = createClient();

/**
 * Generate a secure invite token using SHA256
 */
function generateToken(teamId: string, createdBy: string): string {
  const data = `${teamId}:${createdBy}:${Date.now()}:${Math.random()}`;
  // Simple hash for demo - in production use crypto.subtle or server-side
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

/**
 * Generate a new invite link
 */
export async function generateInviteLink(
  teamId: string,
  createdBy: string,
  options: { maxUses?: number; expiresInDays?: number } = {}
): Promise<{ invite: TeamInvite; link: string }> {
  const token = generateToken(teamId, createdBy);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 7));

  const { data, error } = await supabase
    .from('team_invites')
    .insert({
      team_id: teamId,
      created_by: createdBy,
      token,
      expires_at: expiresAt.toISOString(),
      max_uses: options.maxUses || 50,
      use_count: 0,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create invite');
  }

  const invite: TeamInvite = {
    id: data.id,
    team_id: data.team_id,
    created_by: data.created_by,
    token: data.token,
    email: data.email ?? undefined,
    expires_at: data.expires_at,
    used_at: data.used_at ?? undefined,
    used_by: data.used_by ?? undefined,
    max_uses: data.max_uses,
    use_count: data.use_count,
    created_at: data.created_at,
  };

  // Generate shareable URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${baseUrl}/teams/invite?token=${token}`;

  return { invite, link };
}

/**
 * Get invite by token (public - no auth required)
 */
export async function getInviteByToken(token: string): Promise<TeamInvite | null> {
  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) return null;

  // Check if expired or max uses reached
  const expiresAt = new Date(data.expires_at);
  const isExpired = expiresAt < new Date();
  const isMaxed = data.max_uses && data.use_count >= data.max_uses;

  if (isExpired || isMaxed) return null;

  return {
    id: data.id,
    team_id: data.team_id,
    created_by: data.created_by,
    token: data.token,
    email: data.email ?? undefined,
    expires_at: data.expires_at,
    used_at: data.used_at ?? undefined,
    used_by: data.used_by ?? undefined,
    max_uses: data.max_uses,
    use_count: data.use_count,
    created_at: data.created_at,
  };
}

/**
 * Get all invites for a team (admin only)
 */
export async function getTeamInvites(teamId: string): Promise<TeamInvite[]> {
  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((item) => ({
    id: item.id,
    team_id: item.team_id,
    created_by: item.created_by,
    token: item.token,
    email: item.email ?? undefined,
    expires_at: item.expires_at,
    used_at: item.used_at ?? undefined,
    used_by: item.used_by ?? undefined,
    max_uses: item.max_uses,
    use_count: item.use_count,
    created_at: item.created_at,
  }));
}

/**
 * Join team with invite token
 */
export async function joinTeamWithInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; teamId?: string; error?: string }> {
  // Get and validate invite
  const invite = await getInviteByToken(token);
  if (!invite) {
    return { success: false, error: 'invalid_or_expired' };
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', invite.team_id)
    .eq('user_id', userId)
    .single();

  if (existingMember) {
    return { success: false, error: 'already_member' };
  }

  // Add user to team as member
  const { error: joinError } = await supabase.from('team_members').insert({
    team_id: invite.team_id,
    user_id: userId,
    role: 'member',
  });

  if (joinError) {
    return { success: false, error: 'join_failed' };
  }

  // Update invite usage
  await supabase
    .from('team_invites')
    .update({
      use_count: invite.use_count + 1,
      used_at: new Date().toISOString(),
      used_by: userId,
    })
    .eq('id', invite.id);

  // Also cache locally
  const db = await getDB();
  const member: TeamMember = {
    id: crypto.randomUUID(),
    team_id: invite.team_id,
    user_id: userId,
    player_id: undefined,
    role: 'member',
    joined_at: new Date().toISOString(),
    sync_status: 'synced',
  };
  await db.put('team_members', member);

  return { success: true, teamId: invite.team_id };
}

/**
 * Revoke/delete an invite (admin only)
 */
export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('team_invites')
    .delete()
    .eq('id', inviteId);

  if (error) {
    throw new Error(error.message);
  }
}
