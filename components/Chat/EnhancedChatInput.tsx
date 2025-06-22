import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { useVoice } from "@/hooks/useVoice";
import * as ImagePicker from "expo-image-picker";
import { Camera, Mic, Phone, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EnhancedChatInputProps {
  onSendMessage: (message: string, isVoice?: boolean) => void;
  onImageSelected?: (imageUri: string) => void;
  onVoiceCallStart?: () => void;
  isLoading?: boolean;
}

export const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSendMessage,
  onImageSelected,
  onVoiceCallStart,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<TextInput>(null);
  const {
    hasPermission,
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  } = useVoice();

  // Handle transcript from voice recording
  useEffect(() => {
    if (transcript) {
      onSendMessage(transcript, true);
    }
  }, [transcript, onSendMessage]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      Keyboard.dismiss();
    }
  };

  const handleCameraPress = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to take photos.",
          [{ text: "OK" }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected?.(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleMicrophonePress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleVoiceCallPress = () => {
    onVoiceCallStart?.();
  };

  return (
    <View style={styles.container}>
      {/* Main Input Container */}
      <View style={styles.inputContainer}>
        {/* Camera Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCameraPress}
          activeOpacity={0.7}
        >
          <Camera size={20} color={colors.gray[500]} />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Message Anna..."
          placeholderTextColor={colors.gray[400]}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={true}
        />

        {/* Send Button (only show when there's text) */}
        {message.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={handleSend}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Send
              size={20}
              color={isLoading ? colors.gray[400] : colors.white}
            />
          </TouchableOpacity>
        ) : (
          <>
            {/* Microphone Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.microphoneButton,
                isRecording && styles.recordingButton,
              ]}
              onPress={handleMicrophonePress}
              disabled={hasPermission === false}
              activeOpacity={0.7}
            >
              <Mic
                size={20}
                color={
                  hasPermission === false
                    ? colors.gray[400]
                    : isRecording
                    ? colors.white
                    : colors.primary
                }
              />
            </TouchableOpacity>

            {/* Voice Call Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.voiceCallButton]}
              onPress={handleVoiceCallPress}
              activeOpacity={0.7}
            >
              <Phone size={20} color={colors.white} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    ...theme.shadows.sm,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    paddingHorizontal: theme.spacing.xs,
    color: colors.text,
    maxHeight: 100,
    minHeight: 32,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  sendButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
  },
  microphoneButton: {
    backgroundColor: colors.gray[100],
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  voiceCallButton: {
    backgroundColor: colors.secondary,
  },
});
