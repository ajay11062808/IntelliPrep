import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
// import { useAuthStore } from "../../stores/authStore"

export default function TabLayout() {
  // const { isAuthenticated } = useAuthStore()

  // if (!isAuthenticated) {
  //   return <Redirect href="/(auth)/signin" />
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          borderRadius: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
          paddingBottom: 5,
          paddingTop: 5,
          height: 80,
          paddingLeft:10,
          paddingRight: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="intelliprep"
        options={{
          title: "IntelliPrep",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
