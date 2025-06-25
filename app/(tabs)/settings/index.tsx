import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function SettingsScreen() {
  return (
    <ThemedView className='flex-1 justify-center items-center bg-red px-3' >
      <ThemedText>User Settings (change name, email, etc. coming soon)</ThemedText>
    </ThemedView>
  );
}