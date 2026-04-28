import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { icons } from "../constants/icons";
import type { Subscription } from "../constants/types";
import { addSubscription, loadSubscriptions, updateSubscription } from "../utils/storage";

const createSubscriptionId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getRenewalDate = (billing: string) => {
  const normalizedBilling = billing.trim().toLowerCase();

  if (normalizedBilling === "yearly" || normalizedBilling === "annual") {
    return dayjs().add(1, "year").toISOString();
  }

  if (normalizedBilling === "weekly") {
    return dayjs().add(1, "week").toISOString();
  }

  return dayjs().add(1, "month").toISOString();
};

export default function AddSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [price, setPrice] = useState("");
  const [billing, setBilling] = useState("Monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(Boolean(id));
  const [existingSubscription, setExistingSubscription] = useState<Subscription | null>(null);

  const isEditing = Boolean(id);

  const loadSubscription = useCallback(async () => {
    if (!id) {
      setIsLoadingSubscription(false);
      return;
    }

    try {
      setIsLoadingSubscription(true);
      const subscriptions = await loadSubscriptions();
      const subscription = subscriptions.find((sub) => sub.id === id);

      if (!subscription) {
        Alert.alert("Subscription not found", "We couldn't find that subscription.");
        router.back();
        return;
      }

      setExistingSubscription(subscription);
      setName(subscription.name);
      setPlan(subscription.plan);
      setCategory(subscription.category);
      setPaymentMethod(subscription.paymentMethod);
      setPrice(String(subscription.price));
      setBilling(subscription.billing);
    } catch (error) {
      console.error("Error loading subscription for editing:", error);
      Alert.alert("Load failed", "We couldn't load this subscription.");
      router.back();
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadSubscription();
    }, [loadSubscription])
  );

  const handleSubmit = async () => {
    if (!name || !plan || !category || !paymentMethod || !price) {
      Alert.alert("Missing fields", "Please fill all fields.");
      return;
    }

    const parsedPrice = Number(price);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Invalid price", "Please enter a valid subscription price.");
      return;
    }

    const now = dayjs().toISOString();
    const generatedId = createSubscriptionId(name) || `subscription-${Date.now()}`;
    const subscriptionPayload: Subscription = {
      id: existingSubscription?.id ?? id ?? generatedId,
      icon: existingSubscription?.icon ?? icons.wallet,
      name: name.trim(),
      plan: plan.trim(),
      category: category.trim(),
      paymentMethod: paymentMethod.trim(),
      status: existingSubscription?.status ?? "active",
      startDate: existingSubscription?.startDate ?? now,
      price: parsedPrice,
      currency: existingSubscription?.currency ?? "NGN",
      billing: billing.trim() || "Monthly",
      renewalDate: getRenewalDate(billing),
      color: existingSubscription?.color ?? "#6FA8DC",
      usageStats: existingSubscription?.usageStats,
    };

    try {
      setIsSubmitting(true);
      if (id) {
        await updateSubscription(id, subscriptionPayload);
        Alert.alert("Success", "Subscription updated successfully!");
      } else {
        await addSubscription(subscriptionPayload);
        Alert.alert("Success", "Subscription added successfully!");
      }
      router.back();
    } catch (error) {
      console.error("Error saving subscription:", error);
      Alert.alert("Save failed", "We couldn't save this subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSubscription) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Loading subscription...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-foreground">
          {isEditing ? "Manage Subscription" : "Add Subscription"}
        </Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          {isEditing ? "Update your subscription details" : "Add a new subscription to your list"}
        </Text>
      </View>

      <View className="sub-card mb-6">
        <View className="sub-details gap-4">
          <View>
            <Text className="sub-label">Name</Text>
            <TextInput
              className="sub-value bg-background border border-border rounded px-2 py-1"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Netflix"
            />
          </View>
          <View>
            <Text className="sub-label">Plan</Text>
            <TextInput
              className="sub-value bg-background border border-border rounded px-2 py-1"
              value={plan}
              onChangeText={setPlan}
              placeholder="e.g. Premium"
            />
          </View>
          <View>
            <Text className="sub-label">Category</Text>
            <TextInput
              className="sub-value bg-background border border-border rounded px-2 py-1"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Entertainment"
            />
          </View>
          <View>
            <Text className="sub-label">Payment Method</Text>
            <TextInput
              className="sub-value bg-background border border-border rounded px-2 py-1"
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="e.g. Visa ending in 1234"
            />
          </View>
          <View>
            <Text className="sub-label">Price</Text>
            <TextInput
              className="sub-value bg-background border border-border rounded px-2 py-1"
              value={price}
              onChangeText={setPrice}
              placeholder="e.g. 15.99"
              keyboardType="numeric"
            />
          </View>
          <View>
            <Text className="sub-label">Billing</Text>
            <TextInput
              className="sub-value bg-background border border-border rounded px-2 py-1"
              value={billing}
              onChangeText={setBilling}
              placeholder="Monthly"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity className="sub-cancel mb-8" onPress={handleSubmit} disabled={isSubmitting}>
        <Text className="sub-cancel-text text-center">
          {isSubmitting ? "Saving..." : isEditing ? "Update Subscription" : "Add Subscription"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
