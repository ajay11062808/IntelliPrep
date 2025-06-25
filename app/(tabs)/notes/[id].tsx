import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  
  // In a real app, you'd fetch the note data based on the ID
  const sampleNotes = {
    '1': {
      title: 'Meeting Notes',
      content: 'Discussed project timeline and deliverables.\n\nKey points:\n- Launch date: Q2 2024\n- Team size: 5 developers\n- Budget approved\n- Weekly standup meetings',
      createdAt: '2024-01-15',
    },
    '2': {
      title: 'Ideas',
      content: 'New app features to implement:\n\n1. Dark mode support\n2. Offline sync\n3. Push notifications\n4. User profiles\n5. Social sharing',
      createdAt: '2024-01-14',
    },
    '3': {
      title: 'Shopping List',
      content: 'Grocery items needed:\n\n- Milk (2%)\n- Bread (whole wheat)\n- Eggs (dozen)\n- Bananas\n- Chicken breast\n- Rice\n- Vegetables',
      createdAt: '2024-01-13',
    },
  };

  const note = sampleNotes[id as keyof typeof sampleNotes];

  if (!note) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Note not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {note.title}
          </ThemedText>
          <ThemedText style={styles.date}>
            Created: {note.createdAt}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.contentContainer}>
          <ThemedText style={styles.noteContent}>
            {note.content}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.actions}>
          <Pressable style={styles.editButton}>
            <ThemedText style={styles.editButtonText}>✏️ Edit</ThemedText>
          </Pressable>
          
          <Pressable style={styles.shareButton}>
            <ThemedText style={styles.shareButtonText}>📤 Share</ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
  },
  contentContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
