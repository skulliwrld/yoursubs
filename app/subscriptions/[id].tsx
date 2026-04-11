import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HOME_SUBSCRIPTIONS } from "../../constants/data";

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const subscription = HOME_SUBSCRIPTIONS.find(sub => sub.id === id);

  if (!subscription) {
    return (
<ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
        <View className="mb-6">
          <Text className="text-3xl font-sans-bold text-foreground">Subscription Not Found</Text>
        </View>
        <TouchableOpacity 
          className="bg-primary rounded-2xl p-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-sans-bold">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12">
      <View className="mb-6">
        <TouchableOpacity 
          className="mb-4 bg-muted rounded-full p-2 w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-foreground font-sans-bold">←</Text>
        </TouchableOpacity>
        
        <View className="sub-card">
          <View className="sub-head">
            <View className="sub-main">
              <View 
                className="sub-icon items-center justify-center rounded-lg"
                style={{ backgroundColor: subscription.color }}
              >
                <Text className="text-white font-sans-bold text-2xl">
                  {subscription.name.charAt(0)}
                </Text>
              </View>
              <View className="sub-copy">
                <Text className="sub-title">{subscription.name}</Text>
                <Text className="sub-meta">{subscription.plan}</Text>
              </View>
            </View>
            <View className="sub-price-box">
              <Text className="sub-price">${subscription.price.toFixed(2)}</Text>
              <Text className="sub-billing">{subscription.billing}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Subscription Details */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-foreground mb-3">
          Details
        </Text>
        
        <View className="sub-card">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category</Text>
                <Text className="sub-value">{subscription.category}</Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment Method</Text>
                <Text className="sub-value">{subscription.paymentMethod}</Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Next Payment</Text>
                <Text className="sub-value">
                  {new Date(subscription.renewalDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status</Text>
                <Text className="sub-value text-success capitalize">
                  {subscription.status}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Start Date</Text>
                <Text className="sub-value">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Billing Cycle</Text>
                <Text className="sub-value">{subscription.billing}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="mb-6">
        <Text className="text-lg font-sans-semibold text-foreground mb-3">
          Actions
        </Text>
        
        <View className="flex-col gap-3">
          <TouchableOpacity className="bg-primary rounded-2xl p-4 items-center">
            <Text className="text-white font-sans-bold">Manage Subscription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-subscription rounded-2xl p-4 items-center">
            <Text className="text-white font-sans-bold">View Payment History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-destructive rounded-2xl p-4 items-center">
            <Text className="text-white font-sans-bold">Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Usage Stats */}
      {subscription.usageStats && (
        <View className="mb-6">
          <Text className="text-lg font-sans-semibold text-foreground mb-3">
            Usage Stats
          </Text>
          
          <View className="sub-card">
            <View className="sub-details">
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Monthly Usage</Text>
                  <Text className="sub-value">{subscription.usageStats.monthlyUsage}%</Text>
                </View>
              </View>
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Last Used</Text>
                  <Text className="sub-value">
                    {new Date(subscription.usageStats.lastUsed).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Total Sessions</Text>
                  <Text className="sub-value">{subscription.usageStats.totalSessions}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}