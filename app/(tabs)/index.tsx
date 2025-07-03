"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { AIService } from "../../config/AIService"
import { useNotesStore } from "../../stores/notesStore"

export default function NotesScreen() {
  const {
    notes,
    searchQuery,
    isLoading,
    isProcessingAI,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    setSearchQuery,
    error,
    clearError,
  } = useNotesStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [showAIMenu, setShowAIMenu] = useState<string | null>(null)

  // Speech recognition states
  const [isRecording, setIsRecording] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // AI Suggestion states
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [suggestionType, setSuggestionType] = useState<"summary" | "grammar" | "expand" | "simplify" | null>(null)
  const [suggestionText, setSuggestionText] = useState("")
  const [originalText, setOriginalText] = useState("")
  const [suggestionNoteId, setSuggestionNoteId] = useState<string | null>(null)

  // Animation for microphone
  const micScale = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    fetchNotes()

    // Cleanup speech recognition on unmount
    return () => {
      AIService.destroyRecognizer()
    }
  }, [])

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error)
      clearError()
    }
  }, [error])

  // Animate microphone when recording
  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isRecording])

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

  // AI suggestion handlers
  const handleSummarizeNote = async (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return

    setShowAIMenu(null)
    setSuggestionNoteId(id)
    setSuggestionType("summary")
    setOriginalText(note.content)

    try {
      const summary = await AIService.summarizeText(note.content)
      setSuggestionText(summary)
      setShowSuggestionModal(true)
    } catch (error) {
      Alert.alert("Error", "Failed to generate summary. Please try again.")
    }
  }

  const handleEnhanceNote = async (id: string, type: "grammar" | "expand" | "simplify") => {
    const note = notes.find((n) => n.id === id)
    if (!note) return

    setShowAIMenu(null)
    setSuggestionNoteId(id)
    setSuggestionType(type)
    setOriginalText(note.content)

    try {
      const enhancedText = await AIService.enhanceNote(note.content, type)
      setSuggestionText(enhancedText)
      setShowSuggestionModal(true)
    } catch (error) {
      Alert.alert("Error", `Failed to ${type} text. Please try again.`)
    }
  }

  const handleAcceptSuggestion = async () => {
    if (!suggestionNoteId || !suggestionType) return

    if (suggestionType === "summary") {
      await updateNote(suggestionNoteId, { summary: suggestionText })
    } else {
      await updateNote(suggestionNoteId, { content: suggestionText })
    }

    setShowSuggestionModal(false)
    setSuggestionText("")
    setSuggestionType(null)
    setSuggestionNoteId(null)
    setOriginalText("")
  }

  const handleRejectSuggestion = () => {
    setShowSuggestionModal(false)
    setSuggestionText("")
    setSuggestionType(null)
    setSuggestionNoteId(null)
    setOriginalText("")
  }

  // Speech recognition handlers
  const handleStartSpeechRecognition = async () => {
    try {
      const isAvailable = await AIService.isAvailable()
      if (!isAvailable) {
        Alert.alert(
          "Speech Recognition",
          "Speech recognition is not available on this device or microphone permission is denied.",
        )
        return
      }

      setInterimTranscript("")
      setFinalTranscript("")
      setIsRecording(true)
      setShowTranscriptModal(true)

      await AIService.startListening(
        (finalText) => {
          // Handle final results
          console.log("Final transcript:", finalText)
          setFinalTranscript(finalText)
          setIsRecording(false)
        },
        (error) => {
          // Handle errors
          console.error("Speech error:", error)
          setIsRecording(false)
          setShowTranscriptModal(false)
          Alert.alert("Speech Recognition Error", error)
        },
        (partialText) => {
          // Handle partial results for live transcript
          console.log("Partial transcript:", partialText)
          setInterimTranscript(partialText)
        },
        (volume) => {
          // Handle volume changes for visual feedback
          setAudioLevel(volume)
        },
      )
    } catch (error) {
      setIsRecording(false)
      setShowTranscriptModal(false)
      Alert.alert("Error", "Failed to start speech recognition")
    }
  }

  const handleStopSpeechRecognition = async () => {
    setIsRecording(false)
    await AIService.stopListening()
  }

  const handleAcceptTranscript = () => {
    const textToAdd = finalTranscript || interimTranscript
    if (textToAdd.trim()) {
      setNewNoteContent((prev) => {
        const newContent = prev ? prev + "\n\n" + textToAdd : textToAdd
        return newContent
      })
    }
    setShowTranscriptModal(false)
    setInterimTranscript("")
    setFinalTranscript("")
  }

  const handleRejectTranscript = () => {
    setShowTranscriptModal(false)
    setInterimTranscript("")
    setFinalTranscript("")
  }

  const renderAIMenu = (noteId: string) => (
    <Modal visible={showAIMenu === noteId} transparent animationType="fade" onRequestClose={() => setShowAIMenu(null)}>
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={() => setShowAIMenu(null)}
      >
        <View className="bg-white rounded-2xl p-6 mx-8 w-80">
          <Text className="text-lg font-bold text-gray-800 mb-4 text-center">AI Tools</Text>

          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => handleSummarizeNote(noteId)}
            disabled={isProcessingAI}
          >
            <Ionicons name="sparkles" size={20} color="#4A90E2" />
            <Text className="text-base text-gray-800 ml-3 flex-1">Generate Summary</Text>
            {isProcessingAI && (
              <View className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => handleEnhanceNote(noteId, "grammar")}
            disabled={isProcessingAI}
          >
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-base text-gray-800 ml-3 flex-1">Fix Grammar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => handleEnhanceNote(noteId, "expand")}
            disabled={isProcessingAI}
          >
            <Ionicons name="add-circle" size={20} color="#F59E0B" />
            <Text className="text-base text-gray-800 ml-3 flex-1">Expand Content</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => handleEnhanceNote(noteId, "simplify")}
            disabled={isProcessingAI}
          >
            <Ionicons name="remove-circle" size={20} color="#EF4444" />
            <Text className="text-base text-gray-800 ml-3 flex-1">Simplify Text</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-100 rounded-xl py-3 mt-4" onPress={() => setShowAIMenu(null)}>
            <Text className="text-center text-gray-600 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  const renderSuggestionModal = () => (
    <Modal visible={showSuggestionModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleRejectSuggestion}>
            <Text className="text-base text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            AI{" "}
            {suggestionType === "summary"
              ? "Summary"
              : suggestionType === "grammar"
                ? "Grammar Fix"
                : suggestionType === "expand"
                  ? "Expanded Content"
                  : "Simplified Text"}
          </Text>
          <TouchableOpacity onPress={handleAcceptSuggestion}>
            <Text className="text-base text-green-600 font-semibold">Accept</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2">Original Text:</Text>
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-gray-800 leading-6">{originalText}</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2">AI Suggestion:</Text>
            <View className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Text className="text-gray-800 leading-6">{suggestionText}</Text>
            </View>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-gray-100 py-3 rounded-lg" onPress={handleRejectSuggestion}>
              <Text className="text-center text-gray-700 font-medium">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-green-600 py-3 rounded-lg" onPress={handleAcceptSuggestion}>
              <Text className="text-center text-white font-medium">Accept & Apply</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )

  const renderTranscriptModal = () => (
    <Modal visible={showTranscriptModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleRejectTranscript}>
            <Text className="text-base text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Speech to Text</Text>
          <TouchableOpacity onPress={handleAcceptTranscript} disabled={!finalTranscript && !interimTranscript}>
            <Text
              className={`text-base font-semibold ${finalTranscript || interimTranscript ? "text-green-600" : "text-gray-400"}`}
            >
              Accept
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-4">
          {/* Microphone Visual Feedback */}
          <View className="items-center mb-8">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
              className={`w-24 h-24 rounded-full items-center justify-center ${
                isRecording ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={40}
                color={isRecording ? "#EF4444" : "#4A90E2"}
              />
            </Animated.View>

            <Text className={`mt-4 text-lg font-medium ${isRecording ? "text-red-600" : "text-blue-600"}`}>
              {isRecording ? "Listening..." : "Tap microphone to start"}
            </Text>

            {/* Audio Level Indicator */}
            {isRecording && (
              <View className="w-32 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <View
                  className="h-full bg-red-500 rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                />
              </View>
            )}
          </View>

          {/* Transcript Display */}
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              {isRecording ? "Live Transcript:" : "Final Transcript:"}
            </Text>

            <ScrollView className="flex-1 bg-gray-50 p-4 rounded-lg">
              <Text className="text-base text-gray-800 leading-6">
                {isRecording ? interimTranscript : finalTranscript}
                {isRecording && !interimTranscript && <Text className="text-gray-400 italic">Start speaking...</Text>}
              </Text>
            </ScrollView>
          </View>

          {/* Control Buttons */}
          <View className="flex-row justify-center mt-6 space-x-4">
            {isRecording ? (
              <TouchableOpacity
                className="bg-red-500 px-8 py-3 rounded-lg flex-row items-center"
                onPress={handleStopSpeechRecognition}
              >
                <Ionicons name="stop" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Stop Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="bg-blue-500 px-8 py-3 rounded-lg flex-row items-center"
                onPress={handleStartSpeechRecognition}
              >
                <Ionicons name="mic" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Start Recording</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )

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
          <TouchableOpacity onPress={() => setShowAIMenu(item.id)} className="p-1 ml-2">
            <Ionicons name="sparkles" size={20} color="#4A90E2" />
          </TouchableOpacity>
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

      {item.summary && (
        <View className="bg-blue-50 p-3 rounded-lg mb-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="sparkles" size={14} color="#4A90E2" />
            <Text className="text-xs font-medium text-blue-700 ml-1">AI Summary</Text>
          </View>
          <Text className="text-sm text-blue-800 leading-5">{item.summary}</Text>
        </View>
      )}

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

      {renderAIMenu(item.id)}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">My Notes</Text>
        <View className="flex-row">
          {isProcessingAI && (
            <View className="flex-row items-center mr-4">
              <View className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              <Text className="text-sm text-primary">AI Processing...</Text>
            </View>
          )}
          <TouchableOpacity className="p-2" onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
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
                if (isRecording) {
                  AIService.stopListening()
                  setIsRecording(false)
                }
              }}
            >
              <Text className="text-base text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">{editingNote ? "Edit Note" : "New Note"}</Text>
            <TouchableOpacity onPress={handleCreateNote}>
              <Text className="text-base text-primary font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <TextInput
              className="text-xl font-semibold text-gray-800 py-3 border-b border-gray-200 mb-4"
              placeholder="Note title..."
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />

            <TextInput
              className="flex-1 text-base text-gray-800 leading-6 min-h-96"
              placeholder="Start writing your note or use voice input..."
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Voice Input Button */}
          <View className="flex-row items-center justify-center py-4 bg-gray-50 border-t border-gray-200">
            <TouchableOpacity
              className="flex-row items-center px-6 py-3 rounded-lg bg-blue-100"
              onPress={handleStartSpeechRecognition}
              disabled={isProcessingAI}
            >
              <Ionicons name="mic-outline" size={20} color="#4A90E2" />
              <Text className="text-sm font-medium ml-2 text-blue-600">Add Voice Note</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Render Modals */}
      {renderSuggestionModal()}
      {renderTranscriptModal()}
    </SafeAreaView>
  )
}
