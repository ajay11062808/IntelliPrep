"use client"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { supabase } from "../../config/supabase"
import { useAuthStore } from "../../stores/authStore"

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setFullName(user.user_metadata?.full_name || "")
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      })

      if (error) throw error

      Alert.alert("Success", "Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true); // Optional: Show a loading indicator
            try {
              await signOut(); // Supabase sign-out logic
              console.log("Supabase sign-out successful");
              router.replace("/(auth)/signin"); // Navigate to the login page
            } catch (error) {
              console.error("Supabase sign-out error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
          } finally {
            setIsLoading(false); // Optional: Hide the loading indicator
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-#F8F9FA">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#4A90E2" />
          </View>
          <Text style={styles.name}>{fullName || "User"}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Ionicons name={isEditing ? "close" : "pencil"} size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder="Email address"
            />
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  editButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    marginLeft: 8,
  },
})
