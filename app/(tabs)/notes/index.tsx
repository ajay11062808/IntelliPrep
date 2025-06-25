import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotesHomeScreen() {
  const sampleNotes = [
    { id: '1', title: 'Meeting Notes', preview: 'Discussed project timeline...' },
    { id: '2', title: 'Ideas', preview: 'New app features to implement...' },
    { id: '3', title: 'Shopping List', preview: 'Milk, Bread, Eggs...' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">📝 My Notes</ThemedText>
          <Link href="/notes/create" asChild>
            <Pressable style={styles.createButton}>
              <ThemedText style={styles.createButtonText}>+ New Note</ThemedText>
            </Pressable>
          </Link>
        </ThemedView>
        
        <ThemedView style={styles.notesList}>
          {sampleNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} asChild>
              <Pressable style={styles.noteItem}>
                <ThemedText style={styles.noteTitle}>{note.title}</ThemedText>
                <ThemedText style={styles.notePreview}>{note.preview}</ThemedText>
              </Pressable>
            </Link>
          ))}
        </ThemedView>
        
        {sampleNotes.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No notes yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Tap "New Note" to get started!</ThemedText>
          </ThemedView>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  notePreview: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});
