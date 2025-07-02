"use client"

import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuthStore } from "../../stores/authStore"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { resetPassword } = useAuthStore()

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setIsLoading(true)
    const result = await resetPassword(email.trim())
    setIsLoading(false)

    if (result.success) {
      Alert.alert("Success", "Password reset instructions have been sent to your email.", [
        { text: "OK", onPress: () => router.back() },
      ])
    } else {
      Alert.alert("Error", result.error || "An error occurred")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 p-6">
          <TouchableOpacity className="self-start p-2 mb-5" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-gray-800 mb-4">Reset Password</Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View className="w-full">
            <View className="flex-row items-center bg-white rounded-xl px-4 mb-6 shadow-sm border border-gray-200">
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

            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 items-center mb-6 ${isLoading ? "opacity-60" : ""}`}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text className="text-base font-semibold text-white">
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-sm text-gray-600">Remember your password? </Text>
              <Link href="/(auth)/signin" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-primary font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
