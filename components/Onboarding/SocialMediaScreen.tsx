import { Card } from "@/components/UI/Card";
import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
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

interface SocialMediaScreenProps {
  onNext: () => void;
}

export const SocialMediaScreen: React.FC<SocialMediaScreenProps> = ({
  onNext,
}) => {
  const { width } = useWindowDimensions();

  const socialFeatures = [
    {
      icon: "📱",
      title: "Multi-Platform Management",
      description: "Manage Instagram, Twitter, LinkedIn, and TikTok from one place with Anna's unified dashboard.",
    },
    {
      icon: "🤖",
      title: "AI Content Creation",
      description: "Anna generates engaging posts, captions, and hashtags tailored to each platform's audience.",
    },
    {
      icon: "⏰",
      title: "Smart Scheduling",
      description: "Post at optimal times when your audience is most active, automatically across all platforms.",
    },
    {
      icon: "💬",
      title: "Engagement Automation",
      description: "Anna responds to comments and messages with your brand voice, keeping conversations flowing.",
    },
  ];

  const platforms = [
    { name: "Instagram", icon: "📷", color: "#E4405F" },
    { name: "Twitter", icon: "🐦", color: "#1DA1F2" },
    { name: "LinkedIn", icon: "💼", color: "#0077B5" },
    { name: "TikTok", icon: "🎵", color: "#000000" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.secondary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Social Media Mastery</Text>
            <Text style={styles.subtitle}>
              Anna automates your social presence while keeping your authentic voice
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              }}
              style={[styles.image, { width: width * 0.9 }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.platformsContainer}>
            <Text style={styles.platformsTitle}>Supported Platforms</Text>
            <View style={styles.platformsGrid}>
              {platforms.map((platform, index) => (
                <View key={index} style={styles.platformItem}>
                  <Text style={styles.platformIcon}>{platform.icon}</Text>
                  <Text style={styles.platformName}>{platform.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.featuresContainer}>
            {socialFeatures.map((feature, index) => (
              <Card key={index} variant="elevated" style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                </View>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </Card>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="Continue"
              onPress={onNext}
              style={styles.continueButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  image: {
    height: 200,
    borderRadius: 16,
  },
  platformsContainer: {
    marginBottom: 30,
  },
  platformsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  platformsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  platformItem: {
    alignItems: "center",
  },
  platformIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  platformName: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: "#ffffff",
  },
});
