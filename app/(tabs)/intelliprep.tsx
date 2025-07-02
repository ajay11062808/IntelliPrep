"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export default function IntelliPrepScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isInterviewActive, setIsInterviewActive] = useState(false)

  const interviewCategories = [
    {
      id: "technical",
      title: "Technical Interview",
      description: "Coding, algorithms, and system design questions",
      icon: "code-slash",
      color: "#4A90E2",
    },
    {
      id: "behavioral",
      title: "Behavioral Interview",
      description: "Leadership, teamwork, and situational questions",
      icon: "people",
      color: "#50C878",
    },
    {
      id: "product",
      title: "Product Management",
      description: "Product strategy, metrics, and case studies",
      icon: "bulb",
      color: "#FF6B6B",
    },
    {
      id: "design",
      title: "Design Interview",
      description: "UX/UI design process and portfolio review",
      icon: "color-palette",
      color: "#9B59B6",
    },
  ]

  const handleStartInterview = () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select an interview category")
      return
    }

    setIsInterviewActive(true)
    // TODO: Initialize AI interview session
    Alert.alert(
      "Coming Soon!",
      "AI Interview feature will be implemented in the next phase. This will include:\n\n• Resume-based question generation\n• Real-time conversation\n• Performance analysis\n• Automatic note taking",
    )
  }

  const handleEndInterview = () => {
    setIsInterviewActive(false)
    setSelectedCategory(null)
    setUserInput("")
    // TODO: Save interview notes to Notes tab
  }

  const renderCategoryCard = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, selectedCategory === category.id && styles.categoryCardSelected]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
        <Ionicons name={category.icon as any} size={24} color={category.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      {selectedCategory === category.id && <Ionicons name="checkmark-circle" size={24} color={category.color} />}
    </TouchableOpacity>
  )

  if (isInterviewActive) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View style={styles.interviewHeader}>
          <Text style={styles.interviewTitle}>AI Interview Session</Text>
          <TouchableOpacity style={styles.endButton} onPress={handleEndInterview}>
            <Text style={styles.endButtonText}>End Interview</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.chatContainer}>
          <View style={styles.messageContainer}>
            <View style={styles.aiMessage}>
              <Text style={styles.messageText}>
                Hello! I'm your AI interviewer. Let's start with a simple question: Can you tell me about yourself and
                your background?
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your response..."
            value={userInput}
            onChangeText={setUserInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>IntelliPrep AI</Text>
          <Text style={styles.subtitle}>Practice interviews with AI and get personalized feedback</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Interview Type</Text>
          <View style={styles.categoriesContainer}>{interviewCategories.map(renderCategoryCard)}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Context (Optional)</Text>
          <TextInput
            style={styles.contextInput}
            placeholder="Paste your resume, job description, or specific topics you'd like to focus on..."
            value={userInput}
            onChangeText={setUserInput}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.startButton, !selectedCategory && styles.startButtonDisabled]}
          onPress={handleStartInterview}
          disabled={!selectedCategory}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" style={styles.startButtonIcon} />
          <Text style={styles.startButtonText}>Start AI Interview</Text>
        </TouchableOpacity>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What to Expect</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#50C878" />
              <Text style={styles.featureText}>Personalized questions based on your background</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#50C878" />
              <Text style={styles.featureText}>Real-time feedback and suggestions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#50C878" />
              <Text style={styles.featureText}>Automatic note-taking and summary</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#50C878" />
              <Text style={styles.featureText}>Performance analytics and improvement tips</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 27,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryCardSelected: {
    borderColor: "#4A90E2",
    backgroundColor: "#F0F8FF",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  contextInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1A1A1A",
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  featuresSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  // Interview Active Styles
  interviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  interviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  endButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  aiMessage: {
    backgroundColor: "#E8F4FD",
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})
