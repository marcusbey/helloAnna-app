import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Send, User } from 'lucide-react-native';
import { onboardingAI, OnboardingQuestion } from '../../lib/onboarding-ai';
import { useVoice } from '../../hooks/useVoice';

interface Message {
  id: string;
  type: 'anna' | 'user';
  content: string;
  timestamp: Date;
  choices?: string[];
}

interface ConversationalOnboardingProps {
  onComplete: (userProfile: any) => void;
}

export default function ConversationalOnboarding({ onComplete }: ConversationalOnboardingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<OnboardingQuestion | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
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
        type: 'anna',
        content,
        timestamp: new Date(),
        choices
      };
      
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !currentQuestion) return;

    const userAnswer = currentInput.trim();
    addUserMessage(userAnswer);
    setCurrentInput('');

    // Record the response
    await onboardingAI.recordResponse(currentQuestion.id, userAnswer);

    // Check if we need a follow-up or next question
    const conversationHistory = messages.map(m => `${m.type}: ${m.content}`);
    
    // Randomly decide to ask a follow-up (30% chance) to make conversation natural
    const shouldFollowUp = Math.random() < 0.3 && currentQuestion.type === 'open';
    
    if (shouldFollowUp) {
      const followUp = await onboardingAI.generateFollowUpQuestion(
        userAnswer, 
        conversationHistory.join('\n')
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
    const nextQuestion = await onboardingAI.getNextQuestion(conversationHistory);
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
    await handleSendMessage();
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
    const isAnna = message.type === 'anna';
    
    return (
      <View key={message.id} className={`mb-4 ${isAnna ? 'mr-8' : 'ml-8'}`}>
        <View className={`flex-row ${isAnna ? 'justify-start' : 'justify-end'}`}>
          {isAnna && (
            <View className="w-10 h-10 rounded-full bg-blue-500 mr-3 items-center justify-center">
              <Text className="text-white font-bold text-lg">A</Text>
            </View>
          )}
          
          <View className={`max-w-[80%] p-4 rounded-2xl ${
            isAnna 
              ? 'bg-gray-100 rounded-bl-sm' 
              : 'bg-blue-500 rounded-br-sm'
          }`}>
            <Text className={`text-base ${isAnna ? 'text-gray-800' : 'text-white'}`}>
              {message.content}
            </Text>
            
            {/* Render choice buttons for Anna's messages */}
            {isAnna && message.choices && (
              <View className="mt-3 space-y-2">
                {message.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleChoiceSelect(choice)}
                    className="bg-white border border-gray-300 rounded-lg p-3"
                  >
                    <Text className="text-blue-600 text-center font-medium">
                      {choice}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {!isAnna && (
            <View className="w-10 h-10 rounded-full bg-gray-300 ml-3 items-center justify-center">
              <User size={20} color="#666" />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      className="flex-1"
    >
      <View className="flex-1 pt-16 pb-8">
        {/* Header */}
        <View className="px-6 mb-6">
          <Text className="text-white text-2xl font-bold">Getting to Know You</Text>
          <Text className="text-white/80 text-base mt-1">
            Let's have a conversation! Anna wants to understand how she can best help you.
          </Text>
        </View>

        {/* Chat Area */}
        <View className="flex-1 bg-white rounded-t-3xl">
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4 pt-6"
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            
            {/* Typing Indicator */}
            {isTyping && (
              <View className="mr-8 mb-4">
                <View className="flex-row justify-start">
                  <View className="w-10 h-10 rounded-full bg-blue-500 mr-3 items-center justify-center">
                    <Text className="text-white font-bold text-lg">A</Text>
                  </View>
                  <View className="bg-gray-100 rounded-2xl rounded-bl-sm p-4">
                    <View className="flex-row space-x-1">
                      <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                      <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="px-4 pb-6 border-t border-gray-200">
            <View className="flex-row items-center space-x-3 mt-4">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4">
                <TextInput
                  value={currentInput}
                  onChangeText={setCurrentInput}
                  placeholder="Type your response..."
                  className="flex-1 py-3 text-base"
                  multiline
                  onSubmitEditing={handleSendMessage}
                  blurOnSubmit={false}
                />
              </View>
              
              {/* Voice Button */}
              <TouchableOpacity
                onPress={handleVoiceToggle}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <Mic size={20} color={isRecording ? 'white' : '#666'} />
              </TouchableOpacity>
              
              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!currentInput.trim()}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  currentInput.trim() ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <Send size={20} color={currentInput.trim() ? 'white' : '#666'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}