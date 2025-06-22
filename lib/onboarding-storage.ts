import { supabase } from './supabase';
import { UserProfile } from './onboarding-ai';

export interface OnboardingConversation {
  timestamp: string;
  speaker: 'anna' | 'user';
  message: string;
  questionId?: string;
}

export interface StoredOnboardingProfile {
  id: string;
  userId: string;
  personalData: UserProfile['personal'];
  workStyle: UserProfile['workStyle'];
  preferences: UserProfile['preferences'];
  goals: UserProfile['goals'];
  conversationHistory: OnboardingConversation[];
  profileCompleteness: number;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

class OnboardingStorageService {
  // Save onboarding profile to database
  async saveOnboardingProfile(
    userProfile: UserProfile, 
    conversationHistory: OnboardingConversation[] = []
  ): Promise<void> {
    try {
      // Get current user from Clerk
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user profile ID from our database
      const { data: userProfileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError || !userProfileData) {
        throw new Error('User profile not found');
      }

      const userId = userProfileData.id;

      // Calculate completeness percentage
      const completeness = this.calculateCompleteness(userProfile);

      // Prepare data for storage
      const onboardingData = {
        user_id: userId,
        personal_data: userProfile.personal || {},
        work_style: userProfile.workStyle || {},
        preferences: userProfile.preferences || {},
        goals: userProfile.goals || {},
        conversation_history: conversationHistory,
        profile_completeness: completeness,
        onboarding_completed_at: completeness >= 80 ? new Date().toISOString() : null
      };

      // Upsert onboarding profile
      const { error } = await supabase
        .from('user_onboarding_profiles')
        .upsert(onboardingData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving onboarding profile:', error);
        throw new Error('Failed to save onboarding profile');
      }

      // Update user profile completion status
      if (completeness >= 80) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_completed: true })
          .eq('id', userId);
      }

      console.log('Onboarding profile saved successfully');
    } catch (error) {
      console.error('Error in saveOnboardingProfile:', error);
      throw error;
    }
  }

  // Load existing onboarding profile
  async loadOnboardingProfile(): Promise<StoredOnboardingProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userProfileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError || !userProfileData) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .select('*')
        .eq('user_id', userProfileData.id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        personalData: data.personal_data,
        workStyle: data.work_style,
        preferences: data.preferences,
        goals: data.goals,
        conversationHistory: data.conversation_history,
        profileCompleteness: data.profile_completeness,
        onboardingCompletedAt: data.onboarding_completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error loading onboarding profile:', error);
      return null;
    }
  }

  // Save conversation message
  async saveConversationMessage(
    speaker: 'anna' | 'user',
    message: string,
    questionId?: string
  ): Promise<void> {
    try {
      const profile = await this.loadOnboardingProfile();
      if (!profile) {
        console.warn('No onboarding profile found to update conversation');
        return;
      }

      const newMessage: OnboardingConversation = {
        timestamp: new Date().toISOString(),
        speaker,
        message,
        questionId
      };

      const updatedHistory = [...profile.conversationHistory, newMessage];

      const { error } = await supabase
        .from('user_onboarding_profiles')
        .update({
          conversation_history: updatedHistory
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error saving conversation message:', error);
      }
    } catch (error) {
      console.error('Error in saveConversationMessage:', error);
    }
  }

  // Check if user has completed onboarding
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const profile = await this.loadOnboardingProfile();
      return profile?.profileCompleteness >= 80 && !!profile.onboardingCompletedAt;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }

  // Get onboarding insights for Anna to use
  async getOnboardingInsights(): Promise<{
    communicationStyle: string;
    primaryChallenges: string[];
    preferredAutomation: string;
    workContext: string;
  } | null> {
    try {
      const profile = await this.loadOnboardingProfile();
      if (!profile) return null;

      return {
        communicationStyle: profile.preferences?.communicationStyle || 'professional',
        primaryChallenges: profile.workStyle?.challenges || [],
        preferredAutomation: profile.preferences?.automationLevel || 'suggest',
        workContext: `${profile.personalData?.role || 'Professional'} at ${profile.personalData?.company || 'their company'}`
      };
    } catch (error) {
      console.error('Error getting onboarding insights:', error);
      return null;
    }
  }

  // Private helper to calculate profile completeness
  private calculateCompleteness(profile: UserProfile): number {
    let completedFields = 0;
    let totalFields = 0;

    // Personal data fields (weight: 30%)
    const personalFields = ['name', 'role', 'company'];
    personalFields.forEach(field => {
      totalFields++;
      if (profile.personal?.[field as keyof typeof profile.personal]) {
        completedFields++;
      }
    });

    // Work style fields (weight: 30%)
    const workFields = ['emailVolume', 'challenges', 'priorities'];
    workFields.forEach(field => {
      totalFields++;
      if (profile.workStyle?.[field as keyof typeof profile.workStyle]) {
        completedFields++;
      }
    });

    // Preferences fields (weight: 25%)
    const prefFields = ['communicationStyle', 'automationLevel'];
    prefFields.forEach(field => {
      totalFields++;
      if (profile.preferences?.[field as keyof typeof profile.preferences]) {
        completedFields++;
      }
    });

    // Goals fields (weight: 15%)
    const goalFields = ['primaryGoals'];
    goalFields.forEach(field => {
      totalFields++;
      if (profile.goals?.[field as keyof typeof profile.goals]) {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }
}

// Export singleton instance
export const onboardingStorage = new OnboardingStorageService();
export default onboardingStorage;