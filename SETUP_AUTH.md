# 🔐 Anna AI Assistant - Authentication Setup Guide

## 📋 Prerequisites

The authentication system is now installed and ready to configure. You need to set up:

1. **Clerk** - For user authentication
2. **Supabase** - For user data storage

## 🔑 Step 1: Set Up Clerk Authentication

### 1.1 Create Clerk Account
1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "React Native" as your platform

### 1.2 Get Clerk Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy the following values:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Configure Clerk Settings
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address** as required
3. Enable **Email verification** 
4. Disable social providers for now (we'll add them later in Settings)

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Wait for the project to be ready

### 2.2 Get Supabase Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **URL** (your project URL)
   - **anon public** key
   - **service_role** key (keep this secret!)

### 2.3 Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL to create all tables and policies

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Update Your .env File
Replace the placeholder values in your `.env` file:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-clerk-publishable-key
CLERK_SECRET_KEY=sk_test_your-actual-clerk-secret-key

# Supabase Database
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-supabase-service-role-key
```

### 3.2 Restart Your Development Server
After updating the environment variables:
1. Stop the current dev server (Ctrl+C)
2. Clear cache: `rm -rf node_modules/.cache .expo .metro`
3. Restart: `bun run start-web`

## 🔧 Step 4: Enable Authentication

### 4.1 Uncomment Auth Code
Once your environment variables are set, uncomment the following lines in `app/_layout.tsx`:

```typescript
// Change this:
// import { ClerkProvider, clerkPublishableKey, tokenCache } from "@/lib/clerk";

// To this:
import { ClerkProvider, clerkPublishableKey, tokenCache } from "@/lib/clerk";

// And change this:
// <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
//   <AppContent />
// </ClerkProvider>

// To this:
<ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
  <AppContent />
</ClerkProvider>
```

## 🚀 Step 5: Test Authentication

### 5.1 Test the Flow
1. Open your app in the browser
2. You should see the Anna welcome screen
3. Click "Create Account" to test sign-up
4. Check that email verification works
5. Test sign-in with existing account

### 5.2 Verify Database Integration
1. Check your Supabase dashboard
2. Go to **Table Editor** → **user_profiles**
3. You should see new user records when people sign up

## 🔒 Security Notes

- **Never commit** your `.env` file to version control
- The **service role key** should only be used on the backend
- **Publishable keys** are safe to use in the frontend
- All user data is isolated using Row Level Security (RLS)

## 🆘 Troubleshooting

### Common Issues:

1. **"Missing Clerk publishable key"**
   - Check your `.env` file has the correct variable name
   - Restart your dev server after changing env vars

2. **"Missing Supabase environment variables"**
   - Verify your Supabase URL and keys are correct
   - Make sure there are no extra spaces in the values

3. **Database connection errors**
   - Ensure you've run the SQL schema in Supabase
   - Check that RLS policies are enabled

4. **Authentication not working**
   - Verify Clerk settings allow email authentication
   - Check that email verification is properly configured

## 📞 Next Steps

Once authentication is working:
1. Test the complete onboarding flow
2. Add external account connections in Settings
3. Implement email sync functionality
4. Set up subscription management

---

**Ready to continue?** Once you've completed these steps, the Anna AI Assistant will have full multi-user authentication with secure data isolation! 🎉
