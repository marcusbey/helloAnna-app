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

interface EmailManagementScreenProps {
  onNext: () => void;
}

export const EmailManagementScreen: React.FC<EmailManagementScreenProps> = ({
  onNext,
}) => {
  const { width } = useWindowDimensions();

  const features = [
    {
      icon: "📈",
      title: "Smart Content Strategy",
      description:
        "Anna analyzes your audience and suggests content that drives engagement and growth.",
    },
    {
      icon: "🎯",
      title: "Audience Targeting",
      description:
        "Identify and reach your ideal customers with precision targeting and personalized messaging.",
    },
    {
      icon: "🔄",
      title: "Automated Engagement",
      description:
        "Anna responds to comments, DMs, and mentions while maintaining your authentic voice.",
    },
    {
      icon: "📊",
      title: "Growth Analytics",
      description:
        "Track follower growth, engagement rates, and conversion metrics in real-time.",
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
            <Text style={styles.iconText}>📈</Text>
          </LinearGradient>
          <Text style={styles.title}>Grow Your Audience</Text>
          <Text style={styles.subtitle}>
            Anna helps you build a loyal following and turn followers into
            customers
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={[styles.image, { width: width * 0.9 }]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
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
  featuresContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  featureCard: {
    marginBottom: theme.spacing.md,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  featureDescription: {
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
