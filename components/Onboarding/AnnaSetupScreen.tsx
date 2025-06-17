import { Card } from "@/components/UI/Card";
import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AnnaSetupScreenProps {
  onComplete: (userInfo: UserSetupInfo) => void;
}

export interface UserSetupInfo {
  name: string;
  email: string;
  communicationStyle: "formal" | "casual" | "friendly";
  workPriorities: string[];
  emailFrequency: "high" | "medium" | "low";
}

export const AnnaSetupScreen: React.FC<AnnaSetupScreenProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserSetupInfo>({
    name: "",
    email: "",
    communicationStyle: "friendly",
    workPriorities: [],
    emailFrequency: "medium",
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(userInfo);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return userInfo.name.trim().length > 0;
      case 2:
        return userInfo.email.trim().length > 0 && userInfo.email.includes("@");
      case 3:
        return true; // Communication style has default
      case 4:
        return userInfo.workPriorities.length > 0;
      default:
        return false;
    }
  };

  const togglePriority = (priority: string) => {
    setUserInfo((prev) => ({
      ...prev,
      workPriorities: prev.workPriorities.includes(priority)
        ? prev.workPriorities.filter((p) => p !== priority)
        : [...prev.workPriorities, priority],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.annaMessage}>
              Hi there! I'm Anna, your new AI email assistant. I'm excited to
              help you take control of your inbox! What should I call you?
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={userInfo.name}
              onChangeText={(name) =>
                setUserInfo((prev) => ({ ...prev, name }))
              }
              autoFocus
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.annaMessage}>
              Nice to meet you, {userInfo.name}! What's your email address? I'll
              use this to connect with your inbox and provide personalized
              assistance.
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              value={userInfo.email}
              onChangeText={(email) =>
                setUserInfo((prev) => ({ ...prev, email }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.annaMessage}>
              Perfect! Now, how would you like me to communicate with you? I can
              adapt my tone to match your preferences.
            </Text>
            <View style={styles.optionsContainer}>
              {[
                {
                  key: "formal",
                  label: "Professional & Formal",
                  desc: "Business-appropriate tone",
                },
                {
                  key: "friendly",
                  label: "Friendly & Approachable",
                  desc: "Warm but professional",
                },
                {
                  key: "casual",
                  label: "Casual & Relaxed",
                  desc: "Informal and conversational",
                },
              ].map((option) => (
                <Card
                  key={option.key}
                  variant="elevated"
                  style={[
                    styles.optionCard,
                    userInfo.communicationStyle === option.key &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    setUserInfo((prev) => ({
                      ...prev,
                      communicationStyle: option.key as any,
                    }))
                  }
                >
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.desc}</Text>
                </Card>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.annaMessage}>
              Last question! What are your main work priorities? This helps me
              understand what emails are most important to you.
            </Text>
            <View style={styles.optionsContainer}>
              {[
                "Client Communication",
                "Team Collaboration",
                "Project Management",
                "Sales & Business Development",
                "Marketing & Content",
                "Finance & Operations",
                "Learning & Development",
                "Networking & Partnerships",
              ].map((priority) => (
                <Card
                  key={priority}
                  variant="elevated"
                  style={[
                    styles.priorityCard,
                    userInfo.workPriorities.includes(priority) &&
                      styles.selectedOption,
                  ]}
                  onPress={() => togglePriority(priority)}
                >
                  <Text style={styles.priorityText}>{priority}</Text>
                  {userInfo.workPriorities.includes(priority) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Card>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>A</Text>
          </LinearGradient>
          <Text style={styles.title}>Setting up Anna</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(step / totalSteps) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {step} of {totalSteps}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton
            title={step === totalSteps ? "Complete Setup" : "Next"}
            onPress={handleNext}
            disabled={!canProceed()}
            size="large"
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  stepContainer: {
    paddingTop: theme.spacing.lg,
  },
  annaMessage: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionCard: {
    padding: theme.spacing.md,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priorityCard: {
    padding: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  nextButton: {
    width: "100%",
  },
});
