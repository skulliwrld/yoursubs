import { ScrollView, Text, View } from "react-native";
import { getHomeSubscriptions } from "../../constants/data";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Subscription } from "../../constants/types";

const getCompanyInitial = (id: string, name: string): string => {
  if (name) return name.charAt(0).toUpperCase();
  const parts = id.split("-");
  return parts[0].charAt(0).toUpperCase();
};

export default function InsightsScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubs = async () => {
      const subs = await getHomeSubscriptions();
      setSubscriptions(subs);
      setLoading(false);
    };
    loadSubs();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Loading insights...</Text>
      </View>
    );
  }

  const totalSpending = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length;
  const nextRenewal = subscriptions.length > 0
    ? dayjs(Math.min(...subscriptions.map((s) => dayjs(s.renewalDate).valueOf()))).format("MMM D, YYYY")
    : "No upcoming renewals";
  const mostExpensive = subscriptions.length > 0
    ? subscriptions.reduce((prev, current) => (prev.price > current.price ? prev : current))
    : null;

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-foreground">Insights</Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          Track your spending habits
        </Text>
      </View>

      <View className="home-balance-card mb-6">
        <Text className="home-balance-label">This Month&apos;s Spending</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">NGN {totalSpending.toFixed(2)}</Text>
          <Text className="home-balance-date">Current subscriptions</Text>
        </View>
      </View>

      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Summary</Text>
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
              Active Subscriptions
            </Text>
            <Text className="text-2xl font-sans-bold text-foreground">{activeSubscriptions}</Text>
          </View>

          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
              Total Cost
            </Text>
            <Text className="text-2xl font-sans-bold text-foreground">NGN {totalSpending.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">By Category</Text>
        </View>

        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <View key={sub.id} className="sub-card mb-3">
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
                  <View>
                    <Text className="sub-title">{sub.name}</Text>
                    <Text className="sub-meta">{sub.category}</Text>
                  </View>
                </View>
                <View className="sub-price-box">
                  <Text className="sub-price">NGN {sub.price.toFixed(2)}</Text>
                  <Text className="sub-billing">{sub.billing}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="sub-card">
            <Text className="text-center text-muted-foreground">
              Add subscriptions to see your insights.
            </Text>
          </View>
        )}
      </View>

      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Status Overview</Text>
        </View>

        <View className="sub-card">
          <View className="sub-body">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Active</Text>
                <Text className="sub-value text-success">
                  {subscriptions.filter((s) => s.status === "active").length} subscriptions
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Paused</Text>
                <Text className="sub-value text-muted-foreground">
                  {subscriptions.filter((s) => s.status === "paused").length} subscriptions
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Cancelled</Text>
                <Text className="sub-value text-destructive">
                  {subscriptions.filter((s) => s.status === "cancelled").length} subscriptions
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <View className="list-head">
          <Text className="list-title">Insights</Text>
        </View>

        <View className="sub-card">
          <View className="sub-body">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Most Expensive</Text>
                <Text className="sub-value">{mostExpensive?.name ?? "N/A"}</Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Average Cost</Text>
                <Text className="sub-value">
                  {subscriptions.length > 0 ? `NGN ${(totalSpending / subscriptions.length).toFixed(2)}/month` : "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Next Renewal</Text>
                <Text className="sub-value">{nextRenewal}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
