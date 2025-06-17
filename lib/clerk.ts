import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Secure token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Clerk configuration
export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error('Missing Clerk publishable key. Please check your .env file.');
}

// Export Clerk components and hooks
export { ClerkProvider, useAuth, useUser, tokenCache };

// Auth helper functions
export const authHelpers = {
  // Check if user is authenticated
  isAuthenticated: (auth: ReturnType<typeof useAuth>) => {
    return !!auth.isSignedIn && !!auth.userId;
  },

  // Get user's email
  getUserEmail: (user: ReturnType<typeof useUser>['user']) => {
    return user?.emailAddresses?.[0]?.emailAddress || null;
  },

  // Check if email is verified
  isEmailVerified: (user: ReturnType<typeof useUser>['user']) => {
    return user?.emailAddresses?.[0]?.verification?.status === 'verified';
  },

  // Get user's full name
  getUserFullName: (user: ReturnType<typeof useUser>['user']) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.lastName || 'User';
  },

  // Get user's avatar URL
  getUserAvatarUrl: (user: ReturnType<typeof useUser>['user']) => {
    return user?.imageUrl || null;
  },
};

// Auth state types
export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: any;
  signOut: () => Promise<void>;
}

// Custom hook for auth state
export const useAuthState = (): AuthState => {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    userId: userId || null,
    user,
    signOut,
  };
};
