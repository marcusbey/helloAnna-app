import { Avatar } from "@/components/UI/Avatar";
import { colors } from "@/constants/colors";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { ArrowLeft, Mic, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useVoice } from "../../hooks/useVoice";
import { onboardingAI, OnboardingQuestion } from "../../lib/onboarding-ai";

interface Message {
  id: string;
  type: "anna" | "user";
  content: string;
  timestamp: Date;
  choices?: string[];
}

interface ConversationalOnboardingProps {
  onComplete: (userProfile: any) => void;
}

export default function ConversationalOnboarding({
  onComplete,
}: ConversationalOnboardingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<OnboardingQuestion | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  const { isRecording, startRecording, stopRecording, transcript } = useVoice();

  useEffect(() => {
    // Start with Anna's introduction
    startOnboarding();
  }, []);

  useEffect(() => {
    // Handle voice transcript
    if (transcript) {
      setCurrentInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    // Animate button transformation
    Animated.timing(buttonAnimation, {
      toValue: currentInput.trim() ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [currentInput]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    // Animate typing indicator
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const startOnboarding = async () => {
    const firstQuestion = await onboardingAI.getNextQuestion([]);
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      addAnnaMessage(firstQuestion.question, firstQuestion.choices);
    }
  };

  const addAnnaMessage = (content: string, choices?: string[]) => {
    setIsTyping(true);

    // Simulate Anna typing for realism
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        type: "anna",
        content,
        timestamp: new Date(),
        choices,
      };

      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !currentQuestion) return;

    const userAnswer = currentInput.trim();
    addUserMessage(userAnswer);
    setCurrentInput("");

    // Record the response
    await onboardingAI.recordResponse(currentQuestion.id, userAnswer);

    // Build conversation history for AI context
    const conversationHistory = messages.map((m) => `${m.type}: ${m.content}`);

    // Check if onboarding is complete
    if (onboardingAI.isOnboardingComplete()) {
      // Complete onboarding with final message
      const completionMessage = onboardingAI.generateCompletionMessage();
      addAnnaMessage(completionMessage);

      // Complete onboarding after a short delay
      setTimeout(() => {
        const userProfile = onboardingAI.getUserProfile();
        onComplete(userProfile);
      }, 2000);
      return;
    }

    // Get next question
    const nextQuestion = await onboardingAI.getNextQuestion(
      conversationHistory
    );
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      addAnnaMessage(nextQuestion.question, nextQuestion.choices);
    } else {
      // Onboarding complete
      const userProfile = onboardingAI.getUserProfile();
      onComplete(userProfile);
    }
  };

  const handleChoiceSelect = async (choice: string) => {
    setCurrentInput(choice);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleBackPress = () => {
    // Navigate to settings
    router.push("/(tabs)/settings");
  };

  const renderMessage = (message: Message) => {
    const isAnna = message.type === "anna";

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isAnna ? styles.annaMessageContainer : styles.userMessageContainer,
        ]}
      >
        <View style={styles.messageRow}>
          {isAnna && (
            <Avatar
              source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              size={32}
              style={styles.avatar}
            />
          )}

          <View
            style={[
              styles.messageBubble,
              isAnna ? styles.annaBubble : styles.userBubble,
              isAnna ? { marginLeft: 8 } : { marginRight: 8 },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isAnna ? styles.annaMessageText : styles.userMessageText,
              ]}
            >
              {message.content}
            </Text>

            {/* Render choice buttons for Anna's messages */}
            {isAnna && message.choices && (
              <View style={styles.choicesContainer}>
                {message.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleChoiceSelect(choice)}
                    style={styles.choiceButton}
                  >
                    <Text style={styles.choiceButtonText}>{choice}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.messageRow}>
        <Avatar
          source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
          size={32}
          style={styles.avatar}
        />
        <View
          style={[styles.messageBubble, styles.annaBubble, { marginLeft: 8 }]}
        >
          <View style={styles.typingDots}>
            <Animated.View
              style={[styles.typingDot, { opacity: typingAnimation }]}
            />
            <Animated.View
              style={[styles.typingDot, { opacity: typingAnimation }]}
            />
            <Animated.View
              style={[styles.typingDot, { opacity: typingAnimation }]}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.centerSection}>
              <Avatar
                source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                size={28}
                style={styles.headerAvatar}
              />
              <View style={styles.nameContainer}>
                <Text style={styles.name}>Anna</Text>
                <Text style={styles.status}>Getting to know you</Text>
              </View>
            </View>

            <View style={styles.rightSpace} />
          </View>

          {/* Introduction Banner */}
          <View style={styles.introBanner}>
            <Text style={styles.introTitle}>
              Let's have a natural conversation!
            </Text>
            <Text style={styles.introSubtitle}>
              Anna wants to understand how she can best help you.
            </Text>
          </View>

          {/* Chat Area */}
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.map(renderMessage)}
              {isTyping && renderTypingIndicator()}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    value={currentInput}
                    onChangeText={setCurrentInput}
                    placeholder="Type your response..."
                    placeholderTextColor={colors.gray[400]}
                    style={styles.textInput}
                    multiline
                    maxLength={500}
                    onSubmitEditing={() => {
                      // Enter: Send message
                      if (currentInput.trim()) {
                        handleSendMessage();
                      }
                    }}
                    submitBehavior="submit"
                    blurOnSubmit={false}
                  />

                  {/* Voice/Send Button inside input */}
                  <TouchableOpacity
                    onPress={
                      currentInput.trim()
                        ? handleSendMessage
                        : handleVoiceToggle
                    }
                    style={styles.inputActionButton}
                  >
                    <Animated.View
                      style={[
                        styles.buttonBackground,
                        {
                          backgroundColor: buttonAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              isRecording ? colors.error : colors.gray[100],
                              colors.primary,
                            ],
                          }),
                          transform: [
                            {
                              scale: buttonAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.05],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.buttonIconContainer,
                        {
                          transform: [
                            {
                              scale: buttonAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Animated.View
                        style={{
                          opacity: currentInput.trim() ? buttonAnimation : 1,
                          position: "absolute",
                        }}
                      >
                        <Send size={16} color={colors.white} />
                      </Animated.View>
                      <Animated.View
                        style={{
                          opacity: currentInput.trim()
                            ? buttonAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0],
                              })
                            : 1,
                          position: "absolute",
                        }}
                      >
                        <Mic
                          size={16}
                          color={isRecording ? colors.white : colors.gray[500]}
                        />
                      </Animated.View>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    minHeight: 50,
  },
  backButton: {
    width: 28,
    height: 28,
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
  headerAvatar: {
    marginRight: theme.spacing.xs,
  },
  nameContainer: {
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 1,
  },
  status: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "500",
  },
  rightSpace: {
    width: 28,
  },
  introBanner: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  introSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  annaMessageContainer: {
    alignItems: "flex-start",
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  avatar: {
    marginBottom: 2,
  },
  messageBubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    maxWidth: "100%",
  },
  annaBubble: {
    backgroundColor: colors.gray[100],
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  annaMessageText: {
    color: colors.text,
  },
  userMessageText: {
    color: colors.white,
  },
  choicesContainer: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  choiceButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignItems: "center",
  },
  choiceButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  typingContainer: {
    marginBottom: theme.spacing.md,
    alignItems: "flex-start",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.xs,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingRight: 44, // Make room for the smaller button
    minHeight: 48,
    maxHeight: 120,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
    position: "relative",
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    textAlignVertical: "center",
    minHeight: 20,
  },
  inputActionButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
  },
  buttonBackground: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  micButton: {
    backgroundColor: colors.gray[100],
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
});
