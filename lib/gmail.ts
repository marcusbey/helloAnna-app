import { OAuth2Client } from 'google-auth-library';
import { gmail_v1, google } from 'googleapis';
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
  private oauth2Client: OAuth2Client | null = null;
  private gmail: gmail_v1.Gmail | null = null;
  private config: GmailConfig;

  constructor() {
    this.config = {
      clientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_GMAIL_CLIENT_ID || process.env.EXPO_PUBLIC_GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: Constants.expoConfig?.extra?.EXPO_PUBLIC_GMAIL_REDIRECT_URI || process.env.EXPO_PUBLIC_GMAIL_REDIRECT_URI || 'http://localhost:8081/auth/callback'
    };

    this.initializeOAuth();
  }

  private initializeOAuth() {
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('Gmail OAuth credentials not configured');
      return;
    }

    this.oauth2Client = new OAuth2Client({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) return false;

      this.oauth2Client?.setCredentials(tokens);
      
      // Try to make a simple API call to verify tokens
      await this.gmail?.users.getProfile({ userId: 'me' });
      return true;
    } catch (error) {
      console.error('Gmail authentication check failed:', error);
      return false;
    }
  }

  // Get OAuth URL for authentication
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('Gmail OAuth not initialized. Check your configuration.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Handle OAuth callback and exchange code for tokens
  async handleAuthCallback(code: string): Promise<GmailTokens> {
    if (!this.oauth2Client) {
      throw new Error('Gmail OAuth not initialized');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      const gmailTokens: GmailTokens = {
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || ''
      };

      // Store tokens securely
      await this.storeTokens(gmailTokens);
      
      // Set credentials for future requests
      this.oauth2Client.setCredentials(tokens);

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
      this.oauth2Client?.setCredentials({});
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

      const response = await this.gmail?.users.getProfile({ userId: 'me' });
      return response?.data.emailAddress || '';
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
      const totalResponse = await this.gmail?.users.messages.list({
        userId: 'me',
        maxResults: 1
      });

      // Get unread messages
      const unreadResponse = await this.gmail?.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 500
      });

      // Get today's messages
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await this.gmail?.users.messages.list({
        userId: 'me',
        q: `after:${today}`,
        maxResults: 500
      });

      // Get important messages
      const importantResponse = await this.gmail?.users.messages.list({
        userId: 'me',
        q: 'is:important is:unread',
        maxResults: 100
      });

      return {
        totalEmails: totalResponse?.data.resultSizeEstimate || 0,
        unreadCount: unreadResponse?.data.resultSizeEstimate || 0,
        todayCount: todayResponse?.data.resultSizeEstimate || 0,
        importantCount: importantResponse?.data.resultSizeEstimate || 0
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

      const response = await this.gmail?.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox'
      });

      const messages = response?.data.messages || [];
      const emails: EmailMessage[] = [];

      // Get detailed info for each message
      for (const message of messages.slice(0, maxResults)) {
        if (message.id) {
          const details = await this.gmail?.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });

          if (details?.data) {
            const email = this.parseEmailMessage(details.data);
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

      const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      await this.gmail?.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
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

  private parseEmailMessage(messageData: gmail_v1.Schema$Message): EmailMessage | null {
    try {
      const headers = messageData.payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
      const to = headers.find(h => h.name === 'To')?.value?.split(',') || [];
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract body (simplified - could be enhanced for HTML/multipart)
      let body = '';
      if (messageData.payload?.body?.data) {
        body = Buffer.from(messageData.payload.body.data, 'base64').toString();
      } else if (messageData.payload?.parts) {
        // Handle multipart messages
        const textPart = messageData.payload.parts.find(part => 
          part.mimeType === 'text/plain' && part.body?.data
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
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