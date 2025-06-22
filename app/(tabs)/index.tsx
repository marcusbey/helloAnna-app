import { EnhancedChatScreen } from "@/components/Chat/EnhancedChatScreen";
import { Stack } from "expo-router";

export default function ChatTab() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <EnhancedChatScreen />
    </>
  );
}
