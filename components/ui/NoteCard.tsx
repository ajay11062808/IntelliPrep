import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import type { Note } from "../../stores/notesStore"

interface NoteCardProps {
  note: Note
  onPress: () => void
  onToggleFavorite: () => void
  onDelete: () => void
}

const { width } = Dimensions.get("window")

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onToggleFavorite, onDelete }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onToggleFavorite} style={styles.actionButton}>
            <Ionicons
              name={note.is_favorite ? "heart" : "heart-outline"}
              size={20}
              color={note.is_favorite ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {note.content}
      </Text>

      {note.summary && (
        <View style={styles.summaryContainer}>
          <Ionicons name="sparkles" size={14} color="#4A90E2" />
          <Text style={styles.summary} numberOfLines={2}>
            {note.summary}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.tags}>
          {note.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {note.tags.length > 2 && <Text style={styles.moreTagsText}>+{note.tags.length - 2}</Text>}
        </View>

        <View style={styles.metadata}>
          {note.is_from_interview && <Ionicons name="mic" size={14} color="#4A90E2" />}
          <Text style={styles.date}>{new Date(note.updated_at).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F8FF",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  summary: {
    fontSize: 12,
    color: "#4A90E2",
    marginLeft: 6,
    flex: 1,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tag: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: "#4A90E2",
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 10,
    color: "#999",
    fontWeight: "500",
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 10,
    color: "#999",
    marginLeft: 4,
  },
})
