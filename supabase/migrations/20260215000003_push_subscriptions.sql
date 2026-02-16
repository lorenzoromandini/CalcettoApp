-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription JSONB NOT NULL, -- Web Push subscription object
    device_info TEXT, -- Optional: device type, browser
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One subscription per user (simplified)
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    match_reminder_24h BOOLEAN DEFAULT TRUE,
    match_reminder_2h BOOLEAN DEFAULT TRUE,
    match_reminder_30m BOOLEAN DEFAULT FALSE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Notification log (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'reminder_24h', 'reminder_2h', 'reminder_30m'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- push_subscriptions: Users can only see/modify their own
CREATE POLICY "Users can manage own push subscriptions"
    ON push_subscriptions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- notification_preferences: Users can only see/modify their own
CREATE POLICY "Users can manage own notification preferences"
    ON notification_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- notification_logs: Users can only see their own
CREATE POLICY "Users can view own notification logs"
    ON notification_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_match_id ON notification_logs(match_id);

-- Triggers for updated_at
CREATE TRIGGER push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get users needing reminder (for scheduled jobs)
CREATE OR REPLACE FUNCTION get_users_for_match_reminder(reminder_type VARCHAR)
RETURNS TABLE (
    user_id UUID,
    match_id UUID,
    subscription JSONB,
    match_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.user_id,
        m.id as match_id,
        ps.subscription,
        jsonb_build_object(
            'scheduled_at', m.scheduled_at,
            'location', m.location,
            'mode', m.mode
        ) as match_data
    FROM matches m
    JOIN team_members tm ON tm.team_id = m.team_id
    JOIN push_subscriptions ps ON ps.user_id = tm.user_id
    LEFT JOIN notification_preferences np ON np.user_id = tm.user_id
    LEFT JOIN notification_logs nl ON nl.match_id = m.id 
        AND nl.user_id = tm.user_id 
        AND nl.type = reminder_type
    WHERE m.status = 'scheduled'
        AND nl.id IS NULL -- Not already sent
        AND CASE reminder_type
            WHEN 'reminder_24h' THEN 
                m.scheduled_at BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
                AND COALESCE(np.match_reminder_24h, TRUE)
            WHEN 'reminder_2h' THEN 
                m.scheduled_at BETWEEN NOW() + INTERVAL '1 hour' AND NOW() + INTERVAL '3 hours'
                AND COALESCE(np.match_reminder_2h, TRUE)
            WHEN 'reminder_30m' THEN 
                m.scheduled_at BETWEEN NOW() + INTERVAL '15 minutes' AND NOW() + INTERVAL '45 minutes'
                AND COALESCE(np.match_reminder_30m, FALSE)
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
