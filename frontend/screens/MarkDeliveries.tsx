import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Constants from "expo-constants"; // 🎯 Import Constants

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
}

interface Delivery {
  _id: string;
  customer: Customer;
  date: string;
  // 🎯 Updated status to match the Delivery model enum
  status: "delivered" | "absent"; 
}

type DeliveryStatus = {
  [key: string]: boolean;
};

type MarkDeliveriesRouteParams = {
  date: string;
};

type MarkDeliveriesRouteProp = RouteProp<
  { params: MarkDeliveriesRouteParams },
  "params"
>;

// 🎯 Use the proper Expo Constants method
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "https://fruit-basket-mhc3.onrender.com";


const MarkDeliveries = () => {
  const navigation = useNavigation();
  const route = useRoute<MarkDeliveriesRouteProp>();

  const routeDate = route.params?.date;
  const dateToUse = routeDate ? routeDate : new Date().toISOString();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const customersRes = await axios.get(`${API_URL}/api/customers`);
      const allCustomers: Customer[] = customersRes.data;

      const dateString = new Date(dateToUse).toISOString().split("T")[0];
      const deliveriesRes = await axios.get(
        `${API_URL}/api/deliveries?date=${dateString}`
      );
      const existingDeliveries: Delivery[] = deliveriesRes.data.deliveries;

      const initialStatus: DeliveryStatus = {};
      allCustomers.forEach((c: Customer) => {
        const foundDelivery = existingDeliveries.find(
          (d: Delivery) => d.customer._id === c._id
        );
        // Status is TRUE (delivered) if found and status is 'delivered'
        initialStatus[c._id] = foundDelivery?.status === "delivered";
      });

      setCustomers(allCustomers);
      setDeliveryStatus(initialStatus);
    } catch (err) {
      console.error("Error fetching data:", err);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [dateToUse]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveDeliveries = async () => {
    try {
      const deliveriesToSave = customers.map((c: Customer) => {
        const normalizedDate = new Date(dateToUse);
        normalizedDate.setHours(0, 0, 0, 0);

        return {
          customerId: c._id,
          // 🎯 Map boolean value to 'delivered' or 'absent'
          status: deliveryStatus[c._id] ? "delivered" : "absent", 
          date: normalizedDate.toISOString(),
        };
      });

      await axios.post(`${API_URL}/api/deliveries/bulk-upsert`, {
        deliveries: deliveriesToSave,
      });

      Alert.alert("Success", "Deliveries saved!");
      // 🎯 Go back and allow HomeScreen to refetch with the new data
      navigation.goBack(); 
    } catch (err) {
      console.error("Error saving deliveries:", err);
      Alert.alert("Error", "Failed to save deliveries.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Mark Deliveries for {new Date(dateToUse).toDateString()}
      </Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Switch
              value={deliveryStatus[item._id] || false}
              onValueChange={(val) =>
                setDeliveryStatus((prev) => ({ ...prev, [item._id]: val }))
              }
              trackColor={{ false: "#d32f2f", true: "#4CAF50" }} // Red for absent, Green for delivered
              thumbColor={deliveryStatus[item._id] ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        )}
      />
      <Button title="Save Deliveries" onPress={saveDeliveries} />
    </View>
  );
};

export default MarkDeliveries;

const styles = StyleSheet.create({
  // ... (Styles remain the same)
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  name: { fontSize: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});