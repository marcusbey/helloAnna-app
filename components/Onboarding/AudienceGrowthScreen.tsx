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

interface AudienceGrowthScreenProps {
  onNext: () => void;
}

export const AudienceGrowthScreen: React.FC<AudienceGrowthScreenProps> = ({
  onNext,
}) => {
  const { width } = useWindowDimensions();

  const growthFeatures = [
    {
      icon: "📈",
      title: "Smart Content Strategy",
      description: "Anna analyzes your audience and suggests content that drives engagement and growth.",
    },
    {
      icon: "🎯",
      title: "Audience Targeting",
      description: "Identify and reach your ideal customers with precision targeting and personalized messaging.",
    },
    {
      icon: "🔄",
      title: "Automated Engagement",
      description: "Anna responds to comments, DMs, and mentions while maintaining your authentic voice.",
    },
    {
      icon: "📊",
      title: "Growth Analytics",
      description: "Track follower growth, engagement rates, and conversion metrics in real-time.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
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
            <Text style={styles.title}>Grow Your Audience</Text>
            <Text style={styles.subtitle}>
              Anna helps you build a loyal following and turn followers into customers
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              }}
              style={[styles.image, { width: width * 0.9 }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.featuresContainer}>
            {growthFeatures.map((feature, index) => (
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

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3x</Text>
              <Text style={styles.statLabel}>Faster Growth</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Higher Engagement</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Active Presence</Text>
            </View>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: "#ffffff",
  },
});
