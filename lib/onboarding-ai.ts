import Constants from 'expo-constants';
import OpenAI from 'openai';

// Create a dedicated OpenAI instance for onboarding (no user context needed)
const onboardingOpenAI = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

async function sendOnboardingMessage(prompt: string): Promise<{ message: string }> {
  try {
    const completion = await onboardingOpenAI.chat.completions.create({
      model: process.env.EXPO_PUBLIC_AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      message: completion.choices[0]?.message?.content || 'Sorry, I had trouble with that request.'
    };
  } catch (error) {
    console.error('Onboarding OpenAI Error:', error);
    throw new Error('AI service temporarily unavailable');
  }
}

export interface OnboardingQuestion {
  id: string;
  type: 'open' | 'choice' | 'follow_up';
  question: string;
  choices?: string[];
  category: 'personal' | 'work' | 'preferences' | 'goals' | 'contact';
  weight: number; // importance level 1-5
  context?: string; // AI context for generating this question
}

export interface OnboardingResponse {
  questionId: string;
  answer: string;
  timestamp: Date;
  category: string;
}

export interface UserProfile {
  personal: {
    name?: string;
    role?: string;
    company?: string;
    industry?: string;
    experience?: string;
  };
  workStyle: {
    emailVolume?: string;
    busyHours?: string[];
    priorities?: string[];
    challenges?: string[];
  };
  preferences: {
    communicationStyle?: string;
    notificationPreference?: string;
    automationLevel?: string;
  };
  goals: {
    primaryGoals?: string[];
    timeExpectations?: string;
    successMetrics?: string[];
  };
  contact: {
    email?: string;
    timezone?: string;
  };
}

class OnboardingAIService {
  private responses: OnboardingResponse[] = [];
  private currentProfile: Partial<UserProfile> = {};
  private conversationFlow: string[] = []; // Track conversation progression

  // Core information we need to collect organically
  private informationGoals = {
    name: { collected: false, value: null },
    role: { collected: false, value: null },
    company: { collected: false, value: null },
    email_challenges: { collected: false, value: null },
    email_volume: { collected: false, value: null },
    work_goals: { collected: false, value: null },
    communication_style: { collected: false, value: null },
    automation_preference: { collected: false, value: null }
  };

  // Generate the next question using AI based on conversation context
  async getNextQuestion(conversationHistory: string[]): Promise<OnboardingQuestion | null> {
    // Check if this is the very first question
    if (conversationHistory.length === 0) {
      return {
        id: 'intro',
        type: 'open',
        question: "Hi! I'm Anna, your personal AI assistant. I'm excited to get to know you! What should I call you?",
        category: 'personal',
        weight: 5,
        context: 'Starting conversation, getting name'
      };
    }

    // Use AI to generate natural next question
    const uncollectedInfo = Object.entries(this.informationGoals)
      .filter(([key, info]) => !info.collected)
      .map(([key]) => key);

    if (uncollectedInfo.length === 0) {
      return null; // All information collected
    }

    // Generate AI-powered question
    const prompt = `
You are Anna, a friendly AI assistant conducting a natural onboarding conversation. 

CONVERSATION SO FAR:
${conversationHistory.join('\n')}

INFORMATION STILL NEEDED (collect organically, don't ask directly):
${uncollectedInfo.join(', ')}

INSTRUCTIONS:
1. Generate the next question/response that feels natural in this conversation
2. Don't ask multiple questions at once
3. Don't sound like a form or survey
4. Be warm, personable, and genuinely curious
5. If offering choices, ALWAYS include "Something else" or "Other" as the last option
6. Build on what they just said - show you're listening
7. Focus on ONE piece of information at a time

Return a JSON response:
{
  "question": "Your natural question/response here",
  "type": "open" or "choice",
  "choices": ["option1", "option2", "Other"] (only if type is "choice"),
  "target_info": "which information goal this helps collect"
}

Be conversational, not interrogative!`;

    try {
      const response = await sendOnboardingMessage(prompt);
      const aiResponse = JSON.parse(response.message);

      return {
        id: `ai_generated_${Date.now()}`,
        type: aiResponse.type || 'open',
        question: aiResponse.question,
        choices: aiResponse.choices,
        category: this.mapInfoToCategory(aiResponse.target_info),
        weight: 3,
        context: aiResponse.target_info
      };
    } catch (error) {
      console.error('Error generating AI question:', error);

      // Fallback to simple questions if AI fails
      return this.getFallbackQuestion(uncollectedInfo[0]);
    }
  }

  // Record user response and extract information organically using AI
  async recordResponse(questionId: string, answer: string): Promise<void> {
    const response: OnboardingResponse = {
      questionId,
      answer,
      timestamp: new Date(),
      category: 'unknown'
    };

    this.responses.push(response);
    this.conversationFlow.push(`User: ${answer}`);

    // Use AI to extract structured information from the user's natural response
    await this.extractInformationFromResponse(answer);

    // Log progress for debugging
    this.logProgress();
  }

  // Use AI to extract structured information from user responses
  private async extractInformationFromResponse(userResponse: string): Promise<void> {
    const prompt = `
Extract structured information from this user response: "${userResponse}"

Based on the conversation context, identify any of these pieces of information:
- name: What should we call them?
- role: Their job title or role
- company: Company name or type of business
- email_challenges: Email problems they mentioned
- email_volume: How many emails they handle
- work_goals: Professional goals or what they want to achieve
- communication_style: How they prefer to communicate
- automation_preference: How much AI help they want

Return ONLY a JSON object with the information found. If nothing is found, return {}.

Example: {"name": "Marcus", "role": "startup founder"}

JSON:`;

    try {
      const response = await sendOnboardingMessage(prompt);
      const extractedInfo = JSON.parse(response.message);

      // Update our information goals
      Object.entries(extractedInfo).forEach(([key, value]) => {
        if (this.informationGoals[key] && value) {
          this.informationGoals[key].collected = true;
          this.informationGoals[key].value = value;
          console.log(`✅ Collected ${key}: ${value}`);
        }
      });

      // Update user profile with extracted information
      await this.updateProfileFromExtractedInfo(extractedInfo);

    } catch (error) {
      console.error('Error extracting information:', error);
    }
  }

  // Log current progress for debugging
  private logProgress(): void {
    const collectedCount = Object.values(this.informationGoals).filter(info => info.collected).length;
    const totalCount = Object.keys(this.informationGoals).length;
    const collectedInfo = Object.entries(this.informationGoals)
      .filter(([key, info]) => info.collected)
      .map(([key]) => key);

    console.log(`🎯 Current onboarding step: ${this.getCurrentStep()}`);
    console.log(`📊 Onboarding progress: ${collectedCount}/${Math.min(4, totalCount)} essential info collected`);
    console.log(`✅ Collected: ${collectedInfo.join(', ')}`);
  }

  // Get current step for debugging
  private getCurrentStep(): string {
    if (!this.informationGoals.name.collected) return 'conversation-name';
    if (!this.informationGoals.role.collected) return 'conversation-role';
    if (!this.informationGoals.email_challenges.collected) return 'conversation-challenges';
    if (!this.informationGoals.work_goals.collected) return 'conversation-goals';
    return 'conversation-complete';
  }

  // Helper methods
  private mapInfoToCategory(targetInfo: string): string {
    const categoryMap = {
      'name': 'personal',
      'role': 'personal',
      'company': 'personal',
      'email_challenges': 'work',
      'email_volume': 'work',
      'work_goals': 'goals',
      'communication_style': 'preferences',
      'automation_preference': 'preferences'
    };
    return categoryMap[targetInfo] || 'personal';
  }

  private getFallbackQuestion(targetInfo: string): OnboardingQuestion {
    const fallbackQuestions = {
      'name': "What should I call you?",
      'role': "What do you do for work?",
      'company': "Tell me about where you work!",
      'email_challenges': "What's the biggest challenge you face with email?",
      'email_volume': "How many emails do you typically get per day?",
      'work_goals': "What are you hoping to achieve in your work?",
      'communication_style': "How do you like to communicate with people?",
      'automation_preference': "How comfortable are you with AI helping you with tasks?"
    };

    return {
      id: `fallback_${targetInfo}`,
      type: 'open',
      question: fallbackQuestions[targetInfo] || "Tell me more about yourself!",
      category: this.mapInfoToCategory(targetInfo),
      weight: 3,
      context: `Fallback question for ${targetInfo}`
    };
  }

  private async updateProfileFromExtractedInfo(extractedInfo: any): Promise<void> {
    // Update the user profile structure with extracted information
    if (extractedInfo.name) {
      this.currentProfile.personal = {
        ...this.currentProfile.personal,
        name: extractedInfo.name
      };
    }

    if (extractedInfo.role) {
      this.currentProfile.personal = {
        ...this.currentProfile.personal,
        role: extractedInfo.role
      };
    }

    if (extractedInfo.company) {
      this.currentProfile.personal = {
        ...this.currentProfile.personal,
        company: extractedInfo.company
      };
    }

    if (extractedInfo.email_challenges) {
      this.currentProfile.workStyle = {
        ...this.currentProfile.workStyle,
        challenges: [extractedInfo.email_challenges]
      };
    }

    if (extractedInfo.email_volume) {
      this.currentProfile.workStyle = {
        ...this.currentProfile.workStyle,
        emailVolume: extractedInfo.email_volume
      };
    }

    if (extractedInfo.work_goals) {
      this.currentProfile.goals = {
        ...this.currentProfile.goals,
        primaryGoals: [extractedInfo.work_goals]
      };
    }

    if (extractedInfo.communication_style) {
      this.currentProfile.preferences = {
        ...this.currentProfile.preferences,
        communicationStyle: extractedInfo.communication_style
      };
    }

    if (extractedInfo.automation_preference) {
      this.currentProfile.preferences = {
        ...this.currentProfile.preferences,
        automationLevel: extractedInfo.automation_preference
      };
    }
  }

  // Check if onboarding is complete based on collected information
  isOnboardingComplete(): boolean {
    const essentialInfo = ['name', 'role', 'email_challenges', 'automation_preference'];
    const collectedEssentialInfo = essentialInfo.filter(info =>
      this.informationGoals[info]?.collected
    );

    // Need at least 75% of essential information
    const completionThreshold = 0.75;
    const isComplete = collectedEssentialInfo.length >= essentialInfo.length * completionThreshold;

    console.log(`📊 Onboarding progress: ${collectedEssentialInfo.length}/${essentialInfo.length} essential info collected`);
    console.log(`✅ Collected: ${collectedEssentialInfo.join(', ')}`);

    return isComplete;
  }

  // Get current user profile
  getUserProfile(): UserProfile {
    return this.currentProfile as UserProfile;
  }

  // Generate completion message at the end
  generateCompletionMessage(): string {
    const name = this.currentProfile.personal?.name || 'there';
    return `Thanks for sharing all of that with me, ${name}! I feel like I'm getting to know you better already. 

I'm excited to help you ${this.currentProfile.goals?.primaryGoals?.[0] || 'be more productive'} and tackle those ${this.currentProfile.workStyle?.challenges?.[0] || 'email challenges'} you mentioned. 

Let's get you set up so I can start making your work life easier! 🚀`;
  }

  // Private helper methods
  private buildConversationContext(history: string[]): string {
    return history.slice(-3).join('\n'); // Last 3 exchanges for context
  }

  private async selectNextQuestion(questions: OnboardingQuestion[], context: string): Promise<OnboardingQuestion> {
    // Simple logic - prioritize by weight and conversation flow
    // Could be enhanced with AI to make more contextual decisions
    const sortedQuestions = questions.sort((a, b) => b.weight - a.weight);
    return sortedQuestions[0];
  }

  private async updateUserProfile(response: OnboardingResponse): Promise<void> {
    const { questionId, answer, category } = response;

    // Map responses to profile structure
    switch (questionId) {
      case 'intro':
        this.currentProfile.personal = {
          ...this.currentProfile.personal,
          name: answer
        };
        break;

      case 'role_discovery':
        // Use AI to extract role, company, industry from free text
        const roleInfo = await this.extractRoleInfo(answer);
        this.currentProfile.personal = {
          ...this.currentProfile.personal,
          ...roleInfo
        };
        break;

      case 'email_pain_points':
        this.currentProfile.workStyle = {
          ...this.currentProfile.workStyle,
          challenges: [answer]
        };
        break;

      case 'daily_email_volume':
        this.currentProfile.workStyle = {
          ...this.currentProfile.workStyle,
          emailVolume: answer
        };
        break;

      case 'work_goals':
        this.currentProfile.goals = {
          ...this.currentProfile.goals,
          primaryGoals: [answer]
        };
        break;

      case 'communication_style':
        this.currentProfile.preferences = {
          ...this.currentProfile.preferences,
          communicationStyle: answer
        };
        break;

      case 'automation_comfort':
        this.currentProfile.preferences = {
          ...this.currentProfile.preferences,
          automationLevel: answer
        };
        break;
    }
  }

  private async extractRoleInfo(roleDescription: string): Promise<Partial<UserProfile['personal']>> {
    try {
      const prompt = `
Extract role, company, and industry information from this description: "${roleDescription}"

Return a JSON object with keys: role, company, industry
If information is not available, omit the key.
Example: {"role": "Product Manager", "company": "Acme Corp", "industry": "Technology"}
`;

      const response = await sendOnboardingMessage(prompt);
      if (response) {
        return JSON.parse(response);
      }
    } catch (error) {
      console.error('Error extracting role info:', error);
    }

    return { role: roleDescription };
  }
}

// Export singleton instance
export const onboardingAI = new OnboardingAIService();
export default onboardingAI;