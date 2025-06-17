import React, { useEffect } from 'react';
import { useAuthState } from '@/lib/clerk';
import { userService } from '@/lib/supabase';
import { useAppStore } from '@/stores/appStore';
import { router } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoaded, isSignedIn, userId, user } = useAuthState();
  const { setUser, setAuthenticated, isOnboarded } = useAppStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userId && user) {
      // User is authenticated
      setAuthenticated(true);
      
      // Sync user data with Supabase
      syncUserData();
    } else {
      // User is not authenticated
      setAuthenticated(false);
      setUser(null);
      
      // Redirect to auth screen if not on onboarding
      if (!router.canGoBack() || window.location.pathname !== '/onboarding') {
        router.replace('/auth');
      }
    }
  }, [isLoaded, isSignedIn, userId, user]);

  const syncUserData = async () => {
    if (!user || !userId) return;

    try {
      // Create or update user profile in Supabase
      const userProfile = await userService.upsertUserProfile({
        id: userId,
        emailAddresses: user.emailAddresses || [],
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });

      // Update local store with user data
      setUser({
        id: userProfile.id,
        clerkUserId: userProfile.clerk_user_id,
        email: userProfile.email,
        firstName: userProfile.first_name || undefined,
        lastName: userProfile.last_name || undefined,
        avatarUrl: userProfile.avatar_url || undefined,
        preferences: {
          notifications: true,
          emailSync: false,
          voiceEnabled: true,
          theme: 'light',
        },
      });

      // Check if user has completed onboarding
      if (!userProfile.onboarding_completed && isOnboarded) {
        // Mark onboarding as completed in database
        await userService.completeOnboarding(userId);
      } else if (userProfile.onboarding_completed && !isOnboarded) {
        // Update local state if onboarding was completed elsewhere
        useAppStore.getState().setOnboarded(true);
      }

    } catch (error) {
      console.error('Error syncing user data:', error);
      // Don't block the app if sync fails
    }
  };

  // Show loading screen while auth is loading
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
