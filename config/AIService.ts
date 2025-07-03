import { GoogleGenAI } from "@google/genai"
import Voice from "@react-native-community/voice"
import { PermissionsAndroid, Platform } from "react-native"

// Initialize Gemini AI
const genAI = new GoogleGenAI({apiKey:process.env.EXPO_PUBLIC_GEMINI_API_KEY})

export class AIService {
  private static isListening = false
  private static currentCallbacks: {
    onResult?: (text: string) => void
    onError?: (error: string) => void
    onPartialResults?: (text: string) => void
    onVolumeChanged?: (volume: number) => void
  } = {}

  // Text Summarization using Gemini Pro
  static async summarizeText(text: string): Promise<string> {
    try {
      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured")
      }

      console.log("Summarizing text with Gemini...")

      const prompt = `Please provide a concise summary of the following text. Keep it under 100 words and focus on the key points:

${text}`

      const model = await genAI.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
      
      const summary = model.text ?? "";


      console.log("Summary generated successfully")
      return summary.trim()
    } catch (error) {
      console.error("Summarization error:", error)

      // Fallback to simple extractive summary
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
      const summary = sentences.slice(0, 2).join(". ") + "."

      return summary || "Unable to generate summary."
    }
  }

  // Enhanced text processing with Gemini
  static async enhanceNote(text: string, type: "grammar" | "expand" | "simplify"): Promise<string> {
    try {
      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured")
      }


      let prompt = ""
      switch (type) {
        case "grammar":
          prompt = `Please correct the grammar and spelling in the following text while maintaining its original meaning and tone:

${text}`
          break
        case "expand":
          prompt = `Please expand on the following text by adding more detail and context while keeping the same tone:

${text}`
          break
        case "simplify":
          prompt = `Please simplify the following text to make it clearer and easier to understand:

${text}`
          break
      }

      const model = await genAI.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
      return model.text ?? "".trim();
    } catch (error) {
      console.error("Text enhancement error:", error)
      throw new Error("Failed to enhance text")
    }
  }

  // Check and request microphone permissions
  static async checkPermissions(): Promise<boolean> {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
          title: "Microphone Permission",
          message: "This app needs access to microphone for speech recognition.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn("Permission request error:", err)
        return false
      }
    }
    return true // iOS permissions are handled via Info.plist
  }

  // Check if speech recognition is available
  static async isAvailable(): Promise<boolean> {
    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions()
      if (!hasPermission) {
        console.log("Microphone permission not granted")
        return false
      }

      // Check if speech recognition is available on device
      const available = await Voice.isAvailable()
      console.log("Speech recognition available:", available)
      return !!available
    } catch (error) {
      console.error("Speech recognition availability check failed:", error)
      return false
    }
  }

  // Initialize Voice listeners
  private static initializeVoiceListeners() {
    // Remove any existing listeners
    Voice.removeAllListeners()

    // Handle speech start
    Voice.onSpeechStart = (event: any) => {
      console.log("Speech recognition started")
      this.isListening = true
    }

    // Handle partial results for live transcript
    Voice.onSpeechPartialResults = (event: any) => {
      console.log("Partial results:", event.value)
      if (event.value && event.value.length > 0 && this.currentCallbacks.onPartialResults) {
        this.currentCallbacks.onPartialResults(event.value[0])
      }
    }

    // Handle final results
    Voice.onSpeechResults = (event: any) => {
      console.log("Final results:", event.value)
      this.isListening = false
      if (event.value && event.value.length > 0 && this.currentCallbacks.onResult) {
        this.currentCallbacks.onResult(event.value[0])
      }
    }

    // Handle errors
    Voice.onSpeechError = (event: any) => {
      console.error("Speech recognition error:", event.error)
      this.isListening = false
      const errorMessage = this.getErrorMessage(event.error)
      if (this.currentCallbacks.onError) {
        this.currentCallbacks.onError(errorMessage)
      }
    }

    // Handle speech end
    Voice.onSpeechEnd = (event: any) => {
      console.log("Speech recognition ended")
      this.isListening = false
    }

    // Handle volume changes for visual feedback
    Voice.onSpeechVolumeChanged = (event: any) => {
      if (this.currentCallbacks.onVolumeChanged) {
        this.currentCallbacks.onVolumeChanged(event.value)
      }
    }
  }

  // Start listening with callbacks
  static async startListening(
    onResult: (text: string) => void,
    onError: (error: string) => void,
    onPartialResults?: (text: string) => void,
    onVolumeChanged?: (volume: number) => void,
  ): Promise<void> {
    try {
      // Check availability first
      const available = await this.isAvailable()
      if (!available) {
        onError("Speech recognition not available on this device")
        return
      }

      // Stop any existing recognition
      if (this.isListening) {
        await this.stopListening()
      }

      // Set callbacks
      this.currentCallbacks = {
        onResult,
        onError,
        onPartialResults,
        onVolumeChanged,
      }

      // Initialize listeners
      this.initializeVoiceListeners()

      // Start listening with options
      await Voice.start("en-US", {
        EXTRA_LANGUAGE_MODEL: "LANGUAGE_MODEL_FREE_FORM",
        EXTRA_CALLING_PACKAGE: "com.intelliprep.app",
        EXTRA_PARTIAL_RESULTS: true,
        REQUEST_PERMISSIONS_AUTO: true,
      })

      console.log("Speech recognition started successfully")
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      this.isListening = false
      onError("Failed to start speech recognition. Please try again.")
    }
  }

  // Stop listening and clean up
  static async stopListening(): Promise<void> {
    try {
      if (this.isListening) {
        console.log("Stopping speech recognition")
        await Voice.stop()
        this.isListening = false
      }
    } catch (error) {
      console.error("Error stopping speech recognition:", error)
    }
  }

  // Cancel listening (immediate stop)
  static async cancelListening(): Promise<void> {
    try {
      if (this.isListening) {
        console.log("Cancelling speech recognition")
        await Voice.cancel()
        this.isListening = false
      }
    } catch (error) {
      console.error("Error cancelling speech recognition:", error)
    }
  }

  // Destroy speech recognition (for cleanup)
  static async destroyRecognizer(): Promise<void> {
    try {
      await Voice.destroy()
      Voice.removeAllListeners()
      this.isListening = false
      this.currentCallbacks = {}
    } catch (error) {
      console.error("Error destroying speech recognizer:", error)
    }
  }

  // Check if currently listening
  static isCurrentlyListening(): boolean {
    return this.isListening
  }

  // Get user-friendly error messages
  private static getErrorMessage(error: any): string {
    if (!error) return "Unknown speech recognition error"

    const errorCode = error.code || error.message || error

    switch (errorCode) {
      case "1":
      case "network":
        return "Network error. Speech recognition works offline, please try again."
      case "2":
      case "audio":
        return "Audio recording error. Please check microphone permissions."
      case "3":
      case "permission":
        return "Microphone permission denied. Please allow microphone access."
      case "4":
      case "busy":
        return "Speech recognition service is busy. Please try again."
      case "5":
      case "no_match":
        return "No speech was detected. Please speak clearly and try again."
      case "6":
      case "recognizer_busy":
        return "Speech recognizer is busy. Please try again."
      case "7":
      case "insufficient_permissions":
        return "Insufficient permissions for speech recognition."
      case "8":
      case "speech_timeout":
        return "No speech input detected. Please try again."
      case "9":
      case "not_available":
        return "Speech recognition not available on this device."
      default:
        return `Speech recognition error: ${errorCode}`
    }
  }

  // Generate interview questions based on context
  static async generateInterviewQuestions(interviewType: string, context?: string): Promise<string[]> {
    try {
      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured")
      }


      let prompt = `Generate 5 relevant ${interviewType} interview questions.`

      if (context) {
        prompt += ` Consider this context: ${context}`
      }

      prompt += `Please format the response as a numbered list of questions only, without any additional text or explanations.`

      const model = await genAI.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })

      // Parse the response into an array of questions
      const responseText = model.text ?? "";
      const questions = responseText
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((q) => q.length > 0)

      return questions.slice(0, 5) // Ensure we only return 5 questions
    } catch (error) {
      console.error("Question generation error:", error)

      // Fallback questions based on type
      const fallbackQuestions: { [key: string]: string[] } = {
        technical: [
          "Explain the difference between var, let, and const in JavaScript.",
          "How would you optimize a slow database query?",
          "Describe the concept of Big O notation.",
          "What is the difference between REST and GraphQL?",
          "How do you handle error handling in your applications?",
        ],
        behavioral: [
          "Tell me about a time you faced a challenging problem at work.",
          "Describe a situation where you had to work with a difficult team member.",
          "How do you prioritize tasks when you have multiple deadlines?",
          "Tell me about a time you made a mistake and how you handled it.",
          "Describe your ideal work environment.",
        ],
        product: [
          "How would you prioritize features for a new product?",
          "Describe how you would measure the success of a feature.",
          "How do you gather and incorporate user feedback?",
          "Tell me about a time you had to make a decision with incomplete information.",
          "How would you approach launching a product in a new market?",
        ],
      }

      return fallbackQuestions[interviewType.toLowerCase()] || fallbackQuestions.technical
    }
  }
}
