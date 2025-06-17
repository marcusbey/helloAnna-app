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

interface PricingScreenProps {
  onSelectPlan: (planType: 'trial' | 'basic') => void;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({
  onSelectPlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'basic'>('trial');
  
  const basicFeatures = [
    'Smart email organization and filtering',
    'Voice-first interaction with Anna',
    'AI-powered email summaries',
    'Intelligent draft suggestions',
    'Priority email detection',
    'Basic email analytics',
    'Gmail integration',
    '24/7 email support',
  ];

  const premiumAddOns = [
    {
      name: 'LinkedIn Content Creator',
      price: '$10/month',
      description: 'AI agent for LinkedIn content creation and engagement',
    },
    {
      name: 'Twitter Growth Agent',
      price: '$8/month', 
      description: 'Automated Twitter content and audience growth',
    },
    {
      name: 'Advanced Analytics',
      price: '$5/month',
      description: 'Deep insights and productivity metrics',
    },
  ];

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
            style={styles.iconContainer}
          >
            <Text style={styles.iconText}>💎</Text>
          </LinearGradient>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Start with Anna's core email features, add premium agents later
          </Text>
        </View>

        {/* Free Trial Option */}
        <TouchableOpacity 
          style={[
            styles.planCard, 
            selectedPlan === 'trial' && styles.selectedPlan
          ]}
          onPress={() => setSelectedPlan('trial')}
        >
          <Card variant="elevated" style={styles.card}>
            <View style={styles.planHeader}>
              <View style={styles.planBadge}>
                <Text style={styles.badgeText}>RECOMMENDED</Text>
              </View>
              <Text style={styles.planName}>Free Trial</Text>
              <Text style={styles.planPrice}>
                <Text style={styles.priceAmount}>Free</Text>
                <Text style={styles.pricePeriod}> for 14 days</Text>
              </Text>
              <Text style={styles.planDescription}>
                Try all Anna features risk-free, then $5/month
              </Text>
            </View>
            <View style={styles.checkmark}>
              {selectedPlan === 'trial' && <Text style={styles.checkmarkText}>✓</Text>}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Basic Plan */}
        <TouchableOpacity 
          style={[
            styles.planCard, 
            selectedPlan === 'basic' && styles.selectedPlan
          ]}
          onPress={() => setSelectedPlan('basic')}
        >
          <Card variant="elevated" style={styles.card}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Anna Basic</Text>
              <Text style={styles.planPrice}>
                <Text style={styles.priceAmount}>$5</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </Text>
              <Text style={styles.planDescription}>
                Everything you need for intelligent email management
              </Text>
            </View>
            <View style={styles.checkmark}>
              {selectedPlan === 'basic' && <Text style={styles.checkmarkText}>✓</Text>}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Features List */}
        <Card variant="elevated" style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's included:</Text>
          {basicFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Card>

        {/* Premium Add-ons */}
        <View style={styles.addOnsSection}>
          <Text style={styles.addOnsTitle}>Premium Agent Add-ons</Text>
          <Text style={styles.addOnsSubtitle}>
            Expand Anna's capabilities with specialized AI agents
          </Text>
          
          {premiumAddOns.map((addOn, index) => (
            <Card key={index} variant="elevated" style={styles.addOnCard}>
              <View style={styles.addOnHeader}>
                <Text style={styles.addOnName}>{addOn.name}</Text>
                <Text style={styles.addOnPrice}>{addOn.price}</Text>
              </View>
              <Text style={styles.addOnDescription}>{addOn.description}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <GradientButton
          title={selectedPlan === 'trial' ? 'Start Free Trial' : 'Subscribe to Anna Basic'}
          onPress={() => onSelectPlan(selectedPlan)}
          size="large"
          style={styles.subscribeButton}
        />
        <Text style={styles.footerNote}>
          Cancel anytime • No hidden fees • Secure payment
        </Text>
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
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  iconText: {
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
  planCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  selectedPlan: {
    transform: [{ scale: 1.02 }],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planHeader: {
    flex: 1,
  },
  planBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  planPrice: {
    marginBottom: theme.spacing.xs,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  featuresCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureCheck: {
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: theme.spacing.md,
    fontSize: 16,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  addOnsSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  addOnsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  addOnsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  addOnCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: colors.gray[50],
  },
  addOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  addOnName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addOnPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addOnDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
  subscribeButton: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
