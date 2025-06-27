"use client"

import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { useAuth } from "../../hooks/useAuth"

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await signIn(email.trim(), password)
      router.push("/(notes)")
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={32} color="#6366F1" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</Text>
          <Text className="text-gray-600 text-center">Sign in to access your notes and sync across devices</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
            <View className="relative">
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-base text-gray-900"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable className="absolute right-4 top-4" onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>

          <Pressable
            className="bg-indigo-600 rounded-xl py-4 items-center mt-6"
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/auth/signup" asChild>
              <Pressable>
                <Text className="text-indigo-600 font-semibold">Sign Up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
