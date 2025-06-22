-- Anna AI Assistant Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (synced with Clerk)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'trial', 'premium'
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External account connections (per user)
CREATE TABLE user_external_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gmail', 'twitter', 'linkedin', etc.
  provider_account_id TEXT, -- External account ID
  provider_username TEXT, -- @username for social media
  provider_email TEXT, -- Email for the external account
  access_token TEXT, -- Encrypted access token
  refresh_token TEXT, -- Encrypted refresh token
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB, -- Additional account-specific data
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one connection per provider per user
  UNIQUE(user_id, provider)
);

-- User onboarding data (conversational profile)
CREATE TABLE user_onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  personal_data JSONB DEFAULT '{}', -- name, role, company, industry, experience
  work_style JSONB DEFAULT '{}', -- emailVolume, busyHours, priorities, challenges
  preferences JSONB DEFAULT '{}', -- communicationStyle, notificationPreference, automationLevel
  goals JSONB DEFAULT '{}', -- primaryGoals, timeExpectations, successMetrics
  conversation_history JSONB DEFAULT '[]', -- full onboarding conversation
  profile_completeness INTEGER DEFAULT 0, -- percentage complete (0-100)
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one onboarding profile per user
  UNIQUE(user_id)
);

-- User preferences and settings
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference per key per user
  UNIQUE(user_id, preference_key)
);

-- Email sync data (for Gmail integration)
CREATE TABLE user_email_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  external_account_id UUID REFERENCES user_external_accounts(id) ON DELETE CASCADE,
  last_sync_token TEXT, -- Gmail sync token
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'error'
  sync_error TEXT,
  emails_synced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_user_external_accounts_user_id ON user_external_accounts(user_id);
CREATE INDEX idx_user_external_accounts_provider ON user_external_accounts(provider);
CREATE INDEX idx_user_onboarding_profiles_user_id ON user_onboarding_profiles(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_email_sync_user_id ON user_email_sync(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_external_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_sync ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own external accounts" ON user_external_accounts
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view own onboarding profile" ON user_onboarding_profiles
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view own email sync" ON user_email_sync
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_external_accounts_updated_at BEFORE UPDATE ON user_external_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_profiles_updated_at BEFORE UPDATE ON user_onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_email_sync_updated_at BEFORE UPDATE ON user_email_sync
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
