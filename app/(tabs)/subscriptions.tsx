import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getHomeSubscriptions } from "../../constants/data";
import { useCallback, useState } from "react";
import { Subscription } from "../../constants/types";

export const getCompanyInitial = (id: string, name: string): string => {
  if (name) return name.charAt(0).toUpperCase();
  const parts = id.split("-");
  return parts[0].charAt(0).toUpperCase();
};

export default function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const subs = await getHomeSubscriptions();
      setSubscriptions(subs);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [loadSubscriptions])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Loading subscriptions...</Text>
      </View>
    );
  }

  const activeSubscriptions = subscriptions.filter(sub => sub.status === "active");
  const inactiveSubscriptions = subscriptions.filter(sub => sub.status !== "active");

  const handleSubscriptionPress = (id: string) => {
    router.push({
      pathname: "/subscriptions/[id]",
      params: { id }
    });
  };

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-foreground">Subscriptions</Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          Manage your subscriptions
        </Text>
      </View>

      {/* Active Subscriptions */}
      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Active</Text>
          <TouchableOpacity className="list-action" onPress={() => router.push("/add-subscription")}>
            <Text className="list-action-text">Add New</Text>
          </TouchableOpacity>
        </View>

        {activeSubscriptions.map((sub) => (
          <TouchableOpacity 
            key={sub.id} 
            className="sub-card mb-4"
            onPress={() => handleSubscriptionPress(sub.id)}
          >
            <View className="sub-head">
              <View className="sub-main">
                <View 
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: sub.color }}
                >
                  <Text className="text-white font-sans-bold text-xl">
                    {getCompanyInitial(sub.id, sub.name)}
                  </Text>
                </View>
                <View className="sub-copy">
                  <Text className="sub-title">{sub.name}</Text>
                  <Text className="sub-meta">{sub.plan}</Text>
                </View>
              </View>
              <View className="sub-price-box">
                <Text className="sub-price">NGN {sub.price.toFixed(2)}</Text>
                <Text className="sub-billing">{sub.billing}</Text>
              </View>
            </View>
            <View className="sub-body">
              <View className="sub-details">
                 <View className="sub-row">
                   <View className="sub-row-copy">
                     <Text className="sub-label">Category</Text>
                     <Text className="sub-value">{sub.category}</Text>
                   </View>
                 </View>
                 <View className="sub-row">
                   <View className="sub-row-copy">
                     <Text className="sub-label">Payment Method</Text>
                     <Text className="sub-value">{sub.paymentMethod}</Text>
                   </View>
                 </View>
                 <View className="sub-row">
                   <View className="sub-row-copy">
                     <Text className="sub-label">Next Payment</Text>
<Text className="sub-value">
                        {dayjs(sub.renewalDate).format("MMM D, YYYY")}
                      </Text>
                   </View>
                 </View>
                <View className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">Status</Text>
                    <Text className="sub-value text-success capitalize">
                      {sub.status}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="sub-cancel">
                <Text className="sub-cancel-text text-center">Cancel Subscription</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <View className="mb-6">
          <View className="list-head">
            <Text className="list-title">Inactive</Text>
          </View>

          {inactiveSubscriptions.map((sub) => (
            <TouchableOpacity 
              key={sub.id} 
              className="sub-card mb-4 opacity-75"
              onPress={() => handleSubscriptionPress(sub.id)}
            >
              <View className="sub-head">
                <View className="sub-main">
                  <View 
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: sub.color }}
                >
                  <Text className="text-white font-sans-bold text-xl">
                    {getCompanyInitial(sub.id, sub.name)}
                  </Text>
                </View>
                  <View className="sub-copy">
                    <Text className="sub-title">{sub.name}</Text>
                    <Text className="sub-meta">{sub.plan}</Text>
                  </View>
                </View>
                <View className="sub-price-box">
                  <Text className="sub-price">NGN {sub.price.toFixed(2)}</Text>
                  <Text className="sub-billing">{sub.billing}</Text>
                </View>
              </View>
              <View className="sub-body">
                <View className="sub-details">
                  <View className="sub-row">
                    <View className="sub-row-copy">
                      <Text className="sub-label">Category</Text>
                      <Text className="sub-value">{sub.category}</Text>
                    </View>
                  </View>
                  <View className="sub-row">
                    <View className="sub-row-copy">
                      <Text className="sub-label">Status</Text>
                      <Text className="sub-value text-muted-foreground capitalize">
                        {sub.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {subscriptions.length === 0 && (
        <View className="home-empty-state">
          <Text className="text-center text-muted-foreground">
            No subscriptions found. Add your first subscription to get started.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
