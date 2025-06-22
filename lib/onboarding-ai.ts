import { openaiService } from './openai';

export interface OnboardingQuestion {
  id: string;
  type: 'open' | 'choice' | 'follow_up';
  question: string;
  choices?: string[];
  category: 'personal' | 'work' | 'preferences' | 'goals' | 'contact';
  weight: number; // importance level 1-5
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
  
  private questionTemplates: OnboardingQuestion[] = [
    {
      id: 'intro',
      type: 'open',
      question: "Hi! I'm Anna, your personal AI assistant. I'm excited to get to know you! Tell me, what should I call you?",
      category: 'personal',
      weight: 5
    },
    {
      id: 'role_discovery',
      type: 'open', 
      question: "Nice to meet you! What do you do for work? I'd love to understand your role better.",
      category: 'personal',
      weight: 4
    },
    {
      id: 'email_pain_points',
      type: 'choice',
      question: "What's your biggest challenge with email right now?",
      choices: [
        "Too many emails to handle",
        "Important emails get buried", 
        "Takes too long to write responses",
        "Hard to stay organized",
        "Constant interruptions"
      ],
      category: 'work',
      weight: 5
    },
    {
      id: 'daily_email_volume',
      type: 'choice',
      question: "How many emails do you typically receive per day?",
      choices: [
        "Less than 20",
        "20-50 emails", 
        "50-100 emails",
        "100-200 emails",
        "Over 200 emails"
      ],
      category: 'work',
      weight: 4
    },
    {
      id: 'work_goals',
      type: 'open',
      question: "What are you hoping to achieve in your work? What would make your days more productive?",
      category: 'goals',
      weight: 4
    },
    {
      id: 'communication_style',
      type: 'choice',
      question: "How do you prefer to communicate?",
      choices: [
        "Direct and to the point",
        "Friendly and conversational",
        "Formal and professional", 
        "Casual and relaxed"
      ],
      category: 'preferences',
      weight: 3
    },
    {
      id: 'automation_comfort',
      type: 'choice',
      question: "How comfortable are you with AI helping manage your emails?",
      choices: [
        "Handle everything automatically",
        "Suggest actions, I'll approve",
        "Only help with organization",
        "Just provide insights"
      ],
      category: 'preferences',
      weight: 5
    }
  ];

  // Generate the next question based on conversation context
  async getNextQuestion(conversationHistory: string[]): Promise<OnboardingQuestion | null> {
    const answeredQuestions = this.responses.map(r => r.questionId);
    const remainingQuestions = this.questionTemplates.filter(q => 
      !answeredQuestions.includes(q.id)
    );

    if (remainingQuestions.length === 0) {
      return null; // Onboarding complete
    }

    // Use AI to determine the most natural next question
    const context = this.buildConversationContext(conversationHistory);
    const nextQuestion = await this.selectNextQuestion(remainingQuestions, context);
    
    return nextQuestion;
  }

  // Record user response and update profile
  async recordResponse(questionId: string, answer: string): Promise<void> {
    const response: OnboardingResponse = {
      questionId,
      answer,
      timestamp: new Date(),
      category: this.questionTemplates.find(q => q.id === questionId)?.category || 'unknown'
    };

    this.responses.push(response);
    await this.updateUserProfile(response);
  }

  // Generate personalized follow-up questions based on answers
  async generateFollowUpQuestion(previousAnswer: string, context: string): Promise<OnboardingQuestion | null> {
    try {
      const prompt = `
Based on this user's answer: "${previousAnswer}"
And our conversation context: "${context}"

Generate a natural follow-up question to learn more about them personally or professionally. 
The question should feel like a genuine conversation, not an interview.
Keep it friendly and engaging.

Return only the question text, nothing else.
`;

      const response = await openaiService.sendMessage(prompt);
      
      if (response) {
        return {
          id: `follow_up_${Date.now()}`,
          type: 'follow_up',
          question: response,
          category: 'personal',
          weight: 2
        };
      }
    } catch (error) {
      console.error('Error generating follow-up question:', error);
    }
    
    return null;
  }

  // Check if onboarding is complete (but don't ask for email here)
  isOnboardingComplete(): boolean {
    const essentialQuestions = this.questionTemplates.filter(q => q.weight >= 4);
    const answeredEssential = essentialQuestions.filter(q => 
      this.responses.some(r => r.questionId === q.id)
    );
    
    return answeredEssential.length >= essentialQuestions.length * 0.8; // 80% of essential questions
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

      const response = await openaiService.sendMessage(prompt);
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