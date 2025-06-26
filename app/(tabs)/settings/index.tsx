import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function SettingsScreen() {
  return (
    <ThemedView className='flex-1 justify-center items-center'>
      <ThemedText className='bg-red-500'>User Settings (change name, email, etc. coming soon)</ThemedText>
    </ThemedView>
  );
}