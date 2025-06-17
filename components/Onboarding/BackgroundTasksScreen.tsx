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

interface BackgroundTasksScreenProps {
  onNext: () => void;
}

export const BackgroundTasksScreen: React.FC<BackgroundTasksScreenProps> = ({
  onNext,
}) => {
  const { width } = useWindowDimensions();

  const backgroundTasks = [
    {
      icon: "📧",
      title: "Email Management",
      description: "Anna sorts, prioritizes, and drafts responses to your emails while you focus on important work.",
    },
    {
      icon: "📅",
      title: "Calendar Coordination",
      description: "Schedule meetings, send reminders, and manage your calendar automatically.",
    },
    {
      icon: "📊",
      title: "Data Analysis",
      description: "Anna analyzes your business metrics and provides actionable insights and reports.",
    },
    {
      icon: "🔍",
      title: "Research & Monitoring",
      description: "Track competitors, monitor mentions, and research opportunities while you sleep.",
    },
    {
      icon: "📝",
      title: "Content Planning",
      description: "Anna creates content calendars, writes drafts, and plans your marketing campaigns.",
    },
    {
      icon: "🤝",
      title: "Lead Management",
      description: "Follow up with prospects, nurture leads, and manage your sales pipeline automatically.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.accent, colors.primary]}
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
            <Text style={styles.title}>Background Tasks & More</Text>
            <Text style={styles.subtitle}>
              Anna handles the busy work so you can focus on what matters most
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              }}
              style={[styles.image, { width: width * 0.9 }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.benefitContainer}>
            <Text style={styles.benefitTitle}>What This Means For You</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⏰</Text>
              <Text style={styles.benefitText}>Save 10+ hours per week</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>Focus on high-value activities</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={styles.benefitText}>Scale your business faster</Text>
            </View>
          </View>

          <View style={styles.tasksContainer}>
            {backgroundTasks.map((task, index) => (
              <Card key={index} variant="elevated" style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <Text style={styles.taskDescription}>
                  {task.description}
                </Text>
              </Card>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="See Pricing"
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
  benefitContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  tasksContainer: {
    marginBottom: 30,
  },
  taskCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  taskIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  taskDescription: {
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
