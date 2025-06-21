import { useAppStore } from '@/stores/appStore';
import { Message } from '@/types';
import { useState } from 'react';
import { Platform } from 'react-native';
import { openaiService } from '@/lib/openai';

export function useChat() {
  const { messages, addMessage } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, isVoice = false) => {
    if (!content.trim()) return;

    // Add user message to state
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
      isVoice,
    };

    addMessage(userMessage);
    setIsLoading(true);

    try {
      // Send message to Emma via OpenAI service
      const response = await openaiService.sendMessage(content);

      // Add Emma's response to state
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: Date.now(),
      };

      addMessage(assistantMessage);

      // Trigger haptic feedback on response
      if (Platform.OS !== 'web') {
        try {
          const Haptics = require('expo-haptics');
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.log('Haptics not available');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message with Emma's personality
      addMessage({
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "I'm having trouble connecting right now. Please try again later.",
        role: 'assistant',
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
  };
}