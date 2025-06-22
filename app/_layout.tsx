// Temporarily disable Clerk until env vars are set
// import { ClerkProvider, clerkPublishableKey, tokenCache } from "@/lib/clerk";
import { StoreProvider } from "@/components/StoreProvider";
import { supabase } from "@/lib/supabase";
import { useSafeAppStore } from "@/stores/appStore";
import { Stack, router, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AppContent() {
  const [mounted, setMounted] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Call hooks unconditionally - this is required by React
  const segments = useSegments();

  // Access store - but handle errors gracefully
  const storeState = useSafeAppStore();
  const isStoreReady = storeState?.isStoreReady || false;

  // Wait for component to mount before accessing store
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Supabase auth listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in, check if they exist in our database
        try {
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("email", session.user.email)
            .single();

          if (profile) {
            // Existing user - mark as authenticated and onboarded
            storeState.setUser({
              id: profile.id,
              name: `${profile.first_name || ""} ${
                profile.last_name || ""
              }`.trim(),
              email: profile.email,
              isGmailConnected: false,
              preferences: {
                notificationsEnabled: true,
                voiceEnabled: true,
                darkMode: false,
              },
            });
            storeState.setAuthenticated(true);
            // Only mark as onboarded if they have completed signup AND onboarding
            if (profile.onboarding_completed && profile.email) {
              storeState.setOnboarded(true);
            } else {
              // User exists but hasn't completed full onboarding
              storeState.setOnboarded(false);
            }
          } else {
            // New user - they'll go through onboarding
            console.log("👤 New user detected, starting onboarding");
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
        }
      } else if (event === "SIGNED_OUT") {
        // User signed out
        storeState.setUser(null);
        storeState.setAuthenticated(false);
        storeState.setOnboarded(false);
      }

      setAuthInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle navigation after component is mounted
  useEffect(() => {
    // Wait for everything to be ready
    if (!mounted || !isStoreReady || !authInitialized) {
      console.log("⏳ Waiting for mount/store/auth...", {
        mounted,
        isStoreReady,
        authInitialized,
      });
      return;
    }

    // Add a small delay to ensure navigation is ready
    const navigationTimeout = setTimeout(() => {
      try {
        // Get current store state safely
        const { isOnboarded, onboardingStep } = storeState;

        // Safely check segments array
        if (!Array.isArray(segments)) {
          console.log(
            "⏳ Segments not ready yet, proceeding with default navigation"
          );
        }

        const currentRoute = segments?.[0];
        const inTabsGroup = currentRoute === "(tabs)";
        const inOnboardingRoute = currentRoute === "onboarding";

        console.log("🧭 Navigation check:", {
          isOnboarded,
          onboardingStep,
          currentRoute,
          inTabsGroup,
          inOnboardingRoute,
        });

        // Route logic
        if (!isOnboarded) {
          // User hasn't completed onboarding
          if (!inOnboardingRoute) {
            console.log("🚀 Redirecting to onboarding");
            router.replace("/onboarding");
          }
        } else {
          // User has completed onboarding
          if (!inTabsGroup && currentRoute !== "modal") {
            console.log("🏠 Redirecting to main app");
            router.replace("/(tabs)");
          }
        }
      } catch (error) {
        console.warn("❌ Navigation effect error:", error);
        // Fallback: if there's an error, try to go to onboarding
        router.replace("/onboarding");
      }
    }, 500); // Give navigation 500ms to initialize

    return () => clearTimeout(navigationTimeout);
  }, [mounted, isStoreReady, authInitialized, storeState?.isOnboarded]);

  // Show loading screen while store is initializing
  if (!isStoreReady || !authInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Anna...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          {/* Temporarily disable Clerk wrapper until env vars are set */}
          {/* <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}> */}
          <AppContent />
          {/* </ClerkProvider> */}
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
});
