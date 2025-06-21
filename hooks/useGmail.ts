import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { gmailService, EmailStats, EmailMessage } from '@/lib/gmail';

export function useGmail() {
  const { user, setUser } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [recentEmails, setRecentEmails] = useState<EmailMessage[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');

  const connectGmail = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Authenticate with Gmail using OAuth
      const success = await gmailService.authenticate();
      
      if (success) {
        // Get user's email address
        const email = await gmailService.getUserEmail();
        setUserEmail(email);
        
        // Update user profile with Gmail connection
        if (user) {
          setUser({
            ...user,
            isGmailConnected: true,
          });
        }
        
        // Load initial data
        await loadGmailData();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to connect Gmail', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Gmail. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async () => {
    try {
      // Disconnect from Gmail service
      await gmailService.disconnect();
      
      // Clear local data
      setUserEmail('');
      setEmailStats(null);
      setRecentEmails([]);
      
      // Update user profile
      if (user) {
        setUser({
          ...user,
          isGmailConnected: false,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to disconnect Gmail', error);
      return false;
    }
  };

  // Load Gmail data (stats and recent emails)
  const loadGmailData = async () => {
    try {
      const [stats, emails] = await Promise.all([
        gmailService.getEmailStats(),
        gmailService.getRecentEmails(10)
      ]);
      
      setEmailStats(stats);
      setRecentEmails(emails);
    } catch (error) {
      console.error('Failed to load Gmail data:', error);
    }
  };

  // Send email through Gmail
  const sendEmail = async (to: string, subject: string, body: string) => {
    try {
      await gmailService.sendEmail(to, subject, body);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await gmailService.isAuthenticated();
        if (isAuth) {
          const email = await gmailService.getUserEmail();
          setUserEmail(email);
          
          if (user) {
            setUser({
              ...user,
              isGmailConnected: true,
            });
          }
          
          await loadGmailData();
        }
      } catch (error) {
        console.error('Error checking Gmail auth:', error);
      }
    };

    checkAuth();
  }, []);

  return {
    isGmailConnected: user?.isGmailConnected || false,
    isConnecting,
    error,
    emailStats,
    recentEmails,
    userEmail,
    connectGmail,
    disconnectGmail,
    loadGmailData,
    sendEmail,
  };
}