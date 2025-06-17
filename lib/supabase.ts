import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Database types
export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  subscription_status: 'free' | 'trial' | 'premium';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserExternalAccount {
  id: string;
  user_id: string;
  provider: 'gmail' | 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  provider_account_id?: string;
  provider_username?: string;
  provider_email?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  account_data?: Record<string, any>;
  is_active: boolean;
  connected_at: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserEmailSync {
  id: string;
  user_id: string;
  external_account_id: string;
  last_sync_token?: string;
  last_sync_at?: string;
  sync_status: 'pending' | 'syncing' | 'completed' | 'error';
  sync_error?: string;
  emails_synced: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_external_accounts: {
        Row: UserExternalAccount;
        Insert: Omit<UserExternalAccount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserExternalAccount, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_preferences: {
        Row: UserPreference;
        Insert: Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_email_sync: {
        Row: UserEmailSync;
        Insert: Omit<UserEmailSync, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserEmailSync, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Create Supabase client with AsyncStorage for persistence
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for user data management
export const userService = {
  // Create or update user profile from Clerk data
  async upsertUserProfile(clerkUser: {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        clerk_user_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        first_name: clerkUser.firstName || null,
        last_name: clerkUser.lastName || null,
        avatar_url: clerkUser.imageUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user profile by Clerk ID
  async getUserProfile(clerkUserId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Mark onboarding as completed
  async completeOnboarding(clerkUserId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's external accounts
  async getUserExternalAccounts(userId: string) {
    const { data, error } = await supabase
      .from('user_external_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  // Add external account connection
  async connectExternalAccount(userId: string, accountData: Omit<UserExternalAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_external_accounts')
      .upsert({
        user_id: userId,
        ...accountData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Disconnect external account
  async disconnectExternalAccount(userId: string, provider: string) {
    const { data, error } = await supabase
      .from('user_external_accounts')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('provider', provider)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user preferences
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  // Set user preference
  async setUserPreference(userId: string, key: string, value: Record<string, any>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_key: key,
        preference_value: value,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
