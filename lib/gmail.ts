import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type: string;
  scope: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  date: string;
  snippet: string;
  body: string;
  isRead: boolean;
  labels: string[];
}

export interface EmailStats {
  totalEmails: number;
  unreadCount: number;
  todayCount: number;
  importantCount: number;
}

class GmailService {
  private config: GmailConfig;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      clientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_GMAIL_CLIENT_ID || process.env.EXPO_PUBLIC_GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: Constants.expoConfig?.extra?.EXPO_PUBLIC_GMAIL_REDIRECT_URI || process.env.EXPO_PUBLIC_GMAIL_REDIRECT_URI || 'http://localhost:8081/auth/callback'
    };
  }

  private async makeGmailRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gmail');
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    return response.json();
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens || !tokens.access_token) return false;

      this.accessToken = tokens.access_token;
      
      // Try to make a simple API call to verify tokens
      await this.makeGmailRequest('/users/me/profile');
      return true;
    } catch (error) {
      console.error('Gmail authentication check failed:', error);
      this.accessToken = null;
      return false;
    }
  }

  // Get OAuth URL for authentication
  getAuthUrl(): string {
    if (!this.config.clientId) {
      throw new Error('Gmail OAuth not configured. Check your configuration.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Handle OAuth callback and exchange code for tokens
  async handleAuthCallback(code: string): Promise<GmailTokens> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Gmail OAuth not configured');
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokens = await tokenResponse.json();
      
      const gmailTokens: GmailTokens = {
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || ''
      };

      // Store tokens securely
      await this.storeTokens(gmailTokens);
      
      // Set access token for future requests
      this.accessToken = gmailTokens.access_token;

      return gmailTokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to authenticate with Gmail');
    }
  }

  // Start OAuth flow
  async authenticate(): Promise<boolean> {
    try {
      const authUrl = this.getAuthUrl();
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.config.redirectUri
      );

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          await this.handleAuthCallback(code);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Gmail authentication error:', error);
      throw new Error('Failed to authenticate with Gmail');
    }
  }

  // Disconnect and clear tokens
  async disconnect(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('gmail_tokens');
      this.accessToken = null;
      console.log('Gmail disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
    }
  }

  // Get user's email address
  async getUserEmail(): Promise<string> {
    try {
      if (!await this.isAuthenticated()) {
        throw new Error('Not authenticated with Gmail');
      }

      const response = await this.makeGmailRequest('/users/me/profile');
      return response.emailAddress || '';
    } catch (error) {
      console.error('Error getting user email:', error);
      throw new Error('Failed to get user email');
    }
  }

  // Get email statistics
  async getEmailStats(): Promise<EmailStats> {
    try {
      if (!await this.isAuthenticated()) {
        throw new Error('Not authenticated with Gmail');
      }

      // Get total messages
      const totalResponse = await this.makeGmailRequest('/users/me/messages?maxResults=1');

      // Get unread messages
      const unreadResponse = await this.makeGmailRequest('/users/me/messages?q=is:unread&maxResults=500');

      // Get today's messages
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await this.makeGmailRequest(`/users/me/messages?q=after:${today}&maxResults=500`);

      // Get important messages
      const importantResponse = await this.makeGmailRequest('/users/me/messages?q=is:important%20is:unread&maxResults=100');

      return {
        totalEmails: totalResponse?.resultSizeEstimate || 0,
        unreadCount: unreadResponse?.resultSizeEstimate || 0,
        todayCount: todayResponse?.resultSizeEstimate || 0,
        importantCount: importantResponse?.resultSizeEstimate || 0
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      throw new Error('Failed to get email statistics');
    }
  }

  // Get recent emails
  async getRecentEmails(maxResults: number = 10): Promise<EmailMessage[]> {
    try {
      if (!await this.isAuthenticated()) {
        throw new Error('Not authenticated with Gmail');
      }

      const response = await this.makeGmailRequest(`/users/me/messages?maxResults=${maxResults}&q=in:inbox`);
      const messages = response?.messages || [];
      const emails: EmailMessage[] = [];

      // Get detailed info for each message
      for (const message of messages.slice(0, maxResults)) {
        if (message.id) {
          const details = await this.makeGmailRequest(`/users/me/messages/${message.id}?format=full`);
          
          if (details) {
            const email = this.parseEmailMessage(details);
            if (email) emails.push(email);
          }
        }
      }

      return emails;
    } catch (error) {
      console.error('Error getting recent emails:', error);
      throw new Error('Failed to get recent emails');
    }
  }

  // Send email
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      if (!await this.isAuthenticated()) {
        throw new Error('Not authenticated with Gmail');
      }

      const userEmail = await this.getUserEmail();
      
      const email = [
        `From: ${userEmail}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');

      await this.makeGmailRequest('/users/me/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Private helper methods
  private async storeTokens(tokens: GmailTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync('gmail_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing Gmail tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  private async getStoredTokens(): Promise<GmailTokens | null> {
    try {
      const tokensJson = await SecureStore.getItemAsync('gmail_tokens');
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      console.error('Error getting stored Gmail tokens:', error);
      return null;
    }
  }

  private parseEmailMessage(messageData: any): EmailMessage | null {
    try {
      const headers = messageData.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const to = headers.find((h: any) => h.name === 'To')?.value?.split(',') || [];
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';

      // Extract body (simplified - could be enhanced for HTML/multipart)
      let body = '';
      if (messageData.payload?.body?.data) {
        body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (messageData.payload?.parts) {
        // Handle multipart messages
        const textPart = messageData.payload.parts.find((part: any) => 
          part.mimeType === 'text/plain' && part.body?.data
        );
        if (textPart?.body?.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }

      return {
        id: messageData.id || '',
        threadId: messageData.threadId || '',
        subject,
        from,
        to,
        date,
        snippet: messageData.snippet || '',
        body: body.substring(0, 500), // Limit body length
        isRead: !messageData.labelIds?.includes('UNREAD'),
        labels: messageData.labelIds || []
      };
    } catch (error) {
      console.error('Error parsing email message:', error);
      return null;
    }
  }
}

// Export singleton instance
export const gmailService = new GmailService();
export default gmailService;