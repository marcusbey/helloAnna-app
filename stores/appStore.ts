import { Message, OnboardingStep, Subscription, UserProfile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
    // Store state
    isStoreReady: boolean;

    // User state
    user: UserProfile | null;
    isOnboarded: boolean;
    isAuthenticated: boolean;

    // Onboarding state
    onboardingStep: OnboardingStep;
    subscription: Subscription | null;

    // Chat state
    messages: Message[];
    isRecording: boolean;
    isProcessingVoice: boolean;

    // Email state
    isEmailSyncing: boolean;
    lastEmailSync: number | null;

    // Actions
    setStoreReady: (isReady: boolean) => void;
    setUser: (user: UserProfile | null) => void;
    setOnboarded: (isOnboarded: boolean) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    setOnboardingStep: (step: OnboardingStep) => void;
    setSubscription: (subscription: Subscription | null) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    setRecording: (isRecording: boolean) => void;
    setProcessingVoice: (isProcessingVoice: boolean) => void;
    setEmailSyncing: (isEmailSyncing: boolean) => void;
    setLastEmailSync: (timestamp: number) => void;
    updateUserPreference: <K extends keyof UserProfile['preferences']>(
        key: K,
        value: UserProfile['preferences'][K]
    ) => void;
    resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            isStoreReady: false,
            user: null,
            isOnboarded: false,
            isAuthenticated: false,
            onboardingStep: 'anna-intro-1' as OnboardingStep,
            subscription: null,
            messages: [],
            isRecording: false,
            isProcessingVoice: false,
            isEmailSyncing: false,
            lastEmailSync: null,

            // Actions
            setStoreReady: (isStoreReady) => set({ isStoreReady }),
            setUser: (user) => set({ user }),
            setOnboarded: (isOnboarded) => set({ isOnboarded }),
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
            setSubscription: (subscription) => set({ subscription }),
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
            clearMessages: () => set({ messages: [] }),
            setRecording: (isRecording) => set({ isRecording }),
            setProcessingVoice: (isProcessingVoice) => set({ isProcessingVoice }),
            setEmailSyncing: (isEmailSyncing) => set({ isEmailSyncing }),
            setLastEmailSync: (timestamp) => set({ lastEmailSync: timestamp }),
            updateUserPreference: (key, value) => set((state) => ({
                user: state.user
                    ? {
                        ...state.user,
                        preferences: {
                            ...state.user.preferences,
                            [key]: value
                        }
                    }
                    : null
            })),
            resetOnboarding: () => set({
                isOnboarded: false,
                isAuthenticated: false,
                onboardingStep: 'anna-intro-1' as OnboardingStep,
                subscription: null,
                messages: [],
                isRecording: false,
                isProcessingVoice: false,
                isEmailSyncing: false,
                lastEmailSync: null,
            }),
        }),
        {
            name: 'anna-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isOnboarded: state.isOnboarded,
                isAuthenticated: state.isAuthenticated,
                messages: state.messages,
                lastEmailSync: state.lastEmailSync,
                subscription: state.subscription,
                onboardingStep: state.onboardingStep,
            }),
            onRehydrateStorage: () => (state) => {
                // Mark store as ready after hydration
                if (state) {
                    state.setStoreReady(true);
                }
            },
        }
    )
);

// Initialize store ready state for non-persisted usage
// Use a more robust initialization approach
let initializationAttempts = 0;
const maxAttempts = 10;

const initializeStore = () => {
    try {
        // Check if the store is available before calling getState
        if (useAppStore && typeof useAppStore.getState === 'function') {
            const state = useAppStore.getState();
            if (state && !state.isStoreReady) {
                state.setStoreReady(true);
                console.log('Store initialized successfully');
            }
        } else {
            throw new Error('Store not ready');
        }
    } catch (error) {
        initializationAttempts++;
        if (initializationAttempts < maxAttempts) {
            console.log(`Store initialization attempt ${initializationAttempts}/${maxAttempts}`);
            setTimeout(initializeStore, 100 * initializationAttempts);
        } else {
            console.error('Failed to initialize store after', maxAttempts, 'attempts');
        }
    }
};

// Start initialization with a longer delay to ensure Zustand is ready
setTimeout(initializeStore, 200);

// Safe store access hook - simplified version
export const useSafeAppStore = () => {
    try {
        return useAppStore();
    } catch (error) {
        console.warn('Store access error:', error);
        // Return default state if store is not ready
        return {
            isStoreReady: false,
            user: null,
            isOnboarded: false,
            isAuthenticated: false,
            onboardingStep: 'anna-intro-1' as OnboardingStep,
            subscription: null,
            messages: [],
            isRecording: false,
            isProcessingVoice: false,
            isEmailSyncing: false,
            lastEmailSync: null,
            setStoreReady: () => { },
            setUser: () => { },
            setOnboarded: () => { },
            setAuthenticated: () => { },
            setOnboardingStep: () => { },
            setSubscription: () => { },
            addMessage: () => { },
            clearMessages: () => { },
            setRecording: () => { },
            setProcessingVoice: () => { },
            setEmailSyncing: () => { },
            setLastEmailSync: () => { },
            updateUserPreference: () => { },
            resetOnboarding: () => { },
        };
    }
};