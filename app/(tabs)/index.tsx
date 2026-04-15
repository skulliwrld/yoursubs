import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS } from "../../constants/data";
import { icons } from "../../constants/icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";

const getCompanyInitial = (id: string, name: string): string => {
  if (name) return name.charAt(0).toUpperCase();
  const parts = id.split("-");
  return parts[0].charAt(0).toUpperCase();
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  const userName = user?.fullName || user?.firstName || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      {/* Header */}
      <View className="home-header mb-6">
        <View className="home-user">
          <View className="home-avatar bg-muted items-center justify-center">
            <Text className="text-2xl font-sans-bold text-foreground">
              {userInitial}
            </Text>
          </View>
          <Text className="home-user-name ml-4">{userName}</Text>
        </View>
        <TouchableOpacity className="home-add-icon bg-accent items-center justify-center rounded-full" onPress={() => router.push("/add-subscription")}>
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
            Next: {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM D, YYYY")}
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
                <View 
                  className="w-14 h-14 rounded-lg items-center justify-center"
                  style={{ backgroundColor: "#f5c542" }}
                >
                  <Text className="text-white font-sans-bold text-xl">
                    {getCompanyInitial(sub.id, sub.name)}
                  </Text>
                </View>
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

      {/* All Subscriptions */}
      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">All Subscriptions</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/subscriptions")}>
            <Text className="list-action-text">See All</Text>
          </TouchableOpacity>
        </View>

        {HOME_SUBSCRIPTIONS.slice(0, 4).map((sub) => (
          <TouchableOpacity 
            key={sub.id} 
            className="sub-card mb-3"
            onPress={() => router.push(`/subscriptions/${sub.id}`)}
          >
            <View className="sub-row">
              <View className="sub-row-copy">
                <View 
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: sub.color }}
                >
                  <Text className="text-white font-sans-bold text-lg">
                    {getCompanyInitial(sub.id, sub.name)}
                  </Text>
                </View>
                <View className="ml-3">
                  <Text className="sub-title">{sub.name}</Text>
                  <Text className="sub-meta">{sub.plan}</Text>
                </View>
              </View>
              <View className="text-right">
                <Text className="sub-price">${sub.price.toFixed(2)}</Text>
                <Text className="sub-meta">{sub.billing}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}