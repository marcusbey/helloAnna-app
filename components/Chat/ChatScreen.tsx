import { colors } from "@/constants/colors";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/types";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnhancedChatInput } from "./EnhancedChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export const ChatScreen: React.FC = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <MessageBubble
      message={item}
      isLastMessage={index === messages.length - 1}
    />
  );

  const keyExtractor = (item: Message) => item.id;

  const handleImageSelected = (imageUri: string) => {
    // Handle image selection - for now, just show an alert
    Alert.alert("Image Selected", `Image URI: ${imageUri}`);
    // TODO: Implement image message sending
  };

  const handleVoiceCallStart = () => {
    // Handle voice call start
    Alert.alert("Voice Call", "Starting voice call with Anna...");
    // TODO: Implement voice call functionality
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}

          {isLoading && <TypingIndicator />}
        </View>

        <EnhancedChatInput
          onSendMessage={sendMessage}
          onImageSelected={handleImageSelected}
          onVoiceCallStart={handleVoiceCallStart}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  messagesList: {
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
