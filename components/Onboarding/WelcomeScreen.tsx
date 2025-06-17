import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: (email: string) => void;
  isSignupMode?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onLogin,
  isSignupMode = false,
}) => {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Responsive sizing
  const isSmallScreen = height < 700;
  const isMediumScreen = height >= 700 && height < 850;
  const imageHeight = isSmallScreen ? height * 0.4 : height * 0.5;
  const cardMarginTop = isSmallScreen ? 10 : 20;
  const titleSize = isSmallScreen ? 24 : 28;
  const subtitleSize = isSmallScreen ? 14 : 16;
  const featureSize = isSmallScreen ? 12 : 14;

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      Alert.alert(
        "Check your email",
        "We sent you a magic link to sign in. Please check your email and tap the link.",
        [
          {
            text: "OK",
            onPress: () => {
              onLogin(email.trim());
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Sign In Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPressed = () => {
    if (isSignupMode) {
      if (!showEmailInput) {
        setShowEmailInput(true);
        return;
      }

      if (!email.trim()) {
        Alert.alert("Error", "Please enter your email address");
        return;
      }

      onGetStarted();
    } else {
      onGetStarted();
    }
  };

  const handleLoginPressed = () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
    } else {
      handleLogin();
    }
  };

  if (isSignupMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
          >
            <View style={styles.signupContainer}>
              <View style={styles.signupContent}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoWrapper}>
                    <Text style={styles.logoText}>A</Text>
                  </View>
                </View>

                <Text style={styles.signupTitle}>Almost there!</Text>
                <Text style={styles.signupSubtitle}>
                  Enter your email to create your Anna account
                </Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>

                <GradientButton
                  title="Create Account"
                  onPress={handleStartPressed}
                  style={StyleSheet.flatten([
                    styles.actionButton,
                    { opacity: !email.trim() ? 0.5 : 1 },
                  ])}
                  textStyle={styles.actionButtonText}
                  disabled={!email.trim()}
                />
              </View>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Background Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/anna.png")}
            style={[styles.backgroundImage, { width, height: imageHeight }]}
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              "transparent",
              "rgba(124, 99, 255, 0.2)",
              "rgba(124, 99, 255, 0.9)",
              colors.primary,
            ]}
            locations={[0, 0.4, 0.8, 1]}
            style={[styles.gradientOverlay, { height: imageHeight }]}
          />
        </View>

        {/* Content Card */}
        <View style={[styles.contentWrapper, { marginTop: cardMarginTop }]}>
          <View style={styles.contentCard}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Text style={styles.logoText}>A</Text>
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.textContent}>
              <Text style={[styles.mainTitle, { fontSize: titleSize }]}>
                Meet Anna
              </Text>
              <Text style={[styles.mainSubtitle, { fontSize: subtitleSize }]}>
                Your AI-powered personal assistant with multi-agent
                orchestration
              </Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
              {[
                "Voice-first interaction for seamless control",
                "Specialized agents for email, social media & content",
                "Background automation with smart coordination",
              ].map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.featureDot} />
                  <Text style={[styles.featureText, { fontSize: featureSize }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Email Input */}
            {showEmailInput && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <GradientButton
                title={showEmailInput ? "Get Started" : "Start for Free"}
                onPress={handleStartPressed}
                style={StyleSheet.flatten([
                  styles.actionButton,
                  { opacity: showEmailInput && !email.trim() ? 0.5 : 1 },
                ])}
                textStyle={styles.actionButtonText}
                disabled={showEmailInput && !email.trim()}
              />

              <GradientButton
                title={
                  showEmailInput
                    ? isLoading
                      ? "Signing in..."
                      : "Sign In Instead"
                    : "Already have an account?"
                }
                onPress={handleLoginPressed}
                variant="outline"
                style={StyleSheet.flatten([
                  styles.secondaryButton,
                  {
                    opacity:
                      isLoading || (showEmailInput && !email.trim()) ? 0.5 : 1,
                  },
                ])}
                textStyle={styles.secondaryButtonText}
                disabled={isLoading || (showEmailInput && !email.trim())}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
  },

  // Image and Background
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  // Content Layout
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 2,
  },
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.3)",
    elevation: 20,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoWrapper: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
    elevation: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
  },

  // Typography
  textContent: {
    alignItems: "center",
    marginBottom: 16,
  },
  mainTitle: {
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Features
  features: {
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 10,
    marginTop: 5,
    flexShrink: 0,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
    flex: 1,
  },

  // Input
  inputWrapper: {
    marginBottom: 16,
  },
  emailInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.white,
    textAlign: "center",
    fontWeight: "500",
  },

  // Buttons
  actionContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.2)",
    elevation: 6,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(255, 255, 255, 0.5)",
  },

  // Signup Mode Styles
  signupContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  signupContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  signupTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
    marginBottom: 6,
  },
  signupSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
});
