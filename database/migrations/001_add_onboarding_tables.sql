-- Migration: Complete Anna AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the update function first (outside DO block)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Check if tables exist before creating
DO $$ 
BEGIN
    -- Create user_profiles table first if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clerk_user_id TEXT UNIQUE,
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

        -- Create index
        CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
        CREATE INDEX idx_user_profiles_email ON user_profiles(email);

        -- Enable RLS
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can view own profile" ON user_profiles
            FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

        CREATE POLICY "Users can update own profile" ON user_profiles
            FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

        -- Create trigger for updated_at
        CREATE TRIGGER update_user_profiles_updated_at 
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created user_profiles table successfully';
    ELSE
        RAISE NOTICE 'user_profiles table already exists';
    END IF;

    -- Create user_onboarding_profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_onboarding_profiles') THEN
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

        -- Create index
        CREATE INDEX idx_user_onboarding_profiles_user_id ON user_onboarding_profiles(user_id);

        -- Enable RLS
        ALTER TABLE user_onboarding_profiles ENABLE ROW LEVEL SECURITY;

        -- Create RLS policy
        CREATE POLICY "Users can view own onboarding profile" ON user_onboarding_profiles
            FOR ALL USING (
                user_id IN (
                    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
                )
            );

        -- Create trigger for updated_at
        CREATE TRIGGER update_user_onboarding_profiles_updated_at 
            BEFORE UPDATE ON user_onboarding_profiles
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created user_onboarding_profiles table successfully';
    ELSE
        RAISE NOTICE 'user_onboarding_profiles table already exists';
    END IF;

    -- Add external accounts table for Gmail, Twitter, etc.
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_external_accounts') THEN
        CREATE TABLE user_external_accounts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            provider TEXT NOT NULL, -- 'gmail', 'twitter', 'linkedin', etc.
            provider_account_id TEXT,
            provider_username TEXT,
            provider_email TEXT,
            access_token TEXT,
            refresh_token TEXT,
            token_expires_at TIMESTAMP WITH TIME ZONE,
            account_data JSONB,
            is_active BOOLEAN DEFAULT TRUE,
            connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_synced_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            UNIQUE(user_id, provider)
        );

        -- Create indexes
        CREATE INDEX idx_user_external_accounts_user_id ON user_external_accounts(user_id);
        CREATE INDEX idx_user_external_accounts_provider ON user_external_accounts(provider);

        -- Enable RLS
        ALTER TABLE user_external_accounts ENABLE ROW LEVEL SECURITY;

        -- Create RLS policy
        CREATE POLICY "Users can view own external accounts" ON user_external_accounts
            FOR ALL USING (
                user_id IN (
                    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
                )
            );

        -- Create trigger for updated_at
        CREATE TRIGGER update_user_external_accounts_updated_at 
            BEFORE UPDATE ON user_external_accounts
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created user_external_accounts table successfully';
    ELSE
        RAISE NOTICE 'user_external_accounts table already exists';
    END IF;

END $$;

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_onboarding_profiles')
ORDER BY tablename;