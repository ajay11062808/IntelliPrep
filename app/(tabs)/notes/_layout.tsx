import { Stack } from 'expo-router';

export default function NotesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'My Notes',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Create Note',
          headerShown: true,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Note Details',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
