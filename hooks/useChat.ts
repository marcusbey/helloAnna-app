import { useAppStore } from '@/stores/appStore';
import { Message } from '@/types';
import { useState } from 'react';
import { Platform } from 'react-native';

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
      // Make API request to AI
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: "You are Anna, an AI email assistant. You help users manage their inbox, draft responses, and organize emails. Be concise, helpful, and friendly. If asked about email-specific tasks, explain that you'll need the user to connect their Gmail account first if they haven't already."
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content }
          ]
        }),
      });

      const data = await response.json();

      // Add AI response to state
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.completion,
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

      // Add error message
      addMessage({
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again later.",
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