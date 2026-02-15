-- Migration: Match Management Schema
-- Created: 2026-02-15
-- Purpose: Database schema for match scheduling, RSVPs, and formations

-- ============================================================================
-- TABLES
-- ============================================================================

-- Matches table - scheduled football games
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    mode VARCHAR(10) CHECK (mode IN ('5vs5', '8vs8')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    home_score INTEGER,
    away_score INTEGER,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'synced'
);

-- Match players junction table - tracks player RSVPs per match
CREATE TABLE IF NOT EXISTS match_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    rsvp_status VARCHAR(10) CHECK (rsvp_status IN ('in', 'out', 'maybe')) DEFAULT 'maybe',
    rsvp_at TIMESTAMPTZ,
    position_on_pitch VARCHAR(20),
    sync_status VARCHAR(20) DEFAULT 'synced',
    UNIQUE(match_id, player_id)
);

-- Formations table - formation template per match
CREATE TABLE IF NOT EXISTS formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    team_formation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formation positions table - player assignments to positions
CREATE TABLE IF NOT EXISTS formation_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    position_x INTEGER CHECK (position_x >= 0 AND position_x <= 9) NOT NULL,
    position_y INTEGER CHECK (position_y >= 0 AND position_y <= 6) NOT NULL,
    position_label VARCHAR(20) NOT NULL,
    is_substitute BOOLEAN DEFAULT FALSE,
    UNIQUE(formation_id, position_x, position_y)
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_positions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER for performance)
-- ============================================================================

-- Check if current user is admin of the team that owns the match
CREATE OR REPLACE FUNCTION is_match_admin(match_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches m
        JOIN team_members tm ON m.team_id = tm.team_id
        WHERE m.id = match_uuid
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'co-admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is a team member for this match
CREATE OR REPLACE FUNCTION is_match_participant(match_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches m
        JOIN team_members tm ON m.team_id = tm.team_id
        WHERE m.id = match_uuid
        AND tm.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES FOR MATCHES
-- ============================================================================

-- SELECT: Team members can view their team's matches
CREATE POLICY "Team members can view matches"
    ON matches
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = matches.team_id
            AND tm.user_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

-- INSERT: Team admins can create matches
CREATE POLICY "Team admins can create matches"
    ON matches
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = matches.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'co-admin')
        )
    );

-- UPDATE: Team admins can update matches
CREATE POLICY "Team admins can update matches"
    ON matches
    FOR UPDATE
    TO authenticated
    USING (is_match_admin(id))
    WITH CHECK (is_match_admin(id));

-- DELETE: Team admins can delete matches
CREATE POLICY "Team admins can delete matches"
    ON matches
    FOR DELETE
    TO authenticated
    USING (is_match_admin(id));

-- ============================================================================
-- RLS POLICIES FOR MATCH_PLAYERS
-- ============================================================================

-- SELECT: Team members can view match player RSVPs
CREATE POLICY "Team members can view match players"
    ON match_players
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM matches m
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE m.id = match_players.match_id
            AND tm.user_id = auth.uid()
        )
    );

-- INSERT: Players can RSVP for themselves, admins can add anyone
CREATE POLICY "Players can RSVP for themselves"
    ON match_players
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- User is admin of the match's team
        is_match_admin(match_id)
        OR
        -- User's player profile matches
        EXISTS (
            SELECT 1 FROM players p
            WHERE p.id = match_players.player_id
            AND p.user_id = auth.uid()
        )
    );

-- UPDATE: Players can update their own RSVP, admins can update any
CREATE POLICY "Players can update their own RSVP"
    ON match_players
    FOR UPDATE
    TO authenticated
    USING (
        is_match_admin(match_id)
        OR
        EXISTS (
            SELECT 1 FROM players p
            WHERE p.id = match_players.player_id
            AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        is_match_admin(match_id)
        OR
        EXISTS (
            SELECT 1 FROM players p
            WHERE p.id = match_players.player_id
            AND p.user_id = auth.uid()
        )
    );

-- DELETE: Only admins can delete match player entries
CREATE POLICY "Team admins can delete match players"
    ON match_players
    FOR DELETE
    TO authenticated
    USING (is_match_admin(match_id));

-- ============================================================================
-- RLS POLICIES FOR FORMATIONS
-- ============================================================================

-- SELECT: Team members can view formations
CREATE POLICY "Team members can view formations"
    ON formations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM matches m
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE m.id = formations.match_id
            AND tm.user_id = auth.uid()
        )
    );

-- INSERT: Team admins can create formations
CREATE POLICY "Team admins can create formations"
    ON formations
    FOR INSERT
    TO authenticated
    WITH CHECK (is_match_admin(match_id));

-- UPDATE: Team admins can update formations
CREATE POLICY "Team admins can update formations"
    ON formations
    FOR UPDATE
    TO authenticated
    USING (is_match_admin(match_id))
    WITH CHECK (is_match_admin(match_id));

-- DELETE: Team admins can delete formations
CREATE POLICY "Team admins can delete formations"
    ON formations
    FOR DELETE
    TO authenticated
    USING (is_match_admin(match_id));

-- ============================================================================
-- RLS POLICIES FOR FORMATION_POSITIONS
-- ============================================================================

-- SELECT: Team members can view formation positions
CREATE POLICY "Team members can view formation positions"
    ON formation_positions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM formations f
            JOIN matches m ON f.match_id = m.id
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE f.id = formation_positions.formation_id
            AND tm.user_id = auth.uid()
        )
    );

-- INSERT: Team admins can create formation positions
CREATE POLICY "Team admins can create formation positions"
    ON formation_positions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM formations f
            JOIN matches m ON f.match_id = m.id
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE f.id = formation_positions.formation_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'co-admin')
        )
    );

-- UPDATE: Team admins can update formation positions
CREATE POLICY "Team admins can update formation positions"
    ON formation_positions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM formations f
            JOIN matches m ON f.match_id = m.id
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE f.id = formation_positions.formation_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'co-admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM formations f
            JOIN matches m ON f.match_id = m.id
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE f.id = formation_positions.formation_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'co-admin')
        )
    );

-- DELETE: Team admins can delete formation positions
CREATE POLICY "Team admins can delete formation positions"
    ON formation_positions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM formations f
            JOIN matches m ON f.match_id = m.id
            JOIN team_members tm ON m.team_id = tm.team_id
            WHERE f.id = formation_positions.formation_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'co-admin')
        )
    );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_team_id ON matches(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_team_id_scheduled_at ON matches(team_id, scheduled_at);

-- Match players indexes
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player_id ON match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_match_players_rsvp_status ON match_players(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_match_players_match_id_rsvp ON match_players(match_id, rsvp_status);

-- Formations indexes
CREATE INDEX IF NOT EXISTS idx_formations_match_id ON formations(match_id);

-- Formation positions indexes
CREATE INDEX IF NOT EXISTS idx_formation_positions_formation_id ON formation_positions(formation_id);
CREATE INDEX IF NOT EXISTS idx_formation_positions_player_id ON formation_positions(player_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger for matches
CREATE TRIGGER matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for formations
CREATE TRIGGER formations_updated_at
    BEFORE UPDATE ON formations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE matches IS 'Scheduled football matches';
COMMENT ON TABLE match_players IS 'Player RSVPs and assignments per match';
COMMENT ON TABLE formations IS 'Formation templates for matches';
COMMENT ON TABLE formation_positions IS 'Player assignments to formation positions';

COMMENT ON COLUMN matches.mode IS 'Match format: 5vs5 or 8vs8';
COMMENT ON COLUMN matches.sync_status IS 'Offline-first sync tracking: synced, pending, error';
COMMENT ON COLUMN match_players.rsvp_status IS 'Player availability: in, out, or maybe';
COMMENT ON COLUMN match_players.sync_status IS 'Offline-first sync tracking: synced, pending, error';
COMMENT ON COLUMN formation_positions.position_x IS 'Grid column 0-9 for horizontal positioning on pitch';
COMMENT ON COLUMN formation_positions.position_y IS 'Grid row 0-6 for vertical positioning on pitch';
