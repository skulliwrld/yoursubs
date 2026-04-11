import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-foreground">Settings</Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          Manage your account and preferences
        </Text>
      </View>

      {/* Profile Section */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-foreground mb-3">
          Profile
        </Text>
        
        <View className="sub-card mb-3">
          <View className="sub-row">
            <View className="sub-row-copy">
              <View className="home-avatar bg-muted items-center justify-center">
                <Text className="text-2xl font-sans-bold text-foreground">AD</Text>
              </View>
              <View className="ml-4">
                <Text className="sub-title">Adrian | JS Mastery</Text>
                <Text className="sub-meta">adrian@jsmastery.com</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-muted rounded-full p-2">
              <Text className="text-accent font-sans-bold">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-foreground mb-3">
          Account
        </Text>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-subscription items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">🔔</Text>
              </View>
              <View>
                <Text className="sub-title">Notifications</Text>
                <Text className="sub-meta">Payment reminders, renewals</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-accent items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">🔒</Text>
              </View>
              <View>
                <Text className="sub-title">Security</Text>
                <Text className="sub-meta">Password, biometrics</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-primary items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">💳</Text>
              </View>
              <View>
                <Text className="sub-title">Payment Methods</Text>
                <Text className="sub-meta">Cards, bank accounts</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-muted items-center justify-center rounded-lg">
                <Text className="text-foreground font-sans-bold text-lg">🌐</Text>
              </View>
              <View>
                <Text className="sub-title">Language & Region</Text>
                <Text className="sub-meta">English (US)</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Preferences */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-foreground mb-3">
          Preferences
        </Text>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-subscription items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">🎨</Text>
              </View>
              <View>
                <Text className="sub-title">Appearance</Text>
                <Text className="sub-meta">Light mode</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-accent items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">📊</Text>
              </View>
              <View>
                <Text className="sub-title">Currency</Text>
                <Text className="sub-meta">USD ($)</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-primary items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">📅</Text>
              </View>
              <View>
                <Text className="sub-title">Billing Cycle</Text>
                <Text className="sub-meta">Monthly view</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Support & Legal */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-foreground mb-3">
          Support & Legal
        </Text>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-muted items-center justify-center rounded-lg">
                <Text className="text-foreground font-sans-bold text-lg">❓</Text>
              </View>
              <View>
                <Text className="sub-title">Help Center</Text>
                <Text className="sub-meta">FAQs and guides</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-subscription items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">📄</Text>
              </View>
              <View>
                <Text className="sub-title">Privacy Policy</Text>
                <Text className="sub-meta">How we protect your data</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>

        <View className="sub-card mb-3">
          <TouchableOpacity className="sub-row py-3">
            <View className="sub-row-copy">
              <View className="sub-icon bg-accent items-center justify-center rounded-lg">
                <Text className="text-white font-sans-bold text-lg">📋</Text>
              </View>
              <View>
                <Text className="sub-title">Terms of Service</Text>
                <Text className="sub-meta">User agreement</Text>
              </View>
            </View>
            <Text className="text-accent font-sans-bold">→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View className="mb-6">
        <View className="sub-card">
          <View className="sub-row py-2">
            <Text className="sub-label">Version</Text>
            <Text className="sub-value text-muted-foreground">1.0.0</Text>
          </View>
          <View className="sub-row py-2">
            <Text className="sub-label">Build</Text>
            <Text className="sub-value text-muted-foreground">2026.04.11</Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity className="sub-cancel mb-8">
        <Text className="sub-cancel-text text-center">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}