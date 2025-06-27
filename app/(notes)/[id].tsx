"use client"

import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Dimensions, Pressable, ScrollView, Share, Text, View } from "react-native"
import { useAuth } from "../../hooks/useAuth"
import { useNotes } from "../../hooks/useNotes"

const { width } = Dimensions.get("window")

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const { notes, deleteNote, summarizeNote } = useNotes()
  const [summarizing, setSummarizing] = useState(false)

  const note = notes.find((n) => n.id === id)

  useEffect(() => {
    if (!note && notes.length > 0) {
      // Note not found, go back
      Alert.alert("Note Not Found", "This note may have been deleted.", [{ text: "OK", onPress: () => router.back() }])
    }
  }, [note, notes])

  const handleDelete = () => {
    if (!note) return

    Alert.alert("Delete Note", `Are you sure you want to delete "${note.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(note.id)
            router.back()
          } catch (error) {
            Alert.alert("Error", "Failed to delete note")
          }
        },
      },
    ])
  }

  const handleShare = async () => {
    if (!note) return

    try {
      const shareContent = `${note.title}\n\n${note.content}\n\n---\nShared from IntelliPrep Notes`
      await Share.share({
        message: shareContent,
        title: note.title,
      })
    } catch (error) {
      console.error("Error sharing note:", error)
    }
  }

  const handleSummarize = async () => {
    if (!note) return

    setSummarizing(true)
    try {
      await summarizeNote(note.id)
    } catch (error) {
      Alert.alert("Error", "Failed to summarize note")
    } finally {
      setSummarizing(false)
    }
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Please Sign In</Text>
        <Text className="text-gray-500 text-center">Sign in to view your notes</Text>
      </View>
    )
  }

  if (!note) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-600 mt-4">Loading note...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Pressable className="p-2 -ml-2" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>

          <View className="flex-row items-center space-x-2">
            {/* Summarize Button */}
            <Pressable className="p-2 rounded-lg bg-blue-50" onPress={handleSummarize} disabled={summarizing}>
              {summarizing ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Ionicons name="sparkles" size={20} color="#6366F1" />
              )}
            </Pressable>

            {/* Share Button */}
            <Pressable className="p-2 rounded-lg bg-gray-100" onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#64748B" />
            </Pressable>

            {/* Edit Button */}
            <Pressable className="p-2 rounded-lg bg-gray-100" onPress={() => router.push(`/(notes)/edit/${note.id}`)}>
              <Ionicons name="pencil" size={20} color="#64748B" />
            </Pressable>

            {/* Delete Button */}
            <Pressable className="p-2 rounded-lg bg-red-50" onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Title and Metadata */}
          <View className="mb-6">
            <View className="flex-row items-start justify-between mb-3">
              <Text className="text-2xl font-bold text-gray-900 flex-1 mr-4">{note.title}</Text>
              {note.source === "intelliprep" && (
                <View className="bg-indigo-600 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="mic" size={12} color="#fff" />
                  <Text className="text-white text-xs font-medium ml-1">IntelliPrep</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  Created {note.createdAt.toDate().toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  Updated {note.updatedAt.toDate().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Summary */}
          {note.summary && (
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="sparkles" size={16} color="#3B82F6" />
                <Text className="text-blue-700 font-semibold ml-2">AI Summary</Text>
              </View>
              <Text className="text-blue-800 leading-6">{note.summary}</Text>
            </View>
          )}

          {/* Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-gray-900 text-base leading-7" selectable>
              {note.content}
            </Text>
          </View>

          {/* Tags */}
          {note.tags.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3">Tags</Text>
              <View className="flex-row flex-wrap">
                {note.tags.map((tag) => (
                  <View key={tag} className="bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2">
                    <Text className="text-gray-700 font-medium">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Interview Info (if applicable) */}
          {note.source === "intelliprep" && note.interviewId && (
            <View className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="mic" size={16} color="#6366F1" />
                <Text className="text-indigo-700 font-semibold ml-2">Interview Session</Text>
              </View>
              <Text className="text-indigo-600 text-sm">Session ID: {note.interviewId}</Text>
              <Text className="text-indigo-600 text-sm mt-1">
                This note was automatically generated from an IntelliPrep interview session.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
