import { Card } from "@/components/UI/Card";
import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface VoiceInteractionScreenProps {
  onNext: () => void;
}

export const VoiceInteractionScreen: React.FC<VoiceInteractionScreenProps> = ({
  onNext,
}) => {
  const { width } = useWindowDimensions();

  const socialFeatures = [
    {
      platform: "Instagram",
      icon: "📷",
      description:
        "Auto-post stories, respond to DMs, and track engagement metrics",
    },
    {
      platform: "Twitter",
      icon: "🐦",
      description:
        "Schedule tweets, reply to mentions, and monitor trending topics",
    },
    {
      platform: "LinkedIn",
      icon: "💼",
      description:
        "Share professional content, connect with prospects, and build your network",
    },
    {
      platform: "TikTok",
      icon: "🎵",
      description:
        "Create viral content ideas, post at optimal times, and engage with followers",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Text style={styles.iconText}>📱</Text>
          </LinearGradient>
          <Text style={styles.title}>Social Media Mastery</Text>
          <Text style={styles.subtitle}>
            Anna automates your social presence while keeping your authentic
            voice
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={[styles.image, { width: width * 0.9 }]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.commandsContainer}>
          <Text style={styles.sectionTitle}>Supported Platforms:</Text>
          {socialFeatures.map((item, index) => (
            <Card key={index} variant="elevated" style={styles.commandCard}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformIcon}>{item.icon}</Text>
                <Text style={styles.commandText}>{item.platform}</Text>
              </View>
              <Text style={styles.commandDescription}>{item.description}</Text>
            </Card>
          ))}
        </View>

        <Card variant="elevated" style={styles.benefitCard}>
          <View style={styles.benefitHeader}>
            <Text style={styles.benefitIcon}>✨</Text>
            <Text style={styles.benefitTitle}>Hands-Free Productivity</Text>
          </View>
          <Text style={styles.benefitDescription}>
            Perfect for when you're commuting, walking, or multitasking. Anna
            understands context and can handle complex email tasks through
            simple conversation.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="Next"
          onPress={onNext}
          size="large"
          style={styles.nextButton}
        />
      </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  image: {
    height: 200,
    borderRadius: theme.borderRadius.lg,
  },
  commandsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  commandCard: {
    marginBottom: theme.spacing.md,
  },
  platformHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  platformIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  commandText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    flex: 1,
  },
  commandDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  benefitCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: colors.primary + "10",
  },
  benefitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
