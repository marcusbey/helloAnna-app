import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AnnaIntroScreenProps {
  onStart: () => void;
}

const { width, height } = Dimensions.get("window");

export const AnnaIntroScreen: React.FC<AnnaIntroScreenProps> = ({
  onStart,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  const slides = [
    {
      title: "Meet Anna",
      subtitle: "Your AI Assistant",
      description:
        "Anna is here to help you grow your business, manage your social media, and handle all the tasks that keep you busy.",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      gradient: [colors.primary, colors.secondary] as const,
    },
    {
      title: "Anna Learns",
      subtitle: "Adapts & Grows With You",
      description:
        "The more you work with Anna, the better she understands your style, preferences, and goals. She becomes your perfect digital partner.",
      image:
        "https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      gradient: [colors.secondary, colors.primary] as const,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        // Fade out current slide
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Move to next slide
          setCurrentSlide(currentSlide + 1);
          // Fade in new slide
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      } else {
        // Show start button after last slide
        setShowStartButton(true);
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    }, 3000); // 3 seconds per slide

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={currentSlideData.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#ffffff", "#f0f0f0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logo}
            >
              <Text style={styles.logoText}>A</Text>
            </LinearGradient>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>{currentSlideData.title}</Text>
            <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>

            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentSlideData.image }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.description}>
              {currentSlideData.description}
            </Text>
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentSlide && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Start Button */}
        {showStartButton && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <GradientButton
              title="Let's Begin"
              onPress={onStart}
              style={styles.startButton}
              textStyle={styles.startButtonText}
            />
          </Animated.View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 40,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 40,
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
    elevation: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  description: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    opacity: 0.3,
    marginHorizontal: 4,
  },
  progressDotActive: {
    opacity: 1,
    backgroundColor: "#ffffff",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
  },
  startButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
});
