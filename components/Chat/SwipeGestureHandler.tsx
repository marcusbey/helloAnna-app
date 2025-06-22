import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface SwipeGestureHandlerProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
}

export const SwipeGestureHandler: React.FC<SwipeGestureHandlerProps> = ({
  children,
  onSwipeRight,
}) => {
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      // Detect swipe right gesture
      if (event.translationX > 100 && Math.abs(event.velocityX) > 500) {
        if (onSwipeRight) {
          onSwipeRight();
        } else {
          // Default action: navigate to settings
          router.push("/(tabs)/settings");
        }
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
