Required API Keys for Anna AI Assistant

🔴 CRITICAL - Need Real Values

AI/ML Services

- EXPO_PUBLIC_OPENAI_API_KEY - Currently placeholder, need real OpenAI key
- EXPO_ANTROPIC_API_KEY - Has real value ✅

Email Integration

- EXPO_PUBLIC_GMAIL_CLIENT_ID - Currently placeholder, need real Google OAuth client ID
- GMAIL_CLIENT_SECRET - Missing, need to add Google OAuth client secret

Payment Processing

- EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY - Currently placeholder, need real Stripe key
- STRIPE_SECRET_KEY - Missing, need to add Stripe secret key

🟡 OPTIONAL - For Enhanced Features

Social Media APIs (for agents)

- TWITTER_API_KEY - Missing, needed for Twitter/X integration
- TWITTER_API_SECRET - Missing
- TWITTER_BEARER_TOKEN - Missing
- LINKEDIN_CLIENT_ID - Missing, needed for LinkedIn integration
- LINKEDIN_CLIENT_SECRET - Missing

Analytics & Monitoring

- EXPO_PUBLIC_ANALYTICS_ID - Currently placeholder
- EXPO_PUBLIC_SENTRY_DSN - Currently placeholder
- EXPO_PUBLIC_MIXPANEL_TOKEN - Currently placeholder

Voice Services

- ELEVEN_LABS_API_KEY - Missing, for advanced text-to-speech
- AZURE_SPEECH_KEY - Missing, alternative to OpenAI Whisper

🟢 ALREADY CONFIGURED

Database

- EXPO_PUBLIC_SUPABASE_URL - ✅ Active
- EXPO_PUBLIC_SUPABASE_ANON_KEY - ✅ Active
- SUPABASE_SERVICE_ROLE_KEY - ✅ Active

Authentication

- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY - ✅ Active
- CLERK_SECRET_KEY - ✅ Active

🚨 SECURITY KEYS NEEDED

- ENCRYPTION_KEY - Currently placeholder, need 32-byte key for data encryption
- WEBHOOK_SECRET - Currently placeholder, need Clerk webhook secret
- JWT_SECRET - Missing, might be needed for custom JWT signing

📋 Priority Order for Implementation

Week 1 - Core Functionality

1. OpenAI API Key - Essential for Emma's AI brain
2. Gmail OAuth credentials - Critical for email management
3. Encryption key - Security for sensitive data

Week 2 - Enhanced Features

4. Stripe keys - For subscription management
5. Twitter API keys - For social media agent
6. LinkedIn API keys - For professional networking

Week 3 - Monitoring & Analytics

7. Sentry DSN - Error tracking
8. Analytics keys - User behavior tracking

💡 Next Steps

1. Set up OpenAI account and get API key
2. Configure Google Cloud Console for Gmail OAuth
3. Generate secure encryption key
4. Set up Stripe account for payments
5. Apply for Twitter/X API access
6. Configure LinkedIn Developer account
