import { ChatScreen } from "@/components/Chat/ChatScreen";
import { Stack } from "expo-router";

export default function ChatTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Anna",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ChatScreen />
    </>
  );
}
