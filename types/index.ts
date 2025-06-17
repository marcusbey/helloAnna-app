export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  isVoice?: boolean;
};

export type EmailSummary = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isPriority: boolean;
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isGmailConnected: boolean;
  preferences: {
    notificationsEnabled: boolean;
    voiceEnabled: boolean;
    darkMode: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
};

export type Subscription = {
  id: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'inactive' | 'trial' | 'cancelled';
  startDate: string;
  endDate?: string;
  price: number;
  currency: string;
  isTrialActive: boolean;
  trialEndDate?: string;
};

export type OnboardingStep =
  | 'anna-intro-1'
  | 'anna-intro-2'
  | 'anna-start'
  | 'value-proposition-1'
  | 'value-proposition-2'
  | 'value-proposition-3'
  | 'pricing'
  | 'conversation-name'
  | 'conversation-work'
  | 'conversation-challenge'
  | 'conversation-style'
  | 'conversation-goals'
  | 'signup'
  | 'email-input'
  | 'gmail-connect'
  | 'dashboard-intro'
  | 'completed';