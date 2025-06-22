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

// Separate interface for conversational onboarding data
interface OnboardingUserInfo {
  name: string;
  email: string;
  role: string;
  company: string;
  goals: string;
  challenges: string;
  communicationStyle: "formal" | "casual" | "friendly";
}

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
  const [onboardingUserInfo, setOnboardingUserInfo] =
    useState<OnboardingUserInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Debug: Reset onboarding if needed (temporary)
  useEffect(() => {
    const shouldReset = false; // Set to true to force reset for testing
    const skipToConversation = false; // Skip directly to conversation for testing
    const forceCompleteReset = false; // Turn off debug reset
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

    // Don't save to database yet - user isn't authenticated
    // We'll save after signup/authentication is complete
    console.log(
      "✅ Conversational onboarding complete, profile stored locally"
    );
    console.log("📋 Profile data:", JSON.stringify(profile, null, 2));

    setOnboardingStep("signup");
  };

  // Signup handlers
  const handleSignupComplete = async (email?: string) => {
    if (userProfile && email) {
      // Create detailed onboarding user info from profile
      const onboardingInfo: OnboardingUserInfo = {
        name: userProfile.personal?.name || "",
        email: email,
        role: userProfile.personal?.role || "",
        company: userProfile.personal?.company || "",
        goals: userProfile.goals?.primaryGoals?.[0] || "",
        challenges: userProfile.workStyle?.challenges?.[0] || "",
        communicationStyle:
          (userProfile.preferences?.communicationStyle as
            | "formal"
            | "casual"
            | "friendly") || "formal",
      };

      // Also create UserSetupInfo for compatibility with existing components
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

      setOnboardingUserInfo(onboardingInfo);
      setUserSetupInfo(setupInfo);

      setUser({
        id: "1",
        name: onboardingInfo.name,
        email: email,
        isGmailConnected: false,
        preferences: {
          notificationsEnabled: true,
          voiceEnabled: true,
          darkMode: false,
        },
      });

      // Set authenticated state first
      setAuthenticated(true);

      // Now save profile to database after authentication
      try {
        const profileWithEmail = {
          ...userProfile,
          contact: {
            ...userProfile.contact,
            email: email,
          },
        };
        await onboardingStorage.saveOnboardingProfile(profileWithEmail);
        console.log("✅ Profile saved to database after authentication");
      } catch (error) {
        console.error("❌ Failed to save profile to database:", error);
        // Continue with onboarding even if save fails
      }
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
    if (onboardingUserInfo) {
      setUser({
        id: "1",
        name: onboardingUserInfo.name,
        email: onboardingUserInfo.email || "user@example.com",
        isGmailConnected,
        preferences: {
          notificationsEnabled: true,
          voiceEnabled: true,
          darkMode: false,
        },
      });

      // Profile was already saved in handleSignupComplete
      // Just update Gmail connection status if needed
      if (isGmailConnected && userProfile) {
        try {
          const updatedProfile = {
            ...userProfile,
            contact: {
              ...userProfile.contact,
              email: onboardingUserInfo.email,
            },
            preferences: {
              ...userProfile.preferences,
              gmailConnected: true,
            },
          };
          await onboardingStorage.saveOnboardingProfile(updatedProfile);
          console.log("✅ Profile updated with Gmail connection status");
        } catch (error) {
          console.error(
            "❌ Failed to update profile with Gmail status:",
            error
          );
        }
      }
    }

    setOnboardingStep("dashboard-intro");
  };

  const handleDashboardIntroComplete = () => {
    // Only mark as fully onboarded if user has completed signup
    if (onboardingUserInfo?.email) {
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
            userName={onboardingUserInfo?.name || "User"}
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
