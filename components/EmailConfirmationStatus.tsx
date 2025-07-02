import { View, Text, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../stores/authStore"

interface EmailConfirmationStatusProps {
  email: string
  onDismiss?: () => void
}

export function EmailConfirmationStatus({ email, onDismiss }: EmailConfirmationStatusProps) {
  const { resendConfirmation } = useAuthStore()

  const handleResendConfirmation = async () => {
    const result = await resendConfirmation(email)

    if (result.success) {
      Alert.alert(
        "Confirmation Email Sent",
        "We've sent another confirmation email to your inbox. Please check your email and click the confirmation link.",
      )
    } else {
      Alert.alert("Error", result.error || "Failed to resend confirmation email")
    }
  }

  return (
    <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
      <View className="flex-row items-start">
        <Ionicons name="mail-outline" size={24} color="#4A90E2" className="mr-3 mt-1" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-blue-800 mb-2">Check Your Email</Text>
          <Text className="text-sm text-blue-700 leading-5 mb-3">
            We've sent a confirmation link to <Text className="font-medium">{email}</Text>. Please check your email and
            click the link to activate your account.
          </Text>

          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle-outline" size={16} color="#4A90E2" />
            <Text className="text-xs text-blue-600 ml-2 flex-1">
              Don't forget to check your spam folder if you don't see the email.
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <TouchableOpacity className="bg-blue-100 px-4 py-2 rounded-lg" onPress={handleResendConfirmation}>
              <Text className="text-sm font-medium text-blue-700">Resend Email</Text>
            </TouchableOpacity>

            {onDismiss && (
              <TouchableOpacity onPress={onDismiss} className="p-2">
                <Ionicons name="close" size={20} color="#4A90E2" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}
