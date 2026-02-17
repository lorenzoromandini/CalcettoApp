-- Migration: Live Match Experience Schema
-- Creates tables for match timers and match events
-- Phase 04, Plan 01

-- ============================================
-- MATCH_TIMERS TABLE
-- ============================================
-- Tracks the state of the match timer (start, pause, elapsed time)
CREATE TABLE IF NOT EXISTS match_timers (
    match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ,                          -- When timer first started
    paused_at TIMESTAMPTZ,                           -- When timer was paused
    total_elapsed_seconds INTEGER NOT NULL DEFAULT 0, -- Accumulated time before current run
    is_running BOOLEAN NOT NULL DEFAULT FALSE,       -- Current timer state
    updated_by UUID REFERENCES auth.users(id),       -- Last user to modify timer
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATCH_EVENTS TABLE
-- ============================================
-- Records match events: goals, assists, cards, etc.
-- Client-generated UUIDs for offline support
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY,                             -- Client-generated UUID
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card', 'own_goal', 'penalty')),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player_id_secondary UUID REFERENCES players(id) ON DELETE SET NULL, -- For assists or substituted player
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_time_seconds INTEGER NOT NULL,             -- Elapsed match time when event occurred
    match_time_display TEXT NOT NULL,                -- Formatted MM:SS for display
    recorded_by UUID REFERENCES auth.users(id),      -- Who recorded the event
    timestamp TIMESTAMPTZ DEFAULT NOW(),             -- Server timestamp
    client_timestamp TIMESTAMPTZ NOT NULL,           -- Client timestamp for ordering
    metadata JSONB,                                  -- Event-specific data (body_part, goal_type, card_reason)
    sync_status TEXT DEFAULT 'synced'                -- For optimistic updates tracking
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE match_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user can record events for a match
CREATE OR REPLACE FUNCTION can_record_match_events(match_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    team_uuid UUID;
BEGIN
    SELECT team_id INTO team_uuid FROM matches WHERE id = match_uuid;
    RETURN is_match_participant(match_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Match timers policies
CREATE POLICY "Team members can view match timers"
    ON match_timers FOR SELECT
    TO authenticated
    USING (is_match_participant(match_id));

CREATE POLICY "Team members can create/update match timers"
    ON match_timers FOR ALL
    TO authenticated
    USING (is_match_participant(match_id))
    WITH CHECK (is_match_participant(match_id));

-- Match events policies
CREATE POLICY "Team members can view match events"
    ON match_events FOR SELECT
    TO authenticated
    USING (is_match_participant(match_id));

CREATE POLICY "Team members can record match events"
    ON match_events FOR INSERT
    TO authenticated
    WITH CHECK (can_record_match_events(match_id));

CREATE POLICY "Team members can update match events"
    ON match_events FOR UPDATE
    TO authenticated
    USING (can_record_match_events(match_id))
    WITH CHECK (can_record_match_events(match_id));

CREATE POLICY "Team members can delete match events"
    ON match_events FOR DELETE
    TO authenticated
    USING (can_record_match_events(match_id));

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
-- Enable realtime for both tables to broadcast changes
ALTER PUBLICATION supabase_realtime ADD TABLE match_timers;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;

-- ============================================
-- INDEXES
-- ============================================
-- Match events indexes
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_event_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_events_timestamp ON match_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_match_events_client_timestamp ON match_events(client_timestamp);

-- Match timers indexes (match_id is already PK)
CREATE INDEX IF NOT EXISTS idx_match_timers_updated_by ON match_timers(updated_by);
