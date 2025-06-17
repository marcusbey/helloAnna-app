import { Card } from "@/components/UI/Card";
import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { useGmail } from "@/hooks/useGmail";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GmailConnectProps {
  onSkip: () => void;
  onComplete: () => void;
}

export const GmailConnect: React.FC<GmailConnectProps> = ({
  onSkip,
  onComplete,
}) => {
  const { isConnecting, error, connectGmail } = useGmail();

  const handleConnect = async () => {
    const success = await connectGmail();
    if (success) {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Gmail</Text>
          <Text style={styles.subtitle}>
            Anna works best when connected to your email account
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Card variant="elevated" style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why connect Gmail?</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoItemTitle}>• Inbox Organization</Text>
            <Text style={styles.infoItemDescription}>
              Anna will help you filter spam, categorize emails, and highlight
              important messages.
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoItemTitle}>• Smart Responses</Text>
            <Text style={styles.infoItemDescription}>
              Get AI-powered suggestions for quick replies to common emails.
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoItemTitle}>• Priority Notifications</Text>
            <Text style={styles.infoItemDescription}>
              Only get notified for truly important emails, not spam or
              newsletters.
            </Text>
          </View>
        </Card>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="Connect Gmail"
          onPress={handleConnect}
          isLoading={isConnecting}
          size="large"
          style={styles.connectButton}
        />

        <GradientButton
          title="Skip for Now"
          onPress={onSkip}
          variant="outline"
          size="medium"
          style={styles.skipButton}
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
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
    marginVertical: theme.spacing.lg,
  },
  image: {
    width: "100%",
    height: 200,
  },
  infoCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    marginBottom: theme.spacing.md,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
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
  connectButton: {
    width: "100%",
    marginBottom: theme.spacing.md,
  },
  skipButton: {
    width: "100%",
  },
});
