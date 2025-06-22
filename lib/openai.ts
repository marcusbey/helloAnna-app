import Constants from 'expo-constants';
import OpenAI from 'openai';
import { onboardingStorage } from './onboarding-storage';

const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const EMMA_SYSTEM_PROMPT = `You are Emma, an intelligent AI assistant created to help users manage their digital life. 

Key traits:
- Friendly, professional, and helpful
- Proactive in suggesting solutions
- Great at understanding context and user intent
- Specialized in email management, social media, and productivity
- Always provide actionable advice

You can help with:
- Email management and organization
- Social media content and engagement
- Scheduling and task management
- Professional networking
- Content creation and optimization

Always respond in a conversational, helpful tone while being concise and actionable.`;

export class OpenAIService {
  private messages: ChatMessage[] = [
    {
      role: 'system',
      content: EMMA_SYSTEM_PROMPT,
      timestamp: Date.now()
    }
  ];

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Add user message to conversation history
      this.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      });

      // Get user's onboarding insights for personalized responses (if authenticated)
      let insights = null;
      try {
        insights = await onboardingStorage.getOnboardingInsights();
      } catch (error) {
        // User not authenticated yet - this is normal during onboarding conversation
        console.log('No onboarding insights available (user not authenticated yet)');
      }

      // Prepare messages for OpenAI
      let messages = this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add personalized context if we have onboarding data
      if (insights && this.messages.length <= 4) { // Only for first few messages
        const personalizedPrompt = `${EMMA_SYSTEM_PROMPT}

User Context (use this to personalize your responses):
- Communication style: ${insights.communicationStyle}
- Primary challenges: ${insights.primaryChallenges.join(', ')}
- Preferred automation: ${insights.preferredAutomation}
- Work context: ${insights.workContext}

Adapt your responses to match their communication style and address their specific challenges.`;

        messages[0] = {
          role: 'system',
          content: personalizedPrompt
        };
      }

      // Send to OpenAI
      const completion = await openai.chat.completions.create({
        model: process.env.EXPO_PUBLIC_AI_MODEL || 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I had trouble understanding that. Could you try rephrasing?';

      // Add assistant response to conversation history
      this.messages.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: Date.now()
      });

      return {
        message: assistantMessage,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      };

    } catch (error) {
      console.error('OpenAI Service Error:', error);

      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key is missing or invalid. Please check your configuration.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        }
      }

      throw new Error('I encountered an error while processing your request. Please try again.');
    }
  }

  // Method to get conversation history
  getConversationHistory(): ChatMessage[] {
    return this.messages.filter(msg => msg.role !== 'system');
  }

  // Method to clear conversation history (but keep system prompt)
  clearConversation(): void {
    this.messages = [this.messages[0]]; // Keep only the system prompt
  }

  // Method to add context about user's connected accounts
  updateUserContext(context: {
    hasGmail?: boolean;
    hasTwitter?: boolean;
    hasLinkedIn?: boolean;
    emailCount?: number;
    recentActivity?: string;
  }): void {
    const contextMessage = `User context update: ${JSON.stringify(context)}`;

    // Update system message with current context
    this.messages[0] = {
      role: 'system',
      content: `${EMMA_SYSTEM_PROMPT}\n\nCurrent user context: ${contextMessage}`,
      timestamp: Date.now()
    };
  }

  // Method for specialized email assistance
  async processEmailRequest(emailData: {
    subject?: string;
    sender?: string;
    content?: string;
    action: 'summarize' | 'reply' | 'categorize' | 'priority';
  }): Promise<ChatResponse> {
    const prompt = this.buildEmailPrompt(emailData);
    return this.sendMessage(prompt);
  }

  private buildEmailPrompt(emailData: any): string {
    switch (emailData.action) {
      case 'summarize':
        return `Please summarize this email:\nFrom: ${emailData.sender}\nSubject: ${emailData.subject}\nContent: ${emailData.content}`;

      case 'reply':
        return `Help me draft a professional reply to this email:\nFrom: ${emailData.sender}\nSubject: ${emailData.subject}\nContent: ${emailData.content}`;

      case 'categorize':
        return `Categorize this email (work, personal, promotional, urgent, etc.):\nFrom: ${emailData.sender}\nSubject: ${emailData.subject}`;

      case 'priority':
        return `Rate the priority of this email (high, medium, low) and explain why:\nFrom: ${emailData.sender}\nSubject: ${emailData.subject}\nContent: ${emailData.content?.substring(0, 200)}`;

      default:
        return `Help me with this email:\nFrom: ${emailData.sender}\nSubject: ${emailData.subject}`;
    }
  }
}

// Export a singleton instance
export const openaiService = new OpenAIService();
export default openaiService;