import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';

export function useGmail() {
  const { user, setUser } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectGmail = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // In a real app, we would implement OAuth flow with Google
      // For this MVP, we'll simulate a successful connection
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user profile with Gmail connection
      if (user) {
        setUser({
          ...user,
          isGmailConnected: true,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect Gmail', error);
      setError('Failed to connect to Gmail. Please try again.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async () => {
    try {
      // In a real app, we would revoke OAuth tokens
      // For this MVP, we'll simulate a successful disconnection
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
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

  return {
    isGmailConnected: user?.isGmailConnected || false,
    isConnecting,
    error,
    connectGmail,
    disconnectGmail,
  };
}