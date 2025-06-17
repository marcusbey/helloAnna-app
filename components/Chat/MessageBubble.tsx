import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Message } from '@/types';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Avatar } from '@/components/UI/Avatar';

interface MessageBubbleProps {
  message: Message;
  isLastMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLastMessage,
}) => {
  const isUser = message.role === 'user';
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer,
    ]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Avatar 
            source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            size={36}
          />
        </View>
      )}
      
      <View style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
      ]}>
        {isUser ? (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.userBubble}
          >
            <Text style={styles.userText}>{message.content}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.assistantBubble}>
            <Text style={styles.assistantText}>{message.content}</Text>
          </View>
        )}
        
        <Text style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.assistantTimestamp,
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      
      {isUser && (
        <View style={styles.avatarContainer}>
          <Avatar 
            name="John Doe"
            size={36}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
    alignSelf: 'flex-end',
  },
  bubbleContainer: {
    maxWidth: '70%',
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
  },
  assistantBubbleContainer: {
    alignItems: 'flex-start',
  },
  userBubble: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadows.sm,
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadows.sm,
  },
  userText: {
    color: colors.white,
    fontSize: 16,
  },
  assistantText: {
    color: colors.text,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: colors.gray[400],
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: colors.gray[400],
    textAlign: 'left',
  },
});