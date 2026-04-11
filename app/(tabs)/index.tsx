import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "../../constants/data";
import { icons } from "../../constants/icons";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      {/* Header */}
      <View className="home-header mb-6">
        <View className="home-user">
          <View className="home-avatar bg-muted items-center justify-center">
            <Text className="text-2xl font-sans-bold text-foreground">
              {HOME_USER.name.charAt(0)}
            </Text>
          </View>
          <Text className="home-user-name ml-4">{HOME_USER.name}</Text>
        </View>
        <TouchableOpacity className="home-add-icon bg-accent items-center justify-center rounded-full">
          <Text className="text-2xl font-sans-bold text-primary">+</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View className="home-balance-card mb-6">
        <Text className="home-balance-label">Total Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">
            ${HOME_BALANCE.amount.toFixed(2)}
          </Text>
          <Text className="home-balance-date">
            Next: {new Date(HOME_BALANCE.nextRenewalDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Upcoming Subscriptions */}
      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Upcoming</Text>
          <View className="list-action">
            <Text className="list-action-text">See All</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {UPCOMING_SUBSCRIPTIONS.map((sub) => (
            <View key={sub.id} className="upcoming-card">
              <View className="upcoming-row">
                <Image
                  source={sub.icon}
                  style={{ width: 56, height: 56, borderRadius: 8 }}
                />
                <View>
                  <Text className="upcoming-price">${sub.price.toFixed(2)}</Text>
                  <Text className="upcoming-meta">{sub.name}</Text>
                </View>
              </View>
              <Text className="upcoming-name">{sub.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Quick Actions</Text>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity className="flex-1 bg-card rounded-2xl p-4 border border-border items-center">
            <Image
              source={icons.activity}
              style={{ width: 32, height: 32, marginBottom: 8 }}
            />
            <Text className="text-sm font-sans-semibold text-foreground text-center">
              View Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-card rounded-2xl p-4 border border-border items-center">
            <Image
              source={icons.setting}
              style={{ width: 32, height: 32, marginBottom: 8 }}
            />
            <Text className="text-sm font-sans-semibold text-foreground text-center">
              Set Reminders
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Recent Activity</Text>
        </View>

        <View className="home-empty-state">
          <Text className="text-center text-muted-foreground">
            No recent activity to display
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}