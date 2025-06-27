import { Stack } from "expo-router"

export default function NotesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "My Notes",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Note",
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Note Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}
