import { GradientButton } from "@/components/UI/GradientButton";
import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ConversationScreenProps {
  question: string;
  placeholder: string;
  inputType?: "text" | "multiline";
  options?: string[];
  onAnswer: (answer: string) => void;
  showTyping?: boolean;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  question,
  placeholder,
  inputType = "text",
  options,
  onAnswer,
  showTyping = true,
}) => {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [typingText, setTypingText] = useState("");
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    if (showTyping) {
      // Simulate typing effect
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= question.length) {
          setTypingText(question.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setShowInput(true);
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]).start();
          }, 500);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    } else {
      setTypingText(question);
      setShowInput(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [question, showTyping]);

  const handleSubmit = () => {
    const finalAnswer = selectedOption || answer;
    if (finalAnswer.trim()) {
      onAnswer(finalAnswer.trim());
    }
  };

  const canSubmit = selectedOption || answer.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            {/* Anna Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>A</Text>
              </LinearGradient>
            </View>

            {/* Question Bubble */}
            <View style={styles.questionContainer}>
              <View style={styles.questionBubble}>
                <Text style={styles.questionText}>
                  {typingText}
                  {showTyping && typingText.length < question.length && (
                    <Text style={styles.cursor}>|</Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Input Area */}
            {showInput && (
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {options ? (
                  <View style={styles.optionsContainer}>
                    {options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          selectedOption === option &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => setSelectedOption(option)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedOption === option &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        inputType === "multiline" && styles.textInputMultiline,
                      ]}
                      placeholder={placeholder}
                      placeholderTextColor={colors.gray[400]}
                      value={answer}
                      onChangeText={setAnswer}
                      multiline={inputType === "multiline"}
                      numberOfLines={inputType === "multiline" ? 4 : 1}
                      autoFocus
                    />
                  </View>
                )}

                <GradientButton
                  title="Continue"
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  style={[
                    styles.submitButton,
                    !canSubmit && styles.submitButtonDisabled,
                  ]}
                />
              </Animated.View>
            )}
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  questionContainer: {
    alignItems: "flex-start",
    marginBottom: 40,
  },
  questionBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    padding: 20,
    maxWidth: "85%",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 4,
  },
  questionText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  cursor: {
    opacity: 0.7,
    fontSize: 16,
  },
  inputContainer: {
    marginTop: "auto",
    paddingBottom: 40,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#ffffff",
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: "center",
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  textInputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  textInputMultiline: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#ffffff",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});
