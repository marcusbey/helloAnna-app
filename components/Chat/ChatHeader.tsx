import { Avatar } from "@/components/UI/Avatar";
import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const ChatHeader: React.FC = () => {
  const handleBackPress = () => {
    router.push("/(tabs)/settings");
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          {/* Back Arrow Button - Left */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Anna's Profile - Center */}
          <View style={styles.centerSection}>
            <Avatar
              source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              size={32}
              style={styles.avatar}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>Anna</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </View>

          {/* Empty space for balance */}
          <View style={styles.rightSpace} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  centerSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: theme.spacing.sm,
  },
  avatar: {
    marginRight: theme.spacing.xs,
  },
  nameContainer: {
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 1,
  },
  status: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "500",
  },
  rightSpace: {
    width: 32, // Same as backButton for balance
  },
});
