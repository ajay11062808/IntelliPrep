"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useNotesStore } from "../../stores/notesStore"

export default function NotesScreen() {
  const { notes, searchQuery, isLoading, fetchNotes, addNote, updateNote, deleteNote, toggleFavorite, setSearchQuery } =
    useNotesStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")

  useEffect(() => {
    fetchNotes()
  }, [])

  // Filter notes based on search
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      Alert.alert("Error", "Please enter a title for your note")
      return
    }

    const noteData = {
      title: newNoteTitle,
      content: newNoteContent,
      tags: [],
      is_from_interview: false,
      is_favorite: false,
    }

    if (editingNote) {
      await updateNote(editingNote, noteData)
    } else {
      await addNote(noteData)
    }

    setNewNoteTitle("")
    setNewNoteContent("")
    setShowCreateModal(false)
    setEditingNote(null)
  }

  const handleDeleteNote = (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteNote(id) },
    ])
  }

  const handleEditNote = (note: any) => {
    setEditingNote(note.id)
    setNewNoteTitle(note.title)
    setNewNoteContent(note.content)
    setShowCreateModal(true)
  }

  const renderNoteCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mx-4 my-2 shadow-sm border border-gray-100"
      onPress={() => handleEditNote(item)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} className="p-1 ml-2">
            <Ionicons
              name={item.is_favorite ? "heart" : "heart-outline"}
              size={20}
              color={item.is_favorite ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteNote(item.id)} className="p-1 ml-2">
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-sm text-gray-600 leading-5 mb-3" numberOfLines={3}>
        {item.content}
      </Text>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {item.is_from_interview && (
            <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full mr-2">
              <Ionicons name="mic" size={12} color="#4A90E2" />
              <Text className="text-xs text-primary font-medium ml-1">Interview</Text>
            </View>
          )}
          {item.is_favorite && (
            <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full">
              <Ionicons name="heart" size={12} color="#FF6B6B" />
              <Text className="text-xs text-red-500 font-medium ml-1">Favorite</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-400">{new Date(item.updated_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">My Notes</Text>
        <TouchableOpacity className="p-2" onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white mx-4 my-3 px-3 rounded-xl shadow-sm border border-gray-100">
        <Ionicons name="search" size={20} color="#666" className="mr-2" />
        <TextInput
          className="flex-1 py-3 text-base text-gray-800"
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => item.id}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchNotes} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text className="text-lg font-semibold text-gray-600 mt-4">No notes yet</Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">Tap the + button to create your first note</Text>
          </View>
        }
      />

      {/* Create/Edit Note Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false)
                setEditingNote(null)
                setNewNoteTitle("")
                setNewNoteContent("")
              }}
            >
              <Text className="text-base text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">{editingNote ? "Edit Note" : "New Note"}</Text>
            <TouchableOpacity onPress={handleCreateNote}>
              <Text className="text-base text-primary font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 p-4">
            <TextInput
              className="text-xl font-semibold text-gray-800 py-3 border-b border-gray-200 mb-4"
              placeholder="Note title..."
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />

            <TextInput
              className="flex-1 text-base text-gray-800 leading-6"
              placeholder="Start writing your note..."
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}
