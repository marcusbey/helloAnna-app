import { LinearGradient } from "expo-linear-gradient";
import { Mic, Send, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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

    // Check if we need a follow-up or next question
    const conversationHistory = messages.map((m) => `${m.type}: ${m.content}`);

    // Randomly decide to ask a follow-up (30% chance) to make conversation natural
    const shouldFollowUp =
      Math.random() < 0.3 && currentQuestion.type === "open";

    if (shouldFollowUp) {
      const followUp = await onboardingAI.generateFollowUpQuestion(
        userAnswer,
        conversationHistory.join("\n")
      );

      if (followUp) {
        setCurrentQuestion(followUp);
        addAnnaMessage(followUp.question);
        return;
      }
    }

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
            <View style={styles.annaAvatar}>
              <Text style={styles.annaAvatarText}>A</Text>
            </View>
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

          {!isAnna && (
            <View style={styles.userAvatar}>
              <User size={16} color="#666" />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.messageRow}>
        <View style={styles.annaAvatar}>
          <Text style={styles.annaAvatarText}>A</Text>
        </View>
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <Text style={styles.headerTitle}>Getting to Know You</Text>
          <Text style={styles.headerSubtitle}>
            Hi! I'm Anna, your personal AI assistant. I'm excited to get to know
            you! Tell me, what should I call you?
          </Text>
        </LinearGradient>

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
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  multiline
                  maxLength={500}
                />
              </View>

              {/* Voice Button */}
              <TouchableOpacity
                onPress={handleVoiceToggle}
                style={[
                  styles.actionButton,
                  isRecording ? styles.recordingButton : styles.micButton,
                ]}
              >
                <Mic size={20} color={isRecording ? "white" : "#666"} />
              </TouchableOpacity>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!currentInput.trim()}
                style={[
                  styles.actionButton,
                  currentInput.trim()
                    ? styles.sendButton
                    : styles.disabledButton,
                ]}
              >
                <Send
                  size={20}
                  color={currentInput.trim() ? "white" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
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
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: "100%",
  },
  annaBubble: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  annaMessageText: {
    color: "#333333",
  },
  userMessageText: {
    color: "#ffffff",
  },
  annaAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
  },
  annaAvatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  choicesContainer: {
    marginTop: 12,
    gap: 8,
  },
  choiceButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  choiceButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  typingContainer: {
    marginBottom: 16,
    alignItems: "flex-start",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999999",
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: "#333333",
    textAlignVertical: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    backgroundColor: "#f0f0f0",
  },
  recordingButton: {
    backgroundColor: "#ff4444",
  },
  sendButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
});
