"use client"

import { Ionicons } from "@expo/vector-icons"
import Voice from "@react-native-voice/voice"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native"
import { useAuth } from "../../../hooks/useAuth"
import { useNotes } from "../../../hooks/useNotes"

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const { notes, updateNote } = useNotes()

  const note = notes.find((n) => n.id === id)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [speechResults, setSpeechResults] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const pulseAnim = useRef(new Animated.Value(1)).current
  const contentInputRef = useRef<TextInput>(null)

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags)
    }
  }, [note])

  // Track changes
  useEffect(() => {
    if (note) {
      const hasChanged =
        title !== note.title ||
        content !== note.content ||
        JSON.stringify(tags.sort()) !== JSON.stringify(note.tags.sort())
      setHasChanges(hasChanged)
    }
  }, [title, content, tags, note])

  useEffect(() => {
    // Initialize Voice
    Voice.onSpeechStart = onSpeechStart
    Voice.onSpeechRecognized = onSpeechRecognized
    Voice.onSpeechEnd = onSpeechEnd
    Voice.onSpeechError = onSpeechError
    Voice.onSpeechResults = onSpeechResults
    Voice.onSpeechPartialResults = onSpeechPartialResults

    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  const onSpeechStart = () => console.log("Speech recognition started")
  const onSpeechRecognized = () => console.log("Speech recognized")
  const onSpeechEnd = () => setIsRecording(false)

  const onSpeechError = (error: any) => {
    console.log("Speech error:", error)
    setIsRecording(false)
    Alert.alert("Speech Recognition Error", "Please try again.")
  }

  const onSpeechResults = (event: any) => {
    setSpeechResults(event.value)
    if (event.value && event.value.length > 0) {
      const recognizedText = event.value[0]
      setContent((prev) => prev + (prev ? " " : "") + recognizedText)
    }
  }

  const onSpeechPartialResults = (event: any) => {
    setSpeechResults(event.value)
  }

  const startRecording = async () => {
    try {
      await Voice.start("en-US")
      setIsRecording(true)
    } catch (error) {
      console.log("Error starting voice recognition:", error)
      Alert.alert("Error", "Could not start voice recognition")
    }
  }

  const stopRecording = async () => {
    try {
      await Voice.stop()
      setIsRecording(false)
    } catch (error) {
      console.log("Error stopping voice recognition:", error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!user || !note) {
      Alert.alert("Error", "Unable to save note")
      return
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your note")
      return
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please add some content to your note")
      return
    }

    setSaving(true)
    try {
      await updateNote(note.id, {
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : ["general"],
      })

      Alert.alert("Success", "Note updated successfully!", [{ text: "OK", onPress: () => router.back() }])
    } catch (error) {
      Alert.alert("Error", "Failed to update note. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert("Unsaved Changes", "You have unsaved changes. What would you like to do?", [
        { text: "Discard", style: "destructive", onPress: () => router.back() },
        { text: "Save", onPress: handleSave },
        { text: "Cancel", style: "cancel" },
      ])
    } else {
      router.back()
    }
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Please Sign In</Text>
        <Text className="text-gray-500 text-center">Sign in to edit notes</Text>
      </View>
    )
  }

  if (!note) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
        <Text className="text-xl font-semibold text-gray-500 mt-4">Note Not Found</Text>
        <Pressable className="bg-indigo-600 px-6 py-3 rounded-xl mt-4" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    )
  }

  const suggestedTags = ["work", "personal", "ideas", "meeting", "todo", "important"]

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Pressable className="p-2 -ml-2" onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-lg font-semibold text-gray-900">Edit Note</Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-5">
          {/* Title Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">Title</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter note title..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              onSubmitEditing={() => contentInputRef.current?.focus()}
            />
          </View>

          {/* Content Input with Speech-to-Text */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-semibold text-gray-700">Content</Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  className={`w-11 h-11 rounded-full justify-center items-center border-2 ${
                    isRecording ? "bg-red-500 border-red-500" : "bg-blue-50 border-indigo-600"
                  }`}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Ionicons name={isRecording ? "stop" : "mic"} size={18} color={isRecording ? "#fff" : "#6366F1"} />
                </Pressable>
              </Animated.View>
            </View>

            <TextInput
              ref={contentInputRef}
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900 min-h-[120px]"
              value={content}
              onChangeText={setContent}
              placeholder="Write your note here or use voice input..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />

            {isRecording && (
              <View className="bg-red-50 rounded-lg p-3 mt-2 flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-600 font-medium mr-2">Listening...</Text>
                {speechResults.length > 0 && <Text className="flex-1 text-gray-600 italic">{speechResults[0]}</Text>}
              </View>
            )}
          </View>

          {/* Tags Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">Tags</Text>

            {/* Current Tags */}
            {tags.length > 0 && (
              <View className="flex-row flex-wrap mb-3">
                {tags.map((tag) => (
                  <View key={tag} className="bg-indigo-100 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center">
                    <Text className="text-indigo-700 font-medium text-sm">{tag}</Text>
                    <Pressable className="ml-2" onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={14} color="#6366F1" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Tag Input */}
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl">
              <TextInput
                className="flex-1 px-4 py-4 text-base text-gray-900"
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tags..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <Pressable className="p-4" onPress={addTag}>
                <Ionicons name="add" size={18} color="#6366F1" />
              </Pressable>
            </View>

            {/* Suggested Tags */}
            <View className="mt-3">
              <Text className="text-sm text-gray-500 mb-2">Suggested:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {suggestedTags
                  .filter((tag) => !tags.includes(tag))
                  .map((tag) => (
                    <Pressable
                      key={tag}
                      className="bg-gray-100 rounded-full px-3 py-2 mr-2"
                      onPress={() => setTags([...tags, tag])}
                    >
                      <Text className="text-gray-600 text-sm">{tag}</Text>
                    </Pressable>
                  ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="flex-row px-5 py-4 bg-white border-t border-gray-200">
        <Pressable
          className="flex-1 py-4 rounded-xl bg-gray-100 items-center mr-3"
          onPress={handleBack}
          disabled={saving}
        >
          <Text className="text-gray-600 font-semibold text-base">Cancel</Text>
        </Pressable>

        <Pressable
          className={`flex-2 py-4 rounded-xl items-center flex-row justify-center ${
            hasChanges ? "bg-indigo-600" : "bg-gray-300"
          }`}
          onPress={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                {hasChanges ? "Save Changes" : "No Changes"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
