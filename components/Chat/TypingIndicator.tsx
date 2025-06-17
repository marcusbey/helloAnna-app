import { colors } from "@/constants/colors";
import React, { useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const TypingIndicator: React.FC = () => {
  const animations = [
    React.useRef(new Animated.Value(0)).current,
    React.useRef(new Animated.Value(0)).current,
    React.useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const createAnimation = (animation: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    const animationSequence = Animated.loop(
      Animated.parallel([
        createAnimation(animations[0], 0),
        createAnimation(animations[1], 200),
        createAnimation(animations[2], 400),
      ])
    );

    animationSequence.start();

    return () => {
      animationSequence.stop();
    };
  }, []);

  const dotStyle = (animation: Animated.Value) => ({
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubbleContainer}>
        <View style={styles.bubble}>
          <View style={styles.dotsContainer}>
            {animations.map((animation, index) => (
              <Animated.View
                key={index}
                style={[styles.dot, dotStyle(animation)]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  bubbleContainer: {
    maxWidth: "70%",
    alignItems: "flex-start",
    marginLeft: 52, // Account for avatar width + margin
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
    width: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[400],
    marginHorizontal: 4,
  },
});
