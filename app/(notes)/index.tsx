"use client"

import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useMemo, useState } from "react"
import { ActivityIndicator, Alert, Dimensions, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { useAuth } from "../../hooks/useAuth"
import { useNotes } from "../../hooks/useNotes"

const { width } = Dimensions.get("window")

export default function NotesHomeScreen() {
  const { user } = useAuth()
  const { notes, loading, deleteNote, summarizeNote } = useNotes()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [summarizing, setSummarizing] = useState<string | null>(null)

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => note.tags.includes(tag))

      return matchesSearch && matchesTags
    })

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return b.updatedAt.toMillis() - a.updatedAt.toMillis()
      }
      return a.title.localeCompare(b.title)
    })
  }, [notes, searchQuery, selectedTags, sortBy])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    notes.forEach((note) => note.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags)
  }, [notes])

  const handleDeleteNote = (id: string, title: string) => {
    Alert.alert("Delete Note", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(id)
          } catch (error) {
            Alert.alert("Error", "Failed to delete note")
          }
        },
      },
    ])
  }

  const handleSummarizeNote = async (id: string) => {
    setSummarizing(id)
    try {
      await summarizeNote(id)
    } catch (error) {
      Alert.alert("Error", "Failed to summarize note")
    } finally {
      setSummarizing(null)
    }
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Please Sign In</Text>
        <Text className="text-gray-500 text-center mb-6">Sign in to access your notes and sync across devices</Text>
        <Link href="../auth/signin" asChild>
          <Pressable className="bg-indigo-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </Pressable>
        </Link>
      </View>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-600 mt-4">Loading your notes...</Text>
      </View>
    )
  }

  const NoteCard = ({ note, index }: { note: any; index: number }) => (
    <View
      className={`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 ${
        viewMode === "grid" ? "w-[48%]" : "w-full"
      }`}
    >
      <Link href={`/(notes)/${note.id}`} asChild>
        <Pressable className="flex-1">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-base font-semibold text-gray-900 flex-1 mr-2" numberOfLines={2}>
              {note.title}
            </Text>
            {note.source === "intelliprep" && (
              <View className="bg-indigo-600 px-2 py-1 rounded-lg flex-row items-center">
                <Ionicons name="mic" size={10} color="#fff" />
                <Text className="text-white text-xs font-medium ml-1">AI</Text>
              </View>
            )}
          </View>

          <Text className="text-sm text-gray-600 leading-5 mb-3" numberOfLines={3}>
            {note.content}
          </Text>

          {note.summary && (
            <View className="bg-blue-50 p-2 rounded-lg mb-3 flex-row items-start">
              <Ionicons name="sparkles" size={12} color="#3B82F6" />
              <Text className="text-blue-700 text-xs flex-1 ml-2 italic" numberOfLines={2}>
                {note.summary}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              {note.tags.slice(0, 2).map((tag: string) => (
                <View key={tag} className="bg-gray-100 px-2 py-1 rounded-full mr-1">
                  <Text className="text-gray-600 text-xs font-medium">{tag}</Text>
                </View>
              ))}
              {note.tags.length > 2 && (
                <Text className="text-gray-400 text-xs font-medium">+{note.tags.length - 2}</Text>
              )}
            </View>

            <Text className="text-gray-400 text-xs">{note.updatedAt.toDate().toLocaleDateString()}</Text>
          </View>
        </Pressable>
      </Link>

      <View className="flex-row justify-end items-center mt-3 pt-3 border-t border-gray-100">
        <Pressable
          className="p-2 rounded-lg bg-gray-50 mr-2"
          onPress={() => handleSummarizeNote(note.id)}
          disabled={summarizing === note.id}
        >
          {summarizing === note.id ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Ionicons name="sparkles" size={14} color="#6366F1" />
          )}
        </Pressable>

        <Pressable className="p-2 rounded-lg bg-gray-50 mr-2" onPress={() => router.push(`/(notes)/edit/${note.id}`)}>
          <Ionicons name="pencil" size={14} color="#64748B" />
        </Pressable>

        <Pressable className="p-2 rounded-lg bg-red-50" onPress={() => handleDeleteNote(note.id, note.title)}>
          <Ionicons name="trash" size={14} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">My Notes</Text>
          <View className="flex-row items-center">
            <Pressable
              className="p-2 rounded-lg bg-gray-100 mr-3"
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              <Ionicons name={viewMode === "grid" ? "list" : "grid"} size={18} color="#64748B" />
            </Pressable>

            <Link href="/(notes)/create" asChild>
              <Pressable className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center">
                <Ionicons name="add" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">New</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="bg-white px-5 pb-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-3">
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            className={`px-4 py-2 rounded-full mr-2 ${selectedTags.length === 0 ? "bg-indigo-600" : "bg-gray-100"}`}
            onPress={() => setSelectedTags([])}
          >
            <Text className={`font-medium ${selectedTags.length === 0 ? "text-white" : "text-gray-600"}`}>All</Text>
          </Pressable>

          {allTags.map((tag) => (
            <Pressable
              key={tag}
              className={`px-4 py-2 rounded-full mr-2 ${selectedTags.includes(tag) ? "bg-indigo-600" : "bg-gray-100"}`}
              onPress={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag))
                } else {
                  setSelectedTags([...selectedTags, tag])
                }
              }}
            >
              <Text className={`font-medium ${selectedTags.includes(tag) ? "text-white" : "text-gray-600"}`}>
                {tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Notes List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredNotes.length === 0 ? (
          <View className="flex-1 justify-center items-center py-16">
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text className="text-xl font-semibold text-gray-500 mt-4 mb-2">
              {searchQuery || selectedTags.length > 0 ? "No matching notes" : "No notes yet"}
            </Text>
            <Text className="text-gray-400 text-center mb-6 px-8">
              {searchQuery || selectedTags.length > 0
                ? "Try adjusting your search or filters"
                : "Create your first note or start an IntelliPrep interview"}
            </Text>
            {!searchQuery && selectedTags.length === 0 && (
              <Link href="/(notes)/create" asChild>
                <Pressable className="bg-indigo-600 px-6 py-3 rounded-xl">
                  <Text className="text-white font-semibold">Create Note</Text>
                </Pressable>
              </Link>
            )}
          </View>
        ) : (
          <View className={`py-5 ${viewMode === "grid" ? "flex-row flex-wrap justify-between" : "flex-col"}`}>
            {filteredNotes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
