import { router } from "expo-router";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";

export default function AddSubscriptionScreen() {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [price, setPrice] = useState("");
  const [billing, setBilling] = useState("Monthly");

  const handleSubmit = () => {
    if (!name || !plan || !category || !paymentMethod || !price) {
      alert("Please fill all fields");
      return;
    }

    alert("Subscription added successfully!");
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-12 pb-24">
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-foreground">Add Subscription</Text>
        <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
          Add a new subscription to your list
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

      <TouchableOpacity className="sub-cancel mb-8" onPress={handleSubmit}>
        <Text className="sub-cancel-text text-center">Add Subscription</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}