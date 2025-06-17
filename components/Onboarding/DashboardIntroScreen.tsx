import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { GradientButton } from '@/components/UI/GradientButton';
import { Card } from '@/components/UI/Card';

interface DashboardIntroScreenProps {
  userName: string;
  onComplete: () => void;
}

export const DashboardIntroScreen: React.FC<DashboardIntroScreenProps> = ({
  userName,
  onComplete,
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tutorialTips = [
    {
      icon: '💬',
      title: 'Chat with Anna',
      description: 'Tap the microphone to start a voice conversation, or type your questions in the chat.',
      highlight: 'Voice commands work best!',
    },
    {
      icon: '📧',
      title: 'Email Summaries',
      description: 'Anna will automatically summarize your important emails and highlight what needs your attention.',
      highlight: 'Check your inbox daily',
    },
    {
      icon: '⚙️',
      title: 'Customize Settings',
      description: 'Adjust notification preferences, quiet hours, and communication style in the Settings tab.',
      highlight: 'Make Anna work for you',
    },
    {
      icon: '🎯',
      title: 'Smart Priorities',
      description: 'Anna learns your patterns and will get better at identifying important emails over time.',
      highlight: 'The more you use it, the smarter it gets',
    },
  ];

  const nextTip = () => {
    if (currentTip < tutorialTips.length - 1) {
      setCurrentTip(currentTip + 1);
    }
  };

  const prevTip = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.celebrationContainer}
          >
            <Text style={styles.celebrationIcon}>🎉</Text>
          </LinearGradient>
          <Text style={styles.title}>Welcome, {userName}!</Text>
          <Text style={styles.subtitle}>
            Anna is ready to help you manage your emails. Here's a quick tour of what you can do:
          </Text>
        </View>

        <View style={styles.tutorialContainer}>
          <Card variant="elevated" style={styles.tutorialCard}>
            <View style={styles.tipHeader}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tipIconContainer}
              >
                <Text style={styles.tipIcon}>{tutorialTips[currentTip].icon}</Text>
              </LinearGradient>
              <Text style={styles.tipTitle}>{tutorialTips[currentTip].title}</Text>
            </View>
            
            <Text style={styles.tipDescription}>
              {tutorialTips[currentTip].description}
            </Text>
            
            <View style={styles.highlightContainer}>
              <Text style={styles.highlightText}>
                💡 {tutorialTips[currentTip].highlight}
              </Text>
            </View>
          </Card>

          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, currentTip === 0 && styles.navButtonDisabled]}
              onPress={prevTip}
              disabled={currentTip === 0}
            >
              <Text style={[styles.navButtonText, currentTip === 0 && styles.navButtonTextDisabled]}>
                ← Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.dotsContainer}>
              {tutorialTips.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    index === currentTip && styles.activeDot
                  ]} 
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.navButton, currentTip === tutorialTips.length - 1 && styles.navButtonDisabled]}
              onPress={nextTip}
              disabled={currentTip === tutorialTips.length - 1}
            >
              <Text style={[styles.navButtonText, currentTip === tutorialTips.length - 1 && styles.navButtonTextDisabled]}>
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card variant="elevated" style={styles.quickStartCard}>
          <Text style={styles.quickStartTitle}>Quick Start Tips</Text>
          <View style={styles.quickStartItem}>
            <Text style={styles.quickStartIcon}>🎤</Text>
            <Text style={styles.quickStartText}>
              Try saying: "Anna, what are my important emails today?"
            </Text>
          </View>
          <View style={styles.quickStartItem}>
            <Text style={styles.quickStartIcon}>📱</Text>
            <Text style={styles.quickStartText}>
              Enable notifications to stay updated on priority emails
            </Text>
          </View>
          <View style={styles.quickStartItem}>
            <Text style={styles.quickStartIcon}>⏰</Text>
            <Text style={styles.quickStartText}>
              Set quiet hours in Settings for uninterrupted focus time
            </Text>
          </View>
        </Card>
      </ScrollView>
      
      <View style={styles.footer}>
        <GradientButton
          title="Start Using Anna"
          onPress={onComplete}
          size="large"
          style={styles.startButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  celebrationContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  celebrationIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tutorialContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  tutorialCard: {
    marginBottom: theme.spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  tipDescription: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  highlightContainer: {
    backgroundColor: colors.primary + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  highlightText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: colors.gray[400],
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  quickStartCard: {
    marginHorizontal: theme.spacing.lg,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  quickStartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  quickStartIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  quickStartText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  startButton: {
    width: '100%',
  },
});
