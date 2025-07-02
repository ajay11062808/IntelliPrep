"use client"

import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { EmailConfirmationStatus } from "../../components/EmailConfirmationStatus"
import { useAuthStore } from "../../stores/authStore"

export default function SignInScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, error, clearError, pendingEmailConfirmation, clearPendingConfirmation } = useAuthStore()

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    console.log("SignIn attempt for:", email)
    setIsLoading(true)
    clearError()

    const result = await signIn(email.trim(), password)
    setIsLoading(false)

    console.log("SignIn result:", result)

    if (result.success) {
      console.log("SignIn successful, navigating to tabs")
      router.replace("/(tabs)")
    } else if (result.needsConfirmation) {
      // Don't show alert for email confirmation, the status component will handle it
      console.log("Email confirmation needed")
    } else {
      Alert.alert("Sign In Failed", result.error || "An error occurred")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-gray-600 dark:text-white mb-2">Welcome Back</Text>
            <Text className="text-base text-gray-600 dark:text-gray-100 text-center leading-6">
              Sign in to continue your interview prep journey
            </Text>
          </View>

          {/* Email Confirmation Status */}
          {pendingEmailConfirmation && (
            <EmailConfirmationStatus email={pendingEmailConfirmation} onDismiss={clearPendingConfirmation} />
          )}

          {/* General Error Message */}
          {error && !pendingEmailConfirmation && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="alert-circle-outline" size={20} color="#DC2626" className="mr-2 mt-0.5" />
                <Text className="text-red-600 flex-1">{error}</Text>
              </View>
            </View>
          )}

          <View className="w-full">
            <View className="flex-row items-center bg-white  rounded-xl px-4 mb-4 shadow-sm border border-gray-200">
              <Ionicons name="mail-outline" size={20} color="#666" className="mr-3" />
              <TextInput
                className="flex-1 py-4 text-base text-gray-800"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="flex-row items-center bg-white rounded-xl px-4 mb-4 shadow-sm border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#666" className="mr-3" />
              <TextInput
                className="flex-1 py-4 text-base text-gray-800"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity className="self-end mb-6">
                <Text className="text-sm text-gray-800 dark:text-blue-300 font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              className={`bg-green-500 rounded-xl py-4 items-center mb-6 ${isLoading ? "opacity-60" : ""}`}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-white mr-2">Signing In</Text>
                  <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </View>
              ) : (
                <Text className="text-black font-semibold text-white">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-100">Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-blue-500 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
