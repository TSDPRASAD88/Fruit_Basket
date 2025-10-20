import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import HomeScreen from "./screens/HomeScreen";
import EditCustomer from "./screens/EditCustomer";
import MarkDeliveries from "./screens/MarkDeliveries";
import AllCustomers from "./screens/AllCustomers";

// Types
import { RootStackParamList } from "./types/navigation";


const Stack = createNativeStackNavigator<RootStackParamList>();

// ✅ Debug log for env variable at app startup
console.log(">>> API_URL from App.tsx =", process.env.EXPO_PUBLIC_API_URL);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EditCustomer" component={EditCustomer} />
        <Stack.Screen name="MarkDeliveries" component={MarkDeliveries} />
        <Stack.Screen name="AllCustomers" component={AllCustomers} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
