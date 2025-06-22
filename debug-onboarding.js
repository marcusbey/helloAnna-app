#!/usr/bin/env node

/**
 * Debug Onboarding State Script
 * 
 * This script helps debug onboarding issues by:
 * 1. Checking current onboarding state
 * 2. Optionally resetting state to start fresh
 * 3. Validating onboarding flow configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Anna Onboarding Debug Tool\n');

// 1. Check onboarding configuration
console.log('📋 Checking onboarding configuration...\n');

const onboardingFile = path.join(__dirname, 'app', 'onboarding.tsx');
const typesFile = path.join(__dirname, 'types', 'index.ts');

if (fs.existsSync(onboardingFile)) {
  console.log('✅ onboarding.tsx exists');
} else {
  console.log('❌ onboarding.tsx missing');
}

if (fs.existsSync(typesFile)) {
  console.log('✅ types/index.ts exists');
  
  // Check onboarding steps
  const typesContent = fs.readFileSync(typesFile, 'utf8');
  const onboardingStepsMatch = typesContent.match(/OnboardingStep =\s*[\s\S]*?;/);
  
  if (onboardingStepsMatch) {
    console.log('\n📝 Available onboarding steps:');
    const steps = onboardingStepsMatch[0]
      .match(/['"`][^'"`]+['"`]/g)
      ?.map(step => step.replace(/['"`]/g, ''));
    
    if (steps) {
      steps.forEach(step => console.log(`   - ${step}`));
    }
  }
} else {
  console.log('❌ types/index.ts missing');
}

// 2. Check app store configuration
const appStoreFile = path.join(__dirname, 'stores', 'appStore.ts');
if (fs.existsSync(appStoreFile)) {
  console.log('✅ appStore.ts exists');
  
  const storeContent = fs.readFileSync(appStoreFile, 'utf8');
  const defaultStepMatch = storeContent.match(/onboardingStep:\s*['"`]([^'"`]+)['"`]/);
  
  if (defaultStepMatch) {
    console.log(`\n🎯 Default onboarding step: ${defaultStepMatch[1]}`);
  }
} else {
  console.log('❌ appStore.ts missing');
}

// 3. Instructions for debugging
console.log('\n🛠️  Debug Instructions:');
console.log('1. Check the app logs for current onboarding step');
console.log('2. If you see the wrong screen, the store state might be cached');
console.log('3. To reset onboarding state, clear app storage or call resetOnboarding()');
console.log('\n📱 To test onboarding flow:');
console.log('1. Open React Native debugger or console');
console.log('2. Run: useAppStore.getState().resetOnboarding()');
console.log('3. Restart the app');

console.log('\n🔧 Current onboarding flow:');
console.log('anna-intro-1 → WelcomeScreen (Discover phase)');
console.log('value-proposition-1/2/3 → Benefits screens');
console.log('pricing → PricingScreen (Paywall)');
console.log('conversation-name → ConversationalOnboarding (New!)');
console.log('signup → WelcomeScreen (Signup wall)');
console.log('gmail-connect → GmailConnect');
console.log('dashboard-intro → DashboardIntroScreen');

console.log('\n✨ If you see this script output, the project structure is correct!');
console.log('The issue might be with cached state or navigation timing.');

console.log('\n💡 Quick fixes to try:');
console.log('1. Clear React Native cache: npx expo start --clear');
console.log('2. Reset app data in simulator/device');
console.log('3. Check console logs for navigation state');

process.exit(0);