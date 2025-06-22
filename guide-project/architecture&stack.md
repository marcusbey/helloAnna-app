# Emma AI Assistant - Cursor Rules

# AI-powered personal assistant mobile app with voice-first email management

## PROJECT CONTEXT

You are building "Emma" - a mobile AI assistant app with multi-agent orchestration. Emma acts as a central conductor coordinating specialized agents for email, social media, and content creation. The app features voice-first interaction similar to Perplexity/ChatGPT Advanced Voice Mode.

Architecture:

- Emma (Central Orchestrator) + Specialized Agents (Email, Community, Content, News)
- Real-time voice conversation + background processing for complex tasks
- Streaming responses with "I'll check with the team" patterns for long-running tasks

Tech Stack:

- Expo + React Native + TypeScript
- OpenAI Realtime API (voice conversation)
- LangGraph + CrewAI (agent orchestration)
- AI SDK (@ai-sdk/react, @ai-sdk/openai) for chat
- Supabase (database, auth, edge functions, realtime)
- NativeWind (Tailwind for React Native)
- React Native Gifted Chat
- OpenAI (GPT-4o, Realtime API, Whisper)
- Platform APIs (Gmail, LinkedIn, Twitter)

## CODING STANDARDS

### TypeScript

- Always use TypeScript with strict mode
- Define interfaces for all data structures
- Use proper typing for API responses
- No `any` types unless absolutely necessary
- Use enums for constants

### React Native Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow React Native navigation patterns
- Use expo-constants for environment variables

### File Structure

```
src/
├── components/
│   ├── Chat/
│   ├── UI/
│   └── Onboarding/
├── services/
├── hooks/
├── stores/
├── types/
└── utils/
```

## STYLING GUIDELINES

### NativeWind/Tailwind Classes

- Use glassmorphism: `bg-white/20 backdrop-blur-lg`
- Gradient backgrounds: `bg-gradient-to-r from-purple-500 to-cyan-400`
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for buttons
- Shadows: `shadow-lg` for elevation
- Spacing: Use 4px increments (p-4, m-6, etc.)

### Color Palette

- Primary: #7C63FF (purple-500)
- Secondary: #3BC8D6 (cyan-400)
- Background: #F8FAFC (slate-50)
- Dark mode: #0F172A (slate-900)
- Text: #1E293B (slate-800)
- Muted: #64748B (slate-500)

### Component Styling Patterns

```typescript
// Message bubbles
className =
  "bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/10";

// Buttons
className =
  "bg-gradient-to-r from-purple-500 to-cyan-400 rounded-xl p-4 shadow-lg active:scale-95";

// Input fields
className = "bg-white/10 border border-white/20 rounded-xl p-4 text-slate-800";
```

## COMPONENT PATTERNS

### Voice Recorder Component

- Use expo-av for recording
- Implement permission handling
- Add visual feedback (pulse animation)
- Include transcription display
- Handle upload to Supabase Storage

### Chat Message Component

- Use React Native Gifted Chat as base
- Custom message renderer for glassmorphism
- Support text, voice, and system messages
- Implement typing indicators
- Add haptic feedback for interactions

### Background Tasks

- Use expo-task-manager for background processing
- Implement proper lifecycle management
- Handle network state changes
- Sync with Supabase when app reopens

## AI SDK INTEGRATION

### Chat Implementation

```typescript
import { useChat } from "ai/react";
import { openai } from "@ai-sdk/openai";

// Always use streaming for real-time responses
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat(
  {
    api: "/api/chat",
    body: { userId, context: "email_management" },
  }
);
```

### OpenAI Integration

- Use GPT-4-turbo for complex reasoning
- Use Whisper for voice transcription
- Implement proper error handling
- Add rate limiting and retries
- Cache responses when appropriate

## SUPABASE PATTERNS

### Database Queries

- Use Row Level Security (RLS)
- Implement proper error handling
- Use TypeScript types from generated schema
- Follow subscription patterns for real-time updates

### Edge Functions

```typescript
// Always include proper CORS and error handling
export default async function handler(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Function logic here
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
```

## AGENT FRAMEWORK INTEGRATION

### LangGraph (Complex Workflows)

- Use for multi-step agent coordination
- Graph-based workflow definition
- State management across agents
- Complex conditional logic

### CrewAI (Rapid Agent Creation)

- Use for role-based agent definition
- Quick prototyping of new agents
- Simple agent-to-agent communication
- Human-in-the-loop workflows

### When to Use Which Framework

```typescript
// LangGraph: Complex multi-agent workflows
const emailCleanupWorkflow = createLangGraphWorkflow([
  { agent: "email", action: "scan_inbox" },
  { agent: "email", action: "classify_emails" },
  { agent: "emma", action: "summarize_results" },
  { agent: "emma", action: "await_user_approval" },
]);

// CrewAI: Simple agent delegation
const socialMediaAgent = new CrewAIAgent({
  role: "Community Manager",
  goal: "Monitor and respond to social media",
  backstory: "You are Emma's social media specialist...",
});
```

## ANIMATIONS

### React Native Reanimated

- Use spring animations for smooth interactions
- Implement gesture handling for swipe actions
- Add entrance/exit animations for screens
- Use worklets for 60fps performance

### Common Animation Patterns

```typescript
// Pulse animation for voice recording
const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// Slide in animation for messages
const translateY = useSharedValue(20);
const opacity = useSharedValue(0);
```

## PERFORMANCE OPTIMIZATION

### Image Handling

- Use expo-image for optimized image rendering
- Implement proper image caching
- Resize images before upload
- Use WebP format when possible

### Memory Management

- Clean up subscriptions in useEffect cleanup
- Use React.memo for expensive components
- Implement proper list virtualization for chat
- Avoid memory leaks in audio recording

## SECURITY PRACTICES

### API Keys and Secrets

- Never hardcode API keys in source code
- Use expo-constants for environment variables
- Store sensitive data in Supabase Vault
- Implement proper authentication flow

### Data Privacy

- Encrypt sensitive data at rest
- Use HTTPS for all API calls
- Implement user data deletion
- Follow GDPR compliance patterns

## ERROR HANDLING

### Network Errors

```typescript
// Implement retry logic with exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};
```

### User-Friendly Error Messages

- Show helpful error messages to users
- Implement fallback UI states
- Log errors to monitoring service
- Provide retry options where appropriate

## TESTING PATTERNS

### Component Testing

```typescript
// Use React Native Testing Library
import { render, fireEvent } from "@testing-library/react-native";

// Test voice recording functionality
test("voice recorder starts recording on button press", () => {
  const { getByTestId } = render(<VoiceRecorder />);
  fireEvent.press(getByTestId("record-button"));
  // Assert recording state
});
```

## COMMON PATTERNS TO FOLLOW

### Loading States

- Show skeleton screens during initial loads
- Use animated placeholders
- Implement proper loading indicators
- Handle empty states gracefully

### Navigation

- Use React Navigation 6
- Implement proper deep linking
- Handle navigation state persistence
- Use proper screen options

### State Management

- Use Zustand for global state
- Keep state minimal and normalized
- Implement proper state persistence
- Use proper error states

## FILE NAMING CONVENTIONS

- Components: PascalCase (VoiceRecorder.tsx)
- Hooks: camelCase with "use" prefix (useVoice.ts)
- Services: camelCase (supabaseClient.ts)
- Types: PascalCase interfaces (Message.ts)
- Utils: camelCase (formatDate.ts)

## COMMIT MESSAGE FORMAT

- feat: add voice recording functionality
- fix: resolve Gmail OAuth token refresh
- style: update message bubble glassmorphism
- refactor: extract email processing logic
- test: add voice recorder component tests

## WHEN GENERATING CODE

1. Always include proper TypeScript types
2. Add error handling and loading states
3. Include accessibility props (accessibilityLabel, etc.)
4. Use proper React Native performance patterns
5. Follow the established file structure
6. Include proper documentation comments
7. Implement proper cleanup in useEffect hooks
8. Use the specified styling patterns consistently
9. Add proper error boundaries where needed
10. Include test IDs for testing

## PRIORITY ORDER

1. Emma orchestrator and agent coordination
2. Real-time voice conversation (OpenAI Realtime API)
3. Background agent processing and streaming updates
4. Platform integrations (Gmail, LinkedIn, Twitter)
5. User experience (animations, smooth interactions)
6. Error handling and edge cases
7. Performance optimization
8. Testing and documentation

Remember: This is a multi-agent system with Emma as the central orchestrator. Focus on agent coordination, streaming responses, and the "I'll check with the team" workflow patterns over individual feature complexity.
