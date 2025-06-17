import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [storeReady, setStoreReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 20;

    const initializeStore = async () => {
      try {
        // Wait for Zustand to initialize
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Dynamically import the store to avoid circular dependency
        const { useAppStore } = await import("@/stores/appStore");

        // Check if store exists and has getState method
        if (!useAppStore || typeof useAppStore.getState !== "function") {
          throw new Error("Store not properly initialized");
        }

        // Try to access the store state
        const store = useAppStore.getState();

        if (store && typeof store === "object" && mounted) {
          console.log("✅ Store initialized successfully");
          setStoreReady(true);
          setError(null);
          return;
        } else if (mounted) {
          throw new Error("Store state is invalid");
        }
      } catch (err) {
        attempts++;
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        if (mounted && attempts < maxAttempts) {
          console.log(
            `🔄 Store init attempt ${attempts}/${maxAttempts}: ${errorMessage}`
          );
          // Progressive delay
          setTimeout(initializeStore, 500 * attempts);
        } else if (mounted) {
          console.error(
            "❌ Store initialization failed after",
            maxAttempts,
            "attempts"
          );
          setError(`Store initialization failed: ${errorMessage}`);
        }
      }
    };

    initializeStore();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Store Error</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <Text style={styles.errorHint}>Please restart the app</Text>
      </View>
    );
  }

  if (!storeReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing Anna...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff0000",
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
  },
});
