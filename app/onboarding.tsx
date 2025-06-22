import { DashboardIntroScreen } from "@/components/Onboarding/DashboardIntroScreen";
import { GmailConnect } from "@/components/Onboarding/GmailConnect";
import { PricingScreen } from "@/components/Onboarding/PricingScreen";
import { useAppStore } from "@/stores/appStore";
import { Subscription } from "@/types";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

// Import onboarding components - updated imports
import { AnnaIntroScreen } from "@/components/Onboarding/AnnaIntroScreen";
import { UserSetupInfo } from "@/components/Onboarding/AnnaSetupScreen";
import { AudienceGrowthScreen } from "@/components/Onboarding/AudienceGrowthScreen";
import { BackgroundTasksScreen } from "@/components/Onboarding/BackgroundTasksScreen";
import ConversationalOnboarding from "@/components/Onboarding/ConversationalOnboarding";
import { SocialMediaScreen } from "@/components/Onboarding/SocialMediaScreen";
import { WelcomeScreen } from "@/components/Onboarding/WelcomeScreen";
import { UserProfile } from "@/lib/onboarding-ai";
import { onboardingStorage } from "@/lib/onboarding-storage";

export default function OnboardingScreen() {
  const {
    onboardingStep,
    setOnboardingStep,
    setOnboarded,
    setUser,
    setSubscription,
    setAuthenticated,
    resetOnboarding,
  } = useAppStore();

  const [userSetupInfo, setUserSetupInfo] = useState<UserSetupInfo | null>(
    null
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Debug: Reset onboarding if needed (temporary)
  useEffect(() => {
    const shouldReset = false; // Set to true to force reset for testing
    const skipToConversation = false; // Skip directly to conversation for testing
    const forceCompleteReset = true;
    if (forceCompleteReset) {
      console.log("🔄 Force complete reset including persisted data");
      resetOnboarding();
      // Also clear the AsyncStorage manually
      import("@react-native-async-storage/async-storage").then(
        (AsyncStorage) => {
          AsyncStorage.default.removeItem("anna-storage");
        }
      );
      return;
    }

    if (shouldReset) {
      console.log("🔄 Force resetting onboarding for testing");
      resetOnboarding();

      if (skipToConversation) {
        console.log("⏭️ Skipping directly to conversation for testing");
        // Wait a moment for reset to complete, then skip to conversation
        setTimeout(() => {
          setOnboardingStep("conversation-name");
        }, 100);
      }
    }
  }, []);

  // Anna Intro Screen handlers
  const handleAnnaIntroStart = () => {
    setOnboardingStep("value-proposition-1");
  };

  const handleLogin = (email: string) => {
    // TODO: Handle magic link authentication
    // For now, simulate login and go to dashboard
    setTimeout(() => {
      setUser({
        id: "1",
        name: "Returning User",
        email: email,
        isGmailConnected: false,
        preferences: {
          notificationsEnabled: true,
          voiceEnabled: true,
          darkMode: false,
        },
      });
      setAuthenticated(true);
      setOnboarded(true);
      router.replace("/(tabs)");
    }, 1000);
  };

  // Value Proposition handlers
  const handleValueProp1Next = () => {
    setOnboardingStep("value-proposition-2");
  };

  const handleValueProp2Next = () => {
    setOnboardingStep("value-proposition-3");
  };

  const handleValueProp3Next = () => {
    setOnboardingStep("pricing");
  };

  // Pricing handlers
  const handleSelectPlan = (planType: "trial" | "basic") => {
    const subscription: Subscription = {
      id: "1",
      plan: "basic",
      status: planType === "trial" ? "trial" : "active",
      startDate: new Date().toISOString(),
      price: 5,
      currency: "USD",
      isTrialActive: planType === "trial",
      trialEndDate:
        planType === "trial"
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
    };

    setSubscription(subscription);
    setOnboardingStep("conversation-name");
  };

  // Conversation handlers - for conversational onboarding phase
  const handleConversationComplete = async (profile: UserProfile) => {
    setUserProfile(profile);

    // Save to database
    try {
      await onboardingStorage.saveOnboardingProfile(profile);
      console.log("Profile saved successfully");
    } catch (error) {
      console.error("Failed to save profile:", error);
    }

    setOnboardingStep("signup");
  };

  // Signup handlers
  const handleSignupComplete = (email?: string) => {
    if (userProfile && email) {
      // Create user setup info from profile
      const setupInfo: UserSetupInfo = {
        name: userProfile.personal?.name || "",
        email: email,
        communicationStyle:
          (userProfile.preferences?.communicationStyle as
            | "formal"
            | "casual"
            | "friendly") || "formal",
        workPriorities: userProfile.goals?.primaryGoals || [],
        emailFrequency: "medium" as "high" | "medium" | "low",
      };

      setUserSetupInfo(setupInfo);

      setUser({
        id: "1",
        name: setupInfo.name,
        email: email,
        isGmailConnected: false,
        preferences: {
          notificationsEnabled: true,
          voiceEnabled: true,
          darkMode: false,
        },
      });
    }
    setOnboardingStep("gmail-connect");
  };

  // Gmail Connect handlers
  const handleSkipGmail = () => {
    completeOnboarding(false);
  };

  const handleGmailConnected = () => {
    completeOnboarding(true);
  };

  const completeOnboarding = async (isGmailConnected: boolean) => {
    if (userSetupInfo) {
      setUser({
        id: "1",
        name: userSetupInfo.name,
        email: userSetupInfo.email || "user@example.com",
        isGmailConnected,
        preferences: {
          notificationsEnabled: true,
          voiceEnabled: true,
          darkMode: false,
        },
      });

      // Update stored profile with Gmail connection status
      if (userProfile) {
        try {
          await onboardingStorage.saveOnboardingProfile({
            ...userProfile,
            contact: {
              ...userProfile.contact,
              email: userSetupInfo.email,
            },
          });
        } catch (error) {
          console.error("Failed to update profile with Gmail status:", error);
        }
      }
    }

    setOnboardingStep("dashboard-intro");
  };

  const handleDashboardIntroComplete = () => {
    // Only mark as fully onboarded if user has completed signup
    if (userSetupInfo?.email) {
      setOnboarded(true);
      setAuthenticated(true);
      router.replace("/(tabs)");
    } else {
      console.error("Cannot complete onboarding without user signup");
      // Redirect back to signup if no email
      setOnboardingStep("signup");
    }
  };

  const renderCurrentStep = () => {
    console.log("🎯 Current onboarding step:", onboardingStep);

    // Note: Emergency reset removed - no longer needed

    switch (onboardingStep) {
      // Initial Welcome/Authentication Screen
      case "anna-intro-1":
        return (
          <WelcomeScreen
            onGetStarted={handleAnnaIntroStart}
            onLogin={handleLogin}
          />
        );

      // Anna Introduction (2 Auto-playing Slides + Start Button)
      case "anna-intro-2":
      case "anna-start":
        return <AnnaIntroScreen onStart={handleAnnaIntroStart} />;

      // Value Propositions (3 Focused Slides)
      case "value-proposition-1":
        return <AudienceGrowthScreen onNext={handleValueProp1Next} />;

      case "value-proposition-2":
        return <SocialMediaScreen onNext={handleValueProp2Next} />;

      case "value-proposition-3":
        return <BackgroundTasksScreen onNext={handleValueProp3Next} />;

      // Paywall
      case "pricing":
        return <PricingScreen onSelectPlan={handleSelectPlan} />;

      // Conversational Setup (Anna Asks Questions)
      case "conversation-name":
      case "conversation-work":
      case "conversation-challenge":
      case "conversation-style":
      case "conversation-goals":
        return (
          <ConversationalOnboarding onComplete={handleConversationComplete} />
        );

      // Account Creation (Signup Wall)
      case "signup":
      case "email-input":
        return (
          <WelcomeScreen
            onGetStarted={handleSignupComplete}
            onLogin={handleLogin}
            isSignupMode={true}
          />
        );

      case "gmail-connect":
        return (
          <GmailConnect
            onSkip={handleSkipGmail}
            onComplete={handleGmailConnected}
          />
        );

      // Welcome to Anna
      case "dashboard-intro":
        return (
          <DashboardIntroScreen
            userName={userSetupInfo?.name || "User"}
            onComplete={handleDashboardIntroComplete}
          />
        );

      default:
        return (
          <WelcomeScreen
            onGetStarted={handleAnnaIntroStart}
            onLogin={handleLogin}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderCurrentStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
