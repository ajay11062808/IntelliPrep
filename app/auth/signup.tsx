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
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { useAuth } from "../../hooks/useAuth"

export default function SignUpScreen() {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { displayName, email, password, confirmPassword } = formData

    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter your full name")
      return false
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address")
      return false
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return false
    }

    return true
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      await signUp(formData.email.trim(), formData.password, formData.displayName.trim())
      Alert.alert("Account Created!", "Your account has been created successfully. You can now start taking notes!", [
        { text: "Get Started", onPress: () => router.push("/(notes)") },
      ])
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again."

      if (error.message.includes("email-already-in-use")) {
        errorMessage = "An account with this email already exists. Please sign in instead."
      } else if (error.message.includes("weak-password")) {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (error.message.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address."
      }

      Alert.alert("Sign Up Failed", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "bg-gray-200" }
    if (password.length < 6) return { strength: 1, text: "Weak", color: "bg-red-400" }
    if (password.length < 8) return { strength: 2, text: "Fair", color: "bg-yellow-400" }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 4, text: "Strong", color: "bg-green-400" }
    }
    return { strength: 3, text: "Good", color: "bg-blue-400" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 pt-12 pb-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="person-add" size={32} color="#6366F1" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Create Account</Text>
            <Text className="text-gray-600 text-center">
              Join IntelliPrep to save your notes and sync across devices
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pl-12 text-base text-gray-900"
                  value={formData.displayName}
                  onChangeText={(value) => updateFormData("displayName", value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoComplete="name"
                />
                <Ionicons name="person-outline" size={20} color="#9CA3AF" className="absolute left-4 top-4" />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pl-12 text-base text-gray-900"
                  value={formData.email}
                  onChangeText={(value) => updateFormData("email", value)}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" className="absolute left-4 top-4" />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pl-12 pr-12 text-base text-gray-900"
                  value={formData.password}
                  onChangeText={(value) => updateFormData("password", value)}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" className="absolute left-4 top-4" />
                <Pressable className="absolute right-4 top-4" onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </Pressable>
              </View>

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View className="mt-2">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs text-gray-500">Password Strength</Text>
                    <Text
                      className={`text-xs font-medium ${
                        passwordStrength.strength === 4
                          ? "text-green-600"
                          : passwordStrength.strength === 3
                            ? "text-blue-600"
                            : passwordStrength.strength === 2
                              ? "text-yellow-600"
                              : "text-red-600"
                      }`}
                    >
                      {passwordStrength.text}
                    </Text>
                  </View>
                  <View className="flex-row space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        className={`flex-1 h-1 rounded-full ${
                          level <= passwordStrength.strength ? passwordStrength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pl-12 pr-12 text-base text-gray-900"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData("confirmPassword", value)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" className="absolute left-4 top-4" />
                <Pressable
                  className="absolute right-4 top-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </Pressable>
              </View>

              {/* Password Match Indicator */}
              {formData.confirmPassword.length > 0 && (
                <View className="flex-row items-center mt-2">
                  <Ionicons
                    name={formData.password === formData.confirmPassword ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={formData.password === formData.confirmPassword ? "#10B981" : "#EF4444"}
                  />
                  <Text
                    className={`text-xs ml-1 ${
                      formData.password === formData.confirmPassword ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
                  </Text>
                </View>
              )}
            </View>

            {/* Terms and Privacy */}
            <View className="bg-gray-50 rounded-xl p-4 mt-4">
              <Text className="text-xs text-gray-600 text-center leading-4">
                By creating an account, you agree to our{" "}
                <Text className="text-indigo-600 font-medium">Terms of Service</Text> and{" "}
                <Text className="text-indigo-600 font-medium">Privacy Policy</Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <Pressable
              className={`rounded-xl py-4 items-center mt-6 ${loading ? "bg-indigo-400" : "bg-indigo-600"}`}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">Creating Account...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">Create Account</Text>
                </View>
              )}
            </Pressable>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/auth/signin" asChild>
                <Pressable>
                  <Text className="text-indigo-600 font-semibold">Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
