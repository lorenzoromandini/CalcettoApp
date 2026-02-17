-- Migration: Match Management Schema
-- Creates tables for matches, RSVPs, formations, and formation positions
-- Phase 03, Plan 01

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('5vs5', '8vs8')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    home_score INTEGER,
    away_score INTEGER,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'synced'
);

-- ============================================
-- MATCH_PLAYERS TABLE (RSVP tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS match_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(10) NOT NULL CHECK (rsvp_status IN ('in', 'out', 'maybe')),
    rsvp_at TIMESTAMPTZ DEFAULT NOW(),
    position_on_pitch VARCHAR(20),
    sync_status VARCHAR(20) DEFAULT 'synced',
    UNIQUE(match_id, player_id)
);

-- ============================================
-- FORMATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    team_formation JSONB NOT NULL DEFAULT '{"formation": "", "positions": []}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FORMATION_POSITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS formation_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    position_x INTEGER NOT NULL CHECK (position_x >= 0 AND position_x <= 9),
    position_y INTEGER NOT NULL CHECK (position_y >= 0 AND position_y <= 6),
    position_label VARCHAR(20) NOT NULL,
    is_substitute BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(formation_id, position_x, position_y)
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_positions ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin of the team that owns the match
CREATE OR REPLACE FUNCTION is_match_admin(match_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    team_uuid UUID;
BEGIN
    SELECT team_id INTO team_uuid FROM matches WHERE id = match_uuid;
    RETURN is_team_admin(team_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is a participant (team member) of the match
CREATE OR REPLACE FUNCTION is_match_participant(match_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    team_uuid UUID;
BEGIN
    SELECT team_id INTO team_uuid FROM matches WHERE id = match_uuid;
    RETURN is_team_member(team_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Matches table policies
CREATE POLICY "Team members can view matches"
    ON matches FOR SELECT
    TO authenticated
    USING (is_match_participant(id));

CREATE POLICY "Team admins can create matches"
    ON matches FOR INSERT
    TO authenticated
    WITH CHECK (is_team_admin(team_id));

CREATE POLICY "Team admins can update matches"
    ON matches FOR UPDATE
    TO authenticated
    USING (is_match_admin(id))
    WITH CHECK (is_match_admin(id));

CREATE POLICY "Team admins can delete matches"
    ON matches FOR DELETE
    TO authenticated
    USING (is_match_admin(id));

-- Match players (RSVP) policies
CREATE POLICY "Team members can view RSVPs"
    ON match_players FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM matches m 
        WHERE m.id = match_players.match_id 
        AND is_match_participant(m.id)
    ));

CREATE POLICY "Players can RSVP for themselves"
    ON match_players FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM players p 
        WHERE p.id = match_players.player_id 
        AND p.user_id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM matches m 
        WHERE m.id = match_players.match_id 
        AND is_match_participant(m.id)
    ));

CREATE POLICY "Players can update their own RSVP"
    ON match_players FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM players p 
        WHERE p.id = match_players.player_id 
        AND p.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM players p 
        WHERE p.id = match_players.player_id 
        AND p.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all RSVPs"
    ON match_players FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM matches m 
        WHERE m.id = match_players.match_id 
        AND is_match_admin(m.id)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM matches m 
        WHERE m.id = match_players.match_id 
        AND is_match_admin(m.id)
    ));

-- Formations table policies
CREATE POLICY "Team members can view formations"
    ON formations FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM matches m 
        WHERE m.id = formations.match_id 
        AND is_match_participant(m.id)
    ));

CREATE POLICY "Team admins can create formations"
    ON formations FOR INSERT
    TO authenticated
    WITH CHECK (is_match_admin(match_id));

CREATE POLICY "Team admins can update formations"
    ON formations FOR UPDATE
    TO authenticated
    USING (is_match_admin(match_id))
    WITH CHECK (is_match_admin(match_id));

CREATE POLICY "Team admins can delete formations"
    ON formations FOR DELETE
    TO authenticated
    USING (is_match_admin(match_id));

-- Formation positions policies
CREATE POLICY "Team members can view formation positions"
    ON formation_positions FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM formations f 
        JOIN matches m ON m.id = f.match_id 
        WHERE f.id = formation_positions.formation_id 
        AND is_match_participant(m.id)
    ));

CREATE POLICY "Team admins can manage formation positions"
    ON formation_positions FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM formations f 
        WHERE f.id = formation_positions.formation_id 
        AND is_match_admin(f.match_id)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM formations f 
        WHERE f.id = formation_positions.formation_id 
        AND is_match_admin(f.match_id)
    ));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_matches_team_id ON matches(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player_id ON match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_match_players_rsvp_status ON match_players(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_formations_match_id ON formations(match_id);
CREATE INDEX IF NOT EXISTS idx_formation_positions_formation_id ON formation_positions(formation_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER formations_updated_at
    BEFORE UPDATE ON formations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
