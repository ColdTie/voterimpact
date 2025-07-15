-- Create notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{
    "emailNotifications": true,
    "billUpdates": true,
    "voteAlerts": true,
    "townHalls": false,
    "weeklyDigest": true,
    "categories": [],
    "representatives": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create bill tracking table
CREATE TABLE IF NOT EXISTS bill_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id TEXT NOT NULL,
  bill_title TEXT NOT NULL,
  bill_status TEXT,
  last_notified_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Create notification history table
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'bill_update', 'vote_alert', 'town_hall', 'weekly_digest'
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_notification_user_sent (user_id, sent_at DESC)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bill_tracking_user ON bill_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_tracking_bill ON bill_tracking(bill_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);

-- Add RLS policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Notification settings policies
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- Bill tracking policies
CREATE POLICY "Users can view own tracked bills" ON bill_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tracked bills" ON bill_tracking
  FOR ALL USING (auth.uid() = user_id);

-- Notification history policies
CREATE POLICY "Users can view own notification history" ON notification_history
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE
  ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_tracking_updated_at BEFORE UPDATE
  ON bill_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();