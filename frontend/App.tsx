import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen"
import AddCustomer from "./screens/AddCustomer";
import EditCustomer from "./screens/EditCustomer";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddCustomer" component={AddCustomer} />
        <Stack.Screen name="EditCustomer" component={EditCustomer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
