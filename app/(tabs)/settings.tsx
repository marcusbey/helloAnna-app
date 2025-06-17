import { useAppStore } from "@/stores/appStore";
import { router, Stack } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsTab() {
  const { resetOnboarding } = useAppStore();

  const handleResetOnboarding = () => {
    resetOnboarding();
    // Navigate to onboarding after a short delay
    setTimeout(() => {
      router.replace("/onboarding");
    }, 100);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Settings</Text>

          {/* Debug Section */}
          <View style={styles.debugSection}>
            <Text style={styles.sectionTitle}>Debug</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetOnboarding}
            >
              <Text style={styles.resetButtonText}>Reset Onboarding</Text>
            </TouchableOpacity>
            <Text style={styles.debugNote}>
              Tap to reset onboarding state and see the new Anna intro flow
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#1a1a1a",
  },
  debugSection: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#7C63FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  debugNote: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
});
