import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { router } from 'expo-router';

interface SwipeGestureHandlerProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
}

export const SwipeGestureHandler: React.FC<SwipeGestureHandlerProps> = ({
  children,
  onSwipeRight,
}) => {
  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Check if it's a right swipe with sufficient distance and velocity
      if (translationX > 100 && velocityX > 500) {
        if (onSwipeRight) {
          onSwipeRight();
        } else {
          // Default action: navigate to settings
          router.push('/(tabs)/settings');
        }
      }
    }
  };

  return (
    <PanGestureHandler
      onHandlerStateChange={handleGestureStateChange}
      activeOffsetX={[-10, 10]}
      failOffsetY={[-5, 5]}
    >
      <View style={styles.container}>
        {children}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
