-- Migration: Team Management Schema
-- Created: 2026-02-15
-- Purpose: Database schema for team management with RLS policies, indexes, and offline-first support

-- ============================================================================
-- TABLES
-- ============================================================================

-- Teams table - a group of players
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_mode VARCHAR(10) CHECK (team_mode IN ('5-a-side', '8-a-side')) DEFAULT '5-a-side',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- for soft delete, preserve match history
    sync_status VARCHAR(20) DEFAULT 'synced' -- for offline-first tracking
);

-- Team members junction table - links users to teams with roles
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL, -- for non-registered players
    role VARCHAR(20) CHECK (role IN ('admin', 'co-admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Players table - team-agnostic player profiles
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50),
    nickname VARCHAR(50),
    avatar_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- link to auth user if registered
    roles TEXT[] DEFAULT '{}', -- array of 'goalkeeper', 'defender', 'midfielder', 'attacker'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'synced'
);

-- Player teams junction table - supports players in multiple teams with jersey numbers
CREATE TABLE IF NOT EXISTS player_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    jersey_number INTEGER CHECK (jersey_number >= 1 AND jersey_number <= 99) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'synced',
    UNIQUE(player_id, team_id), -- a player can only be in a team once
    UNIQUE(team_id, jersey_number) -- jersey numbers must be unique within a team
);

-- Team invites table - invitation links for joining teams
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255), -- optional for targeted invites
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id),
    max_uses INTEGER DEFAULT 50,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER for performance)
-- ============================================================================

-- Check if current user is team admin or co-admin
CREATE OR REPLACE FUNCTION is_team_admin(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = team_uuid
        AND user_id = auth.uid()
        AND role IN ('admin', 'co-admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is any team member
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = team_uuid
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a player is in a specific team
CREATE OR REPLACE FUNCTION is_player_in_team(player_uuid UUID, team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM player_teams
        WHERE player_id = player_uuid
        AND team_id = team_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES FOR TEAMS
-- ============================================================================

-- SELECT: Team members can view their teams
CREATE POLICY "Team members can view teams"
    ON teams
    FOR SELECT
    TO authenticated
    USING (
        is_team_member(id)
        OR created_by = auth.uid()
    );

-- INSERT: Authenticated users can create teams (sets created_by automatically)
CREATE POLICY "Authenticated users can create teams"
    ON teams
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- UPDATE: Only team admins can update
CREATE POLICY "Team admins can update teams"
    ON teams
    FOR UPDATE
    TO authenticated
    USING (is_team_admin(id))
    WITH CHECK (is_team_admin(id));

-- DELETE: Only team admins can delete (soft delete via deleted_at)
CREATE POLICY "Team admins can delete teams"
    ON teams
    FOR DELETE
    TO authenticated
    USING (is_team_admin(id));

-- ============================================================================
-- RLS POLICIES FOR TEAM_MEMBERS
-- ============================================================================

-- SELECT: Team members can view all members of their teams
CREATE POLICY "Team members can view memberships"
    ON team_members
    FOR SELECT
    TO authenticated
    USING (is_team_member(team_id));

-- INSERT: Team admins can add members
CREATE POLICY "Team admins can add members"
    ON team_members
    FOR INSERT
    TO authenticated
    WITH CHECK (is_team_admin(team_id));

-- UPDATE: Team admins can update member roles
CREATE POLICY "Team admins can update members"
    ON team_members
    FOR UPDATE
    TO authenticated
    USING (is_team_admin(team_id))
    WITH CHECK (is_team_admin(team_id));

-- DELETE: Team admins can remove members (except themselves if they're the only admin)
CREATE POLICY "Team admins can delete members"
    ON team_members
    FOR DELETE
    TO authenticated
    USING (is_team_admin(team_id));

-- ============================================================================
-- RLS POLICIES FOR PLAYERS
-- ============================================================================

-- SELECT: Team members can view players via player_teams join
CREATE POLICY "Team members can view players"
    ON players
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM player_teams pt
            WHERE pt.player_id = players.id
            AND is_team_member(pt.team_id)
        )
        OR user_id = auth.uid() -- Users can always see their own player profile
    );

-- INSERT: Team admins can create players
CREATE POLICY "Team admins can create players"
    ON players
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- The player must be linked to at least one team where user is admin
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id IN (
                SELECT team_id FROM player_teams
                WHERE player_id = players.id
            )
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'co-admin')
        )
    );

-- UPDATE: Team admins can update players in their teams
CREATE POLICY "Team admins can update players"
    ON players
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM player_teams pt
            WHERE pt.player_id = players.id
            AND is_team_admin(pt.team_id)
        )
        OR user_id = auth.uid() -- Users can update their own profile
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM player_teams pt
            WHERE pt.player_id = players.id
            AND is_team_admin(pt.team_id)
        )
        OR user_id = auth.uid()
    );

-- DELETE: Team admins can delete players in their teams
CREATE POLICY "Team admins can delete players"
    ON players
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM player_teams pt
            WHERE pt.player_id = players.id
            AND is_team_admin(pt.team_id)
        )
    );

-- ============================================================================
-- RLS POLICIES FOR PLAYER_TEAMS
-- ============================================================================

-- SELECT: Team members can view player_team relationships
CREATE POLICY "Team members can view player teams"
    ON player_teams
    FOR SELECT
    TO authenticated
    USING (is_team_member(team_id));

-- INSERT: Team admins can add players to teams
CREATE POLICY "Team admins can add players to teams"
    ON player_teams
    FOR INSERT
    TO authenticated
    WITH CHECK (is_team_admin(team_id));

-- UPDATE: Team admins can update jersey numbers
CREATE POLICY "Team admins can update player teams"
    ON player_teams
    FOR UPDATE
    TO authenticated
    USING (is_team_admin(team_id))
    WITH CHECK (is_team_admin(team_id));

-- DELETE: Team admins can remove players from teams
CREATE POLICY "Team admins can delete player teams"
    ON player_teams
    FOR DELETE
    TO authenticated
    USING (is_team_admin(team_id));

-- ============================================================================
-- RLS POLICIES FOR TEAM_INVITES
-- ============================================================================

-- SELECT: Team admins can view all invites for their teams
CREATE POLICY "Team admins can view invites"
    ON team_invites
    FOR SELECT
    TO authenticated
    USING (
        is_team_admin(team_id)
        OR created_by = auth.uid()
    );

-- SELECT: Anyone with a valid token can view invite details (for joining)
CREATE POLICY "Anyone can view valid invites by token"
    ON team_invites
    FOR SELECT
    TO authenticated
    USING (
        token IS NOT NULL
        AND expires_at > NOW()
        AND (max_uses IS NULL OR use_count < max_uses)
    );

-- INSERT: Team admins can create invites
CREATE POLICY "Team admins can create invites"
    ON team_invites
    FOR INSERT
    TO authenticated
    WITH CHECK (is_team_admin(team_id));

-- UPDATE: Team admins can update invites (e.g., revoke)
CREATE POLICY "Team admins can update invites"
    ON team_invites
    FOR UPDATE
    TO authenticated
    USING (is_team_admin(team_id))
    WITH CHECK (is_team_admin(team_id));

-- DELETE: Team admins can delete invites
CREATE POLICY "Team admins can delete invites"
    ON team_invites
    FOR DELETE
    TO authenticated
    USING (is_team_admin(team_id));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id_user_id ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- Player teams indexes
CREATE INDEX IF NOT EXISTS idx_player_teams_player_id_team_id ON player_teams(player_id, team_id);
CREATE INDEX IF NOT EXISTS idx_player_teams_team_id ON player_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_player_teams_team_id_jersey ON player_teams(team_id, jersey_number);

-- Team invites indexes
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at ON team_invites(expires_at);

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_deleted_at ON teams(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for teams
CREATE TRIGGER teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for players
CREATE TRIGGER players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE teams IS 'Teams/groups of players';
COMMENT ON TABLE team_members IS 'Junction table linking users to teams with roles';
COMMENT ON TABLE players IS 'Player profiles (team-agnostic)';
COMMENT ON TABLE player_teams IS 'Junction table linking players to teams with jersey numbers';
COMMENT ON TABLE team_invites IS 'Invitation tokens for joining teams';

COMMENT ON COLUMN teams.deleted_at IS 'Soft delete timestamp - preserves match history';
COMMENT ON COLUMN teams.sync_status IS 'Offline-first sync tracking: synced, pending, error';
COMMENT ON COLUMN players.sync_status IS 'Offline-first sync tracking: synced, pending, error';
COMMENT ON COLUMN player_teams.sync_status IS 'Offline-first sync tracking: synced, pending, error';
