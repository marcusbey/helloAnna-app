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

interface AIAssistanceScreenProps {
  onSetupAnna: () => void;
}

export const AIAssistanceScreen: React.FC<AIAssistanceScreenProps> = ({
  onSetupAnna,
}) => {
  const { width } = useWindowDimensions();

  const backgroundTasks = [
    {
      icon: "📧",
      title: "Email Management",
      description:
        "Anna sorts, prioritizes, and drafts responses to your emails while you focus on important work.",
    },
    {
      icon: "📅",
      title: "Calendar Coordination",
      description:
        "Schedule meetings, send reminders, and manage your calendar automatically.",
    },
    {
      icon: "📊",
      title: "Data Analysis",
      description:
        "Anna analyzes your business metrics and provides actionable insights and reports.",
    },
    {
      icon: "🔍",
      title: "Research & Monitoring",
      description:
        "Track competitors, monitor mentions, and research opportunities while you sleep.",
    },
    {
      icon: "📝",
      title: "Content Planning",
      description:
        "Anna creates content calendars, writes drafts, and plans your marketing campaigns.",
    },
    {
      icon: "🤝",
      title: "Lead Management",
      description:
        "Follow up with prospects, nurture leads, and manage your sales pipeline automatically.",
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
            <Text style={styles.iconText}>⚡</Text>
          </LinearGradient>
          <Text style={styles.title}>Background Tasks & More</Text>
          <Text style={styles.subtitle}>
            Anna handles the busy work so you can focus on what matters most
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={[styles.image, { width: width * 0.9 }]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.capabilitiesContainer}>
          {backgroundTasks.map((task, index) => (
            <Card key={index} variant="elevated" style={styles.capabilityCard}>
              <View style={styles.capabilityHeader}>
                <Text style={styles.capabilityIcon}>{task.icon}</Text>
                <Text style={styles.capabilityTitle}>{task.title}</Text>
              </View>
              <Text style={styles.capabilityDescription}>
                {task.description}
              </Text>
            </Card>
          ))}
        </View>

        <Card variant="elevated" style={styles.personalizedCard}>
          <View style={styles.personalizedHeader}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.personalizedIcon}
            >
              <Text style={styles.personalizedIconText}>⏰</Text>
            </LinearGradient>
            <Text style={styles.personalizedTitle}>
              Save 10+ Hours Per Week
            </Text>
          </View>
          <Text style={styles.personalizedDescription}>
            Anna handles all the repetitive tasks that eat up your time. Focus
            on high-value activities like strategy, creativity, and building
            relationships while Anna takes care of the rest.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="Set Up Anna"
          onPress={onSetupAnna}
          size="large"
          style={styles.setupButton}
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
  capabilitiesContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  capabilityCard: {
    marginBottom: theme.spacing.md,
  },
  capabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  capabilityIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  capabilityTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  capabilityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  personalizedCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: colors.secondary + "10",
  },
  personalizedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  personalizedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  personalizedIconText: {
    fontSize: 16,
  },
  personalizedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  personalizedDescription: {
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
  setupButton: {
    width: "100%",
  },
});
