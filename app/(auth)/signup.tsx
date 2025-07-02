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

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const { signUp, error, clearError, pendingEmailConfirmation } = useAuthStore()

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    clearError()

    const result = await signUp(email.trim(), password, fullName.trim())
    setIsLoading(false)

    if (result.success) {
      if (result.needsConfirmation) {
        // Show success message for email confirmation
        setShowSuccessMessage(true)
      } else {
        // User is automatically signed in
        router.replace("/(tabs)")
      }
    } else {
      Alert.alert("Sign Up Failed", result.error || "An error occurred")
    }
  }

  const handleGoToSignIn = () => {
    setShowSuccessMessage(false)
    router.replace("/(auth)/signin")
  }

  if (showSuccessMessage || pendingEmailConfirmation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <View className="flex-1 justify-center p-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">Account Created!</Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Your account has been created successfully.
            </Text>
          </View>

          <EmailConfirmationStatus email={pendingEmailConfirmation || email} />

          <TouchableOpacity className="bg-primary rounded-xl py-4 items-center mb-4" onPress={handleGoToSignIn}>
            <Text className="text-base font-semibold text-white">Continue to Sign In</Text>
          </TouchableOpacity>

          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <View className="flex-row items-start">
              <Ionicons name="bulb-outline" size={20} color="#D97706" className="mr-2 mt-0.5" />
              <Text className="text-sm text-yellow-700 flex-1">
                <Text className="font-medium">Tip:</Text> Add our email address to your contacts to ensure you receive
                all notifications.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Join IntelliPrep and start your interview preparation
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="alert-circle-outline" size={20} color="#DC2626" className="mr-2 mt-0.5" />
                <Text className="text-red-600 flex-1">{error}</Text>
              </View>
            </View>
          )}

          <View className="w-full">
            <View className="flex-row items-center bg-white rounded-xl px-4 mb-4 shadow-sm border border-gray-200">
              <Ionicons name="person-outline" size={20} color="#666" className="mr-3" />
              <TextInput
                className="flex-1 py-4 text-base text-gray-800"
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View className="flex-row items-center bg-white rounded-xl px-4 mb-4 shadow-sm border border-gray-200">
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
                placeholder="Password (min. 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-white rounded-xl px-4 mb-6 shadow-sm border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#666" className="mr-3" />
              <TextInput
                className="flex-1 py-4 text-base text-gray-800"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`bg-green-500 rounded-xl py-4 items-center mb-6 ${isLoading ? "opacity-60" : ""}`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-white mr-2">Creating Account</Text>
                  <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </View>
              ) : (
                <Text className="text-base font-semibold text-white">Create Account</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-sm text-gray-600">Already have an account? </Text>
              <Link href="/(auth)/signin" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-primary font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
