import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Platform,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useVoice } from '@/hooks/useVoice';

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReady,
}) => {
  const { hasPermission, isRecording, transcript, startRecording, stopRecording } = useVoice();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    
    if (isRecording) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRecording, pulseAnim]);
  
  useEffect(() => {
    if (transcript) {
      onTranscriptReady(transcript);
    }
  }, [transcript, onTranscriptReady]);
  
  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.button}
          disabled={true}
        >
          <Mic size={24} color={colors.gray[400]} />
          <Text style={styles.disabledText}>Voice not available on web</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.button}
          disabled={true}
        >
          <Mic size={24} color={colors.gray[400]} />
          <Text style={styles.disabledText}>Microphone permission denied</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            transform: [{ scale: pulseAnim }],
            opacity: isRecording ? 0.7 : 0,
          },
        ]}
      />
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.recordingButton,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Mic 
          size={24} 
          color={isRecording ? colors.error : colors.white} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  recordingButton: {
    backgroundColor: colors.white,
  },
  disabledText: {
    position: 'absolute',
    bottom: -24,
    color: colors.gray[500],
    fontSize: 12,
    width: 120,
    textAlign: 'center',
  },
});