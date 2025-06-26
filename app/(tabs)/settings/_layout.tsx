import { Stack } from 'expo-router';


export default function IntelliAILayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Settings',
          headerShown: true,
        }} 
      />
      {/* <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'AI Settings',
          headerShown: true,
        }} 
      /> */}
    </Stack>
  );
}
