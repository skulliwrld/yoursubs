import { Tabs } from "expo-router";
import { Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { tabs } from "../../constants/data";
import "../../global.css";

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#ea7a53",
            tabBarInactiveTintColor: "#081126",
            tabBarStyle: {
              backgroundColor: "#fff9e3",
              borderTopWidth: 1,
              borderTopColor: "rgba(0, 0, 0, 0.1)",
              height: 65,
              paddingBottom: 12,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
            headerStyle: {
              backgroundColor: "#fff9e3",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(0, 0, 0, 0.1)",
            },
            headerTintColor: "#081126",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tabs.Screen
              key={index}
              name={tab.name}
              options={{
                title: tab.title,
                tabBarIcon: ({ focused }) => (
                  <Image
                    source={tab.icon}
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: focused ? "#ea7a53" : "#081126",
                    }}
                  />
                ),
              }}
            />
          ))}
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}