#!/usr/bin/env node

/**
 * Reset Onboarding Script
 * 
 * This script helps reset the app to show onboarding again by clearing AsyncStorage
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Resetting Anna Onboarding State\n');

// Instructions for different platforms
console.log('📱 Choose your reset method:\n');

console.log('🤖 For Android Simulator:');
console.log('   adb shell pm clear host.exp.exponent');
console.log('   # OR clear app data manually in Settings\n');

console.log('📱 For iOS Simulator:');
console.log('   1. Open Simulator');
console.log('   2. Device → Erase All Content and Settings');
console.log('   3. OR: Long press app → Delete App → Reinstall\n');

console.log('💻 For Expo development:');
console.log('   1. Stop the current metro bundler');
console.log('   2. Run: npx expo start --clear');
console.log('   3. OR delete app and reinstall from Expo Go\n');

console.log('🛠️  For React Native debugger:');
console.log('   1. Open React Native debugger');
console.log('   2. In console: useAppStore.getState().resetOnboarding()');
console.log('   3. Reload app\n');

console.log('📝 Manual AsyncStorage clear:');
console.log('   1. Add this to your app temporarily:');
console.log('   import AsyncStorage from "@react-native-async-storage/async-storage";');
console.log('   2. AsyncStorage.clear().then(() => console.log("Storage cleared"));');
console.log('   3. Restart app\n');

console.log('✅ After reset, you should see the WelcomeScreen (anna-intro-1)');
console.log('   This is the first screen of the onboarding flow.\n');

console.log('🔍 To verify reset worked:');
console.log('   Look for console log: "🎯 Current onboarding step: anna-intro-1"');

process.exit(0);