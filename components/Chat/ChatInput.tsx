import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { Send } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { VoiceRecorder } from "./VoiceRecorder";

interface ChatInputProps {
  onSendMessage: (message: string, isVoice?: boolean) => void;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      Keyboard.dismiss();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim(), true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
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

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || isLoading}
        >
          <Send
            size={20}
            color={
              !message.trim() || isLoading ? colors.gray[400] : colors.white
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.voiceContainer}>
        <VoiceRecorder onTranscriptReady={handleVoiceTranscript} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
  },
  voiceContainer: {
    marginLeft: 12,
  },
});
